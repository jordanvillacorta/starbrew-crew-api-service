require('dotenv').config();

const axios = require('axios');
const { handleError } = require('../utils/errorHandler');
const redisClient = require('../config/redis');
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

/**
 * Generates AI completion using OpenAI API
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<Object>} - The AI-generated response
 */
const generateAICompletion = async (prompt, retryCount = 0, maxRetries = 3) => {
    try {
        // Try to get cached response first with a longer cache duration
        let cachedResponse;
        try {
            cachedResponse = await redisClient.get(`ai:${prompt}`);
            if (cachedResponse) {
                console.log('Using cached response');
                return JSON.parse(cachedResponse);
            }
        } catch (cacheError) {
            console.warn('Redis cache error:', cacheError);
        }

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not configured in environment variables');
        }

        try {
            // Add a longer initial delay to help avoid rate limits
            const baseDelay = 5000; // 5 seconds base delay
            if (retryCount > 0) {
                const delay = baseDelay + (Math.pow(2, retryCount) * 1000);
                console.log(`Waiting ${delay / 1000} seconds before attempt ${retryCount + 1}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature: 0.7
            });

            // Cache for 24 hours during development
            try {
                await redisClient.set(
                    `ai:${prompt}`,
                    JSON.stringify(response),
                    'EX',
                    86400 // Cache for 24 hours
                );
            } catch (cacheError) {
                console.warn('Redis cache set error:', cacheError);
            }

            return response;

        } catch (error) {
            if (error.response?.status === 429) {
                // Get retry-after header if it exists
                const retryAfter = error.response.headers['retry-after']
                    ? parseInt(error.response.headers['retry-after'])
                    : Math.pow(2, retryCount) * 5;

                console.log(`Rate limited. Server requested retry after: ${retryAfter} seconds`);

                if (retryCount < maxRetries) {
                    const delay = retryAfter * 1000;
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return generateAICompletion(prompt, retryCount + 1, maxRetries);
                }
            }
            throw error;
        }
    } catch (error) {
        console.error('Full error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        throw error;
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
