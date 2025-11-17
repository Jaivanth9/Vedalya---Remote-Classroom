// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import courseRouter from './routes/courses.js';
import assignmentRoutes from './routes/assignments.js';
import classRoutes from './routes/classes.js';
import enrollmentRoutes from './routes/enrollments.js';
import submissionRoutes from './routes/submissions.js';
import noteRoutes from './routes/notes.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/users.js';
import queriesRouter from './routes/queries.js'; // <<< fixed import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/akalya-smart-learn';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes (register each router once)
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRouter);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/queries', queriesRouter); // mounted correctly

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
