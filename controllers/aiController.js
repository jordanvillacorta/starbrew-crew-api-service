const { generateAICompletion, analyzeCoffeeShops, enrichSearchResults } = require('../services/aiService');
const { handleError } = require('../utils/errorHandler');

/**
 * Handles AI completion requests from clients
 */
const generateAIResponse = async (req, res) => {
    try {
        const { prompt } = req.body;

        // Validate input
        if (!prompt) {
            return handleError(res, new Error('Prompt is required'), 400);
        }

        const aiResponse = await generateAICompletion(prompt);

        // Send the AI response to the client
        res.status(200).json({
            success: true,
            data: aiResponse,
        });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Handles requests for analyzing coffee shops
 */
const analyzeCoffeeShopData = async (req, res) => {
    try {
        const { coffeeShops, userPreferences } = req.body;

        // Validate input
        if (!coffeeShops || !Array.isArray(coffeeShops)) {
            return handleError(res, new Error('Invalid coffeeShops data'), 400);
        }

        const insights = await analyzeCoffeeShops(coffeeShops, userPreferences);

        // Send the analysis results to the client
        res.status(200).json({
            success: true,
            data: insights,
        });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Handles requests to enrich Mapbox search results with AI-driven insights
 */
const enrichCoffeeShopSearch = async (req, res) => {
    try {
        const { searchResult, preferences } = req.body;

        // Validate input
        if (!searchResult || typeof searchResult !== 'object') {
            return handleError(res, new Error('Invalid searchResult data'), 400);
        }

        const enrichedResults = await enrichSearchResults(searchResult, preferences);

        // Send the enriched search results to the client
        res.status(200).json({
            success: true,
            data: enrichedResults,
        });
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Provides a health check for the AI service
 */
const healthCheck = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'AI service is up and running!',
        });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = {
    generateAIResponse,
    analyzeCoffeeShopData,
    enrichCoffeeShopSearch,
    healthCheck,
};
