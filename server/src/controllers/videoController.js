const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
// Use API-free service if no YouTube API key is configured
const youtubeService =
	process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your-youtube-api-key-here'
		? require('../services/youtubeService')
		: require('../services/youtubeServiceNoAPI');
// Choose AI service based on available API keys
const aiService =
	process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here'
		? require('../services/geminiService')
		: require('../services/aiService');
const { validateYouTubeUrl, extractYouTubeVideoId, validateObjectId } = require('../utils/validators');

const processVideo = async (req, res) => {
	try {
		const { videoUrl } = req.body;
		const userId = req.user.id;

		// Validate YouTube URL
		if (!validateYouTubeUrl(videoUrl)) {
			return res.status(400).json({ error: 'Invalid YouTube URL' });
		}

		// Extract video ID
		const videoId = extractYouTubeVideoId(videoUrl);
		if (!videoId) {
			return res.status(400).json({ error: 'Could not extract video ID from URL' });
		}

		// Check user credits
		const user = await User.findById(userId);
		if (user.subscription.creditsRemaining <= 0) {
			return res.status(403).json({
				error: 'No credits remaining',
				creditsRemaining: 0,
				resetDate: user.subscription.resetDate,
			});
		}

		// Check if video already processed by this user
		const existingPost = await BlogPost.findOne({ userId, videoId });
		if (existingPost) {
			return res.json({
				message: 'Video already processed',
				postId: existingPost._id,
				status: existingPost.status,
			});
		}

		// Validate video
		const validation = await youtubeService.validateVideo(videoId);
		if (!validation.isValid) {
			return res.status(400).json({ error: validation.error });
		}

		// Create initial blog post record
		const blogPost = new BlogPost({
			userId,
			videoUrl,
			videoId,
			videoTitle: validation.metadata.title,
			videoThumbnail: validation.metadata.thumbnail,
			videoDuration: validation.metadata.duration,
			videoChannel: validation.metadata.channelTitle,
			status: 'processing',
			language: validation.metadata.language,
		});

		await blogPost.save();

		// Process video asynchronously
		console.log(`🚀 About to start async processing for post ${blogPost._id}`);
		processVideoAsync(blogPost._id, videoId, user, validation.metadata).catch((error) => {
			console.error(`💥 Async processing failed for ${blogPost._id}:`, error);
		});

		res.json({
			message: 'Video processing started',
			postId: blogPost._id,
			estimatedTime: '2-3 minutes',
		});
	} catch (error) {
		console.error('Process video error:', error);
		res.status(500).json({ error: error.message || 'Failed to process video' });
	}
};

async function processVideoAsync(blogPostId, videoId, user, metadata) {
	console.log(`🚀 Starting async processing for video ${videoId} (post: ${blogPostId})`);

	try {
		const blogPost = await BlogPost.findById(blogPostId);
		if (!blogPost) {
			throw new Error(`Blog post ${blogPostId} not found`);
		}

		console.log(`📋 Blog post found: ${blogPost.videoTitle}`);

		// Get transcript
		console.log(`📝 Fetching transcript for video ${videoId}...`);
		const transcriptData = await youtubeService.getTranscript(videoId, metadata.language);
		console.log(`✅ Transcript received: ${transcriptData.transcript.length} characters`);

		// Get video comments for additional context
		console.log(`💬 Fetching comments for video ${videoId}...`);
		const comments = await youtubeService.getVideoComments(videoId);
		console.log(`✅ Comments received: ${comments.length} comments`);

		// Generate blog post with AI
		console.log(`🤖 Generating blog post content with AI...`);
		const generatedContent = await aiService.generateBlogPost(
			transcriptData.transcript,
			metadata.title,
			metadata.description,
			{
				comments,
				tags: metadata.tags,
				language: metadata.language,
			}
		);
		console.log(`✅ Blog content generated: ${generatedContent.content.length} characters`);

		// Extract keywords for SEO
		console.log(`🔍 Extracting keywords...`);
		const keywords = await aiService.extractKeywords(generatedContent.content);
		console.log(`✅ Keywords extracted: ${keywords.length} keywords`);

		// Update blog post with all required fields at once
		console.log(`💾 Updating blog post with generated content...`);
		await BlogPost.findByIdAndUpdate(blogPostId, {
			transcript: transcriptData.transcript,
			generatedContent: {
				...generatedContent,
				keywords,
			},
			status: 'completed',
			wordCount: generatedContent.content.split(/\s+/).length,
			readingTime: Math.ceil(generatedContent.content.split(/\s+/).length / 200),
		});

		// Deduct credit
		console.log(`💳 Deducting credit from user...`);
		user.subscription.creditsRemaining -= 1;
		await user.save();

		console.log(`🎉 Successfully processed video ${videoId} - Post status: completed`);
	} catch (error) {
		console.error(`❌ Error processing video ${videoId}:`, error.message);
		console.error(`❌ Full error stack:`, error);

		// Update blog post with error status
		try {
			await BlogPost.findByIdAndUpdate(blogPostId, {
				status: 'failed',
				error: error.message,
			});
			console.log(`💔 Updated blog post ${blogPostId} status to 'failed'`);
		} catch (updateError) {
			console.error(`❌ Failed to update blog post status:`, updateError);
		}
	}
}

const getVideoStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		if (!validateObjectId(id)) {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		const blogPost = await BlogPost.findOne({ _id: id, userId }).select(
			'status error videoTitle videoThumbnail createdAt'
		);

		if (!blogPost) {
			return res.status(404).json({ error: 'Blog post not found' });
		}

		res.json({
			id: blogPost._id,
			status: blogPost.status,
			error: blogPost.error,
			videoTitle: blogPost.videoTitle,
			videoThumbnail: blogPost.videoThumbnail,
			createdAt: blogPost.createdAt,
		});
	} catch (error) {
		console.error('Get video status error:', error);
		res.status(500).json({ error: 'Failed to get video status' });
	}
};

const listVideos = async (req, res) => {
	try {
		const userId = req.user.id;
		const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

		// Build query
		const query = { userId };
		if (status) {
			query.status = status;
		}

		// Pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);
		const limitNum = Math.min(parseInt(limit), 50);

		// Get videos
		const [videos, total] = await Promise.all([
			BlogPost.find(query)
				.select('videoTitle videoThumbnail videoDuration status createdAt wordCount readingTime')
				.sort(sort)
				.skip(skip)
				.limit(limitNum)
				.lean(),
			BlogPost.countDocuments(query),
		]);

		res.json({
			videos,
			pagination: {
				page: parseInt(page),
				limit: limitNum,
				total,
				pages: Math.ceil(total / limitNum),
			},
		});
	} catch (error) {
		console.error('List videos error:', error);
		res.status(500).json({ error: 'Failed to list videos' });
	}
};

const retryVideo = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		if (!validateObjectId(id)) {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		// Find failed blog post
		const blogPost = await BlogPost.findOne({
			_id: id,
			userId,
			status: 'failed',
		});

		if (!blogPost) {
			return res.status(404).json({
				error: 'Blog post not found or not in failed state',
			});
		}

		// Check user credits
		const user = await User.findById(userId);
		if (user.subscription.creditsRemaining <= 0) {
			return res.status(403).json({
				error: 'No credits remaining',
				creditsRemaining: 0,
			});
		}

		// Reset status and retry
		blogPost.status = 'processing';
		blogPost.error = null;
		await blogPost.save();

		// Get video metadata
		const metadata = {
			title: blogPost.videoTitle,
			description: '',
			tags: [],
			language: blogPost.language || 'en',
		};

		// Retry processing
		processVideoAsync(blogPost._id, blogPost.videoId, user, metadata);

		res.json({
			message: 'Video processing restarted',
			postId: blogPost._id,
		});
	} catch (error) {
		console.error('Retry video error:', error);
		res.status(500).json({ error: 'Failed to retry video processing' });
	}
};

module.exports = {
	processVideo,
	getVideoStatus,
	listVideos,
	retryVideo,
};
