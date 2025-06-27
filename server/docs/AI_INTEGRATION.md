# AI Integration with Vercel AI SDK

This application now uses the [Vercel AI SDK](https://sdk.vercel.ai/) to provide unified access to multiple AI providers for generating blog posts from YouTube videos.

## Supported AI Providers

The application supports the following AI providers and models:

### OpenAI

- **GPT-4o** - Latest multimodal model (128k tokens)
- **GPT-4o Mini** - Cost-effective version (128k tokens)
- **GPT-4 Turbo** - High performance model (128k tokens)
- **GPT-3.5 Turbo** - Fast and affordable (16k tokens)

### Anthropic

- **Claude 3 Opus** - Most capable Claude model (200k tokens)
- **Claude 3.5 Sonnet** - Balanced performance (200k tokens)
- **Claude 3 Haiku** - Fast and efficient (200k tokens)

### Google

- **Gemini 1.5 Pro** - Advanced reasoning (1M tokens)
- **Gemini 1.5 Flash** - Fast and efficient (1M tokens)
- **Gemini Pro** - Balanced performance (32k tokens)

### xAI

- **Grok 3 Beta** - Latest Grok model (65k tokens)
- **Grok 2** - Production model (32k tokens)

### Groq

- **Llama 3.1 405B** - Largest open model (131k tokens)
- **Llama 3.1 70B** - Versatile model (131k tokens)
- **Mixtral 8x7B** - MoE architecture (32k tokens)

### Mistral

- **Mistral Large** - Most capable (128k tokens)
- **Mistral Medium** - Balanced (32k tokens)
- **Mistral Small** - Fast and efficient (32k tokens)

### Cohere

- **Command R+** - Advanced reasoning (128k tokens)
- **Command R** - Production ready (128k tokens)

### AWS Bedrock

- Various models available through AWS

## Configuration

To enable AI providers, add the corresponding API keys to your `.env` file:

```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google (any of these will work)
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_API_KEY=your-google-api-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-generative-ai-api-key

# xAI
XAI_API_KEY=your-xai-api-key

# Groq
GROQ_API_KEY=your-groq-api-key

# Mistral
MISTRAL_API_KEY=your-mistral-api-key

# Cohere
COHERE_API_KEY=your-cohere-api-key

# AWS Bedrock
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Default model (optional)
DEFAULT_AI_MODEL=gemini-1.5-flash
```

## Usage

### API Endpoints

1. **Get Available Models**

   ```
   GET /api/videos/models
   ```

   Returns a list of available models based on configured API keys.

2. **Process Video**
   ```
   POST /api/videos/process
   {
     "videoUrl": "https://youtube.com/watch?v=...",
     "modelId": "gpt-3.5-turbo"  // optional, defaults to DEFAULT_AI_MODEL
   }
   ```

### Frontend Integration

The ProcessVideoPage component automatically:

1. Fetches available models on load
2. Groups models by provider for better UX
3. Allows users to select their preferred model
4. Falls back to cheaper models if the selected model fails

## Testing

Run the AI provider test script to verify your configuration:

```bash
cd server
node scripts/test-ai-providers.js
```

This will:

- List all available models based on your API keys
- Test blog post generation with each provider
- Show performance comparisons
- Report any configuration issues

## Model Selection Tips

1. **For best quality**: GPT-4o, Claude 3 Opus, Gemini 1.5 Pro
2. **For speed**: GPT-3.5 Turbo, Claude 3 Haiku, Gemini 1.5 Flash
3. **For cost efficiency**: GPT-3.5 Turbo, Gemini 1.5 Flash
4. **For long context**: Gemini models (up to 1M tokens)
5. **For open source**: Groq models (Llama)

## Error Handling

The system includes automatic fallback:

- If the selected model fails, it tries fallback models
- Default fallback order: GPT-3.5 Turbo → Gemini 1.5 Flash → Claude 3 Haiku
- All errors are logged with detailed information

## Adding New Providers

To add a new provider:

1. Install the provider package:

   ```bash
   npm install @ai-sdk/new-provider
   ```

2. Update `unifiedAIService.js`:

   - Import the provider
   - Add model configurations to `MODELS` object
   - Initialize provider in the providers section
   - Add provider handling in `getModel()`

3. Add environment variables to `env.example`

4. Update this documentation
