const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/secureLogger');

// Enhanced security headers
const securityHeaders = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'"],
			imgSrc: ["'self'", 'data:', 'https:'],
			connectSrc: ["'self'"],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			mediaSrc: ["'self'"],
			frameSrc: ["'none'"],
			// Prevent source map access
			workerSrc: ["'none'"],
			manifestSrc: ["'self'"],
		},
	},
	crossOriginEmbedderPolicy: false, // Allows embedding for development
	hsts: {
		maxAge: 31536000,
		includeSubDomains: true,
		preload: true,
	},
	// Additional security headers
	noSniff: true,
	frameguard: { action: 'deny' },
	xssFilter: true,
	referrerPolicy: { policy: 'same-origin' },
});

// Production-only security middleware
const productionSecurity = (req, res, next) => {
	if (process.env.NODE_ENV === 'production') {
		// Block access to source maps and dev files
		if (
			req.url.match(/\.(map|ts|tsx)$/i) ||
			req.url.includes('/@vite/') ||
			req.url.includes('/@react-refresh') ||
			req.url.includes('/src/')
		) {
			return res.status(404).json({ error: 'Not found' });
		}

		// Remove server information
		res.removeHeader('X-Powered-By');
		res.removeHeader('Server');

		// Add security headers
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Frame-Options', 'DENY');
		res.setHeader('X-XSS-Protection', '1; mode=block');
		res.setHeader('Referrer-Policy', 'same-origin');
		res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	}
	next();
};

// Global rate limiter for all requests
const globalRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // Limit each IP to 1000 requests per windowMs
	message: {
		error: 'Too many requests from this IP, please try again later.',
	},
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => {
		// Skip rate limiting for health checks in production monitoring
		return req.path === '/api/health' && req.method === 'GET';
	},
});

// Strict rate limiter for sensitive endpoints
const strictRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per windowMs
	message: {
		error: 'Too many requests to sensitive endpoint, please try again later.',
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
	// Remove potential XSS and injection attempts
	const sanitize = (obj) => {
		if (typeof obj === 'string') {
			return obj
				.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
				.replace(/javascript:/gi, '') // Remove javascript: protocol
				.replace(/on\w+\s*=/gi, '') // Remove event handlers
				.trim();
		}
		if (typeof obj === 'object' && obj !== null) {
			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					obj[key] = sanitize(obj[key]);
				}
			}
		}
		return obj;
	};

	if (req.body) {
		req.body = sanitize(req.body);
	}
	if (req.query) {
		req.query = sanitize(req.query);
	}
	if (req.params) {
		req.params = sanitize(req.params);
	}

	next();
};

// Request size limiter
const requestSizeLimit = (req, res, next) => {
	// Limit request body size to prevent DoS attacks
	const maxSize = 10 * 1024 * 1024; // 10MB

	if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
		return res.status(413).json({
			error: 'Request too large',
		});
	}

	next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
	// Log suspicious activities
	const suspiciousPatterns = [
		/\.\.\//, // Path traversal
		/<script/i, // XSS attempts
		/union.*select/i, // SQL injection
		/drop.*table/i, // SQL injection
		/exec\(/i, // Code injection
		/eval\(/i, // Code injection
		/\.map$/i, // Source map access attempts
		/\/@vite/i, // Vite dev server access
		/\/src\//i, // Source code access
	];

	const checkSuspicious = (value) => {
		if (typeof value === 'string') {
			return suspiciousPatterns.some((pattern) => pattern.test(value));
		}
		return false;
	};

	const isSuspicious =
		checkSuspicious(req.url) || checkSuspicious(JSON.stringify(req.body)) || checkSuspicious(JSON.stringify(req.query));

	if (isSuspicious) {
		logger.security('Suspicious request detected', {
			ip: req.ip,
			userAgent: req.get('User-Agent'),
			url: req.url,
			method: req.method,
			timestamp: new Date().toISOString(),
		});
	}

	next();
};

// Environment-specific security
const environmentSecurity = (req, res, next) => {
	// Add security headers based on environment
	if (process.env.NODE_ENV === 'production') {
		// Production-only security measures
		res.setHeader('X-Environment', 'production');

		// Remove server signature
		res.removeHeader('X-Powered-By');

		// Strict transport security
		res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	} else {
		// Development-only headers
		res.setHeader('X-Environment', 'development');
	}

	next();
};

module.exports = {
	securityHeaders,
	productionSecurity,
	globalRateLimit,
	strictRateLimit,
	sanitizeInput,
	requestSizeLimit,
	securityLogger,
	environmentSecurity,
};
