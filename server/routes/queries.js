// server/routes/queries.js
import express from 'express';
import Query from '../models/Query.js'; // ensure Query model exports default

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { student, course } = req.query;
    const filter = {};
    if (student) filter.student = student;
    if (course) filter.course = course;

    const queries = await Query.find(filter).sort({ createdAt: -1 }).lean();
    res.json(queries);
  } catch (err) {
    console.error('GET /api/queries error', err);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, courseId, courseTitle, subject, message } = req.body;
    if (!studentId || !message) {
      return res.status(400).json({ error: 'Missing required fields (studentId & message)' });
    }

    const q = new Query({
      student: studentId,
      studentName: studentName || '',
      studentEmail: studentEmail || '',
      course: courseId || null,
      courseTitle: courseTitle || '',
      subject: subject || '',
      message,
    });

    const saved = await q.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /api/queries error', err);
    res.status(500).json({ error: 'Failed to create query' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    if (req.body.reply !== undefined) updates.reply = req.body.reply;
    if (req.body.status !== undefined) updates.status = req.body.status;

    updates.updatedAt = Date.now();

    const updated = await Query.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Query not found' });

    res.json(updated);
  } catch (err) {
    console.error('PUT /api/queries/:id error', err);
    res.status(500).json({ error: 'Failed to update query' });
  }
});

export default router;
