import express from 'express';
import TeamMember from '../models/TeamMember';
import { teamMemberSchema, updateTeamMemberSchema } from '../validators/teamValidator';

const router = express.Router();

// Get all team members with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [teamMembers, totalCount] = await Promise.all([
      TeamMember.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      TeamMember.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: teamMembers,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
});

// Get a single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.status(200).json(teamMember);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team member', error: error.message });
  }
});

// Create a new team member
router.post('/', async (req, res) => {
  try {
    const validationResult = teamMemberSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    // Check if email already exists
    const existingMember = await TeamMember.findOne({ email: validationResult.data.email });
    if (existingMember) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newTeamMember = new TeamMember(validationResult.data);
    const savedTeamMember = await newTeamMember.save();

    res.status(201).json(savedTeamMember);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team member', error: error.message });
  }
});

// Update a team member
router.put('/:id', async (req, res) => {
  try {
    const validationResult = updateTeamMemberSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    // Check if email is being updated and if it already exists
    if (validationResult.data.email) {
      const existingMember = await TeamMember.findOne({
        email: validationResult.data.email,
        _id: { $ne: req.params.id },
      });
      
      if (existingMember) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      validationResult.data,
      { new: true, runValidators: true }
    );

    if (!updatedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.status(200).json(updatedTeamMember);
  } catch (error) {
    res.status(500).json({ message: 'Error updating team member', error: error.message });
  }
});

// Delete a team member
router.delete('/:id', async (req, res) => {
  try {
    const deletedTeamMember = await TeamMember.findByIdAndDelete(req.params.id);

    if (!deletedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.status(200).json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team member', error: error.message });
  }
});

export default router;