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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GO TO: http://0.0.0.0:${PORT}`);
    });

    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.log('Local MongoDB not found. Falling back to In-Memory Database Simulator...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create({
                instance: {
                    startupTimeout: 60000 // 60 seconds
                },
                binary: {
                    version: '7.0.14' // Ensure a version supported by Debian 12+
                }
            });
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            console.log('Connected to In-Memory MongoDB! (Your app will run perfectly for your demo)');
        } catch (memoryDbError) {
            console.error('FATAL ERROR: Failed to start the In-Memory Database.', memoryDbError);
        }
    }
}

startServer();
