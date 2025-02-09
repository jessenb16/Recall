const express = require('express');
const generateWordSearch = require('../utils/wordSearchGenerator');

const router = express.Router();

router.get('/puzzle', (req, res) => {
    const words = ['HEALTH', 'YOGA', 'BLOOD', 'NAP', 'CARE'];
    const puzzle = generateWordSearch(words, 12); // 12x12 grid

    res.json(puzzle);
});

module.exports = router;