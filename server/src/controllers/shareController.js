const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const claimShareReward = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const userId = req.user.id;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if user can earn share reward this month
		if (!user.canEarnShareReward()) {
			return res.status(400).json({
				message: 'Share reward already earned this month. You can earn another reward in 30 days.',
			});
		}

		// Award the share reward
		await user.awardShareReward();

		res.json({
			message: 'Share reward claimed successfully! 5 credits added to your account.',
			creditsAdded: 5,
			newCreditsBalance: user.subscription.creditsRemaining,
		});
	} catch (error) {
		console.error('Error claiming share reward:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

const getShareStatus = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const canEarnReward = user.canEarnShareReward();
		const lastRewardDate = user.shareRewards.lastRewardDate;
		const totalShareRewards = user.shareRewards.totalShareRewards;

		let daysUntilNextReward = 0;
		if (lastRewardDate && !canEarnReward) {
			const daysSinceLastReward = Math.floor((Date.now() - lastRewardDate) / (1000 * 60 * 60 * 24));
			daysUntilNextReward = 30 - daysSinceLastReward;
		}

		res.json({
			canEarnReward,
			lastRewardDate,
			totalShareRewards,
			daysUntilNextReward,
			rewardAmount: 5,
		});
	} catch (error) {
		console.error('Error getting share status:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	claimShareReward,
	getShareStatus,
};
