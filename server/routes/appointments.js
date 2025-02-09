// routes/appointments.js
const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const authenticate = require('../middleware/authorize');

const router = express.Router();

// Middleware to check if the user is a caretaker
const isCaretaker = async (req, res, next) => {
    const user = await User.findById(req.body.caretaker);
    if (user && user.role === 'caretaker') {
        next();
    } else {
        return res.status(403).json({ message: 'Only caretakers can perform this action' });
    }
};

// Add Appointment (Caretaker Only)
router.post('/add', authenticate, async (req, res) => {
    try {
        const { date, location, doctor} = req.body;

        // Ensure the requester is a caretaker
        if (req.user.role !== 'caretaker') {
            return res.status(403).json({ message: 'Only caretakers can add appointments.' });
        }

        // Get the caretaker's record
        const caretaker = await User.findById(req.user.userId).populate('elderlyUser');

        // Check if caretaker has an assigned elderly user
        if (!caretaker.elderlyUser) {
            return res.status(400).json({ message: 'You have no assigned elderly user.' });
        }

        // Create new appointment
        const appointment = new Appointment({
            date,
            location,
            doctor,
            elderlyUser: caretaker.elderlyUser._id,
            caretaker: caretaker._id
        });

        await appointment.save();

        // Add appointment to elderly user's record
        caretaker.elderlyUser.appointments.push(appointment._id);
        await caretaker.elderlyUser.save();

        res.status(201).json({ message: 'Appointment added successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// 📋 Get Appointments for the Elderly User (Accessible by Caretaker & Elderly User)
router.get('/appointments', authenticate, async (req, res) => {
    try {
        let elderlyUserId;

        if (req.user.role === 'caretaker') {
            // Caretaker: Get the assigned elderly user
            const caretaker = await User.findById(req.user.userId);
            elderlyUserId = caretaker.elderlyUser;

            if (!elderlyUserId) {
                return res.status(200).json([]);  // Empty array
            }
        } else if (req.user.role === 'elderly') {
            // Elderly User: Use their own ID
            elderlyUserId = req.user.userId;
        } else {
            return res.status(403).json({ message: 'Unauthorized access.' });
        }

        // Fetch appointments for the elderly user
        const appointments = await Appointment.find({ elderlyUser: elderlyUserId });

        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// 🔄 Update Appointment (Caretaker Only)
router.put('/update/:id', isCaretaker, async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// ❌ Delete Appointment (Caretaker Only)
router.delete('/delete/:id', isCaretaker, async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;