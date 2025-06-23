const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');
const aiService = require('../services/aiService');
const {
	validateObjectId,
	validatePaginationParams,
	validateSortParams,
	sanitizeInput,
} = require('../utils/validators');

const getPosts = async (req, res) => {
	try {
		const userId = req.user.id;
		const { status = 'completed', page = 1, limit = 10, sort = '-createdAt', search, tags } = req.query;

		// Validate pagination
		const { page: pageNum, limit: limitNum } = validatePaginationParams(page, limit);

		// Build query
		const query = { userId };

		if (status !== 'all') {
			query.status = status;
		}

		if (search) {
			query.$or = [
				{ 'generatedContent.title': { $regex: search, $options: 'i' } },
				{ videoTitle: { $regex: search, $options: 'i' } },
			];
		}

		if (tags) {
			const tagArray = tags.split(',').map((tag) => tag.trim());
			query['generatedContent.tags'] = { $in: tagArray };
		}

		// Validate sort
		const sortObj = validateSortParams(sort, ['createdAt', 'updatedAt', 'wordCount', 'readingTime']);

		// Get posts with pagination
		const [posts, total] = await Promise.all([
			BlogPost.find(query)
				.select('-transcript')
				.sort(sortObj)
				.skip((pageNum - 1) * limitNum)
				.limit(limitNum)
				.lean(),
			BlogPost.countDocuments(query),
		]);

		res.json({
			posts,
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				pages: Math.ceil(total / limitNum),
				hasNext: pageNum < Math.ceil(total / limitNum),
				hasPrev: pageNum > 1,
			},
		});
	} catch (error) {
		console.error('Get posts error:', error);
		res.status(500).json({ error: 'Failed to fetch posts' });
	}
};

const getPost = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		if (!validateObjectId(id)) {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		const post = await BlogPost.findOne({ _id: id, userId }).populate('userId', 'name email').lean();

		if (!post) {
			return res.status(404).json({ error: 'Post not found' });
		}

		// Add table of contents if sections exist
		if (post.generatedContent?.sections?.length > 0) {
			post.generatedContent.tableOfContents = aiService.generateTableOfContents(post.generatedContent.sections);
		}

		res.json({ post });
	} catch (error) {
		console.error('Get post error:', error);
		res.status(500).json({ error: 'Failed to fetch post' });
	}
};

const updatePost = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;
		const { title, content, summary, tags, metaDescription, isPublished } = req.body;

		if (!validateObjectId(id)) {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		// Find post
		const post = await BlogPost.findOne({ _id: id, userId });
		if (!post) {
			return res.status(404).json({ error: 'Post not found' });
		}

		// Update fields
		if (title) {
			post.generatedContent.title = sanitizeInput(title);
		}

		if (content) {
			post.generatedContent.content = content;
			post.wordCount = content.split(/\s+/).length;
			post.readingTime = Math.ceil(post.wordCount / 200);
		}

		if (summary) {
			post.generatedContent.summary = sanitizeInput(summary);
		}

		if (tags) {
			post.generatedContent.tags = tags.map((tag) => sanitizeInput(tag).toLowerCase());
		}

		if (metaDescription) {
			post.generatedContent.metaDescription = sanitizeInput(metaDescription).substring(0, 160);
		}

		if (typeof isPublished === 'boolean') {
			post.isPublished = isPublished;
		}

		await post.save();

		res.json({
			message: 'Post updated successfully',
			post,
		});
	} catch (error) {
		console.error('Update post error:', error);
		res.status(500).json({ error: 'Failed to update post' });
	}
};

const deletePost = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		if (!validateObjectId(id)) {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		const post = await BlogPost.findOneAndDelete({ _id: id, userId });

		if (!post) {
			return res.status(404).json({ error: 'Post not found' });
		}

		res.json({ message: 'Post deleted successfully' });
	} catch (error) {
		console.error('Delete post error:', error);
		res.status(500).json({ error: 'Failed to delete post' });
	}
};

