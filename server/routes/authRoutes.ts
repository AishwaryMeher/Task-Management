import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authSchema, loginSchema } from '../validators/authValidator';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends express.Request {
    user?: {
        userId: string;
    };
}

// Signup
router.post('/signup', async (req, res) => {
    try {
        const validationResult = authSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Validation error',
                errors: validationResult.error.errors,
            });
        }

        const { name, email, password } = validationResult.data;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const user = new User({ name, email: email.toLowerCase(), password });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const validationResult = loginSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Validation error',
                errors: validationResult.error.errors,
            });
        }

        const { email, password } = validationResult.data;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// Logout current user
router.post('/logout', (req, res) => {
    return res.status(200).json({ message: 'User logged out' });
});

export default router;