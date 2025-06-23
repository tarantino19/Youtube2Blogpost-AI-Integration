const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');
const { dynamicLimiter } = require('../middleware/rateLimiter');

// All post routes require authentication
router.use(authenticate);

// Get all posts with filtering and pagination
router.get('/', postController.getPosts);

// Get post statistics
router.get('/stats', postController.getPostStats);

// Get a specific post
router.get('/:id', postController.getPost);

// Update a post
router.put('/:id', postController.updatePost);

// Delete a post
router.delete('/:id', postController.deletePost);

// Export a post
router.post('/:id/export', dynamicLimiter('export'), postController.exportPost);

// Improve post content with AI
router.post('/:id/improve', dynamicLimiter('aiGeneration'), postController.improvePost);

module.exports = router;
