// routes/elderly.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authenticate = require('../middleware/authorize'); // Middleware to verify JWT

const router = express.Router();

// Route to add an elderly person (only for caretakers)
router.post('/add', authenticate, async (req, res) => {
    try {
        const { name, username, password, medicalCondition, age, gender, relationToCaregiver } = req.body;

        // Ensure the logged-in user is a caretaker
        if (req.user.role !== 'caretaker') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            //Print to terminal
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create elderly user
        const elderlyUser = new User({
            name,
            username,
            password: hashedPassword,
            role: 'elderly',
            medicalCondition,
            caretaker: req.user.userId, // Link to caretaker
            age,
            gender,
            relationToCaregiver,
        });

        await elderlyUser.save();

        const caretaker = await User.findById(req.user.userId);

        if (caretaker.elderlyUser) {
            return res.status(400).json({ message: 'You already have an assigned elderly user.' });
        }


        // Assign the elderly user to the caretaker
        await User.findByIdAndUpdate(req.user.userId, { elderlyUser: elderlyUser._id });

        res.status(201).json({ message: 'Elderly user added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;