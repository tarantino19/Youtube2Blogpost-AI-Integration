const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function manageCredits() {
	try {
		// Connect to MongoDB
		console.log('🔗 Connecting to MongoDB...');
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yttotext');
		console.log('✅ Connected to MongoDB');

		// Get all users
		const users = await User.find({});
		console.log(`\n👥 Found ${users.length} users:`);

		users.forEach((user, index) => {
			console.log(`\n${index + 1}. ${user.name} (${user.email})`);
			console.log(`   Plan: ${user.subscription.plan}`);
			console.log(`   Credits: ${user.subscription.creditsRemaining}`);
			console.log(`   Reset Date: ${user.subscription.resetDate.toDateString()}`);
		});

		// If there are users, let's work with the first one for now
		if (users.length > 0) {
			const user = users[0];
			console.log(`\n🎯 Working with user: ${user.name} (${user.email})`);

			// Option 1: Reset credits to plan default
			console.log('\n📝 Resetting credits to plan default...');
			const creditsMap = {
				free: 5,
				basic: 50,
				pro: 500,
			};

			user.subscription.creditsRemaining = creditsMap[user.subscription.plan];
			user.subscription.resetDate = new Date();
			await user.save();

			console.log(`✅ Credits reset to ${user.subscription.creditsRemaining} for ${user.subscription.plan} plan`);

			// Option 2: Upgrade to pro for development
			console.log('\n🚀 Upgrading to Pro plan for development...');
			user.subscription.plan = 'pro';
			user.subscription.creditsRemaining = 500;
			user.subscription.resetDate = new Date();
			await user.save();

			console.log(`✅ User upgraded to Pro plan with 500 credits!`);

			// Verify the changes
			const updatedUser = await User.findById(user._id);
			console.log(`\n📊 Final status:`);
			console.log(`   Plan: ${updatedUser.subscription.plan}`);
			console.log(`   Credits: ${updatedUser.subscription.creditsRemaining}`);
			console.log(`   Reset Date: ${updatedUser.subscription.resetDate.toDateString()}`);
		} else {
			console.log('\n❌ No users found! Please register an account first.');
		}
	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		console.log('\n👋 Disconnecting from MongoDB...');
		await mongoose.disconnect();
		process.exit(0);
	}
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
	console.log(`
📋 Credit Management Script

This script helps you manage user credits for development.

Usage:
  npm run manage-credits

What it does:
1. Shows all users and their current credit status
2. Resets the first user's credits to their plan default
3. Upgrades the first user to Pro plan (500 credits)

Note: This is for development purposes only!
	`);
	process.exit(0);
}

console.log('🚀 Starting credit management script...');
manageCredits();
