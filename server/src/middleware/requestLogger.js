const logger = require('../utils/secureLogger');

/**
 * Advanced request logging and performance monitoring middleware
 * Tracks API usage, response times, error rates, and user behavior patterns
 */
const requestLogger = (options = {}) => {
	const {
		logLevel = 'info',
		includeBody = false,
		includeHeaders = false,
		slowRequestThreshold = 1000, // ms
		excludePaths = ['/health', '/favicon.ico'],
		sensitiveFields = ['password', 'token', 'authorization', 'cookie'],
	} = options;

	return (req, res, next) => {
		const startTime = Date.now();
		const requestId = generateRequestId();
		
		// Add request ID to request object for tracing
		req.requestId = requestId;
		
		// Skip logging for excluded paths
		if (excludePaths.some(path => req.path.includes(path))) {
			return next();
		}

		// Capture original res.json to log response data
		const originalJson = res.json;
		let responseBody = null;
		
		res.json = function(data) {
			responseBody = data;
			return originalJson.call(this, data);
		};

		// Log request start
		const requestData = {
			requestId,
			method: req.method,
			url: req.url,
			path: req.path,
			query: req.query,
			ip: getClientIP(req),
			userAgent: req.get('User-Agent'),
			referer: req.get('Referer'),
			userId: req.user?.id || 'anonymous',
			userPlan: req.user?.subscription?.plan || 'none',
			timestamp: new Date().toISOString(),
		};

		// Include request body if enabled (excluding sensitive data)
		if (includeBody && req.body) {
			requestData.body = sanitizeData(req.body, sensitiveFields);
		}

		// Include headers if enabled (excluding sensitive data)
		if (includeHeaders) {
			requestData.headers = sanitizeData(req.headers, sensitiveFields);
		}

		logger.info('Request started', requestData);

		// Handle response completion
		res.on('finish', () => {
			const duration = Date.now() - startTime;
			const isSlowRequest = duration > slowRequestThreshold;
			const isError = res.statusCode >= 400;

			const responseData = {
				requestId,
				method: req.method,
				url: req.url,
				statusCode: res.statusCode,
				duration: `${duration}ms`,
				contentLength: res.get('Content-Length') || 0,
				userId: req.user?.id || 'anonymous',
				userPlan: req.user?.subscription?.plan || 'none',
				timestamp: new Date().toISOString(),
			};

			// Include response body for errors or if explicitly enabled
			if ((isError || includeBody) && responseBody) {
				responseData.response = sanitizeData(responseBody, sensitiveFields);
			}

			// Log based on response type and performance
			if (isError) {
				logger.error('Request failed', responseData);
			} else if (isSlowRequest) {
				logger.warn('Slow request detected', responseData);
			} else {
				logger.info('Request completed', responseData);
			}

			// Track metrics for monitoring
			trackMetrics(req, res, duration);
		});

		// Handle connection errors
		res.on('error', (error) => {
			const duration = Date.now() - startTime;
			
			logger.error('Request error', {
				requestId,
				method: req.method,
				url: req.url,
				error: error.message,
				stack: error.stack,
				duration: `${duration}ms`,
				userId: req.user?.id || 'anonymous',
				timestamp: new Date().toISOString(),
			});
		});

		next();
	};
};

/**
 * Generate unique request ID for tracing
 */
const generateRequestId = () => {
	return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get real client IP address considering proxies
 */
const getClientIP = (req) => {
	return req.ip || 
		   req.connection?.remoteAddress || 
		   req.socket?.remoteAddress || 
		   req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
		   req.headers['x-real-ip'] ||
		   'unknown';
};

/**
 * Remove sensitive data from objects before logging
 */
const sanitizeData = (data, sensitiveFields) => {
	if (!data || typeof data !== 'object') return data;
	
	const sanitized = Array.isArray(data) ? [...data] : { ...data };
	
	const sanitizeRecursive = (obj) => {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const lowerKey = key.toLowerCase();
				
				// Check if field is sensitive
				if (sensitiveFields.some(field => lowerKey.includes(field))) {
					obj[key] = '[REDACTED]';
				} else if (typeof obj[key] === 'object' && obj[key] !== null) {
					sanitizeRecursive(obj[key]);
				}
			}
		}
	};
	
	sanitizeRecursive(sanitized);
	return sanitized;
};

/**
 * Track metrics for performance monitoring
 */
const trackMetrics = (req, res, duration) => {
	// This could be extended to send metrics to external services
	// like DataDog, New Relic, or custom analytics
	
	const metrics = {
		endpoint: `${req.method} ${req.route?.path || req.path}`,
		statusCode: res.statusCode,
		duration,
		userPlan: req.user?.subscription?.plan || 'anonymous',
		timestamp: Date.now(),
	};

	// Log metrics for analysis
	logger.metrics('API metrics', metrics);
	
	// Could implement:
	// - Response time percentiles
	// - Error rate tracking
	// - Endpoint usage statistics
	// - User behavior patterns
	// - Resource utilization
};

/**
 * Middleware for API usage analytics
 */
const apiAnalytics = (req, res, next) => {
	// Track API usage patterns
	const analyticsData = {
		endpoint: req.path,
		method: req.method,
		userId: req.user?.id,
		userPlan: req.user?.subscription?.plan,
		timestamp: new Date(),
		ip: getClientIP(req),
		userAgent: req.get('User-Agent'),
	};

	// This could be stored in a separate analytics collection
	logger.analytics('API usage', analyticsData);
	
	next();
};

/**
 * Error boundary middleware for unhandled errors
 */
const errorLogger = (error, req, res, next) => {
	const errorData = {
		requestId: req.requestId,
		error: {
			message: error.message,
			stack: error.stack,
			name: error.name,
		},
		request: {
			method: req.method,
			url: req.url,
			headers: sanitizeData(req.headers, ['authorization', 'cookie']),
			body: sanitizeData(req.body, ['password', 'token']),
		},
		user: {
			id: req.user?.id,
			email: req.user?.email,
			plan: req.user?.subscription?.plan,
		},
		timestamp: new Date().toISOString(),
	};

	logger.error('Unhandled error in request', errorData);
	
	// Don't expose internal errors to client
	if (!res.headersSent) {
		res.status(500).json({
			error: 'Internal server error',
			requestId: req.requestId,
		});
	}
};

module.exports = {
	requestLogger,
	apiAnalytics,
	errorLogger,
};