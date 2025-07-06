const { z } = require('zod');

const validateRequest = (schema) => {
	return (req, res, next) => {
		const requestInfo = {
			method: req.method,
			url: req.url,
			body: req.body,
			timestamp: new Date().toISOString(),
			userAgent: req.get('User-Agent'),
			ip: req.ip || req.connection.remoteAddress
		};

		console.log('🔍 Validation middleware - Request received:', {
			method: requestInfo.method,
			url: requestInfo.url,
			timestamp: requestInfo.timestamp,
			bodyKeys: Object.keys(req.body || {}),
			ip: requestInfo.ip
		});

		try {
			console.log('📋 Validation middleware - Validating request body against schema:', {
				bodyData: req.body,
				schemaType: schema.constructor.name
			});

			const validatedData = schema.parse(req.body);
			req.body = validatedData;
			
			console.log('✅ Validation middleware - Validation successful:', {
				validatedKeys: Object.keys(validatedData),
				timestamp: new Date().toISOString()
			});

			next();
		} catch (error) {
			console.error('❌ Validation middleware - Validation failed:', {
				error: error.message,
				errorType: error.constructor.name,
				requestInfo,
				timestamp: new Date().toISOString()
			});

			if (error instanceof z.ZodError) {
				console.error('🔍 Validation middleware - Zod validation errors:', {
					allErrors: error.errors,
					errorCount: error.errors.length,
					formattedErrors: error.errors.map(err => ({
						field: err.path.join('.'),
						message: err.message,
						code: err.code,
						received: err.received
					}))
				});

				const detailedErrors = error.errors.map(err => ({
					field: err.path.join('.') || 'root',
					message: err.message,
					code: err.code,
					received: err.received
				}));

				const errorResponse = {
					error: 'Validation failed',
					message: 'The request data does not meet the required format',
					details: detailedErrors,
					timestamp: new Date().toISOString(),
					requestId: req.id || 'unknown'
				};

				console.error('📤 Validation middleware - Sending error response:', errorResponse);

				return res.status(400).json(errorResponse);
			}

			console.error('💥 Validation middleware - Unexpected error:', {
				error: error.message,
				stack: error.stack,
				requestInfo
			});

			const unexpectedErrorResponse = {
				error: 'Internal server error',
				message: 'An unexpected error occurred during validation',
				timestamp: new Date().toISOString(),
				requestId: req.id || 'unknown'
			};

			console.error('📤 Validation middleware - Sending unexpected error response:', unexpectedErrorResponse);

			return res.status(500).json(unexpectedErrorResponse);
		}
	};
};

module.exports = { validateRequest };
