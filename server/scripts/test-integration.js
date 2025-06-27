#!/usr/bin/env node

const aiService = require('../src/services/unifiedAIService');

console.log('Testing Vercel AI SDK Integration...\n');

// Test 1: Check available models
console.log('1. Checking available models:');
const availableModels = aiService.getAvailableModels();
console.log(`   Found ${availableModels.length} available models`);

if (availableModels.length === 0) {
	console.log('   ⚠️  No models available. This is expected if no API keys are configured.');
	console.log('   To enable models, add API keys to your .env file.\n');
} else {
	console.log('   ✅ Models are available:');
	availableModels.forEach((model) => {
		console.log(`      - ${model.name} (${model.id})`);
	});
	console.log('');
}

// Test 2: Check model configurations
console.log('2. Checking model configurations:');
const modelCount = Object.keys(aiService.MODELS).length;
console.log(`   ✅ ${modelCount} models configured in the system\n`);

// Test 3: List all supported providers
console.log('3. Supported AI Providers:');
const providers = new Set(Object.values(aiService.MODELS).map((m) => m.provider));
providers.forEach((provider) => {
	console.log(`   - ${provider}`);
});

console.log('\n✅ Integration test complete!');
console.log('\nTo test with actual API calls, configure your API keys and run:');
console.log('   node scripts/test-ai-providers.js');
