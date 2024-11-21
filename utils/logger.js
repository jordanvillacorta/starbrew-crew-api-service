const { createLogger, transports, format } = require('winston');

const logger = createLogger({
    level: 'error',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log' }), // Logs errors to a file
    ],
});

module.exports = logger;
