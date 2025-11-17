import express from 'express';
import Note from '../models/Note.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get notes
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    if (req.query.classId) {
      filter.classId = req.query.classId;
    }

    const notes = await Note.find(filter)
      .populate('courseId', 'title')
      .populate('classId', 'title')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('courseId', 'title')
      .populate('classId', 'title');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Users can only access their own notes
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, noteType, courseId, classId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const note = new Note({
      userId: req.user._id,
      title,
      content,
      noteType: noteType || 'learning',
      courseId: courseId || null,
      classId: classId || null
    });

    await note.save();
    await note.populate('courseId', 'title');
    await note.populate('classId', 'title');

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Users can only update their own notes
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, content, noteType, courseId, classId } = req.body;

    if (title) note.title = title;
    if (content) note.content = content;
    if (noteType) note.noteType = noteType;
    if (courseId !== undefined) note.courseId = courseId;
    if (classId !== undefined) note.classId = classId;

    await note.save();
    await note.populate('courseId', 'title');
    await note.populate('classId', 'title');

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Users can only delete their own notes
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;

