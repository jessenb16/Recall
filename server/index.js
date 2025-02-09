// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const elderlyRoutes = require('./routes/elderly');
const gameRoutes = require('./routes/game');

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);               // Auth Routes (Signup, Login)
app.use('/api/appointments', appointmentRoutes); // Appointment Routes
app.use('/api/elderly', elderlyRoutes); // Elderly Routes (Add Elderly)
app.use('/api/game', gameRoutes); // Game Routes (Word Search)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((error) => console.error('❌ MongoDB connection error:', error));