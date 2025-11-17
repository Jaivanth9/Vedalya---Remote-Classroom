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
import queriesRouter from './routes/queries.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ---------------------------------------------------
   GLOBAL CORS HEADERS (ALWAYS APPLIED)
   --------------------------------------------------- */
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://vedalya-remote-classroom.vercel.app',
  'https://vedalya-remote-classroom-pzt2.onrender.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

/* ---------------------------------------------------
   EXPRESS JSON BODY PARSER
   --------------------------------------------------- */
app.use(express.json());

/* ---------------------------------------------------
   SECONDARY CORS HANDLER (SAFE)
   --------------------------------------------------- */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS: Not allowed"));
    },
    credentials: true
  })
);

/* ---------------------------------------------------
   ERROR PROTECTION WRAPPER (AVOID CRASH → 502)
   --------------------------------------------------- */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

/* ---------------------------------------------------
   MONGODB CONNECTION
   --------------------------------------------------- */
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

/* ---------------------------------------------------
   ROUTES
   --------------------------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRouter);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/queries', queriesRouter);

/* ---------------------------------------------------
   HEALTH CHECK
   --------------------------------------------------- */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/* ---------------------------------------------------
   START SERVER
   --------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
