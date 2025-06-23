const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const BlogPost = require('../src/models/BlogPost');

const fixBlogContent = async (specificPostId = null) => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('✅ Connected to MongoDB');

		// Find posts - either specific post or all posts
		let posts;
		if (specificPostId) {
			const post = await BlogPost.findById(specificPostId);
			posts = post ? [post] : [];
			console.log(`📊 Processing specific post: ${specificPostId}`);
		} else {
			posts = await BlogPost.find({});
			console.log(`📊 Found ${posts.length} blog posts to check`);
		}

		let fixedCount = 0;

		for (const post of posts) {
			let needsUpdate = false;
			let updatedContent = { ...post.generatedContent };

			// Check if content needs fixing
			if (post.generatedContent?.content && typeof post.generatedContent.content === 'string') {
				const content = post.generatedContent.content;

				// Check if content is wrapped in markdown code blocks
				if (content.trim().startsWith('```')) {
					try {
						console.log(`🔧 Fixing code block wrapped content for post ${post._id}: ${post.videoTitle}`);

						// Extract JSON from code block
						let jsonString = content;

						// Remove the leading ```json or ```
						if (content.trim().startsWith('```json')) {
							jsonString = content.replace(/^```json\s*/, '');
						} else if (content.trim().startsWith('```')) {
							jsonString = content.replace(/^```[a-z]*\s*/, '');
						}

						// Remove the trailing ``` and any whitespace
						if (jsonString.trim().endsWith('```')) {
							jsonString = jsonString.replace(/\s*```\s*$/, '');
						}

						// Find the JSON object bounds to handle any trailing content
						const trimmed = jsonString.trim();
						let bracketCount = 0;
						let jsonEnd = -1;
						for (let i = 0; i < trimmed.length; i++) {
							if (trimmed[i] === '{') bracketCount++;
							if (trimmed[i] === '}') {
								bracketCount--;
								if (bracketCount === 0) {
									jsonEnd = i;
									break;
								}
							}
						}

						if (jsonEnd > 0) {
							jsonString = trimmed.substring(0, jsonEnd + 1);
						} else {
							jsonString = trimmed;
						}

						// Parse the JSON
						const parsed = JSON.parse(jsonString);

						if (parsed.content && typeof parsed.content === 'string') {
							updatedContent.content = parsed.content;
							needsUpdate = true;
							console.log(`   ✅ Extracted content from code block wrapper`);
						}

						// Also update other fields from the parsed JSON
						if (parsed.title && !updatedContent.title) {
							updatedContent.title = parsed.title;
						}
						if (parsed.summary && !updatedContent.summary) {
							updatedContent.summary = parsed.summary;
						}
						if (parsed.tags && Array.isArray(parsed.tags)) {
							updatedContent.tags = parsed.tags;
						}
						if (parsed.sections && Array.isArray(parsed.sections)) {
							updatedContent.sections = parsed.sections;
						}
						if (parsed.keyTakeaways && Array.isArray(parsed.keyTakeaways)) {
							updatedContent.keyTakeaways = parsed.keyTakeaways;
						}
						if (parsed.metaDescription) {
							updatedContent.metaDescription = parsed.metaDescription;
						}
					} catch (error) {
						console.log(`   ❌ Failed to parse code block content for post ${post._id}: ${error.message}`);
						console.log(`   🔍 Content preview:`, content.substring(0, 200));
					}
				}
				// Check if it's a regular JSON string
				else if (content.trim().startsWith('{') && (content.includes('"title"') || content.includes('"content"'))) {
					try {
						const parsed = JSON.parse(content);
						console.log(`🔧 Fixing JSON string for post ${post._id}: ${post.videoTitle}`);

						if (parsed.content && typeof parsed.content === 'string') {
							updatedContent.content = parsed.content;
							needsUpdate = true;
							console.log(`   ✅ Extracted content from JSON structure`);
						}

						// Update other fields
						if (parsed.title && !updatedContent.title) {
							updatedContent.title = parsed.title;
						}
						if (parsed.summary && !updatedContent.summary) {
							updatedContent.summary = parsed.summary;
						}
						if (parsed.tags && Array.isArray(parsed.tags)) {
							updatedContent.tags = parsed.tags;
						}
						if (parsed.sections && Array.isArray(parsed.sections)) {
							updatedContent.sections = parsed.sections;
						}
						if (parsed.keyTakeaways && Array.isArray(parsed.keyTakeaways)) {
							updatedContent.keyTakeaways = parsed.keyTakeaways;
						}
						if (parsed.metaDescription) {
							updatedContent.metaDescription = parsed.metaDescription;
						}
					} catch (error) {
						console.log(`   ❌ Failed to parse JSON for post ${post._id}: ${error.message}`);
					}
				}
				// Check for escaped JSON (double stringified)
				else if (content.includes('\\"title\\"') && content.includes('\\"content\\"')) {
					try {
						const unescaped = content.replace(/\\"/g, '"').replace(/\\n/g, '\n');
						const parsed = JSON.parse(unescaped);
						console.log(`🔧 Fixing escaped JSON for post ${post._id}: ${post.videoTitle}`);

						if (parsed.content && typeof parsed.content === 'string') {
							updatedContent.content = parsed.content;
							needsUpdate = true;
							console.log(`   ✅ Extracted content from escaped JSON`);
						}
					} catch (error) {
						console.log(`   ❌ Failed to parse escaped JSON for post ${post._id}: ${error.message}`);
					}
				}
			}

			// Update the post if needed
			if (needsUpdate) {
				await BlogPost.findByIdAndUpdate(post._id, {
					generatedContent: updatedContent,
				});
				fixedCount++;
				console.log(`   💾 Updated post ${post._id}`);
			}
		}

		console.log(`🎉 Fixed ${fixedCount} blog posts`);
		console.log(`✅ Script completed successfully`);
	} catch (error) {
		console.error('❌ Error fixing blog content:', error);
	} finally {
		await mongoose.disconnect();
		console.log('🔌 Disconnected from MongoDB');
	}
};

// Run the script
if (require.main === module) {
	// Check for command line arguments
	const args = process.argv.slice(2);
	const postIdArg = args.find((arg) => arg.startsWith('--postId='));
	const specificPostId = postIdArg ? postIdArg.split('=')[1] : null;

	fixBlogContent(specificPostId);
}

module.exports = fixBlogContent;
