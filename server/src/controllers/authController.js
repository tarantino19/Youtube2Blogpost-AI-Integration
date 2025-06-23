const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { validateEmail, validatePassword, validateName, sanitizeInput } = require('../utils/validators');

const register = async (req, res) => {
	try {
		const { email, password, name } = req.body;

		// Sanitize inputs
		const sanitizedEmail = sanitizeInput(email).toLowerCase();
		const sanitizedName = sanitizeInput(name);

		// Validation
		if (!validateEmail(sanitizedEmail)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}

		if (!validatePassword(password)) {
			return res.status(400).json({
				error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
			});
		}

		if (!validateName(sanitizedName)) {
			return res.status(400).json({
				error: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes',
			});
		}

		// Check if user exists
		const existingUser = await User.findOne({ email: sanitizedEmail });
		if (existingUser) {
			return res.status(400).json({ error: 'Email already registered' });
		}

		// Create user
		const user = new User({
			email: sanitizedEmail,
			password,
			name: sanitizedName,
		});

		await user.save();

		// Generate tokens
		const token = generateToken(user._id);
		const refreshToken = generateRefreshToken(user._id);

		// Set httpOnly cookies
		res.cookie('accessToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.status(201).json({
			message: 'Registration successful',
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				subscription: user.subscription,
			},
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ error: 'Registration failed. Please try again.' });
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Sanitize email
		const sanitizedEmail = sanitizeInput(email).toLowerCase();

		// Validate inputs
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		// Find user
		const user = await User.findOne({ email: sanitizedEmail });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Check if account is active
		if (!user.isActive) {
			return res.status(403).json({ error: 'Account is deactivated. Please contact support.' });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Check and reset credits if needed
		if (user.checkAndResetCredits()) {
			await user.save();
		}

		// Generate tokens
		const token = generateToken(user._id);
		const refreshToken = generateRefreshToken(user._id);

		// Update last login
		user.updatedAt = Date.now();
		await user.save();

		// Set httpOnly cookies
		res.cookie('accessToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.json({
			message: 'Login successful',
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				subscription: user.subscription,
			},
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Login failed. Please try again.' });
	}
};

const refreshToken = async (req, res) => {
	try {
		// Get refresh token from cookie
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(400).json({ error: 'Refresh token is required' });
		}

		// Verify refresh token
		let decoded;
		try {
			decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
		} catch (error) {
			return res.status(401).json({ error: 'Invalid refresh token' });
		}

		// Find user
		const user = await User.findById(decoded.id).select('-password');
		if (!user || !user.isActive) {
			return res.status(401).json({ error: 'User not found or inactive' });
		}

		// Generate new tokens
		const newToken = generateToken(user._id);
		const newRefreshToken = generateRefreshToken(user._id);

		// Set new httpOnly cookies
		res.cookie('accessToken', newToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.json({
			message: 'Token refreshed successfully',
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				subscription: user.subscription,
			},
		});
	} catch (error) {
		console.error('Token refresh error:', error);
		res.status(500).json({ error: 'Token refresh failed' });
	}
};

const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password').lean();

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Add additional profile data
		const profileData = {
			...user,
			memberSince: user.createdAt,
			daysUntilReset: Math.ceil((new Date(user.subscription.resetDate) - new Date()) / (1000 * 60 * 60 * 24)),
		};

		res.json({ user: profileData });
	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({ error: 'Failed to fetch profile' });
	}
};

const updateProfile = async (req, res) => {
	try {
		const { name, email } = req.body;
		const userId = req.user.id;

		const updates = {};

		// Validate and update name
		if (name) {
			const sanitizedName = sanitizeInput(name);
			if (!validateName(sanitizedName)) {
				return res.status(400).json({ error: 'Invalid name format' });
			}
			updates.name = sanitizedName;
		}

		// Validate and update email
		if (email && email !== req.user.email) {
			const sanitizedEmail = sanitizeInput(email).toLowerCase();
			if (!validateEmail(sanitizedEmail)) {
				return res.status(400).json({ error: 'Invalid email format' });
			}

			// Check if new email is already taken
			const existingUser = await User.findOne({ email: sanitizedEmail, _id: { $ne: userId } });
			if (existingUser) {
				return res.status(400).json({ error: 'Email already in use' });
			}

			updates.email = sanitizedEmail;
		}

		// Update user
		const user = await User.findByIdAndUpdate(
			userId,
			{ ...updates, updatedAt: Date.now() },
			{ new: true, runValidators: true }
		).select('-password');

		res.json({
			message: 'Profile updated successfully',
			user,
		});
	} catch (error) {
		console.error('Update profile error:', error);
		res.status(500).json({ error: 'Failed to update profile' });
	}
};

const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id;

		// Validate inputs
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ error: 'Current and new passwords are required' });
		}

		if (!validatePassword(newPassword)) {
			return res.status(400).json({
				error: 'New password must be at least 8 characters with uppercase, lowercase, and number',
			});
		}

		// Find user with password field
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Verify current password
		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return res.status(401).json({ error: 'Current password is incorrect' });
		}

		// Update password
		user.password = newPassword;
		await user.save();

		// Generate new token
		const token = generateToken(user._id);

		res.json({
			message: 'Password changed successfully',
			token,
		});
	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({ error: 'Failed to change password' });
	}
};

const deleteAccount = async (req, res) => {
	try {
		const { password } = req.body;
		const userId = req.user.id;

		if (!password) {
			return res.status(400).json({ error: 'Password is required to delete account' });
		}

		// Find user and verify password
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		// Soft delete - deactivate account
		user.isActive = false;
		user.updatedAt = Date.now();
		await user.save();

		res.json({
			message: 'Account deactivated successfully. Contact support within 30 days to reactivate.',
		});
	} catch (error) {
		console.error('Delete account error:', error);
		res.status(500).json({ error: 'Failed to delete account' });
	}
};

const logout = async (req, res) => {
	try {
		// Clear cookies
		res.clearCookie('accessToken');
		res.clearCookie('refreshToken');

		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('Logout error:', error);
		res.status(500).json({ error: 'Failed to logout' });
	}
};

module.exports = {
	register,
	login,
	refreshToken,
	logout,
	getProfile,
	updateProfile,
	changePassword,
	deleteAccount,
};
