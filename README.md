# Akalya Smart Learn

A comprehensive e-learning platform built with React, TypeScript, Express.js, and MongoDB.

## Project Structure

```
├── server/          # Backend server (Express.js + MongoDB)
├── src/            # Frontend React application
├── public/         # Static assets
└── package.json    # Frontend dependencies
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/akalya-smart-learn
JWT_SECRET=your-secret-key-change-in-production
LOVABLE_API_KEY=your-lovable-api-key
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001/api
```

3. Start the development server:
```bash
npm run dev
```

## Features

- **User Authentication**: Sign up, sign in, and role-based access control
- **Course Management**: Create, update, and manage courses
- **Assignments**: Create assignments, submit work, and grade submissions
- **Live Classes**: Schedule and manage live and recorded classes
- **Notes**: Create and manage learning/teaching notes
- **AI Chat Assistant**: Interactive AI-powered learning assistant
- **Enrollments**: Students can enroll in courses and track progress

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api)

### Backend (server/.env)
- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `LOVABLE_API_KEY` - API key for AI chat assistant

## Development

### Running the Application

1. Start MongoDB (if running locally)
2. Start the backend server: `cd server && npm run dev`
3. Start the frontend: `npm run dev`

### Building for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
cd server
npm start
```

## License

MIT
