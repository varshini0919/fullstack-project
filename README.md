# Team Task Manager

A minimal, fully functional full-stack web application for managing tasks, built to successfully deploy on Railway in under 3 hours.

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Auth:** JWT, bcryptjs

## Features
- **User Authentication:** Signup and Login using JWT.
- **Roles:** Admin and Member.
- **Task Management:** Admins can create tasks and assign them to Members. Members can update their assigned tasks.
- **Dashboard:** Displays total, pending, and completed task counts.

## Getting Started (Local Development)

### 1. Install Dependencies
Make sure you have Node.js and MongoDB installed, then run:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (already included for you) or modify it if needed:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=supersecretjwtkeyforassignment
```
*Note: Make sure your local MongoDB instance is running on port 27017, or replace the URI with a MongoDB Atlas string.*

### 3. Run the Server
```bash
npm start
```

### 4. Use the App
Open your browser and navigate to: [http://localhost:5000](http://localhost:5000)
