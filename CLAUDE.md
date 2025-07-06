# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YTtoText is a full-stack MERN application that converts YouTube videos into structured, SEO-optimized blog posts using AI technology. The application supports 20+ AI models from 8 different providers (OpenAI, Anthropic, Google, xAI, Groq, Mistral, Cohere, AWS Bedrock).

## Development Commands

### Client (React/TypeScript)

```bash
cd client
npm run dev          # Start development server with Vite
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Server (Node.js/Express)

```bash
cd server
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm test             # Run tests
npm run backup       # Backup database
npm run health-check # Check system health
```

### Full Stack Development

```bash
# Run both client and server concurrently
npm run dev          # From root directory


```

### Personal Preferences

Don't add features or change code that I didn't really ask for. Specifically fix only the ones I specifically ask for.

Use MCP when its appropriate and related to the task Im asking you to do.

I prefer map filter over for loops

Please try to avoid using classes when providing js or ts code unless necessary

I prefer that you use async await over .then or promises

## Architecture Overview

### Frontend (`client/`)

- **React 19** with TypeScript and Vite
- **React Router 7** for routing with protected routes
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Axios** with interceptors for API calls

Key directories:

- `src/components/` - Reusable UI components and layouts
- `src/pages/` - Page components (HomePage, DashboardPage, ProcessVideoPage, etc.)
- `src/services/` - API service layer with authentication and business logic
- `src/contexts/` - React contexts for global state (AuthContext)

### Backend (`server/`)

- **Express 5.1.0** with comprehensive security middleware
- **MongoDB** with Mongoose ODM
- **JWT authentication** with bcryptjs password hashing
- **Vercel AI SDK** for unified AI provider integration

Key directories:

- `src/controllers/` - Route controllers (auth, posts, videos)
- `src/models/` - Mongoose models (User with subscription tiers, BlogPost)
- `src/services/` - Business logic (AI integration, YouTube processing, transcription)
- `src/middleware/` - Security, authentication, and rate limiting
- `scripts/` - Utility scripts for management and testing

## Key Features & Patterns

### AI Integration

- **Unified AI Service** (`server/src/services/unifiedAIService.js`) supports multiple providers
- **Structured output** generation using Zod schemas
- **Fallback mechanisms** for service failures
- Test AI providers with: `node scripts/test-ai-providers.js`

### Video Processing Pipeline

- **YouTube Data API** integration with fallback transcript extraction
- **Real-time status updates** for processing progress
- **Error handling** with recovery mechanisms

### Security Architecture

- **Multi-layer security** middleware stack
- **Rate limiting** and input validation.
- **Environment-based configuration** with production hardening
- **CORS protection** with configurable origins

### User Management

- **Subscription system** with credit tracking (free/basic/pro plans)
- **JWT-based authentication** with secure token handling
- **Profile management** with usage statistics

### Validation

- **Input Validation** use Zod for validation for both frontend and backend

## Database Models

### User Model

- Authentication fields with bcryptjs hashing
- Subscription management (plan, credits, usage tracking)
- Profile information and preferences

### BlogPost Model

- Video metadata and processing status
- Generated content with SEO optimization
- Export capabilities and user relationships

## Configuration

### Environment Variables

Required variables are defined in `server/src/config/config.js`:

- Database connection (MongoDB)
- JWT secrets and AI provider API keys
- YouTube API credentials
- Security and rate limiting settings

### Development Setup

1. Run `./setup.sh` for automated environment setup
2. Configure environment variables in `.env` files
3. Start MongoDB (local or cloud)
4. Run development servers

## API Structure

### Authentication (`/api/auth/`)

- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile

### Video Processing (`/api/videos/`)

- `POST /process` - Process YouTube URL
- `GET /:id` - Get processing status

### Blog Posts (`/api/posts/`)

- `GET /` - Get user's posts
- `GET /:id` - Get specific post
- `PUT /:id` - Update post
- `DELETE /:id` - Delete post
- `POST /:id/export` - Export post

## Deployment

### Docker Support

- Multi-stage Dockerfile for production builds
- Docker Compose for local development and deployment
- Health checks and monitoring included

### Cloud Deployment

- Railway.json and render.yaml configurations
- Environment-specific configurations
- Automated deployment scripts

## Testing & Utilities

### Management Scripts

- `scripts/backup-database.js` - Database backup/restore
- `scripts/health-check.js` - System monitoring
- `scripts/manage-credits.js` - User credit management
- `scripts/test-ai-providers.js` - AI service testing

### Development Tools

- ESLint configuration for code quality
- TypeScript for type safety
- Vite for fast development builds
- Comprehensive error handling and logging

#### LocatorJS Setup (Always include in React projects)

**Installation:**
```bash
npm install --save-dev @locator/babel-jsx @locator/runtime
```

**Vite Configuration (vite.config.ts):**
```typescript
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: mode === 'development' ? [['@locator/babel-jsx/dist', { env: 'development' }]] : [],
      },
    }),
  ],
  // ... rest of config
}));
```

**Main Entry Point (src/main.tsx):**
```typescript
// Initialize locatorjs in development
if (import.meta.env.DEV) {
  import('@locator/runtime').then(({ setupLocator }) => {
    setupLocator();
  });
}
```

**Usage:** Option+Click (Alt+Click) on React components to jump to source code (development only)
