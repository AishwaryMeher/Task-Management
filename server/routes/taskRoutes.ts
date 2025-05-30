import express from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import TeamMember from '../models/TeamMember';
import { taskSchema, updateTaskSchema, taskFilterSchema } from '../validators/taskValidator';

const router = express.Router();

// Get all tasks with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const validationResult = taskFilterSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const {
      page = 1,
      limit = 10,
      project,
      member,
      status,
      search,
      startDate,
      endDate,
    } = validationResult.data;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    if (project) {
      filter.project = project;
    }

    if (member) {
      filter.assignedMembers = member;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.deadline = {};

      if (startDate) {
        filter.deadline.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.deadline.$lte = new Date(endDate);
      }
    }

    const [tasks, totalCount] = await Promise.all([
      Task.find(filter)
        .populate('project', 'name description')
        .populate('assignedMembers', 'name email designation')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Task.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: tasks,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Get a single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name description')
      .populate('assignedMembers', 'name email designation');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const validationResult = taskSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const { title } = validationResult.data;
    const existingTask = await Task.findOne({ title: { $regex: `^${title}$`, $options: 'i' } });
    if (existingTask) {
      return res.status(400).json({ message: 'Task with this title already exists' });
    }

    // Verify project exists
    const project = await Project.findById(validationResult.data.project);
    if (!project) {
      return res.status(400).json({ message: 'Project does not exist' });
    }

    // Verify all assigned members exist
    const memberIds = validationResult.data.assignedMembers;
    const memberCount = await TeamMember.countDocuments({
      _id: { $in: memberIds },
    });

    if (memberCount !== memberIds.length) {
      return res.status(400).json({ message: 'One or more assigned members do not exist' });
    }

    const taskData = {
      ...validationResult.data,
      deadline: new Date(validationResult.data.deadline),
    };

    const newTask = new Task(taskData);
    const savedTask = await newTask.save();

    // Populate references for response
    const populatedTask = await Task.findById(savedTask._id)
      .populate('project', 'name description')
      .populate('assignedMembers', 'name email designation');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const validationResult = updateTaskSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const updateData: any = { ...validationResult.data };

    if (updateData.title) {
      const existingTask = await Task.findOne({
        title: { $regex: `^${updateData.title}$`, $options: 'i' },
        _id: { $ne: req.params.id },
      });
      if (existingTask) {
        return res.status(400).json({ message: 'Another task with this title already exists' });
      }
    }

    // Verify project exists if it's being updated
    if (updateData.project) {
      const project = await Project.findById(updateData.project);
      if (!project) {
        return res.status(400).json({ message: 'Project does not exist' });
      }
    }

    // Verify all assigned members exist if they're being updated
    if (updateData.assignedMembers && updateData.assignedMembers.length > 0) {
      const memberIds = updateData.assignedMembers;
      const memberCount = await TeamMember.countDocuments({
        _id: { $in: memberIds },
      });

      if (memberCount !== memberIds.length) {
        return res.status(400).json({ message: 'One or more assigned members do not exist' });
      }
    }

    // Convert deadline string to Date object if it exists
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('project', 'name description')
      .populate('assignedMembers', 'name email designation');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

export default router;