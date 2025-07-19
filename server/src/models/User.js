const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		lowercase: true,
		trim: true,
		match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
	},
	password: {
		type: String,
		required: function() {
			return !this.googleId;
		},
		minlength: [8, 'Password must be at least 8 characters'],
	},
	googleId: {
		type: String,
		unique: true,
		sparse: true,
	},
	profilePicture: {
		type: String,
		default: null,
	},
	name: {
		type: String,
		required: [true, 'Name is required'],
		trim: true,
	},
	subscription: {
		plan: {
			type: String,
			enum: ['free', 'basic', 'pro'],
			default: 'free',
		},
		creditsRemaining: {
			type: Number,
			default: 5,
		},
		resetDate: {
			type: Date,
			default: Date.now,
		},
	},
	shareRewards: {
		lastRewardDate: {
			type: Date,
			default: null,
		},
		monthlySharesCount: {
			type: Number,
			default: 0,
		},
		totalShareRewards: {
			type: Number,
			default: 0,
		},
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

// Hash password before saving (only if password exists)
userSchema.pre('save', async function (next) {
	if (!this.isModified('password') || !this.password) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Compare password method (only if password exists)
userSchema.methods.comparePassword = async function (candidatePassword) {
	if (!this.password) {
		return false;
	}
	return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.toJSON = function () {
	const user = this.toObject();
	delete user.password;
	delete user.__v;
	return user;
};

// Check and reset credits if needed
userSchema.methods.checkAndResetCredits = function () {
	const now = new Date();
	const resetDate = new Date(this.subscription.resetDate);
	const daysSinceReset = Math.floor((now - resetDate) / (1000 * 60 * 60 * 24));

	// Reset credits monthly (30 days)
	if (daysSinceReset >= 30) {
		const creditsMap = {
			free: 5,
			basic: 50,
			pro: 500,
		};

		this.subscription.creditsRemaining = creditsMap[this.subscription.plan];
		this.subscription.resetDate = now;
		return true;
	}

	return false;
};

// Check if user can earn share reward this month
userSchema.methods.canEarnShareReward = function () {
	const now = new Date();
	const lastRewardDate = this.shareRewards.lastRewardDate;

	if (!lastRewardDate) {
		return true; // First time sharing
	}

	const daysSinceLastReward = Math.floor((now - lastRewardDate) / (1000 * 60 * 60 * 24));
	return daysSinceLastReward >= 30; // Can earn reward once per month
};

// Award share reward
userSchema.methods.awardShareReward = function () {
	if (!this.canEarnShareReward()) {
		throw new Error('Share reward already earned this month');
	}

	const now = new Date();
	this.subscription.creditsRemaining += 5;
	this.shareRewards.lastRewardDate = now;
	this.shareRewards.monthlySharesCount += 1;
	this.shareRewards.totalShareRewards += 5;

	return this.save();
};

module.exports = mongoose.model('User', userSchema);
