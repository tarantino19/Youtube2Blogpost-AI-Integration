const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticate, checkCredits } = require('../middleware/auth');
const { dynamicLimiter } = require('../middleware/rateLimiter');
const aiService = require('../services/unifiedAIService');

// All video routes require authentication
router.use(authenticate);

// Get available AI models
router.get('/models', (req, res) => {
	try {
		const models = aiService.getAvailableModels();
		res.json({ models });
	} catch (error) {
		res.status(500).json({ error: 'Failed to get available models' });
	}
});

// Process a new video
router.post('/process', dynamicLimiter('videoProcess'), checkCredits, videoController.processVideo);

// Get processing status
router.get('/:id/status', videoController.getVideoStatus);

// List all videos
router.get('/', videoController.listVideos);

// Retry failed video processing
router.post('/:id/retry', dynamicLimiter('videoProcess'), checkCredits, videoController.retryVideo);

module.exports = router;
