// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 

const router = express.Router();

// Register Route
router.post('/signup', async (req, res) => {
    try {
        const { name, username, password } = req.body;  // Removed 'role'

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user as a 'caretaker' by default
        const newUser = new User({
            name,
            username,
            password: hashedPassword,
            role: 'caretaker'   // Set role directly
        });

        await newUser.save();
        res.status(201).json({ message: 'Caretaker registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Generic Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username })
            .populate('elderlyUser') // Populate if caretaker
            .populate('appointments'); // Populate if elderly

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send Role-Based Data
        const responseData = {
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                role: user.role,
                ...(user.role === 'caretaker'
                    ? { elderlyUser: user.elderlyUser }
                    : { appointments: user.appointments, medicalCondition: user.medicalCondition })
            }
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;