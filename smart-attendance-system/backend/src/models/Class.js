const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    classCode: {
        type: String,
        required: true,
        unique: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    radius: {
        type: Number,
        default: 100 // allowed radius in meters
    },
    isActive: {
        type: Boolean,
        default: true
    },
    endTime: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('class', ClassSchema);
