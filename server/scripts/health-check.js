#!/usr/bin/env node

const mongoose = require('mongoose');
const config = require('../src/config/config');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function healthCheck() {
	console.log('🏥 System Health Check\n');

	const results = {
		database: false,
		aiServices: [],
		dependencies: {},
		server: false,
		overall: false,
	};

	// Check Database Connection
	try {
		console.log('📊 Checking database connection...');
		await mongoose.connect(config.mongodb.uri, config.mongodb.options);
		console.log('✅ Database connection: OK');
		results.database = true;
		await mongoose.disconnect();
	} catch (error) {
		console.log('❌ Database connection: FAILED');
		console.log(`   Error: ${error.message}`);
		results.database = false;
	}

	// Check AI Services
	console.log('\n🤖 Checking AI services...');

	if (config.openai.hasApiKey) {
		console.log('✅ OpenAI: API key configured');
		results.aiServices.push('OpenAI');
	} else {
		console.log('⚠️  OpenAI: No API key');
	}

	if (config.anthropic.hasApiKey) {
		console.log('✅ Anthropic: API key configured');
		results.aiServices.push('Anthropic');
	} else {
		console.log('⚠️  Anthropic: No API key');
	}

	if (config.gemini.hasApiKey) {
		console.log('✅ Gemini: API key configured');
		results.aiServices.push('Gemini');
	} else {
		console.log('⚠️  Gemini: No API key');
	}

	if (results.aiServices.length === 0) {
		console.log('❌ No AI services configured!');
	}

	// Check Dependencies
	console.log('\n🔧 Checking optional dependencies...');

	// Check yt-dlp
	try {
		const { stdout } = await execAsync('yt-dlp --version');
		console.log('✅ yt-dlp: Available');
		results.dependencies.ytdlp = true;
	} catch (error) {
		console.log('⚠️  yt-dlp: Not installed');
		results.dependencies.ytdlp = false;
	}

	// Check Python
	try {
		const { stdout } = await execAsync('python3 --version');
		console.log('✅ Python3: Available');
		results.dependencies.python = true;
	} catch (error) {
		console.log('⚠️  Python3: Not available');
		results.dependencies.python = false;
	}

	// Check ffmpeg
	try {
		const { stdout } = await execAsync('ffmpeg -version');
		console.log('✅ ffmpeg: Available');
		results.dependencies.ffmpeg = true;
	} catch (error) {
		console.log('⚠️  ffmpeg: Not available');
		results.dependencies.ffmpeg = false;
	}

	// Check Server Health Endpoint
	console.log('\n🌐 Checking server health...');
	try {
		const axios = require('axios');
		const response = await axios.get(`http://localhost:${config.port}/api/health`, {
			timeout: 5000,
		});

		if (response.status === 200 && response.data.status === 'OK') {
			console.log('✅ Server health endpoint: OK');
			results.server = true;
		} else {
			console.log('❌ Server health endpoint: Unexpected response');
			results.server = false;
		}
	} catch (error) {
		console.log('❌ Server health endpoint: Not responding');
		console.log(`   Make sure server is running on port ${config.port}`);
		results.server = false;
	}

	// Overall Status
	results.overall = results.database && results.aiServices.length > 0;

	console.log('\n📋 Health Check Summary:');
	console.log('========================');
	console.log(`Database: ${results.database ? '✅ OK' : '❌ FAILED'}`);
	console.log(
		`AI Services: ${results.aiServices.length > 0 ? `✅ ${results.aiServices.join(', ')}` : '❌ None configured'}`
	);
	console.log(`Server: ${results.server ? '✅ Running' : '⚠️  Not responding'}`);
	console.log(`Dependencies: ${Object.values(results.dependencies).some((v) => v) ? '⚠️  Partial' : '❌ Missing'}`);
	console.log(`Overall: ${results.overall ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);

	if (!results.overall) {
		console.log('\n🔧 Recommended Actions:');

		if (!results.database) {
			console.log('• Check MongoDB connection and ensure database is running');
		}

		if (results.aiServices.length === 0) {
			console.log('• Configure at least one AI service API key in .env file');
		}

		if (!results.dependencies.ytdlp) {
			console.log('• Install yt-dlp: pip install yt-dlp');
		}

		if (!results.server) {
			console.log('• Start the server: npm run dev');
		}
	}

	return results;
}

// Auto-monitoring mode
async function startMonitoring(intervalMinutes = 5) {
	console.log(`🔄 Starting health monitoring (checking every ${intervalMinutes} minutes)`);
	console.log('Press Ctrl+C to stop\n');

	const checkHealth = async () => {
		const timestamp = new Date().toISOString();
		console.log(`\n[${timestamp}] Running health check...`);

		try {
			const results = await healthCheck();

			if (!results.overall) {
				console.log('🚨 ALERT: System health issues detected!');
				// Here you could send notifications, emails, etc.
			}
		} catch (error) {
			console.error('❌ Health check failed:', error.message);
		}

		console.log(`\n⏰ Next check in ${intervalMinutes} minutes...`);
	};

	// Initial check
	await checkHealth();

	// Set up interval
	const interval = setInterval(checkHealth, intervalMinutes * 60 * 1000);

	// Handle graceful shutdown
	process.on('SIGINT', () => {
		console.log('\n🛑 Stopping health monitoring...');
		clearInterval(interval);
		process.exit(0);
	});
}

// CLI interface
if (require.main === module) {
	const command = process.argv[2];
	const interval = parseInt(process.argv[3]) || 5;

	if (command === 'monitor') {
		startMonitoring(interval);
	} else {
		healthCheck()
			.then((results) => {
				process.exit(results.overall ? 0 : 1);
			})
			.catch((error) => {
				console.error('💥 Health check failed:', error.message);
				process.exit(1);
			});
	}
}

module.exports = { healthCheck, startMonitoring };
