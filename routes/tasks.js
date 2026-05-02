const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get Dashboard Stats
router.get('/dashboard', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Admin') {
            query.assignedTo = req.user.id;
        }
        const total = await Task.countDocuments(query);
        const completed = await Task.countDocuments({ ...query, status: 'Completed' });
        const pending = await Task.countDocuments({ ...query, status: 'Pending' });

        res.json({ total, completed, pending });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        // Admin sees all, member sees their assigned tasks
        let query = {};
        if (req.user.role !== 'Admin') {
            query.assignedTo = req.user.id;
        }
        const tasks = await Task.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create task (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Not authorized to create tasks' });
    }
    try {
        const { title, description, assignedTo } = req.body;
        const task = new Task({
            title,
            description,
            assignedTo,
            createdBy: req.user.id
        });
        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update task status
router.put('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Ensure user is authorized to update
        if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this task' });
        }

        task.status = req.body.status || task.status;
        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
