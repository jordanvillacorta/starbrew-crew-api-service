const express = require('express');
const { generateAIResponse, analyzeCoffeeShopData, enrichCoffeeShopSearch, healthCheck } = require('../controllers/aiController');

const router = express.Router();

router.post('/generate', generateAIResponse);
router.post('/analyze', analyzeCoffeeShopData);
router.post('/enrich', enrichCoffeeShopSearch);
router.get('/health', healthCheck);

module.exports = router;
