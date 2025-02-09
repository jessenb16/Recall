// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
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
        enum: ['caretaker', 'elderly'],
        required: true
    },
    // For caretakers
    elderlyUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // For elderly users
    caretaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    medicalCondition: {
        type: String,
        required: function() {
            return this.role === 'elderly'; // Only required for elderly users
        }
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;