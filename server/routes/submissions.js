// server/routes/submissions.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Submission from '../models/Submission.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const studentId = String(user._id ?? user.id ?? user.userId ?? '');

    // base query
    const query = {
      $or: [{ student_id: studentId }, { studentId: studentId }, { student: studentId }],
    };

    let subs = await Submission.find(query).sort({ createdAt: -1 });

    // Try to populate safely only if the path exists and is a ref
    try {
      const schemaPath = Submission.schema?.path('assignment');
      if (schemaPath && schemaPath.options && schemaPath.options.ref) {
        subs = await Submission.find(query).populate('assignment').sort({ createdAt: -1 }).lean();
      } else {
        subs = await Submission.find(query).sort({ createdAt: -1 }).lean();
      }
    } catch (popErr) {
      // fallback if populate fails for any reason
      console.warn('[GET /api/submissions/me] populate failed, returning raw submissions', popErr);
      subs = await Submission.find(query).sort({ createdAt: -1 }).lean();
    }

    return res.json(Array.isArray(subs) ? subs : []);
  } catch (err) {
    console.error('[GET /api/submissions/me] error:', err);
    return res.status(500).json({ error: 'Failed to fetch your submissions' });
  }
});

export default router;
