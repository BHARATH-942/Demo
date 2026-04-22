const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    classSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class',
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Present'
    },
    locationMatched: {
        type: Boolean,
        default: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('attendance', AttendanceSchema);
