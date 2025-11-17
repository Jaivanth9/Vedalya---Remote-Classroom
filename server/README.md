# Akalya Smart Learn - Backend Server

This is the backend server for the Akalya Smart Learn application, built with Express.js and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server` directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/akalya-smart-learn
JWT_SECRET=your-secret-key-change-in-production
LOVABLE_API_KEY=your-lovable-api-key
```

3. Make sure MongoDB is running on your system or update `MONGODB_URI` to point to your MongoDB instance.

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up a new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user
- `GET /api/auth/role` - Get user role
- `PUT /api/auth/role` - Update user role

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (teacher/admin only)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get single assignment
- `POST /api/assignments` - Create assignment (teacher/admin only)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submissions
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/:id` - Get single submission
- `POST /api/submissions` - Create submission (student only)
- `PUT /api/submissions/:id/grade` - Grade submission (teacher/admin only)

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get single class
- `POST /api/classes` - Create class (teacher/admin only)
- `PUT /api/classes/:id` - Update class

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Enroll in course (student only)
- `PUT /api/enrollments/:id` - Update enrollment progress

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:conversationId/messages` - Get messages
- `POST /api/chat/messages` - Save message
- `POST /api/chat/assistant` - Chat assistant endpoint

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Models

- User
- Course
- Assignment
- AssignmentSubmission
- Class
- CourseEnrollment
- Note
- ChatConversation
- ChatMessage

