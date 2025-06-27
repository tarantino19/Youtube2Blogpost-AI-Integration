# Authentication Implementation Guide

## JWT Authentication System (Functional Approach)

### 1. Authentication Middleware (server/src/middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const verifyToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		throw new Error('Invalid token');
	}
};

const authenticate = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			throw new Error('Authentication required');
		}

		const decoded = verifyToken(token);
		const user = await User.findById(decoded.id).select('-password');

		if (!user) {
			throw new Error('User not found');
		}

		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		res.status(401).json({ error: 'Please authenticate' });
	}
};

const optionalAuth = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (token) {
			const decoded = verifyToken(token);
			const user = await User.findById(decoded.id).select('-password');
			req.user = user;
		}

		next();
	} catch (error) {
		// Continue without authentication
		next();
	}
};

module.exports = {
	generateToken,
	verifyToken,
	authenticate,
	optionalAuth,
};
```

### 2. Authentication Controller (server/src/controllers/authController.js)

```javascript
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validateEmail, validatePassword } = require('../utils/validators');

const register = async (req, res) => {
	try {
		const { email, password, name } = req.body;

		// Validation
		if (!validateEmail(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}

		if (!validatePassword(password)) {
			return res.status(400).json({
				error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
			});
		}

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: 'Email already registered' });
		}

		// Create user
		const user = new User({
			email,
			password,
			name,
		});

		await user.save();

		// Generate token
		const token = generateToken(user._id);

		res.status(201).json({
			message: 'Registration successful',
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				subscription: user.subscription,
			},
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ error: 'Registration failed' });
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Generate token
		const token = generateToken(user._id);

		res.json({
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				subscription: user.subscription,
			},
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Login failed' });
	}
};

const refreshToken = async (req, res) => {
	try {
		const { user } = req;
		const token = generateToken(user._id);

		res.json({
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				subscription: user.subscription,
			},
		});
	} catch (error) {
		res.status(500).json({ error: 'Token refresh failed' });
	}
};

const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password').lean();

		res.json({ user });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch profile' });
	}
};

const updateProfile = async (req, res) => {
	try {
		const { name } = req.body;
		const userId = req.user.id;

		const user = await User.findByIdAndUpdate(userId, { name }, { new: true, runValidators: true }).select('-password');

		res.json({
			message: 'Profile updated',
			user,
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to update profile' });
	}
};

module.exports = {
	register,
	login,
	refreshToken,
	getProfile,
	updateProfile,
};
```

### 3. Authentication Routes (server/src/routes/auth.js)

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', rateLimiter('register'), authController.register);
router.post('/login', rateLimiter('login'), authController.login);

// Protected routes
router.post('/refresh', authenticate, authController.refreshToken);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
```

### 4. Validation Utilities (server/src/utils/validators.js)

```javascript
const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

const validatePassword = (password) => {
	// At least 8 characters, one uppercase, one lowercase, one number
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
	return passwordRegex.test(password);
};

const validateYouTubeUrl = (url) => {
	const patterns = [
		/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/,
		/^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/,
	];

	return patterns.some((pattern) => pattern.test(url));
};

module.exports = {
	validateEmail,
	validatePassword,
	validateYouTubeUrl,
};
```

### 5. Rate Limiting Middleware (server/src/middleware/rateLimiter.js)

```javascript
const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
	return rateLimit({
		windowMs,
		max,
		message,
		standardHeaders: true,
		legacyHeaders: false,
	});
};

const limiters = {
	register: createLimiter(
		15 * 60 * 1000, // 15 minutes
		5, // 5 requests per window
		'Too many registration attempts, please try again later'
	),
	login: createLimiter(
		15 * 60 * 1000, // 15 minutes
		10, // 10 requests per window
		'Too many login attempts, please try again later'
	),
	api: createLimiter(
		15 * 60 * 1000, // 15 minutes
		100, // 100 requests per window
		'Too many requests, please try again later'
	),
};

const rateLimiter = (type = 'api') => {
	return limiters[type] || limiters.api;
};

module.exports = { rateLimiter };
```

### 6. Frontend Authentication Context (client/src/contexts/AuthContext.tsx)

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
	id: string;
	email: string;
	name: string;
	subscription: {
		plan: string;
		creditsRemaining: number;
	};
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
}

interface RegisterData {
	email: string;
	password: string;
	name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			setToken(storedToken);
			// Optionally validate token and fetch user profile
			validateToken(storedToken);
		} else {
			setIsLoading(false);
		}
	}, []);

	const validateToken = async (token: string) => {
		try {
			const response = await authAPI.refresh();
			setUser(response.data.user);
			setToken(response.data.token);
			localStorage.setItem('token', response.data.token);
		} catch (error) {
			localStorage.removeItem('token');
			setToken(null);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		const response = await authAPI.login(email, password);
		setUser(response.data.user);
		setToken(response.data.token);
		localStorage.setItem('token', response.data.token);
	};

	const register = async (data: RegisterData) => {
		const response = await authAPI.register(data);
		setUser(response.data.user);
		setToken(response.data.token);
		localStorage.setItem('token', response.data.token);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('token');
	};

	return (
		<AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
	);
};
```

### 7. Protected Route Component (client/src/components/ProtectedRoute.tsx)

```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
```

### 8. Login Component (client/src/pages/Login.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || '/dashboard';

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			await login(email, password);
			navigate(from, { replace: true });
		} catch (err: any) {
			setError(err.response?.data?.error || 'Login failed');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Sign in to your account</h2>
				</div>
				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					{error && (
						<div className='rounded-md bg-red-50 p-4'>
							<p className='text-sm text-red-800'>{error}</p>
						</div>
					)}
					<div className='rounded-md shadow-sm -space-y-px'>
						<div>
							<label htmlFor='email' className='sr-only'>
								Email address
							</label>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='Email address'
							/>
						</div>
						<div>
							<label htmlFor='password' className='sr-only'>
								Password
							</label>
							<input
								id='password'
								name='password'
								type='password'
								autoComplete='current-password'
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='Password'
							/>
						</div>
					</div>

					<div>
						<button
							type='submit'
							disabled={isLoading}
							className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
						>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</button>
					</div>

					<div className='text-center'>
						<Link to='/register' className='font-medium text-blue-600 hover:text-blue-500'>
							Don't have an account? Sign up
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};
```
