const mapboxService = require('../services/mapboxService');

class MapboxController {
  async searchLocation(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const locations = await mapboxService.searchLocation(query);
      res.json(locations);
    } catch (error) {
      console.error('Search location error:', error);
      res.status(500).json({ error: 'Failed to search location' });
    }
  }

  async searchNearbyShops(req, res) {
    try {
      const { longitude, latitude, radius } = req.query;
      if (!longitude || !latitude) {
        return res.status(400).json({ error: 'Longitude and latitude are required' });
      }

      const coordinates = [parseFloat(longitude), parseFloat(latitude)];
      const searchRadius = radius ? parseInt(radius) : undefined;
      
      const shops = await mapboxService.searchNearbyShops(coordinates, searchRadius);
      res.json(shops);
    } catch (error) {
      console.error('Search nearby shops error:', error);
      res.status(500).json({ error: 'Failed to search nearby shops' });
    }
  }

  async getPlaceById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Place ID is required' });
      }

      const place = await mapboxService.getPlaceById(id);
      if (!place) {
        return res.status(404).json({ error: 'Place not found' });
      }

      res.json(place);
    } catch (error) {
      console.error('Get place error:', error);
      res.status(500).json({ error: 'Failed to get place details' });
    }
  }

  async getLocationCoordinates(req, res) {
    try {
      const { address } = req.query;
      if (!address) {
        return res.status(400).json({ error: 'Address is required' });
      }

      const coordinates = await mapboxService.getLocationCoordinates(address);
      if (!coordinates) {
        return res.status(404).json({ error: 'Coordinates not found' });
      }

      res.json({ coordinates });
    } catch (error) {
      console.error('Get coordinates error:', error);
      res.status(500).json({ error: 'Failed to get coordinates' });
    }
  }

  async getBoundingBox(req, res) {
    try {
      const { coordinates, padding } = req.body;
      if (!coordinates || !Array.isArray(coordinates)) {
        return res.status(400).json({ error: 'Valid coordinates array is required' });
      }

      const boundingBox = mapboxService.getBoundingBox(coordinates, padding);
      res.json({ boundingBox });
    } catch (error) {
      console.error('Get bounding box error:', error);
      res.status(500).json({ error: 'Failed to calculate bounding box' });
    }
  }
}

module.exports = new MapboxController(); 