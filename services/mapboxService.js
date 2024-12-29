const axios = require('axios');
const FRANCHISES = require('../utils/franchises.json');

const MAPBOX_API_URL = 'https://api.mapbox.com';
const MAX_RESULTS = 50;
const SEARCH_RADIUS = 25000;
const { MAPBOX_TOKEN } = require('../config/dotenv');

if (!MAPBOX_TOKEN) {
    throw new Error('MAPBOX_TOKEN is not defined in environment variables');
}

/**
 * @param {string} placeName
 * @returns {boolean}
 */
const isFranchise = (placeName) => {
    if (!placeName) return false;
    
    const normalizedName = placeName.toLowerCase().trim();
    
    // Break the place name into words to check for franchise matches
    const words = normalizedName.split(/[\s-]+/);
    
    return FRANCHISES.some(franchise => {
        const normalizedFranchise = franchise.toLowerCase().trim();
        
        // Check for exact matches
        if (normalizedName === normalizedFranchise) return true;
        
        // Check if franchise name appears as a complete word or phrase
        if (normalizedName.includes(` ${normalizedFranchise} `) || 
            normalizedName.startsWith(`${normalizedFranchise} `) || 
            normalizedName.endsWith(` ${normalizedFranchise}`)) {
            return true;
        }
        
        // Check for possessive forms
        const possessiveForm = normalizedFranchise.replace(/'s\b/, '');
        if (words.some(word => word.startsWith(possessiveForm))) {
            return true;
        }
        
        return false;
    });
};

/**
 * @param {string} query
 * @returns {Promise<Array<{center: number[], place_name: string, context: Array<{id: string, text: string}>}>>}
 */
const searchLocation = async (query) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(
                query
            )}.json?access_token=${MAPBOX_TOKEN}&types=place,locality&limit=1`
        );

        if (response.data.features && response.data.features.length > 0) {
            const feature = response.data.features[0];
            const shops = await searchNearbyShops(feature.center);
            
            return [{
                center: feature.center,
                place_name: feature.place_name,
                context: feature.context || [],
                shops
            }];
        }

        return [];
    } catch (error) {
        console.error('Error searching location:', error);
        return [];
    }
};

/**
 * @param {string} placeName
 * @param {string} location
 * @returns {Promise<string>}
 */
const getPhotoFromGooglePlaces = async (placeName, location) => {
    const localCoffeeShopPhotos = [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
        'https://images.unsplash.com/photo-1600093463592-2e8d28d7f1f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
        'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
        'https://images.unsplash.com/photo-1453614512568-c4024d13c247?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80'
    ];

    const combinedString = `${placeName}-${location}`;
    const hash = Array.from(combinedString).reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const index = Math.abs(hash) % localCoffeeShopPhotos.length;
    return localCoffeeShopPhotos[index];
};

/**
 * @param {Object} place
 * @returns {Promise<Object>}
 */
const transformMapboxPlaceToShop = async (place) => {
    const name = place.text || place.place_name;
    const city = place.context?.find((ctx) => ctx.id.startsWith('place'))?.text || '';
    const state = place.context?.find((ctx) => ctx.id.startsWith('region'))?.text || '';
    const location = `${city}, ${state}`;

    const photo = await getPhotoFromGooglePlaces(name, location);

    return {
        id: place.id,
        name,
        address: place.properties?.address || place.place_name,
        city,
        state,
        description: `Local coffee shop in ${city || 'the area'}`,
        coordinates: {
            longitude: place.center[0],
            latitude: place.center[1],
        },
        photos: [photo],
        contact: {
            website: `https://maps.google.com/search?q=${encodeURIComponent(name + ' ' + location)}`,
        }
    };
};

/**
 * @param {[number, number]} coordinates
 * @param {number} [radius]
 * @returns {Promise<Array<Object>>}
 */
const searchNearbyShops = async ([longitude, latitude], radius = SEARCH_RADIUS) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/coffee.json?proximity=${longitude},${latitude}&access_token=${MAPBOX_TOKEN}&types=poi&limit=${MAX_RESULTS}&radius=${radius}`
        );

        const nonFranchiseShops = response.data.features.filter(place => {
            // Get all possible name variations from the place data
            const namesToCheck = [
                place.text,
                place.place_name,
                place.properties?.name,
                ...((place.context || []).map(ctx => ctx.text))
            ].filter(Boolean);

            // Return false if ANY of the names match a franchise
            return !namesToCheck.some(isFranchise);
        });

        const shopPromises = nonFranchiseShops.map(transformMapboxPlaceToShop);
        const shops = await Promise.all(shopPromises);

        return shops;
    } catch (error) {
        console.error('Error searching nearby shops:', error);
        return [];
    }
};

/**
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const getPlaceById = async (id) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${id}.json?access_token=${MAPBOX_TOKEN}`
        );

        if (response.data.features && response.data.features.length > 0) {
            const place = response.data.features[0];
            return await transformMapboxPlaceToShop(place);
        }
        return null;
    } catch (error) {
        console.error('Error getting place by ID:', error);
        return null;
    }
};

/**
 * @param {string} address
 * @returns {Promise<[number, number]|null>}
 */
const getLocationCoordinates = async (address) => {
    try {
        const response = await axios.get(
            `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(
                address
            )}.json?access_token=${MAPBOX_TOKEN}&limit=1`
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

/**
 * @param {Array<[number, number]>} coordinates
 * @param {number} [padding]
 * @returns {[[number, number], [number, number]]}
 */
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
    getBoundingBox
};