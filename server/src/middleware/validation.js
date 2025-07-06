const { z } = require('zod');

const validateRequest = (schema) => {
	return (req, res, next) => {
		try {
			const validatedData = schema.parse(req.body);
			req.body = validatedData;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Get the first error message for a cleaner response
				const firstError = error.errors[0];
				const errorMessage = firstError.message;
				
				return res.status(400).json({
					error: errorMessage
				});
			}
			
			return res.status(500).json({ error: 'Internal server error' });
		}
	};
};

module.exports = { validateRequest };