const exportPost = async (req, res) => {
	try {
		const { id } = req.params;
		const { format = 'markdown' } = req.body;
		const userId = req.user.id;

		if (!validateObjectId(id)) {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		if (!['markdown', 'html', 'json'].includes(format)) {
			return res.status(400).json({ error: 'Invalid export format. Use markdown, html, or json' });
		}

		const post = await BlogPost.findOne({ _id: id, userId });
		if (!post) {
			return res.status(404).json({ error: 'Post not found' });
		}

		const exportData = post.getExportData(format);

		// Set appropriate headers
		const contentTypes = {
			markdown: 'text/markdown',
			html: 'text/html',
			json: 'application/json',
		};

		const fileExtensions = {
			markdown: 'md',
			html: 'html',
			json: 'json',
		};

		const filename = `${exportData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${fileExtensions[format]}`;

		res.setHeader('Content-Type', contentTypes[format]);
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

		// Format content based on type
		if (format === 'markdown') {
			const markdownContent = `# ${exportData.title}

**Video:** [${exportData.videoTitle}](${exportData.videoUrl})  
**Created:** ${new Date(exportData.createdAt).toLocaleDateString()}  
**Reading Time:** ${exportData.readingTime} minutes  
**Word Count:** ${exportData.wordCount}

${exportData.summary ? `## Summary\n\n${exportData.summary}\n\n` : ''}

${exportData.content}

${exportData.tags.length > 0 ? `\n**Tags:** ${exportData.tags.join(', ')}` : ''}`;

			res.send(markdownContent);
		} else if (format === 'html') {
			const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${exportData.metaDescription}">
    <title>${exportData.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .meta { color: #666; margin-bottom: 20px; }
        .tags { margin-top: 30px; }
        .tag { background: #e0e0e0; padding: 5px 10px; margin-right: 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>${exportData.title}</h1>
    <div class="meta">
        <p>Video: <a href="${exportData.videoUrl}">${exportData.videoTitle}</a></p>
        <p>Created: ${new Date(exportData.createdAt).toLocaleDateString()}</p>
        <p>Reading Time: ${exportData.readingTime} minutes | Word Count: ${exportData.wordCount}</p>
    </div>
    ${exportData.summary ? `<h2>Summary</h2><p>${exportData.summary}</p>` : ''}
    <div class="content">${exportData.content.replace(/\n/g, '<br>')}</div>
    ${
					exportData.tags.length > 0
						? `<div class="tags">Tags: ${exportData.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>`
						: ''
				}
</body>
</html>`;

			res.send(htmlContent);
		} else {
			res.json(exportData);
		}
	} catch (error) {
		console.error('Export post error:', error);
		res.status(500).json({ error: 'Failed to export post' });
	}
};

const improvePost = async (req, res) => {
	try {
		const { id } = req.params;
		const { instructions } = req.body;
		const userId = req.user.id;

		if (!validateObjectId(id)) {
			return res.status(400).json({ error: 'Invalid post ID' });
		}

		if (!instructions || instructions.trim().length < 10) {
			return res.status(400).json({ error: 'Please provide clear improvement instructions (at least 10 characters)' });
		}

		const post = await BlogPost.findOne({ _id: id, userId });
		if (!post) {
			return res.status(404).json({ error: 'Post not found' });
		}

		// Improve content with AI
		const improvedContent = await aiService.improveContent(post.generatedContent.content, sanitizeInput(instructions));

		// Update post
		post.generatedContent.content = improvedContent;
		post.wordCount = improvedContent.split(/\s+/).length;
		post.readingTime = Math.ceil(post.wordCount / 200);
		await post.save();

		res.json({
			message: 'Post improved successfully',
			post,
		});
	} catch (error) {
		console.error('Improve post error:', error);
		res.status(500).json({ error: 'Failed to improve post' });
	}
};

const getPostStats = async (req, res) => {
	try {
		const userId = req.user.id;

		const stats = await BlogPost.aggregate([
			{ $match: { userId: mongoose.Types.ObjectId(userId) } },
			{
				$group: {
					_id: null,
					totalPosts: { $sum: 1 },
					completedPosts: {
						$sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
					},
					totalWords: { $sum: '$wordCount' },
					totalReadingTime: { $sum: '$readingTime' },
					publishedPosts: {
						$sum: { $cond: ['$isPublished', 1, 0] },
					},
				},
			},
		]);

		const tagStats = await BlogPost.aggregate([
			{ $match: { userId: mongoose.Types.ObjectId(userId), status: 'completed' } },
			{ $unwind: '$generatedContent.tags' },
			{
				$group: {
					_id: '$generatedContent.tags',
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);

		res.json({
			stats: stats[0] || {
				totalPosts: 0,
				completedPosts: 0,
				totalWords: 0,
				totalReadingTime: 0,
				publishedPosts: 0,
			},
			topTags: tagStats.map((tag) => ({ tag: tag._id, count: tag.count })),
		});
	} catch (error) {
		console.error('Get post stats error:', error);
		res.status(500).json({ error: 'Failed to fetch post statistics' });
	}
};

module.exports = {
	getPosts,
	getPost,
	updatePost,
	deletePost,
	exportPost,
	improvePost,
	getPostStats,
};
