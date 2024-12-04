const axios = require('axios');
const { handleError } = require('../utils/errorHandler');

/**
 * Generates AI completion using OpenRouter API
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<Object>} - The AI-generated response
 */
const generateAICompletion = async (prompt) => {
    try {
        const response = await axios.post(
            'https://api.openrouter.ai/v1/completions',
            {
                model: 'text-davinci-003', // Replace with your chosen model
                prompt: prompt,
                max_tokens: 200,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        handleError(res, error)
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
        const prompt = `Given the following coffee shops: ${JSON.stringify(coffeeShops)} 
        and user preferences: ${userPreferences}, rank them by relevance.`;

        const aiResponse = await generateAICompletion(prompt);

        // Extract the ranking or insights from the AI response
        const rankedShops = aiResponse.choices[0].text.trim();
        return JSON.parse(rankedShops); // Ensure the AI returns valid JSON
    } catch (error) {
        handleError(res, error)
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
        // Extract the coffee shops and analyze them
        const coffeeShops = searchResult.features.map((feature) => ({
            name: feature.text,
            address: feature.place_name,
        }));

        const insights = await analyzeCoffeeShops(coffeeShops, preferences);

        return {
            success: true,
            coffeeShops,
            insights,
        };
    } catch (error) {
        handleError(res, error)
    }
};

module.exports = {
    generateAICompletion,
    analyzeCoffeeShops,
    enrichSearchResults,
};
