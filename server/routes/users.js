// server/routes/users.js
import express from 'express';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Normalize current requester id (support both req.user.id and req.user._id)
    const requesterId = (req.user && (req.user.id || req.user._id))
      ? String(req.user.id || req.user._id)
      : null;

    // Users can only view their own profile unless admin
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && requesterId !== String(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
