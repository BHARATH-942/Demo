const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');

// Helper to calculate distance in meters between two lat/longs
function getDistanceFromLatLonInM_Sphere(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in m
    return d;
}

// @route   POST api/attendance/mark
// @desc    Mark attendance
// @access  Private
router.post('/mark', auth, async (req, res) => {
    try {
        const { sessionCode, location } = req.body;

        // Check class session
        const classSession = await Class.findOne({ classCode: sessionCode, isActive: true });
        if (!classSession) {
            return res.status(404).json({ msg: 'Invalid or inactive session code' });
        }

        // Double check expiration to prevent race conditions
        if (new Date() > classSession.endTime) {
            return res.status(400).json({ msg: 'Session has ended. No more attendance can be logged.' });
        }

        // Check if attendance already marked
        let attendance = await Attendance.findOne({ student: req.user.id, classSession: classSession.id });
        if (attendance) {
            return res.status(400).json({ msg: 'Attendance already marked for this session' });
        }

        // Location Check
        let locationMatched = true;
        if (classSession.location && location) {
            const distance = getDistanceFromLatLonInM_Sphere(
                classSession.location.latitude,
                classSession.location.longitude,
                location.latitude,
                location.longitude
            );
            if (distance > classSession.radius) {
                locationMatched = false;
            }
        } else {
            // If class requires location but user didn't provide
            locationMatched = false;
        }

        // Face recognition should happen on frontend (sending descriptor and comparing on front, or back).
        // In our architecture, the frontend sends request *only* if face matched, session code is valid, and location holds true.
        // However, backend validates location and session code again for security.

        if (!locationMatched) {
            return res.status(400).json({ msg: 'Location validation failed. You are too far from the class.' });
        }

        attendance = new Attendance({
            student: req.user.id,
            classSession: classSession.id,
            status: 'Present',
            locationMatched
        });

        await attendance.save();
        res.json({ msg: 'Attendance marked successfully', attendance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/attendance
// @desc    Get current user attendance history
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const attendances = await Attendance.find({ student: req.user.id })
            .populate('classSession', ['subject', 'classCode', 'date'])
            .sort({ timestamp: -1 });

        res.json(attendances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/attendance/all
// @desc    Get all attendance (Admin)
// @access  Private Admin
router.get('/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const attendances = await Attendance.find()
            .populate('student', ['name', 'email'])
            .populate('classSession', ['subject', 'classCode', 'date'])
            .sort({ timestamp: -1 });

        res.json(attendances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
