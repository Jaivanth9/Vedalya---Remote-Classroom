// server/routes/queries.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Query from '../models/Query.js'; // adjust path if your model lives elsewhere

const router = express.Router();

/**
 * POST /api/queries
 * - Auth required
 * - Server derives studentId from req.user (client-sent studentId is ignored)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const studentId = String(user._id ?? user.id ?? user.userId);
    const { courseId, courseTitle, subject, message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const q = new Query({
      studentId,
      courseId: courseId ?? null,
      courseTitle: courseTitle ?? null,
      subject: subject ?? null,
      message: message.trim(),
      createdAt: new Date(),
      status: 'open'
    });

    const saved = await q.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('[POST /api/queries] error', err);
    return res.status(500).json({ error: 'Failed to create query' });
  }
});

/**
 * GET /api/queries
 * - Auth required
 * - Students see only their queries; teacher/admin can see all
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const role = String(user.role || user.userRole || 'student').toLowerCase();
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(role);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const skip = (page - 1) * limit;

    const filter = isTeacherOrAdmin ? {} : { studentId: String(user._id ?? user.id ?? user.userId) };

    const [items, total] = await Promise.all([
      Query.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Query.countDocuments(filter)
    ]);

    return res.json({ items, total, page, limit });
  } catch (err) {
    console.error('[GET /api/queries] error', err);
    return res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

export default router;
