const config = require('../config/config');

class SecureLogger {
	constructor() {
		this.isDevelopment = config.isDevelopment;
		this.isProduction = config.isProduction;
	}

	// Safe development-only logging
	dev(...args) {
		if (this.isDevelopment) {
			console.log(...args);
		}
	}

	// Safe error logging (sanitized for production)
	error(message, error = null) {
		if (this.isDevelopment) {
			console.error(message, error);
		} else {
			// In production, log only safe error messages
			const safeMessage = typeof message === 'string' ? message : 'Application error';
			console.error(safeMessage);
		}
	}

	// Warning logs (always show but sanitized)
	warn(message, details = null) {
		if (this.isDevelopment) {
			console.warn(message, details);
		} else {
			const safeMessage = typeof message === 'string' ? message : 'Application warning';
			console.warn(safeMessage);
		}
	}

	// Info logs (production safe)
	info(message) {
		const safeMessage = typeof message === 'string' ? message : 'Application info';
		console.log(safeMessage);
	}

	// Security-related logging (always logged but sanitized)
	security(message, details = {}) {
		const sanitizedDetails = this.sanitizeSecurityDetails(details);
		console.warn(`🚨 SECURITY: ${message}`, sanitizedDetails);
	}

	// Sanitize security details for logging
	sanitizeSecurityDetails(details) {
		if (this.isDevelopment) {
			return details;
		}

		// In production, only log safe security details
		const safe = {};
		if (details.ip) safe.ip = details.ip;
		if (details.timestamp) safe.timestamp = details.timestamp;
		if (details.method) safe.method = details.method;
		if (details.url) {
			// Sanitize URL to remove sensitive parameters
			safe.url = details.url.split('?')[0];
		}
		return safe;
	}

	// Performance logging (development only)
	perf(label, fn) {
		if (this.isDevelopment) {
			console.time(label);
			const result = fn();
			console.timeEnd(label);
			return result;
		}
		return fn();
	}

	// Async performance logging
	async perfAsync(label, fn) {
		if (this.isDevelopment) {
			console.time(label);
			const result = await fn();
			console.timeEnd(label);
			return result;
		}
		return await fn();
	}
}

module.exports = new SecureLogger();
