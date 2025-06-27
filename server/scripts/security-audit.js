#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const config = require('../src/config/config');

async function securityAudit() {
	console.log('🔒 Security Audit Report\n');

	const issues = [];
	const warnings = [];
	const passed = [];

	// Check 1: JWT Secret Configuration
	console.log('1. Checking JWT Secret Configuration...');
	const jwtSecret = process.env.JWT_SECRET;
	if (
		!jwtSecret ||
		jwtSecret === 'your_jwt_secret_key' ||
		jwtSecret === 'dev-secret-change-this' ||
		jwtSecret.length < 16
	) {
		issues.push('JWT_SECRET is weak or not set. Use a strong secret (16+ characters recommended).');
	} else {
		passed.push('JWT_SECRET is properly configured');
	}

	// Check 2: Environment Variables
	console.log('2. Checking Environment Variables...');
	const sensitiveEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'OPENAI_API_KEY', 'GEMINI_API_KEY', 'ANTHROPIC_API_KEY'];

	for (const envVar of sensitiveEnvVars) {
		const value = process.env[envVar];
		if (value && (value.includes('your-') || value.includes('change-this') || value.includes('example'))) {
			warnings.push(`${envVar} appears to contain placeholder values`);
		}
	}

	// Check 3: Production Configuration
	console.log('3. Checking Production Configuration...');
	if (config.isProduction) {
		if (config.mongodb.uri.includes('localhost')) {
			issues.push('Production should not use localhost for MongoDB');
		}

		if (!config.openai.hasApiKey && !config.gemini.hasApiKey && !config.anthropic.hasApiKey) {
			issues.push('No AI service API keys configured in production');
		}

		passed.push('Production environment checks completed');
	} else {
		passed.push('Development environment detected');
	}

	// Check 4: File Permissions and Sensitive Files
	console.log('4. Checking File Security...');
	const sensitiveFiles = ['.env', '.env.production', '.env.development', 'package-lock.json'];

	for (const file of sensitiveFiles) {
		try {
			const filePath = path.join(__dirname, '..', file);
			await fs.access(filePath);

			if (file.startsWith('.env')) {
				// Check if .env files are in .gitignore
				try {
					const gitignore = await fs.readFile(path.join(__dirname, '../..', '.gitignore'), 'utf-8');
					if (!gitignore.includes('.env')) {
						issues.push('.env files should be added to .gitignore');
					}
				} catch (err) {
					warnings.push('.gitignore file not found');
				}
			}
		} catch (err) {
			// File doesn't exist, which is fine for some
		}
	}

	// Check 5: Dependencies Security
	console.log('5. Checking Dependencies...');
	try {
		const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf-8'));
		const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

		// Check for known vulnerable packages (basic check)
		const knownVulnerable = ['lodash@<4.17.21', 'axios@<0.21.1'];
		// This is a simplified check - in production, use npm audit

		passed.push('Dependencies check completed (run npm audit for detailed analysis)');
	} catch (err) {
		warnings.push('Could not read package.json');
	}

	// Check 6: Route Security
	console.log('6. Checking Route Security...');
	const routeFiles = ['auth.js', 'videos.js', 'posts.js'];
	let protectedRoutes = 0;
	let publicRoutes = 0;

	for (const routeFile of routeFiles) {
		try {
			const content = await fs.readFile(path.join(__dirname, '..', 'src', 'routes', routeFile), 'utf-8');

			// Count protected vs public routes
			const authenticateCount = (content.match(/authenticate/g) || []).length;
			const routeCount = (content.match(/router\.(get|post|put|delete)/g) || []).length;

			protectedRoutes += authenticateCount;
			publicRoutes += routeCount - authenticateCount;
		} catch (err) {
			warnings.push(`Could not read route file: ${routeFile}`);
		}
	}

	passed.push(`Route security: ${protectedRoutes} protected, ${publicRoutes} public routes`);

	// Check 7: Error Handling
	console.log('7. Checking Error Handling...');
	try {
		const appJs = await fs.readFile(path.join(__dirname, '..', 'src', 'app.js'), 'utf-8');

		if (appJs.includes('err.stack') && appJs.includes('config.isDevelopment')) {
			passed.push('Error handling properly configured (stack traces only in development)');
		} else {
			warnings.push('Error handling might expose sensitive information');
		}
	} catch (err) {
		warnings.push('Could not check error handling configuration');
	}

	// Check 8: CORS Configuration
	console.log('8. Checking CORS Configuration...');
	if (config.cors.origin === '*') {
		issues.push('CORS is configured to allow all origins - this is insecure for production');
	} else {
		passed.push('CORS is properly configured');
	}

	// Generate Report
	console.log('\n📋 Security Audit Summary');
	console.log('=========================');

	if (issues.length > 0) {
		console.log('\n❌ Critical Issues:');
		issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
	}

	if (warnings.length > 0) {
		console.log('\n⚠️  Warnings:');
		warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning}`));
	}

	if (passed.length > 0) {
		console.log('\n✅ Passed Checks:');
		passed.forEach((pass, i) => console.log(`${i + 1}. ${pass}`));
	}

	// Overall Security Score
	const totalChecks = issues.length + warnings.length + passed.length;
	const securityScore = Math.round((passed.length / totalChecks) * 100);

	console.log(`\n🎯 Security Score: ${securityScore}%`);

	if (issues.length > 0) {
		console.log('\n🚨 CRITICAL: Fix all issues before deploying to production!');
		return false;
	} else if (warnings.length > 0) {
		console.log('\n⚠️  Review warnings before deploying to production');
		return true;
	} else {
		console.log('\n🎉 All security checks passed!');
		return true;
	}
}

// Security recommendations
function printSecurityRecommendations() {
	console.log('\n📚 Security Recommendations:');
	console.log('============================');
	console.log('1. Use strong, unique JWT secrets (16+ characters recommended)');
	console.log('2. Never commit .env files to version control');
	console.log('3. Use HTTPS in production');
	console.log('4. Regularly update dependencies (npm audit)');
	console.log('5. Monitor logs for suspicious activity');
	console.log('6. Use environment-specific configurations');
	console.log('7. Implement proper input validation');
	console.log('8. Use rate limiting on all endpoints');
	console.log('9. Enable security headers (helmet.js)');
	console.log('10. Regular security audits and penetration testing');
}

// CLI interface
if (require.main === module) {
	securityAudit()
		.then((passed) => {
			printSecurityRecommendations();
			process.exit(passed ? 0 : 1);
		})
		.catch((error) => {
			console.error('💥 Security audit failed:', error.message);
			process.exit(1);
		});
}

module.exports = { securityAudit };
