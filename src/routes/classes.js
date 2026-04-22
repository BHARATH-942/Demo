const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');

// @route   POST api/classes
// @desc    Create a class session
// @access  Private Admin
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { subject, classCode, location, radius } = req.body;

        const newClass = new Class({
            subject,
            classCode,
            instructor: req.user.id,
            location,
            radius
        });

        const classObj = await newClass.save();
        res.json(classObj);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/classes
// @desc    Get all active classes
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const classes = await Class.find({ isActive: true }).sort({ date: -1 });
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/classes/:sessionCode
// @desc    Verify a class code
// @access  Private
router.get('/verify/:sessionCode', auth, async (req, res) => {
    try {
        const classObj = await Class.findOne({ classCode: req.params.sessionCode, isActive: true });
        if (!classObj) {
            return res.status(404).json({ msg: 'Invalid or inactive session code', valid: false });
        }
        res.json({ valid: true, class: classObj });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
