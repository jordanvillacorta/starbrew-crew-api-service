const { aiRequest } = require('../services/aiService');
const { handleError } = require('../utils/errorHandler');

/**
 * Handle AI request from client input
 */

const generateAiResponse = async (req, res) => {
    try {
        const { prompt } = req.body; // Assume client sends a "prompt" in the request body

        if (!prompt) {
            return handleError(res, new Error('Prompt is required'), 400);
        }

        const aiResponse = await aiRequest(prompt);

        res.status(200).json({
            success: true,
            data: aiResponse,
        });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = { generateAiResponse };
