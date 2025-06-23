const OpenAI = require('openai');

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
	openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});
}

const generateBlogPost = async (transcript, videoTitle, videoDescription, additionalContext = {}) => {
	// Check if OpenAI is configured
	if (!openai) {
		throw new Error('OpenAI API key not configured. Please add your OPENAI_API_KEY to the .env file.');
	}

	const { comments = [], tags = [], language = 'en' } = additionalContext;

	const systemPrompt = `You are a professional content writer who creates engaging, SEO-optimized blog posts from video transcripts. 
Your writing should be clear, informative, and maintain the original video's key messages while improving readability.
Always structure content with proper headings, paragraphs, and formatting.
Use markdown formatting for the content field - including proper headers (##, ###), bold text (**text**), bullet points, and links where appropriate.`;

	const userPrompt = `Convert the following YouTube video transcript into a well-structured, engaging blog post.

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
- Make the content scannable with short paragraphs (3-4 sentences max)
- Use bullet points or numbered lists where appropriate
- Include relevant quotes from the transcript using blockquotes (> quote)
- Maintain a conversational yet professional tone
- Ensure the content is valuable even without watching the video
- Use proper markdown formatting:
  - ## for main sections
  - ### for subsections
  - **bold** for emphasis
  - - or * for bullet points
  - 1. 2. 3. for numbered lists
- Write in a flowing, natural style - NOT as JSON or technical output

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
		const response = await openai.chat.completions.create({
			model: 'gpt-4-turbo-preview',
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: userPrompt,
				},
			],
			temperature: 0.7,
			max_tokens: 4000,
			response_format: { type: 'json_object' },
		});

		const content = response.choices[0].message.content;
		const parsedContent = JSON.parse(content);

		// Validate the response structure
		if (!parsedContent.title || !parsedContent.content) {
			throw new Error('Invalid response structure from AI');
		}

		return parsedContent;
	} catch (error) {
		console.error('AI Generation Error:', error);

		// Fallback to a simpler model if GPT-4 fails
		if (error.message.includes('model') || error.message.includes('rate')) {
			return await generateBlogPostFallback(transcript, videoTitle, videoDescription);
		}

		throw new Error(`AI generation failed: ${error.message}`);
	}
};

// Fallback function using GPT-3.5
const generateBlogPostFallback = async (transcript, videoTitle, videoDescription) => {
	if (!openai) {
		throw new Error('OpenAI API key not configured');
	}

	try {
		const prompt = `Convert this YouTube video into a blog post.

Title: ${videoTitle}
Description: ${videoDescription}
Transcript: ${transcript.substring(0, 3000)}...

Create a blog post with:
1. New title
2. Introduction
3. Main content with headings
4. Conclusion
5. 5 tags
6. Meta description (150 chars)

Format as JSON with: title, content, summary, tags[], metaDescription`;

		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'user',
					content: prompt,
				},
			],
			temperature: 0.7,
			max_tokens: 2000,
		});

		const content = response.choices[0].message.content;

		// Try to parse as JSON, if fails, create a structured response
		try {
			return JSON.parse(content);
		} catch {
			// Create a basic structure from the response
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
		throw new Error(`Fallback AI generation failed: ${error.message}`);
	}
};

const improveContent = async (content, instructions) => {
	if (!openai) {
		throw new Error('OpenAI API key not configured');
	}

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4-turbo-preview',
			messages: [
				{
					role: 'system',
					content:
						'You are a professional editor who improves blog post content while maintaining the original message and structure.',
				},
				{
					role: 'user',
					content: `Improve the following blog post based on these instructions: ${instructions}

Content to improve:
${content}

Return the improved content in the same format.`,
				},
			],
			temperature: 0.7,
			max_tokens: 3000,
		});

		return response.choices[0].message.content;
	} catch (error) {
		throw new Error(`Content improvement failed: ${error.message}`);
	}
};

const generateSummary = async (content, maxLength = 200) => {
	if (!openai) {
		throw new Error('OpenAI API key not configured');
	}

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'user',
					content: `Summarize this blog post in ${maxLength} characters or less:\n\n${content}`,
				},
			],
			temperature: 0.5,
			max_tokens: 100,
		});

		return response.choices[0].message.content.trim();
	} catch (error) {
		throw new Error(`Summary generation failed: ${error.message}`);
	}
};

const extractKeywords = async (content) => {
	if (!openai) {
		throw new Error('OpenAI API key not configured');
	}

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'user',
					content: `Extract 10-15 relevant keywords from this blog post for SEO. Return as a JSON array of strings:\n\n${content}`,
				},
			],
			temperature: 0.3,
			max_tokens: 200,
		});

		const keywords = response.choices[0].message.content;
		return JSON.parse(keywords);
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
