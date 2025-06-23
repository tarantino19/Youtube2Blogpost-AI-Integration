const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
		expiresIn: process.env.JWT_EXPIRE || '7d',
	});
};

const generateRefreshToken = (userId) => {
	return jwt.sign(
		{ id: userId, type: 'refresh' },
		process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your_jwt_secret_key',
		{ expiresIn: '30d' }
	);
};

const verifyToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
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
		const user = await User.findById(decoded.id).select('-password');

		if (!user) {
			throw new Error('User not found');
		}

		if (!user.isActive) {
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
