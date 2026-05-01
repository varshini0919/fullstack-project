require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Database & Server Setup
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';

async function startServer() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.log('Local MongoDB not found. Downloading and spinning up In-Memory Database Simulator (this may take up to 60 seconds on the first run)...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({
            instance: {
                startupTimeout: 60000 // 60 seconds
            }
        });
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('Connected to In-Memory MongoDB! (Your app will run perfectly for your demo)');
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GO TO: http://0.0.0.0:${PORT}`);
    });
}

startServer();
