const express = require('express');
const twilio = require('twilio');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class AuthService {
    constructor() {
        // Twilio configuration
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Redis client for storing verification codes
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
        });
    }

    // Generate 6-digit verification code
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send SMS verification code
    async sendVerificationCode(phoneNumber) {
        const verificationCode = this.generateVerificationCode();

        try {
            // Store code in Redis with 10-minute expiration
            await this.redisClient.set(
                `verify:${phoneNumber}`,
                verificationCode,
                'EX',
                600 // 10 minutes
            );

            // Send SMS via Twilio
            await this.twilioClient.messages.create({
                body: `Your verification code is: ${verificationCode}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });

            return {
                success: true,
                message: 'Verification code sent'
            };
        } catch (error) {
            console.error('Error sending verification code:', error);
            return {
                success: false,
                message: 'Failed to send verification code'
            };
        }
    }

    // Verify the code
    async verifyCode(phoneNumber, inputCode) {
        try {
            const storedCode = await this.redisClient.get(`verify:${phoneNumber}`);

            if (storedCode === inputCode) {
                // Delete the code after successful verification
                await this.redisClient.del(`verify:${phoneNumber}`);

                // Generate a long-lived JWT token
                const token = this.generateAuthToken(phoneNumber);

                return {
                    success: true,
                    token,
                    message: 'Verification successful'
                };
            }

            return {
                success: false,
                message: 'Invalid or expired verification code'
            };
        } catch (error) {
            console.error('Verification error:', error);
            return {
                success: false,
                message: 'Verification failed'
            };
        }
    }

    // Generate JWT for authenticated sessions
    generateAuthToken(phoneNumber) {
        const payload = {
            phoneNumber,
            type: 'sms-auth',
            iat: Date.now(),
            exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        };

        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { algorithm: 'HS256' }
        );
    }

    // Middleware to protect routes
    authenticateUser(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.type !== 'sms-auth') {
                return res.status(401).json({ error: 'Invalid authentication' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Unauthorized' });
        }
    }
}

// TODO: See if I can make this into ttwo different files

// Create Express app and AuthService instance
const app = express();
const authService = new AuthService();

// Middleware
app.use(express.json());

// Routes
app.post('/auth/request-code', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            message: 'Phone number is required'
        });
    }

    try {
        const result = await authService.sendVerificationCode(phoneNumber);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send verification code'
        });
    }
});

// Verify code and login
app.post('/auth/verify', async (req, res) => {
    const { phoneNumber, verificationCode } = req.body;

    if (!phoneNumber || !verificationCode) {
        return res.status(400).json({
            success: false,
            message: 'Phone number and verification code are required'
        });
    }

    try {
        const result = await authService.verifyCode(phoneNumber, verificationCode);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Verification failed'
        });
    }
});

// Protected route example
app.get('/protected-resource',
    (req, res, next) => authService.authenticateUser(req, res, next),
    (req, res) => {
        res.json({
            message: 'Access granted to protected resource',
            user: req.user
        });
    }
);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Server configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export for potential testing or modular use
module.exports = { app, AuthService };