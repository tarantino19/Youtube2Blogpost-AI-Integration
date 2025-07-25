const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/secureLogger');

const generateToken = (userId) => {
	const secret = process.env.JWT_SECRET;
	if (!secret || secret === 'your_jwt_secret_key' || secret === 'dev-secret-change-this') {
		throw new Error('JWT_SECRET must be set to a secure value');
	}
	return jwt.sign({ id: userId }, secret, {
		expiresIn: process.env.JWT_EXPIRE || '12h',
	});
};

const generateRefreshToken = (userId) => {
	const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
	if (!secret || secret === 'your_jwt_secret_key' || secret === 'dev-secret-change-this') {
		throw new Error('JWT_SECRET must be set to a secure value');
	}
	return jwt.sign({ id: userId, type: 'refresh' }, secret, { expiresIn: '14d' });
};

const verifyToken = (token) => {
	try {
		const secret = process.env.JWT_SECRET;
		if (!secret || secret === 'your_jwt_secret_key' || secret === 'dev-secret-change-this') {
			throw new Error('JWT_SECRET must be set to a secure value');
		}
		return jwt.verify(token, secret);
	} catch (error) {
		throw new Error('Invalid token');
	}
};

const authenticate = async (req, res, next) => {
	try {
		// Try to get token from cookie first, then from Authorization header
		const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			throw new Error('Authentication required');
		}

		const decoded = verifyToken(token);

		// Additional security check: ensure token is not too old
		const tokenAge = Date.now() / 1000 - decoded.iat;
		const maxAge = 12 * 60 * 60; // 12 hours in seconds
		if (tokenAge > maxAge) {
			throw new Error('Token expired');
		}

		const user = await User.findById(decoded.id).select('-password');

		if (!user) {
			// Log potential security issue
			logger.security('Authentication attempt with non-existent user', {
				userId: decoded.id,
				ip: req.ip,
				userAgent: req.get('User-Agent'),
			});
			throw new Error('User not found');
		}

		if (!user.isActive) {
			logger.security('Authentication attempt with deactivated account', {
				userId: user._id,
				email: user.email,
				ip: req.ip,
			});
			throw new Error('Account is deactivated');
		}

		// Check and reset credits if needed
		if (user.checkAndResetCredits()) {
			await user.save();
		}

		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		// Log authentication failures for security monitoring
		logger.security('Authentication failed', {
			error: error.message,
			ip: req.ip,
			userAgent: req.get('User-Agent'),
			url: req.url,
		});

		res.status(401).json({ error: error.message || 'Please authenticate' });
	}
};

const optionalAuth = async (req, res, next) => {
	try {
		// Try to get token from cookie first, then from Authorization header
		const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

		if (token) {
			const decoded = verifyToken(token);
			const user = await User.findById(decoded.id).select('-password');
			if (user && user.isActive) {
				req.user = user;
				req.token = token;
			}
		}

		next();
	} catch (error) {
		// Continue without authentication
		next();
	}
};

const checkSubscription = (requiredPlan = 'free') => {
	const planHierarchy = {
		free: 0,
		basic: 1,
		pro: 2,
	};

	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userPlanLevel = planHierarchy[req.user.subscription.plan] || 0;
		const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

		if (userPlanLevel < requiredPlanLevel) {
			logger.security('Unauthorized access attempt to premium feature', {
				userId: req.user._id,
				currentPlan: req.user.subscription.plan,
				requiredPlan,
				ip: req.ip,
			});

			return res.status(403).json({
				error: `This feature requires ${requiredPlan} plan or higher`,
				currentPlan: req.user.subscription.plan,
				requiredPlan,
			});
		}

		next();
	};
};

const checkCredits = async (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	if (req.user.subscription.creditsRemaining <= 0) {
		logger.dev('Credits exhausted for user', req.user._id);

		return res.status(403).json({
			error: 'No credits remaining',
			creditsRemaining: 0,
			plan: req.user.subscription.plan,
			resetDate: req.user.subscription.resetDate,
		});
	}

	next();
};

module.exports = {
	generateToken,
	generateRefreshToken,
	verifyToken,
	authenticate,
	optionalAuth,
	checkSubscription,
	checkCredits,
};
