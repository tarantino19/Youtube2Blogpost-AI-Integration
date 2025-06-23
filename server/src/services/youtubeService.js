const axios = require('axios');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

const apiKey = process.env.YOUTUBE_API_KEY;

// Extract video ID from URL
const extractVideoId = (url) => {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
		/youtube\.com\/embed\/([^&\n?#]+)/,
		/youtube\.com\/v\/([^&\n?#]+)/,
		/^([a-zA-Z0-9_-]{11})$/, // Direct video ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	throw new Error('Invalid YouTube URL');
};

// Parse ISO 8601 duration to seconds
const parseDuration = (duration) => {
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return 0;

	const hours = parseInt(match[1]) || 0;
	const minutes = parseInt(match[2]) || 0;
	const seconds = parseInt(match[3]) || 0;

	return hours * 3600 + minutes * 60 + seconds;
};

// Get video metadata
const getVideoMetadata = async (videoId) => {
	try {
		if (!apiKey) {
			throw new Error('YouTube API key not configured');
		}

		const response = await youtube.videos.list({
			key: apiKey,
			part: 'snippet,contentDetails,statistics',
			id: videoId,
		});

		if (!response.data.items || response.data.items.length === 0) {
			throw new Error('Video not found');
		}

		const video = response.data.items[0];
		const snippet = video.snippet;
		const contentDetails = video.contentDetails;
		const statistics = video.statistics;

		return {
			videoId: video.id,
			title: snippet.title,
			description: snippet.description,
			thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
			duration: parseDuration(contentDetails.duration),
			channelTitle: snippet.channelTitle,
			channelId: snippet.channelId,
			publishedAt: snippet.publishedAt,
			viewCount: parseInt(statistics.viewCount) || 0,
			likeCount: parseInt(statistics.likeCount) || 0,
			commentCount: parseInt(statistics.commentCount) || 0,
			tags: snippet.tags || [],
			language: snippet.defaultLanguage || snippet.defaultAudioLanguage || 'en',
			categoryId: snippet.categoryId,
		};
	} catch (error) {
		console.error('YouTube API Error:', error);
		throw new Error(`Failed to fetch video metadata: ${error.message}`);
	}
};

// Get video transcript using youtube-transcript API
const getTranscript = async (videoId, language = 'en') => {
	try {
		// Using an alternative approach - youtube-transcript API endpoint
		// In production, you might want to use the youtube-transcript npm package
		const transcriptUrl = `https://youtube-transcript-api.herokuapp.com/api/transcript?video_id=${videoId}&lang=${language}`;

		try {
			const response = await axios.get(transcriptUrl, {
				timeout: 30000, // 30 second timeout
			});

			if (!response.data || response.data.length === 0) {
				throw new Error('No transcript available');
			}

			// Combine all transcript segments
			const fullTranscript = response.data
				.map((item) => item.text)
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim();

			return {
				transcript: fullTranscript,
				segments: response.data,
				language: language,
			};
		} catch (apiError) {
			// Fallback: Try to get auto-generated captions through YouTube API
			return await getAutoCaptions(videoId);
		}
	} catch (error) {
		console.error('Transcript Error:', error);
		throw new Error(`Failed to fetch transcript: ${error.message}`);
	}
};

// Fallback method to get auto-generated captions
const getAutoCaptions = async (videoId) => {
	try {
		if (!apiKey) {
			throw new Error('YouTube API key not configured');
		}

		// Get caption tracks
		const captionsResponse = await youtube.captions.list({
			key: apiKey,
			part: 'snippet',
			videoId: videoId,
		});

		if (!captionsResponse.data.items || captionsResponse.data.items.length === 0) {
			throw new Error('No captions available for this video');
		}

		// Find English captions or auto-generated ones
		const captions = captionsResponse.data.items;
		const englishCaption = captions.find(
			(cap) => cap.snippet.language === 'en' || cap.snippet.language === 'en-US' || cap.snippet.trackKind === 'asr' // Auto-generated
		);

		if (!englishCaption) {
			throw new Error('No English captions available');
		}

		// Note: Actually downloading captions requires OAuth2 authentication
		// This is a limitation of the YouTube API
		throw new Error(
			'Caption download requires OAuth authentication. Please use a video with publicly available transcripts.'
		);
	} catch (error) {
		throw new Error(`Failed to fetch auto-captions: ${error.message}`);
	}
};

// Get video comments (for additional context)
const getVideoComments = async (videoId, maxResults = 20) => {
	try {
		if (!apiKey) {
			return []; // Return empty array if no API key
		}

		const response = await youtube.commentThreads.list({
			key: apiKey,
			part: 'snippet',
			videoId: videoId,
			maxResults: maxResults,
			order: 'relevance',
		});

		if (!response.data.items) {
			return [];
		}

		return response.data.items.map((item) => ({
			author: item.snippet.topLevelComment.snippet.authorDisplayName,
			text: item.snippet.topLevelComment.snippet.textDisplay,
			likeCount: item.snippet.topLevelComment.snippet.likeCount,
			publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
		}));
	} catch (error) {
		console.error('Comments Error:', error);
		return []; // Return empty array on error
	}
};

// Validate if video is suitable for processing
const validateVideo = async (videoId) => {
	try {
		const metadata = await getVideoMetadata(videoId);

		// Check video duration (max 2 hours)
		if (metadata.duration > 7200) {
			throw new Error('Video is too long (max 2 hours)');
		}

		// Check if video is private or deleted
		if (!metadata.title) {
			throw new Error('Video is private or deleted');
		}

		return {
			isValid: true,
			metadata,
		};
	} catch (error) {
		return {
			isValid: false,
			error: error.message,
		};
	}
};

module.exports = {
	extractVideoId,
	getVideoMetadata,
	getTranscript,
	getVideoComments,
	validateVideo,
	parseDuration,
};
