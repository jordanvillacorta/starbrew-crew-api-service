const axios = require('axios');

/**
 * Make a request to the OpenRouter API.
 * @param {string} prompt - The prompt for the AI.
 * @returns {Promise<string>} - The AI's response.
 * @throws {Error} - Throws an error if the API request fails.
 */
const aiRequest = async (prompt) => {
    try {
        const response = await axios.post('https://openrouter.ai/api-endpoint', {
            prompt,
        }, {
            headers: { Authorization: `Bearer YOUR_API_KEY` },
        });

        return response.data.response; // Assuming the API returns a "response" field
    } catch (error) {
        if (error.response) {
            // Errors returned by the API
            const { status, data } = error.response;
            throw new Error(`OpenRouter API Error: ${status} - ${data.message || 'Unknown error'}`);
        } else if (error.request) {
            // Network errors or no response from API
            throw new Error('OpenRouter API is unavailable or not responding.');
        } else {
            // Other errors
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }
};

module.exports = { aiRequest };
