const express = require('express');
const { generateAiResponse } = require('../controllers/aiController');

const router = express.Router();

router.post('/ai', generateAiResponse);

module.exports = router;
