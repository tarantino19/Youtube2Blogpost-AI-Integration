const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
	genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const generateBlogPost = async (transcript, videoTitle, videoDescription, additionalContext = {}) => {
	// Check if Gemini is configured
	if (!genAI) {
		throw new Error('Gemini API key not configured. Please add your GEMINI_API_KEY to the .env file.');
	}

	const { comments = [], tags = [], language = 'en' } = additionalContext;

	const prompt = `You are a professional content writer who creates engaging, SEO-optimized blog posts from video transcripts. 

Convert the following YouTube video transcript into a well-structured, engaging blog post.

Video Title: ${videoTitle}
Video Description: ${videoDescription}
${tags.length > 0 ? `Video Tags: ${tags.join(', ')}` : ''}
${
	comments.length > 0
		? `\nTop Comments for context:\n${comments
				.slice(0, 3)
				.map((c) => `- "${c.text}"`)
				.join('\n')}`
		: ''
}

Transcript: ${transcript}

Please create a blog post with:
1. An engaging, SEO-friendly title (different from the video title)
2. A compelling introduction that hooks the reader
3. Well-organized sections with clear H2 and H3 headings
4. Key takeaways or summary points
5. A conclusion with a call-to-action
6. 5-7 relevant tags for the blog post
7. A meta description (150-160 characters) for SEO

Important guidelines:
- Make the content scannable with short paragraphs
- Use bullet points or numbered lists where appropriate
- Include relevant quotes from the transcript
- Maintain a conversational yet professional tone
- Ensure the content is valuable even without watching the video

Format the response as JSON with the following structure:
{
  "title": "Blog post title",
  "content": "Full blog post content in markdown format",
  "summary": "Brief 2-3 sentence summary",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content"
    }
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "metaDescription": "Meta description for SEO",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"]
}`;

	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const content = response.text();

		// Try to parse as JSON
		try {
			const parsedContent = JSON.parse(content);

			// Validate the response structure
			if (!parsedContent.title || !parsedContent.content) {
				throw new Error('Invalid response structure from AI');
			}

			return parsedContent;
		} catch (parseError) {
			// If JSON parsing fails, create a structured response
			console.log('Failed to parse JSON, creating structured response...');
			return {
				title: videoTitle + ' - Blog Post',
				content: content,
				summary: 'This blog post is based on the YouTube video "' + videoTitle + '"',
				sections: [],
				tags: ['youtube', 'video', 'blog', 'content', 'tutorial'],
				metaDescription: `Read about ${videoTitle} in this comprehensive blog post.`,
				keyTakeaways: [],
			};
		}
	} catch (error) {
		console.error('Gemini Generation Error:', error);
		throw new Error(`AI generation failed: ${error.message}`);
	}
};

const improveContent = async (content, instructions) => {
	if (!genAI) {
		throw new Error('Gemini API key not configured');
	}

	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const prompt = `You are a professional editor who improves blog post content while maintaining the original message and structure.

Improve the following blog post based on these instructions: ${instructions}

Content to improve:
${content}

Return the improved content in the same format.`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		throw new Error(`Content improvement failed: ${error.message}`);
	}
};

const generateSummary = async (content, maxLength = 200) => {
	if (!genAI) {
		throw new Error('Gemini API key not configured');
	}

	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const prompt = `Summarize this blog post in ${maxLength} characters or less:\n\n${content}`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text().trim();
	} catch (error) {
		throw new Error(`Summary generation failed: ${error.message}`);
	}
};

const extractKeywords = async (content) => {
	if (!genAI) {
		throw new Error('Gemini API key not configured');
	}

	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const prompt = `Extract 10-15 relevant keywords from this blog post for SEO. Return as a JSON array of strings:\n\n${content}`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const keywords = response.text();

		try {
			return JSON.parse(keywords);
		} catch (parseError) {
			console.error('Keyword extraction parse error:', parseError);
			return [];
		}
	} catch (error) {
		console.error('Keyword extraction error:', error);
		return [];
	}
};

const generateTableOfContents = (sections) => {
	if (!sections || sections.length === 0) return '';

	let toc = '## Table of Contents\n\n';
	sections.forEach((section, index) => {
		const anchor = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		toc += `${index + 1}. [${section.heading}](#${anchor})\n`;
	});

	return toc + '\n';
};

module.exports = {
	generateBlogPost,
	improveContent,
	generateSummary,
	extractKeywords,
	generateTableOfContents,
};
