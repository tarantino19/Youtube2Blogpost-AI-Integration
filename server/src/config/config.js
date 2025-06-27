const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific config
const envFile =
	process.env.NODE_ENV === 'production'
		? '.env.production'
		: process.env.NODE_ENV === 'test'
		? '.env.test'
		: '.env.development';

// Try to load environment-specific file first, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config(); // Load default .env as fallback

const config = {
	// Environment
	env: process.env.NODE_ENV || 'development',
	isDevelopment: process.env.NODE_ENV === 'development',
	isProduction: process.env.NODE_ENV === 'production',

	// Server
	port: parseInt(process.env.PORT || '5000', 10),

	// Database
	mongodb: {
		uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/yttotext',
		options: {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
		},
	},

	// JWT
	jwt: {
		secret: process.env.JWT_SECRET || 'dev-secret-change-this',
		expiresIn: process.env.JWT_EXPIRE || '7d',
	},

	// CORS
	cors: {
		origin: process.env.CLIENT_URL || 'http://localhost:3000',
		credentials: true,
	},

	// APIs
	youtube: {
		apiKey: process.env.YOUTUBE_API_KEY,
		hasApiKey: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your-youtube-api-key-here'),
	},

	openai: {
		apiKey: process.env.OPENAI_API_KEY,
		hasApiKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'),
	},

	anthropic: {
		apiKey: process.env.ANTHROPIC_API_KEY,
		hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here'),
	},

	gemini: {
		apiKey: process.env.GEMINI_API_KEY,
		hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here'),
	},

	// Rate Limiting
	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
		maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
	},

	// Transcript Service
	transcript: {
		preferredService: process.env.TRANSCRIPT_SERVICE || 'auto',
		ytDlpPath: process.env.YTDLP_PATH || 'yt-dlp',
		useProxy: process.env.USE_PROXY === 'true',
		proxyUrl: process.env.PROXY_URL,
	},

	// Application
	app: {
		name: process.env.APP_NAME || 'YTtoText',
		url: process.env.APP_URL || 'http://localhost:3000',
	},
};

// Validation
const validateConfig = () => {
	const errors = [];

	if (config.isProduction) {
		if (!config.jwt.secret || config.jwt.secret === 'dev-secret-change-this') {
			errors.push('JWT_SECRET must be set in production');
		}

		if (!config.mongodb.uri || config.mongodb.uri.includes('localhost')) {
			errors.push('MONGODB_URI should not use localhost in production');
		}

		if (!config.openai.hasApiKey && !config.anthropic.hasApiKey && !config.gemini.hasApiKey) {
			errors.push('At least one AI service API key must be configured');
		}
	}

	if (errors.length > 0) {
		throw new Error(`Configuration errors:\n${errors.join('\n')}`);
	}
};

// Validate on startup
validateConfig();

module.exports = config;
