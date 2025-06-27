#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
const aiService = require('../src/services/unifiedAIService');

async function testSimple() {
	console.log('🔧 Testing AI Service Fix...\n');

	// Get available models
	const models = aiService.getAvailableModels();
	console.log(`📋 Available models: ${models.length}`);

	if (models.length === 0) {
		console.log('❌ No models available. Please configure API keys.');
		return;
	}

	// Test with the first available model
	const testModel = models[0];
	console.log(`🧪 Testing with: ${testModel.name} (${testModel.id})\n`);

	const testTranscript =
		"Hello everyone, today we're going to talk about artificial intelligence and how it's changing our world.";
	const testTitle = 'AI Revolution';
	const testDescription = 'A discussion about AI';

	try {
		console.log('🚀 Generating blog post...');
		const result = await aiService.generateBlogPost(testTranscript, testTitle, testDescription, {}, testModel.id);

		console.log('✅ Success!');
		console.log(`📝 Title: ${result.title}`);
		console.log(`📄 Content length: ${result.content.length} chars`);
		console.log(`🏷️ Tags: ${result.tags.join(', ')}`);
		console.log(`📊 Sections: ${result.sections.length}`);

		// Test keyword extraction
		console.log('\n🔍 Testing keyword extraction...');
		const keywords = await aiService.extractKeywords(result.content, testModel.id);
		console.log(`✅ Keywords extracted: ${keywords.length} keywords`);
		console.log(`🏷️ Keywords: ${keywords.slice(0, 5).join(', ')}...`);

		console.log('\n🎉 All tests passed!');
	} catch (error) {
		console.error('❌ Test failed:', error.message);
		console.error('Full error:', error);
	}
}

testSimple();
