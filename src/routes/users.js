const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/users/face
// @desc    Upload user face descriptor base
// @access  Private
router.post('/face', auth, async (req, res) => {
    try {
        const { faceDescriptor } = req.body; // array of floats from client

        if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
            return res.status(400).json({ msg: 'Invalid face descriptor' });
        }

        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.faceDescriptor = faceDescriptor;
        await user.save();

        res.json({ msg: 'Face descriptor saved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/students
// @desc    Get all students
// @access  Private Admin
router.get('/students', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Select all user except password
        const students = await User.find({ role: 'student' }).select('-password -faceDescriptor');
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/:id/face
// @desc    Get standard face descriptor for user
// @access  Private
router.get('/:id/face', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user.faceDescriptor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
