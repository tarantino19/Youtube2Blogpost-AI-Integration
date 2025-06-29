const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const { exec } = require('child_process');
const path = require('path');
// Use API-free service if no YouTube API key is configured
const youtubeService =
	process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your-youtube-api-key-here'
		? require('../services/youtubeService')
		: require('../services/youtubeServiceNoAPI');
// Use unified AI service
const aiService = require('../services/unifiedAIService');
const { validateYouTubeUrl, extractYouTubeVideoId, validateObjectId } = require('../utils/validators');

const processVideo = async (req, res) => {
	try {
		const { videoUrl, modelId } = req.body;
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
			aiModel: modelId || process.env.DEFAULT_AI_MODEL || 'gemini-1.5-flash',
		});

		await blogPost.save();

		// Process video asynchronously
		console.log(`🚀 About to start async processing for post ${blogPost._id} using model ${blogPost.aiModel}`);
		processVideoAsync(blogPost._id, videoId, user, validation.metadata, modelId).catch((error) => {
			console.error(`💥 Async processing failed for ${blogPost._id}:`, error);
		});

		res.json({
			message: 'Video processing started',
			postId: blogPost._id,
			estimatedTime: '2-3 minutes',
			modelUsed: blogPost.aiModel,
		});
	} catch (error) {
		console.error('Process video error:', error);
		res.status(500).json({ error: error.message || 'Failed to process video' });
	}
};

