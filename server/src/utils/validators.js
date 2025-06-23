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
		/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)[a-zA-Z0-9_-]{11}(\S*)?$/,
		/^[a-zA-Z0-9_-]{11}$/, // Just the video ID
	];

	return patterns.some((pattern) => pattern.test(url));
};

const extractYouTubeVideoId = (url) => {
	// Handle different YouTube URL formats
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
		/^([a-zA-Z0-9_-]{11})$/, // Just the video ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) {
			return match[1];
		}
	}

	return null;
};

const sanitizeInput = (input) => {
	if (typeof input !== 'string') return input;

	// Remove any HTML tags
	return input.replace(/<[^>]*>/g, '').trim();
};

const validateName = (name) => {
	// Allow letters, spaces, hyphens, and apostrophes
	const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
	return nameRegex.test(name);
};

const validateUrl = (url) => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

const validateObjectId = (id) => {
	// MongoDB ObjectId validation
	const objectIdRegex = /^[0-9a-fA-F]{24}$/;
	return objectIdRegex.test(id);
};

const validatePaginationParams = (page, limit) => {
	const pageNum = parseInt(page) || 1;
	const limitNum = parseInt(limit) || 10;

	return {
		page: Math.max(1, pageNum),
		limit: Math.min(100, Math.max(1, limitNum)),
	};
};

const validateSortParams = (sort, allowedFields = []) => {
	if (!sort) return { createdAt: -1 }; // Default sort

	const sortObj = {};
	const parts = sort.split(',');

	parts.forEach((part) => {
		const trimmed = part.trim();
		const isDescending = trimmed.startsWith('-');
		const field = isDescending ? trimmed.substring(1) : trimmed;

		if (allowedFields.length === 0 || allowedFields.includes(field)) {
			sortObj[field] = isDescending ? -1 : 1;
		}
	});

	return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 };
};

const validateDateRange = (startDate, endDate) => {
	const start = startDate ? new Date(startDate) : null;
	const end = endDate ? new Date(endDate) : null;

	if (start && isNaN(start.getTime())) {
		throw new Error('Invalid start date');
	}

	if (end && isNaN(end.getTime())) {
		throw new Error('Invalid end date');
	}

	if (start && end && start > end) {
		throw new Error('Start date must be before end date');
	}

	return { start, end };
};

module.exports = {
	validateEmail,
	validatePassword,
	validateYouTubeUrl,
	extractYouTubeVideoId,
	sanitizeInput,
	validateName,
	validateUrl,
	validateObjectId,
	validatePaginationParams,
	validateSortParams,
	validateDateRange,
};
