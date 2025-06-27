const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const {
	securityHeaders,
	globalRateLimit,
	sanitizeInput,
	requestSizeLimit,
	securityLogger,
	environmentSecurity,
} = require('./middleware/security');

const app = express();

// Security middleware (order matters!)
app.use(environmentSecurity);
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

// Database connection
mongoose
	.connect(config.mongodb.uri, config.mongodb.options)
	.then(() => console.log('✅ MongoDB connected successfully'))
	.catch((err) => {
		console.error('❌ MongoDB connection error:', err);
		// Exit process on database connection failure in production
		if (config.isProduction) {
			process.exit(1);
		}
	});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/posts', require('./routes/posts'));

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		error: err.message || 'Something went wrong!',
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
	console.log(`📊 Database: ${config.mongodb.uri.split('@')[1] || 'localhost'}`);
	console.log(
		`🤖 AI Services: ${config.openai.hasApiKey ? 'OpenAI' : ''} ${config.anthropic.hasApiKey ? 'Anthropic' : ''} ${
			config.gemini.hasApiKey ? 'Gemini' : ''
		}`
	);
});

module.exports = app;
