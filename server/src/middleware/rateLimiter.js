const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
	return rateLimit({
		windowMs,
		max,
		message: { error: message },
		standardHeaders: true,
		legacyHeaders: false,
		handler: (req, res) => {
			res.status(429).json({
				error: message,
				retryAfter: Math.round(windowMs / 1000),
			});
		},
	});
};

const limiters = {
	// Auth endpoints
	register: createLimiter(
		15 * 60 * 1000, // 15 minutes
		5, // 5 requests per window
		'Too many registration attempts, please try again later'
	),

	login: createLimiter(
		15 * 60 * 1000, // 15 minutes
		10, // 10 requests per window
		'Too many login attempts, please try again later'
	),

	// API endpoints
	api: createLimiter(
		15 * 60 * 1000, // 15 minutes
		100, // 100 requests per window
		'Too many requests, please try again later'
	),

	// Video processing - more restrictive
	videoProcess: createLimiter(
		60 * 60 * 1000, // 1 hour
		10, // 10 videos per hour
		'Too many video processing requests, please try again later'
	),

	// AI generation - very restrictive
	aiGeneration: createLimiter(
		60 * 60 * 1000, // 1 hour
		20, // 20 generations per hour
		'Too many AI generation requests, please try again later'
	),

	// Export endpoints
	export: createLimiter(
		15 * 60 * 1000, // 15 minutes
		30, // 30 exports per window
		'Too many export requests, please try again later'
	),
};

// Dynamic rate limiter based on user subscription
const dynamicLimiter = (type = 'api') => {
	return async (req, res, next) => {
		// If user is authenticated, apply different limits based on subscription
		if (req.user) {
			const planMultipliers = {
				free: 1,
				basic: 3,
				pro: 10,
			};

			const multiplier = planMultipliers[req.user.subscription.plan] || 1;

			// Create a custom limiter for this user's plan
			const baseLimit = {
				api: 100,
				videoProcess: 10,
				aiGeneration: 20,
				export: 30,
			};

			const customLimiter = createLimiter(
				type === 'videoProcess' || type === 'aiGeneration' ? 60 * 60 * 1000 : 15 * 60 * 1000,
				(baseLimit[type] || baseLimit.api) * multiplier,
				`Rate limit exceeded for ${req.user.subscription.plan} plan`
			);

			return customLimiter(req, res, next);
		}

		// Use default limiter for unauthenticated users
		return limiters[type](req, res, next);
	};
};

const rateLimiter = (type = 'api') => {
	return limiters[type] || limiters.api;
};

module.exports = {
	rateLimiter,
	dynamicLimiter,
	limiters,
};
