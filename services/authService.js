const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/dotenv');

class AuthService {
    constructor() {
    }

    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendVerificationCode(phoneNumber) {
        const verificationCode = this.generateVerificationCode();
        try {
            // Store the verification code in Redis with 10 minute expiration
            await redisClient.setex(`verify:${phoneNumber}`, 600, verificationCode);

            // Instead of sending SMS, return the code (for testing/development)
            return { 
                success: true, 
                message: 'Verification code generated',
                code: verificationCode // In production, you would not return this
            };
        } catch (error) {
            console.error('Error generating verification code:', error);
            throw new Error('Failed to generate verification code');
        }
    }

    async verifyCode(phoneNumber, inputCode) {
        if (!phoneNumber || !inputCode) {
            throw new Error('Phone number and verification code are required');
        }

        const storedCode = await redisClient.get(`verify:${phoneNumber}`);
        if (!storedCode) {
            throw new Error('Verification code expired');
        }

        if (storedCode === inputCode) {
            await redisClient.del(`verify:${phoneNumber}`);
            const token = this.generateAuthToken(phoneNumber);
            return { success: true, token, message: 'Verification successful' };
        }

        throw new Error('Invalid verification code');
    }

    generateAuthToken(phoneNumber) {
        // Add basic validation
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }

        const payload = {
            phoneNumber,
            type: 'sms-auth',
            iat: Math.floor(Date.now() / 1000) // Add issued at timestamp
        };
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: '30d',
            algorithm: 'HS256' // Explicitly specify the algorithm
        });
    }
}

module.exports = AuthService;
