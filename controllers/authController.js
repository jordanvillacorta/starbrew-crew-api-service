const AuthService = require('../services/authService');
const authService = new AuthService();

const requestCode = async (req, res) => {
    const { phoneNumber } = req.body;

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;  // Basic E.164 format validation
    if (!phoneNumber) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid phone number format. Please use E.164 format (e.g., +12345678900)' 
        });
    }

    try {
        const result = await authService.sendVerificationCode(phoneNumber);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyCode = async (req, res) => {
    const { phoneNumber, verificationCode } = req.body;

    if (!phoneNumber || !verificationCode) {
        return res.status(400).json({ success: false, message: 'Phone number and verification code are required' });
    }

    try {
        const result = await authService.verifyCode(phoneNumber, verificationCode);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { requestCode, verifyCode }
