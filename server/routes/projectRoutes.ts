import express from 'express';
import Project from '../models/Project';
import TeamMember from '../models/TeamMember';
import { projectSchema, updateProjectSchema } from '../validators/projectValidator';

const router = express.Router();

// Get all projects with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [projects, totalCount] = await Promise.all([
      Project.find()
        .populate('teamMembers', 'name email designation')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Project.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: projects,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Get a single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'teamMembers',
      'name email designation'
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const validationResult = projectSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const { name, teamMembers } = validationResult.data;

    // 🔍 Check if project with same name exists (case-insensitive)
    const existingProject = await Project.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingProject) {
      return res.status(400).json({ message: 'Project with this name already exists' });
    }

    // ✅ Verify team members
    const teamMemberCount = await TeamMember.countDocuments({
      _id: { $in: teamMembers },
    });

    if (teamMemberCount !== teamMembers.length) {
      return res.status(400).json({ message: 'One or more team members do not exist' });
    }

    const newProject = new Project(validationResult.data);
    const savedProject = await newProject.save();

    const populatedProject = await Project.findById(savedProject._id).populate(
      'teamMembers',
      'name email designation'
    );

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const validationResult = updateProjectSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const { name, teamMembers } = validationResult.data;

    // 🔍 Check if another project with the same name exists
    const existingProject = await Project.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
      _id: { $ne: req.params.id },
    });

    if (existingProject) {
      return res.status(400).json({ message: 'Another project with this name already exists' });
    }

    // ✅ Verify team members if provided
    if (teamMembers && teamMembers.length > 0) {
      const teamMemberCount = await TeamMember.countDocuments({
        _id: { $in: teamMembers },
      });

      if (teamMemberCount !== teamMembers.length) {
        return res.status(400).json({ message: 'One or more team members do not exist' });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      validationResult.data,
      { new: true, runValidators: true }
    ).populate('teamMembers', 'name email designation');

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

export default router;