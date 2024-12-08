const express = require('express');
const { requestCode, verifyCode } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/request-code', requestCode);
router.post('/verify', verifyCode);
router.get('/protected-resource', authenticate, (req, res) => {
    res.json({ message: 'Access granted to protected resource', user: req.user });
});

module.exports = router;
