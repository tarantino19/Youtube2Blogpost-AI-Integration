const axios = require('axios');
const { getTranscript, extractVideoId } = require('./transcriptService');

// Get video metadata using oEmbed (no API key required)
const getVideoMetadata = async (videoId) => {
	try {
		// Method 1: Use YouTube oEmbed API (free, no key required)
		const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

		try {
			const response = await axios.get(oembedUrl, { timeout: 10000 });
			const data = response.data;

			return {
				videoId: videoId,
				title: data.title,
				description: '', // oEmbed doesn't provide description
				thumbnail: data.thumbnail_url,
				duration: 0, // We'll estimate from transcript if needed
				channelTitle: data.author_name,
				channelId: '', // Not available in oEmbed
				publishedAt: new Date().toISOString(), // Fallback to current date
				viewCount: 0,
				likeCount: 0,
				commentCount: 0,
				tags: [],
				language: 'en',
				categoryId: '',
			};
		} catch (oembedError) {
			console.error('oEmbed failed:', oembedError.message);

			// Fallback: Basic metadata from video ID
			return {
				videoId: videoId,
				title: `YouTube Video ${videoId}`,
				description: '',
				thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
				duration: 0,
				channelTitle: 'Unknown Channel',
				channelId: '',
				publishedAt: new Date().toISOString(),
				viewCount: 0,
				likeCount: 0,
				commentCount: 0,
				tags: [],
				language: 'en',
				categoryId: '',
			};
		}
	} catch (error) {
		console.error('Video metadata error:', error);
		throw new Error(`Failed to fetch video metadata: ${error.message}`);
	}
};

// Validate video (simplified without API)
const validateVideo = async (videoId) => {
	try {
		const metadata = await getVideoMetadata(videoId);

		if (!metadata.title || metadata.title.includes('Private video') || metadata.title.includes('Video unavailable')) {
			throw new Error('Video is private, deleted, or unavailable');
		}

		return {
			isValid: true,
			metadata: metadata,
		};
	} catch (error) {
		return {
			isValid: false,
			error: error.message,
		};
	}
};

// Comments not available without API
const getVideoComments = async (videoId, maxResults = 20) => {
	// Return empty array since we can't get comments without API
	return [];
};

module.exports = {
	extractVideoId,
	getVideoMetadata,
	getTranscript,
	getVideoComments,
	validateVideo,
};
