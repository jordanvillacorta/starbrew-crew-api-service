const axios = require('axios');
const { handleError } = require('../utils/errorHandler');
const redisClient = require('../config/redis');

/**
 * Generates AI completion using OpenAI API
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<Object>} - The AI-generated response
 */
const generateAICompletion = async (prompt) => {
    try {
        // Try to get cached response first
        let cachedResponse;
        try {
            cachedResponse = await redisClient.get(`ai:${prompt}`);
            if (cachedResponse) {
                return JSON.parse(cachedResponse);
            }
        } catch (cacheError) {
            console.warn('Redis cache error:', cacheError);
            // Continue without cache if Redis is unavailable
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that provides responses in valid JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
                top_p: 1,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Try to cache the response
        try {
            await redisClient.set(
                `ai:${prompt}`, 
                JSON.stringify(response.data),
                'EX',
                3600 // Cache for 1 hour
            );
        } catch (cacheError) {
            console.warn('Redis cache set error:', cacheError);
            // Continue without caching if Redis is unavailable
        }

        return response.data;
    } catch (error) {
        throw new Error(`AI Completion error: ${error.message}`);
    }
};

/**
 * Retrieves AI-driven insights for coffee shop searches
 * @param {Array} coffeeShops - Array of coffee shops from the Mapbox API
 * @param {string} userPreferences - User-specific preferences for ranking
 * @returns {Promise<Object>} - Ranked and analyzed insights for the coffee shops
 */
const analyzeCoffeeShops = async (coffeeShops, userPreferences) => {
    try {
        const prompt = `Analyze and rank the following coffee shops based on user preferences. 
        Provide the response as a JSON array of objects, where each object contains the shop name, 
        rank (1 being best), and a brief explanation of the ranking.
        
        Coffee Shops: ${JSON.stringify(coffeeShops)}
        User Preferences: ${userPreferences}
        
        Response format:
        [
            {
                "name": "shop name",
                "rank": number,
                "explanation": "reason for ranking"
            }
        ]`;

        const aiResponse = await generateAICompletion(prompt);

        try {
            return JSON.parse(aiResponse.choices[0].message.content.trim());
        } catch (parseError) {
            throw new Error('Failed to parse AI response as JSON');
        }
    } catch (error) {
        throw new Error(`Coffee shop analysis error: ${error.message}`);
    }
};

/**
 * Enriches user search results with AI-driven recommendations and insights.
 * @param {Object} searchResult - The search result from Mapbox API
 * @param {string} preferences - User-specific preferences
 * @returns {Promise<Object>} - Enriched search results
 */
const enrichSearchResults = async (searchResult, preferences) => {
    try {
        const coffeeShops = searchResult.features.map((feature) => ({
            name: feature.text,
            address: feature.place_name,
            coordinates: feature.center,
            properties: feature.properties || {}
        }));

        const insights = await analyzeCoffeeShops(coffeeShops, preferences);

        return {
            success: true,
            coffeeShops,
            insights,
        };
    } catch (error) {
        throw new Error(`Failed to enrich search results: ${error.message}`);
    }
};

module.exports = {
    generateAICompletion,
    analyzeCoffeeShops,
    enrichSearchResults,
};
