const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Protected routes
router.post('/claim-reward', authenticate, rateLimiter('api'), shareController.claimShareReward);
router.get('/share-status', authenticate, shareController.getShareStatus);

module.exports = router;
