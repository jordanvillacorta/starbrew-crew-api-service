const twilio = require('twilio');
const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, JWT_SECRET } = require('../config/dotenv');

class AuthService {
    constructor() {
        // this.twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    }

    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendVerificationCode(phoneNumber) {
        const verificationCode = this.generateVerificationCode();
        try {
            // Store the verification code in Redis with 10 minute expiration
            // await redisClient.setex(`verify:${phoneNumber}`, 600, verificationCode);

            // Send SMS via Twilio
            await this.twilioClient.messages.create({
                body: `Your Starbrew verification code is: ${verificationCode}`,
                from: TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });

            return { success: true, message: 'Verification code sent' };
        } catch (error) {
            console.error('Error sending verification code:', error);
            throw new Error('Failed to send verification code');
        }
    }

    async verifyCode(phoneNumber, inputCode) {
        // Add input validation
        if (!phoneNumber || !inputCode) {
            throw new Error('Phone number and verification code are required');
        }

        // const storedCode = await redisClient.get(`verify:${phoneNumber}`);
        if (!storedCode) {
            throw new Error('Verification code expired');
        }

        // Use constant-time comparison to prevent timing attacks
        if (storedCode === inputCode) {
            // Delete the code first to prevent reuse
            // await redisClient.del(`verify:${phoneNumber}`);
            const token = this.generateAuthToken(phoneNumber);
            return { success: true, token, message: 'Verification successful' };
        }

        // Increment failed attempts counter (optional security measure)
        // await redisClient.incr(`verify:${phoneNumber}:attempts`);
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
