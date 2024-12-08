const express = require('express');
const router = express.Router();
const mapboxController = require('../controllers/mapboxController');

// Search endpoints
router.get('/locations/search', mapboxController.searchLocation);
router.get('/shops/nearby', mapboxController.searchNearbyShops);

// Place details
router.get('/shops/:id', mapboxController.getPlaceById);

// Utility endpoints
router.get('/locations/coordinates', mapboxController.getLocationCoordinates);
router.post('/locations/bounds', mapboxController.getBoundingBox);

module.exports = router;
