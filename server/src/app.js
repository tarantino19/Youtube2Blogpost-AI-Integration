const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const passport = require('./config/passport');
const {
	securityHeaders,
	productionSecurity,
	globalRateLimit,
	sanitizeInput,
	requestSizeLimit,
	securityLogger,
	environmentSecurity,
} = require('./middleware/security');

const app = express();

// Security middleware (order matters!)
app.use(environmentSecurity);
app.use(productionSecurity);
app.use(securityHeaders);
app.use(globalRateLimit);
app.use(requestSizeLimit);
app.use(securityLogger);

// Standard middleware
app.use(cors(config.cors));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

// Passport middleware
app.use(passport.initialize());

// Database connection
mongoose
	.connect(config.mongodb.uri, config.mongodb.options)
	.then(() => {
		if (config.isDevelopment) {
			console.log('✅ MongoDB connected successfully');
		}
	})
	.catch((err) => {
		if (config.isDevelopment) {
			console.error('❌ MongoDB connection error:', err);
		} else {
			console.error('❌ Database connection failed');
		}
		// Exit process on database connection failure in production
		if (config.isProduction) {
			process.exit(1);
		}
	});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/shares', require('./routes/shares'));

// Public endpoints (no authentication required)
app.get('/api/health', (req, res) => {
	res.json({ status: 'OK', message: 'Server is running' });
});

// Public statistics endpoint for landing page
const { getPublicStats } = require('./controllers/postController');
app.get('/api/public/stats', getPublicStats);

// Error handling middleware
app.use((err, req, res, next) => {
	// Log full error details only in development
	if (config.isDevelopment) {
		console.error(err.stack);
	} else {
		console.error('Server error:', err.message);
	}

	res.status(err.status || 500).json({
		error: config.isDevelopment ? err.message : 'Something went wrong!',
		...(config.isDevelopment && { stack: err.stack }),
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;
app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT} in ${config.env} mode`);
	if (config.isDevelopment) {
		console.log(`📊 Database: ${config.mongodb.uri.split('@')[1] || 'localhost'}`);
		console.log(
			`🤖 AI Services: ${config.openai.hasApiKey ? 'OpenAI' : ''} ${config.anthropic.hasApiKey ? 'Anthropic' : ''} ${
				config.gemini.hasApiKey ? 'Gemini' : ''
			}`
		);
	}
});

module.exports = app;