async function processVideoAsync(blogPostId, videoId, user, metadata, modelId) {
	const selectedModel = modelId || process.env.DEFAULT_AI_MODEL || 'gemini-1.5-flash';
	console.log(`🚀 Starting async processing for video ${videoId} (post: ${blogPostId}) with model ${selectedModel}`);

	try {
		const blogPost = await BlogPost.findById(blogPostId);
		if (!blogPost) {
			throw new Error(`Blog post ${blogPostId} not found`);
		}

		console.log(`📋 Blog post found: ${blogPost.videoTitle}`);

		// Get transcript
		console.log(`📝 Fetching transcript for video ${videoId}...`);
		await BlogPost.findByIdAndUpdate(blogPostId, { processingStep: 'extracting_transcript' });
		const transcriptData = await youtubeService.getTranscript(videoId, metadata.language);
		console.log(`✅ Transcript received: ${transcriptData.transcript.length} characters`);

		// Get video comments for additional context
		console.log(`💬 Fetching comments for video ${videoId}...`);
		await BlogPost.findByIdAndUpdate(blogPostId, { processingStep: 'fetching_comments' });
		const comments = await youtubeService.getVideoComments(videoId);
		console.log(`✅ Comments received: ${comments.length} comments`);

		// Generate blog post with AI
		console.log(`🤖 Generating blog post content with AI model: ${selectedModel}...`);
		await BlogPost.findByIdAndUpdate(blogPostId, { processingStep: 'generating_content' });
		const generatedContent = await aiService.generateBlogPost(
			transcriptData.transcript,
			metadata.title,
			metadata.description,
			{
				comments,
				tags: metadata.tags,
				language: metadata.language,
			},
			selectedModel
		);
		console.log(
			`✅ Blog content generated: ${
				typeof generatedContent.content === 'string' ? generatedContent.content.length : 'Not a string'
			} characters`
		);
		console.log(`🔍 Generated content type:`, typeof generatedContent);
		console.log(`🔍 Generated content structure:`, {
			hasTitle: !!generatedContent.title,
			hasContent: !!generatedContent.content,
			contentType: typeof generatedContent.content,
			contentPreview:
				typeof generatedContent.content === 'string' ? generatedContent.content.substring(0, 100) + '...' : 'Not a string',
		});

		// Extract keywords for SEO
		console.log(`🔍 Extracting keywords...`);
		await BlogPost.findByIdAndUpdate(blogPostId, { processingStep: 'extracting_keywords' });
		const keywords = await aiService.extractKeywords(generatedContent.content, selectedModel);
		console.log(`✅ Keywords extracted: ${keywords.length} keywords`);

		// Update blog post with all required fields at once
		console.log(`💾 Updating blog post with generated content...`);
		await BlogPost.findByIdAndUpdate(blogPostId, { processingStep: 'saving_content' });

		// Ensure we're not accidentally stringifying the content
		let contentToSave;

		// Handle different formats of generatedContent
		if (typeof generatedContent === 'string') {
			try {
				// Check if it's wrapped in markdown code blocks
				let jsonString = generatedContent;
				if (generatedContent.trim().startsWith('```json') && generatedContent.trim().endsWith('```')) {
					// Remove the markdown code block wrapper
					jsonString = generatedContent
						.replace(/^```json\s*/, '')
						.replace(/\s*```$/, '')
						.trim();
				} else if (generatedContent.trim().startsWith('```') && generatedContent.trim().endsWith('```')) {
					// Remove any code block wrapper
					jsonString = generatedContent
						.replace(/^```[a-z]*\s*/, '')
						.replace(/\s*```$/, '')
						.trim();
				}

				const parsed = JSON.parse(jsonString);
				contentToSave = {
					title: parsed.title,
					content: parsed.content, // This should be markdown string, not JSON
					summary: parsed.summary,
					sections: parsed.sections || [],
					tags: parsed.tags || [],
					metaDescription: parsed.metaDescription || '',
					keyTakeaways: parsed.keyTakeaways || [],
					keywords: keywords || [],
				};
				console.log('✅ Successfully parsed wrapped JSON content');
			} catch (error) {
				console.error('Failed to parse stringified content:', error);
				console.error('Content preview:', generatedContent.substring(0, 200));
				throw new Error('Invalid generated content format');
			}
		} else {
			contentToSave = {
				title: generatedContent.title,
				content: generatedContent.content, // This should be markdown string, not JSON
				summary: generatedContent.summary,
				sections: generatedContent.sections || [],
				tags: generatedContent.tags || [],
				metaDescription: generatedContent.metaDescription || '',
				keyTakeaways: generatedContent.keyTakeaways || [],
				keywords: keywords || [],
			};
		}

		await BlogPost.findByIdAndUpdate(blogPostId, {
			transcript: transcriptData.transcript,
			generatedContent: contentToSave,
			status: 'completed',
			wordCount: generatedContent.content.split(/\s+/).length,
			readingTime: Math.ceil(generatedContent.content.split(/\s+/).length / 200),
		});

		// Deduct credit
		console.log(`💳 Deducting credit from user...`);
		user.subscription.creditsRemaining -= 1;
		await user.save();

		// Automatically fix content structure after successful generation
		console.log(`🔧 Auto-fixing blog content structure for post ${blogPostId}...`);
		await BlogPost.findByIdAndUpdate(blogPostId, { processingStep: 'finalizing' });
		try {
			const scriptPath = path.join(__dirname, '../../scripts/fix-blog-content.js');
			const command = `node "${scriptPath}" --postId=${blogPostId}`;

			await new Promise((resolve, reject) => {
				exec(command, { cwd: path.join(__dirname, '../..') }, (error, stdout, stderr) => {
					if (error) {
						console.error(`❌ Fix script error:`, error);
						reject(error);
						return;
					}
					if (stderr) {
						console.log(`⚠️ Fix script stderr:`, stderr);
					}
					console.log(`✅ Fix script output:`, stdout);
					resolve(stdout);
				});
			});

			console.log(`🎉 Content automatically fixed for post ${blogPostId}`);
		} catch (fixError) {
			console.error(`❌ Failed to auto-fix content for post ${blogPostId}:`, fixError.message);
			// Don't fail the entire process if fix fails, just log it
		}

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
			'status processingStep error videoTitle videoThumbnail createdAt'
		);

		if (!blogPost) {
			return res.status(404).json({ error: 'Blog post not found' });
		}

		res.json({
			id: blogPost._id,
			status: blogPost.status,
			processingStep: blogPost.processingStep,
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
		blogPost.processingStep = 'extracting_transcript';
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
		processVideoAsync(blogPost._id, blogPost.videoId, user, metadata, blogPost.aiModel);

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
