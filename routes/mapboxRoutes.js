const express = require('express');
import { searchLocation } from '../services/mapboxService.js';

const router = express.Router();

router.get('mapbox/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Query is required.' });
        }

        const results = await searchLocation(query);
        res.json(results);
    } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
