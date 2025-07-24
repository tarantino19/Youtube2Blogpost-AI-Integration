const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { strictRateLimit } = require('../middleware/security');
const { validateRequest } = require('../middleware/validation');
const { authActivityLogger } = require('../middleware/activityLogger');
const {
	registerSchema,
	loginSchema,
	updateProfileSchema,
	changePasswordSchema,
	deleteAccountSchema
} = require('../schemas/authSchemas');

// Public routes (with rate limiting)
router.post('/register', rateLimiter('register'), validateRequest(registerSchema), authActivityLogger('REGISTER'), authController.register);
router.post('/login', rateLimiter('login'), validateRequest(loginSchema), authActivityLogger('LOGIN'), authController.login);
router.post('/refresh', rateLimiter('api'), authActivityLogger('TOKEN_REFRESH'), authController.refreshToken);
router.post('/logout', authActivityLogger('LOGOUT'), authController.logout);

// Google OAuth routes
router.get('/google', 
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
	passport.authenticate('google', { session: false }),
	authController.googleCallback
);

// Protected routes
router.get('/profile', authenticate, authActivityLogger('VIEW_PROFILE'), authController.getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), authActivityLogger('UPDATE_PROFILE'), authController.updateProfile);
router.put('/password', authenticate, strictRateLimit, validateRequest(changePasswordSchema), authActivityLogger('CHANGE_PASSWORD'), authController.changePassword);
router.delete('/account', authenticate, strictRateLimit, validateRequest(deleteAccountSchema), authActivityLogger('DELETE_ACCOUNT'), authController.deleteAccount);

module.exports = router;
