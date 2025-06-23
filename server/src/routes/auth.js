const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', rateLimiter('register'), authController.register);
router.post('/login', rateLimiter('login'), authController.login);
router.post('/refresh', rateLimiter('api'), authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);
router.delete('/account', authenticate, authController.deleteAccount);

module.exports = router;
