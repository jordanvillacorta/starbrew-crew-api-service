const logger = require('./logger');

/**
 * Handle errors and send a consistent response to the client.
 * @param {Response} res - Express response object.
 * @param {Error} error - The error object to handle.
 * @param {number} [statusCode=500] - Optional HTTP status code. Defaults to 500.
 */
const handleError = (res, error, statusCode = 500) => {
    logger.error(`[${new Date().toISOString()}] ${error.message}`, {
        stack: error.stack,
        statusCode,
    });

    console.error(`[ERROR]: ${error.message}`, error.stack); // Optional: still log to console

    // Handle specific cases (as in Step 1)

    // Detect specific errors like API unavailability or timeouts
    if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: 'External API is unavailable. Please try again later.',
        });
    }

    if (error.code === 'ETIMEDOUT') {
        return res.status(504).json({
            success: false,
            message: 'External API request timed out. Please try again later.',
        });
    }

    // Default error handling
    res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred.',
    });
};

module.exports = { handleError };
