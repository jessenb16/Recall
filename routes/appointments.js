// routes/appointments.js
const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

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

// ✅ Create Appointment (Caretaker Only)
router.post('/add', isCaretaker, async (req, res) => {
    try {
        const { date, location, doctor, elderlyUser, caretaker } = req.body;

        const newAppointment = new Appointment({
            date,
            location,
            doctor,
            elderlyUser,
            caretaker
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 📋 Get All Appointments for an Elderly User
router.get('/elderly/:id', async (req, res) => {
    try {
        const appointments = await Appointment.find({ elderlyUser: req.params.id });
        res.status(200).json(appointments);
    } catch (error) {
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