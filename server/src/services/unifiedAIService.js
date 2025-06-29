const { generateText, generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { anthropic } = require('@ai-sdk/anthropic');
const { google } = require('@ai-sdk/google');
const { createAmazonBedrock } = require('@ai-sdk/amazon-bedrock');
const { mistral } = require('@ai-sdk/mistral');
const { cohere } = require('@ai-sdk/cohere');
const { groq } = require('@ai-sdk/groq');
const { xai } = require('@ai-sdk/xai');
const { z } = require('zod');

// Schema for the blog post generation output
const blogPostSchema = z.object({
	title: z.string().describe('An engaging, SEO-friendly blog post title'),
	content: z.string().describe('Full blog post content in markdown format'),
	summary: z.string().describe('A brief 2-3 sentence summary of the blog post'),
	sections: z
		.array(
			z.object({
				heading: z.string(),
				content: z.string(),
			})
		)
		.describe('Main sections of the blog post'),
	tags: z.array(z.string()).length(5, 7).describe('5-7 relevant tags for the blog post'),
	metaDescription: z.string().max(160).describe('Meta description for SEO (150-160 characters)'),
	keyTakeaways: z.array(z.string()).describe('Key takeaways from the content'),
});

// Model configurations with their providers and capabilities
const MODELS = {
	// OpenAI Models
	'gpt-4o': { provider: 'openai', model: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
	'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 128000 },
	'gpt-4-turbo': { provider: 'openai', model: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
	'gpt-3.5-turbo': { provider: 'openai', model: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 16384 },

	// Anthropic Models
	'claude-3-opus': { provider: 'anthropic', model: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 200000 },
	'claude-3-sonnet': {
		provider: 'anthropic',
		model: 'claude-3-5-sonnet-20241022',
		name: 'Claude 3.5 Sonnet',
		maxTokens: 200000,
	},
	'claude-3-haiku': {
		provider: 'anthropic',
		model: 'claude-3-haiku-20240307',
		name: 'Claude 3 Haiku',
		maxTokens: 200000,
	},

	// Google Models
	'gemini-1.5-pro': { provider: 'google', model: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', maxTokens: 1048576 },
	'gemini-1.5-flash': {
		provider: 'google',
		model: 'gemini-1.5-flash-latest',
		name: 'Gemini 1.5 Flash',
		maxTokens: 1048576,
	},
	'gemini-pro': { provider: 'google', model: 'gemini-pro', name: 'Gemini Pro', maxTokens: 32768 },

	// xAI Models
	'grok-3-beta': { provider: 'xai', model: 'grok-3-beta', name: 'Grok 3 Beta', maxTokens: 65536 },
	'grok-2': { provider: 'xai', model: 'grok-2', name: 'Grok 2', maxTokens: 32768 },

	// Groq Models
	'llama-3.1-405b': { provider: 'groq', model: 'llama-3.1-405b-reasoning', name: 'Llama 3.1 405B', maxTokens: 131072 },
	'llama-3.1-70b': { provider: 'groq', model: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', maxTokens: 131072 },
	'mixtral-8x7b': { provider: 'groq', model: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', maxTokens: 32768 },

	// Mistral Models
	'mistral-large': { provider: 'mistral', model: 'mistral-large-latest', name: 'Mistral Large', maxTokens: 128000 },
	'mistral-medium': { provider: 'mistral', model: 'mistral-medium-latest', name: 'Mistral Medium', maxTokens: 32768 },
	'mistral-small': { provider: 'mistral', model: 'mistral-small-latest', name: 'Mistral Small', maxTokens: 32768 },

	// Cohere Models
	'command-r-plus': { provider: 'cohere', model: 'command-r-plus', name: 'Command R+', maxTokens: 128000 },
	'command-r': { provider: 'cohere', model: 'command-r', name: 'Command R', maxTokens: 128000 },
};

// Initialize providers based on available API keys
const providers = {};

// Initialize each provider if API key is available
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
	providers.openai = openai;
}

if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here') {
	providers.anthropic = anthropic;
}

if (
	process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
	process.env.GOOGLE_API_KEY ||
	(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here')
) {
	// Set the Google API key for the SDK to use
	const googleApiKey =
		process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = googleApiKey;
	providers.google = google;
}

if (process.env.XAI_API_KEY && process.env.XAI_API_KEY !== 'your-xai-api-key-here') {
	providers.xai = xai;
}

if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
	providers.groq = groq;
}

if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== 'your-mistral-api-key-here') {
	providers.mistral = mistral;
}

if (process.env.COHERE_API_KEY && process.env.COHERE_API_KEY !== 'your-cohere-api-key-here') {
	providers.cohere = cohere;
}

// AWS Bedrock requires more configuration
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
	providers.bedrock = createAmazonBedrock({
		region: process.env.AWS_REGION,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	});
}

// Get available models based on configured providers
const getAvailableModels = () => {
	const availableModels = [];

	for (const [modelId, config] of Object.entries(MODELS)) {
		if (providers[config.provider]) {
			availableModels.push({
				id: modelId,
				...config,
			});
		}
	}

	return availableModels;
};

// Get the model instance
const getModel = (modelId = 'gemini-1.5-flash') => {
	const modelConfig = MODELS[modelId];

	if (!modelConfig) {
		throw new Error(`Model ${modelId} not found`);
	}

	const provider = providers[modelConfig.provider];

	if (!provider) {
		throw new Error(`Provider ${modelConfig.provider} not configured. Please add the API key to your environment.`);
	}

	// Return the model instance based on provider
	if (modelConfig.provider === 'openai') {
		return provider(modelConfig.model);
	} else if (modelConfig.provider === 'anthropic') {
		return provider(modelConfig.model);
	} else if (modelConfig.provider === 'google') {
		// Google provider uses environment variable
		return provider(modelConfig.model);
	} else if (modelConfig.provider === 'xai') {
		return provider(modelConfig.model);
	} else if (modelConfig.provider === 'groq') {
		return provider(modelConfig.model);
	} else if (modelConfig.provider === 'mistral') {
		return provider(modelConfig.model);
	} else if (modelConfig.provider === 'cohere') {
		return provider(modelConfig.model);
	} else if (modelConfig.provider === 'bedrock') {
		return provider(modelConfig.model);
	}

	throw new Error(`Provider ${modelConfig.provider} not implemented`);
};

const generateBlogPost = async (
	transcript,
	videoTitle,
	videoDescription,
	additionalContext = {},
	modelId = 'gemini-1.5-flash'
) => {
	const { comments = [], tags = [], language = 'en' } = additionalContext;

	const systemPrompt = `You are a professional content writer who creates comprehensive, detailed, and engaging blog posts from video transcripts. 
Your writing should be thorough, informative, and maintain the original video's key messages while significantly expanding on them with detailed explanations, examples, and insights.
Always structure content with proper headings, paragraphs, and formatting to create substantial, in-depth articles.
Use markdown formatting for the content field - including proper headers (##, ###), bold text (**text**), bullet points, numbered lists, and links where appropriate.
Aim for comprehensive coverage of the topic with detailed explanations and practical insights.`;

	const userPrompt = `Convert the following YouTube video transcript into a comprehensive, detailed, and well-structured blog post that thoroughly covers the topic.

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

Please create a comprehensive blog post with:
1. An engaging, SEO-friendly title (different from the video title)
2. A compelling introduction that hooks the reader and provides context
3. Well-organized sections with clear H2 and H3 headings that dive deep into each topic
4. Detailed explanations with examples, practical applications, and actionable insights
5. Multiple subsections within each main section to thoroughly cover the topic
6. Key takeaways or summary points with detailed explanations
7. A comprehensive conclusion with actionable next steps and call-to-action
8. 5-7 relevant tags for the blog post
9. A meta description (150-160 characters) for SEO

Important guidelines for detailed content:
- Create substantial paragraphs (5-7 sentences) with detailed explanations
- Expand on concepts mentioned in the transcript with additional context and examples
- Use bullet points and numbered lists for complex information
- Include relevant quotes from the transcript using blockquotes (> quote)
- Add practical tips, best practices, and real-world applications
- Maintain a conversational yet professional tone throughout
- Ensure the content is comprehensive and valuable even without watching the video
- Aim for thorough coverage of the topic with multiple angles and perspectives
- Use proper markdown formatting with clear section breaks
- Include detailed step-by-step processes where applicable
- Add context and background information to make concepts accessible
- Create content that serves as a complete resource on the topic`;

	try {
		const model = getModel(modelId);

		// First try with structured output
		try {
			const { object } = await generateObject({
				model,
				schema: blogPostSchema,
				system: systemPrompt,
				prompt: userPrompt,
				temperature: 0.7,
				maxTokens: 8000,
			});

			return object;
		} catch (structuredError) {
			console.log(`Structured output failed for ${modelId}, trying text generation...`);

			// Fallback to text generation with JSON parsing
			const { text } = await generateText({
				model,
				system: systemPrompt,
				prompt:
					userPrompt +
					'\n\nIMPORTANT: Return your response as a valid JSON object with the following structure:\n{\n  "title": "Blog post title",\n  "content": "Full blog post content in markdown format",\n  "summary": "Brief summary",\n  "sections": [{"heading": "Section heading", "content": "Section content"}],\n  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],\n  "metaDescription": "Meta description (max 160 chars)",\n  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"]\n}',
				temperature: 0.7,
				maxTokens: 8000,
			});

			// Try to parse the JSON response
			try {
				let jsonText = text.trim();

				// Remove markdown code blocks if present
				if (jsonText.startsWith('```json')) {
					jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
				} else if (jsonText.startsWith('```')) {
					jsonText = jsonText.replace(/^```[a-z]*\s*/, '').replace(/\s*```$/, '');
				}

				const parsed = JSON.parse(jsonText);

				// Validate the parsed object has required fields
				if (!parsed.title || !parsed.content) {
					throw new Error('Missing required fields in response');
				}

				// Ensure all required fields exist with defaults
				return {
					title: parsed.title,
					content: parsed.content,
					summary: parsed.summary || 'Generated from video transcript',
					sections: parsed.sections || [],
					tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 7) : ['video', 'transcript', 'blog'],
					metaDescription: (parsed.metaDescription || parsed.title).substring(0, 160),
					keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
				};
			} catch (parseError) {
				console.error('JSON parsing failed:', parseError.message);

				// Create a basic structure from the text response
				return {
					title: videoTitle + ' - Blog Post',
					content: text,
					summary: 'This blog post is based on the YouTube video "' + videoTitle + '"',
					sections: [],
					tags: ['youtube', 'video', 'blog', 'content', 'tutorial'],
					metaDescription: `Read about ${videoTitle} in this comprehensive blog post.`.substring(0, 160),
					keyTakeaways: [],
				};
			}
		}
	} catch (error) {
		console.error('AI Generation Error:', error);

		// If the selected model fails, try fallback models
		const fallbackModels = ['gemini-1.5-flash', 'gpt-3.5-turbo', 'claude-3-haiku'];

		for (const fallbackModelId of fallbackModels) {
			if (fallbackModelId !== modelId && MODELS[fallbackModelId] && providers[MODELS[fallbackModelId].provider]) {
				try {
					console.log(`Trying fallback model: ${fallbackModelId}`);
					return await generateBlogPost(transcript, videoTitle, videoDescription, additionalContext, fallbackModelId);
				} catch (fallbackError) {
					console.error(`Fallback model ${fallbackModelId} failed:`, fallbackError.message);
				}
			}
		}

		throw new Error(`AI generation failed: ${error.message}`);
	}
};

const improveContent = async (content, instructions, modelId = 'gemini-1.5-flash') => {
	try {
		const model = getModel(modelId);

		const { text } = await generateText({
			model,
			system:
				'You are a professional editor who improves blog post content while maintaining the original message and structure.',
			prompt: `Improve the following blog post based on these instructions: ${instructions}

Content to improve:
${content}

Return the improved content in the same format.`,
			temperature: 0.7,
			maxTokens: 3000,
		});

		return text;
	} catch (error) {
		throw new Error(`Content improvement failed: ${error.message}`);
	}
};

const generateSummary = async (content, maxLength = 200, modelId = 'gemini-1.5-flash') => {
	try {
		const model = getModel(modelId);

		const { text } = await generateText({
			model,
			prompt: `Summarize this blog post in ${maxLength} characters or less:\n\n${content}`,
			temperature: 0.5,
			maxTokens: 100,
		});

		return text.trim();
	} catch (error) {
		throw new Error(`Summary generation failed: ${error.message}`);
	}
};

const extractKeywords = async (content, modelId = 'gemini-1.5-flash') => {
	try {
		const model = getModel(modelId);

		try {
			const { object } = await generateObject({
				model,
				schema: z.object({
					keywords: z.array(z.string()).length(10, 15).describe('10-15 relevant keywords for SEO'),
				}),
				prompt: `Extract 10-15 relevant keywords from this blog post for SEO:\n\n${content}`,
				temperature: 0.3,
				maxTokens: 200,
			});

			return object.keywords;
		} catch (structuredError) {
			// Fallback to text generation
			const { text } = await generateText({
				model,
				prompt: `Extract 10-15 relevant keywords from this blog post for SEO. Return as a JSON array of strings:\n\n${content}`,
				temperature: 0.3,
				maxTokens: 200,
			});

			try {
				let jsonText = text.trim();
				if (jsonText.startsWith('```json')) {
					jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
				} else if (jsonText.startsWith('```')) {
					jsonText = jsonText.replace(/^```[a-z]*\s*/, '').replace(/\s*```$/, '');
				}

				const keywords = JSON.parse(jsonText);
				return Array.isArray(keywords) ? keywords.slice(0, 15) : [];
			} catch (parseError) {
				console.error('Keyword parsing failed:', parseError.message);
				return [];
			}
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
	getAvailableModels,
	MODELS,
};
