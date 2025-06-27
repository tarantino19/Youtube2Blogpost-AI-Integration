#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
const aiService = require('../src/services/unifiedAIService');

// Test data
const testTranscript = `Hello everyone, welcome to today's video about artificial intelligence and the future of technology. 
Today we'll explore how AI is transforming various industries and what this means for our daily lives. 
We'll look at machine learning, natural language processing, and the ethical considerations of AI development.`;

const testVideoTitle = 'AI and the Future: A Comprehensive Guide';
const testVideoDescription =
	'In this video, we explore the current state of artificial intelligence and its future implications.';

const testContext = {
	comments: [
		{ text: 'Great explanation of AI concepts!' },
		{ text: 'This really helped me understand machine learning better.' },
	],
	tags: ['AI', 'technology', 'future', 'machine learning'],
	language: 'en',
};

// Colors for console output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
};

async function testModel(modelId, modelInfo) {
	console.log(`\n${colors.cyan}Testing ${modelInfo.name} (${modelId})...${colors.reset}`);

	const startTime = Date.now();

	try {
		// Test blog post generation
		console.log(`${colors.yellow}Generating blog post...${colors.reset}`);
		const blogPost = await aiService.generateBlogPost(
			testTranscript,
			testVideoTitle,
			testVideoDescription,
			testContext,
			modelId
		);

		const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);

		console.log(`${colors.green}✓ Blog post generated successfully in ${generationTime}s${colors.reset}`);
		console.log(`  Title: ${blogPost.title}`);
		console.log(`  Content length: ${blogPost.content.length} characters`);
		console.log(`  Tags: ${blogPost.tags.join(', ')}`);
		console.log(`  Sections: ${blogPost.sections.length}`);

		// Test keyword extraction
		console.log(`${colors.yellow}Extracting keywords...${colors.reset}`);
		const keywords = await aiService.extractKeywords(blogPost.content, modelId);
		console.log(`${colors.green}✓ Keywords extracted: ${keywords.length} keywords${colors.reset}`);
		console.log(`  Keywords: ${keywords.slice(0, 5).join(', ')}...`);

		// Test summary generation
		console.log(`${colors.yellow}Generating summary...${colors.reset}`);
		const summary = await aiService.generateSummary(blogPost.content, 150, modelId);
		console.log(`${colors.green}✓ Summary generated: ${summary.length} characters${colors.reset}`);

		const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log(
			`${colors.bright}${colors.green}✓ All tests passed for ${modelInfo.name} (Total time: ${totalTime}s)${colors.reset}`
		);

		return { success: true, model: modelId, time: totalTime };
	} catch (error) {
		console.log(`${colors.red}✗ Test failed for ${modelInfo.name}: ${error.message}${colors.reset}`);
		return { success: false, model: modelId, error: error.message };
	}
}

async function runTests() {
	console.log(`${colors.bright}${colors.blue}=== Vercel AI SDK Provider Tests ===${colors.reset}`);
	console.log(`${colors.blue}Testing AI providers with mock data...${colors.reset}\n`);

	// Get available models
	const availableModels = aiService.getAvailableModels();
	console.log(`${colors.green}Found ${availableModels.length} available models:${colors.reset}`);

	// Group models by provider
	const modelsByProvider = {};
	availableModels.forEach((model) => {
		if (!modelsByProvider[model.provider]) {
			modelsByProvider[model.provider] = [];
		}
		modelsByProvider[model.provider].push(model);
	});

	// Display available models by provider
	Object.entries(modelsByProvider).forEach(([provider, models]) => {
		console.log(`\n${colors.bright}${provider.toUpperCase()}:${colors.reset}`);
		models.forEach((model) => {
			console.log(`  - ${model.id} (${model.name})`);
		});
	});

	if (availableModels.length === 0) {
		console.log(`\n${colors.red}No AI providers configured!${colors.reset}`);
		console.log('Please add API keys to your .env file for the providers you want to test.');
		console.log('\nSupported providers:');
		console.log('  - OpenAI: OPENAI_API_KEY');
		console.log('  - Anthropic: ANTHROPIC_API_KEY');
		console.log('  - Google: GOOGLE_API_KEY or GEMINI_API_KEY');
		console.log('  - xAI: XAI_API_KEY');
		console.log('  - Groq: GROQ_API_KEY');
		console.log('  - Mistral: MISTRAL_API_KEY');
		console.log('  - Cohere: COHERE_API_KEY');
		return;
	}

	// Test each provider with one model
	console.log(`\n${colors.bright}Running tests...${colors.reset}`);
	const results = [];
	const testedProviders = new Set();

	for (const model of availableModels) {
		// Test only one model per provider to save API calls
		if (testedProviders.has(model.provider)) {
			continue;
		}
		testedProviders.add(model.provider);

		const result = await testModel(model.id, model);
		results.push(result);

		// Add a small delay between tests to avoid rate limits
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	// Summary
	console.log(`\n${colors.bright}${colors.blue}=== Test Summary ===${colors.reset}`);
	const successful = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success).length;

	console.log(`${colors.green}Successful: ${successful}${colors.reset}`);
	console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

	if (failed > 0) {
		console.log(`\n${colors.red}Failed tests:${colors.reset}`);
		results
			.filter((r) => !r.success)
			.forEach((r) => {
				console.log(`  - ${r.model}: ${r.error}`);
			});
	}

	// Performance comparison
	const successfulResults = results.filter((r) => r.success);
	if (successfulResults.length > 0) {
		console.log(`\n${colors.cyan}Performance comparison:${colors.reset}`);
		successfulResults.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
		successfulResults.forEach((r, index) => {
			const model = availableModels.find((m) => m.id === r.model);
			console.log(`  ${index + 1}. ${model.name} (${r.model}): ${r.time}s`);
		});
	}
}

// Run tests if this script is executed directly
if (require.main === module) {
	runTests().catch((error) => {
		console.error(`${colors.red}Test runner error:${colors.reset}`, error);
		process.exit(1);
	});
}

module.exports = { testModel, runTests };
