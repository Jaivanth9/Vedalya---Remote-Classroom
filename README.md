# 📚 Vedalya Remote Classroom  
A full-stack online learning platform for teachers and students with courses, assignments, submissions, attendance, queries, chat, notifications, and more.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Stack](https://img.shields.io/badge/Stack-MERN-green)
![Build](https://img.shields.io/badge/Status-Active-success)

---

## 🚀 Overview
**Vedalya Remote Classroom** is a modern, scalable, remote learning platform designed for teachers and students.  
It includes real-time dashboards, assignment workflows, class videos, student queries, authentication, and detailed analytics.

This repository contains both the **frontend (React + Vite)** and **backend (Node.js + Express + MongoDB)**.

---

## ✨ Features

### 👨‍🏫 Teacher Features
- Create and manage courses  
- Upload video classes  
- Create, view, and grade assignments  
- Track submissions & pending reviews  
- Respond to student queries  
- View analytics (students, submissions, courses, queries)  
- Notification center  
- Full teacher dashboard with real-time polling  

### 👨‍🎓 Student Features
- View available/enrolled courses  
- Attend video lectures  
- Submit assignments  
- View grades & feedback  
- Send doubts / queries to teachers  
- View teacher replies  
- Profile & settings  

### 🔐 Authentication
- JWT-based login  
- Student / Teacher roles  
- Secure protected routes  
- Auto session management  

---

## 👥 Project Team

| Name                         | Email                               | Role |
|-----------------------------|---------------------------------------|------|
| **Koppula Jaivanth**        | jaivanthkoppula999@gmail.com          | Full-Stack & Backend Developer |
| **Sri Rahul Sai Teja Sirigineedi** | Rahul.939014@gmail.com               | Frontend Developer |
| **Karri Deepak Seshu Reddy** | deepaksahith418@gmail.com             | Chatbot Developer & AIML |
| **Mahideep Yadav Gummadi**  | mahideepyadav.g@gmail.com             | Backend Developer |
| **Malapati Renusree**       | renusreemalapati@gmail.com            | Frontend Developer |
| **Bochha Yaswanth**         | yaswanth.bochha@gmail.com             | DataScience & Integrations |


---

## 🏗️ Tech Stack

### **Frontend**  
- React + TypeScript  
- Vite  
- Tailwind CSS  
- ShadCN UI  
- React Router  
- Axios  

### **Backend**
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT Authentication  
- CORS + Security Middleware  

### **DevOps / Deployment**
- Render (Backend)  
- Vercel (Frontend)

---

## ⚙️ Environment Variables

### **Backend (.env)**
PORT=3001
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
AI / Chat (Optional)

GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash

CORS allowed frontend

VITE_API_BASE_URL=https://your-frontend-domain.vercel.app


### **Frontend (.env)**

VITE_API_URL="https://your-backend-server.onrender.com/api"


## 🛠️ Installation & Setup

### **Backend**

cd server
npm install
npm run dev


### **Frontend**

npm install
npm run dev

🔗 API Overview
Auth Routes

POST /api/auth/signup
POST /api/auth/signin
GET /api/auth/me

Courses

GET /api/courses
POST /api/courses
PUT /api/courses/:id

Assignments

POST /api/assignments
GET /api/assignments

Submissions

POST /api/submissions
GET /api/submissions/me
PUT /api/submissions/:id

Queries (Doubts)

POST /api/queries
GET /api/queries
PUT /api/queries/:id

…and many more.

🚀 Deployment
Frontend (Vercel)

Connect GitHub repo

Add VITE_API_URL environment variable

Deploy

Backend (Render)

Add environment variables

Select "Web Service"

Build & deploy

Ensure proper CORS setup

🤝 Contributing

Fork the repo

Create a feature branch

Commit changes

Push and open PR

📜 License

MIT License — free to use, modify, distribute.

❤️ Acknowledgements

React, Express, MongoDB teams

ShadCN UI

Render + Vercel

Google Gemini
