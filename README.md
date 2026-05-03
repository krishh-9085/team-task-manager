# 📋 Team Task Manager

A full-stack, collaborative project and task management application built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## ✨ Features

- **Authentication System**: Secure user registration and login using JWT (JSON Web Tokens).
- **Project Workspaces**: Create, manage, and view distinct projects.
- **Team Collaboration**: Invite members to projects with role-based access control (Admin, Member).
- **Task Management**: Create tasks, assign them to team members, set priorities (Low, Medium, High), and manage statuses (To Do, In Progress, Done).
- **Kanban-Style Boards**: Visual task management interface organized by status.
- **Analytics Dashboard**: Centralized dashboard to view overall progress, overdue tasks, and project summaries.
- **Responsive Design**: Premium, dark-mode focused UI built with Tailwind CSS and glassmorphism effects.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (via Vite)
- **Tailwind CSS** (for styling)
- **React Router** (for navigation)
- **Axios** (for API requests)
- **Lucide React** (for modern icons)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database and ORM)
- **JSON Web Token (JWT)** (Secure authentication)
- **Bcrypt.js** (Password hashing)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB server)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/task-manager"
JWT_SECRET="your_super_secret_jwt_key"
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

The app will now be running on `http://localhost:5173`.

---

## 🌍 Deployment (Railway)

This application is designed as a Monorepo and can be easily deployed to [Railway.app](https://railway.app/).

1. **Connect GitHub**: Create a new project in Railway and select this repository.
2. **Deploy Backend**: 
   - Set the `Root Directory` to `/backend`.
   - Add your `.env` variables (`DATABASE_URL`, `JWT_SECRET`, etc.) in the Railway Variables tab.
   - Generate a Domain in the Public Networking settings.
3. **Deploy Frontend**:
   - Create a second service in Railway from the same repository.
   - Set the `Root Directory` to `/frontend`.
   - Add the environment variable `VITE_API_URL` and set it to your Backend's generated domain (e.g., `https://your-backend-url.up.railway.app/api`).
   - Generate a Domain for the frontend to access your live application!

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
