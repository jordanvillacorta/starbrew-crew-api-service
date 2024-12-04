const axios = require('axios');
import franchises from '../utils/franchises.json';

// Constants
const MAPBOX_API_URL = process.env.MAPBOX_API_URL;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

const FRANCHISES = franchises;

// Utility function to check if a place is a franchise
const isFranchise = (placeName) => {
    const normalizedName = placeName.toLowerCase();
    return FRANCHISES.some((franchise) => normalizedName.includes(franchise.toLowerCase()));
};

// Transform Mapbox place to a Shop-like object
const transformMapboxPlaceToShop = (place) => ({
    id: place.id,
    name: place.text || place.place_name,
    address: place.properties?.address || place.place_name,
    city: place.context?.find((ctx) => ctx.id.startsWith('place'))?.text || '',
    state: place.context?.find((ctx) => ctx.id.startsWith('region'))?.text || '',
    description: `Local coffee shop in ${place.context?.find((ctx) => ctx.id.startsWith('place'))?.text || 'the area'
        }`,
    coordinates: {
        longitude: place.center[0],
        latitude: place.center[1],
    },
    photos: [
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=2940',
    ],
    contact: {
        website: `https://maps.google.com/search?q=${encodeURIComponent(place.text || place.place_name)}`,
    },
});

// Search for locations based on a query
const searchLocation = async (query) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
            {
                params: {
                    access_token: MAPBOX_TOKEN,
                    types: 'place,locality',
                    limit: 50,
                },
            }
        );

        return response.data.features.map((feature) => ({
            center: feature.center,
            place_name: feature.place_name,
            context: feature.context || [],
        }));
    } catch (error) {
        console.error('Error searching location:', error);
        return [];
    }
};

// Search for nearby coffee shops
const searchNearbyShops = async ([longitude, latitude], radius = 10000) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/coffee.json`,
            {
                params: {
                    proximity: `${longitude},${latitude}`,
                    access_token: MAPBOX_TOKEN,
                    types: 'poi',
                    limit: 25,
                },
            }
        );

        return response.data.features
            .filter((place) => !isFranchise(place.text))
            .map(transformMapboxPlaceToShop);
    } catch (error) {
        console.error('Error searching nearby shops:', error);
        return [];
    }
};

// Get a place by ID
const getPlaceById = async (id) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${id}.json`,
            {
                params: {
                    access_token: MAPBOX_TOKEN,
                },
            }
        );

        if (response.data.features && response.data.features.length > 0) {
            return transformMapboxPlaceToShop(response.data.features[0]);
        }
        return null;
    } catch (error) {
        console.error('Error getting place by ID:', error);
        return null;
    }
};

// Get coordinates for an address
const getLocationCoordinates = async (address) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
            {
                params: {
                    access_token: MAPBOX_TOKEN,
                    limit: 1,
                },
            }
        );

        if (response.data.features && response.data.features.length > 0) {
            return response.data.features[0].center;
        }
        return null;
    } catch (error) {
        console.error('Error getting coordinates:', error);
        return null;
    }
};

// Calculate bounding box with optional padding
const getBoundingBox = (coordinates, padding = 50) => {
    const bounds = coordinates.reduce(
        (bounds, coord) => {
            return [
                [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
                [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
            ];
        },
        [
            [coordinates[0][0], coordinates[0][1]],
            [coordinates[0][0], coordinates[0][1]],
        ]
    );

    // Add padding
    const paddingLng = (bounds[1][0] - bounds[0][0]) * (padding / 100);
    const paddingLat = (bounds[1][1] - bounds[0][1]) * (padding / 100);

    return [
        [bounds[0][0] - paddingLng, bounds[0][1] - paddingLat],
        [bounds[1][0] + paddingLng, bounds[1][1] + paddingLat],
    ];
};

module.exports = {
    searchLocation,
    searchNearbyShops,
    getPlaceById,
    getLocationCoordinates,
    getBoundingBox,
};
