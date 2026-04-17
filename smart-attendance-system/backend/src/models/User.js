const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    faceDescriptor: {
        type: [Number], // Array of numbers representing the face-api descriptor
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('user', UserSchema);
