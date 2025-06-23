# YouTube to Text Blog Generator - Backend

## 🌟 Overview

This is the backend server for the YouTube to Text Blog Generator application. It provides robust APIs for converting YouTube videos into well-formatted blog posts using advanced AI technology.

## ✨ Features

- **🔐 User Authentication**: JWT-based authentication with refresh tokens
- **📺 YouTube Integration**: Extract video metadata and transcripts
- **🤖 AI-Powered Generation**: Convert transcripts to blog posts using OpenAI/Claude
- **📝 Content Management**: Full CRUD operations for blog posts
- **📤 Export Options**: Export posts in Markdown, HTML, or JSON formats
- **🛡️ Rate Limiting**: Intelligent rate limiting to protect APIs
- **⚡ Performance**: Optimized queries and caching
- **🔒 Security**: Comprehensive security measures and data protection

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v4.4 or higher)
- **YouTube Data API Key**
- **OpenAI API Key** or **Anthropic Claude API Key**

## 🚀 Installation

1. **Navigate to server directory:**

```bash
cd server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

Copy `.env.example` to `.env` and configure:

```bash
cp env.example .env
```

4. **Configure environment variables:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/yttotext

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# AI Service (choose one)
OPENAI_API_KEY=your_openai_api_key
# or
ANTHROPIC_API_KEY=your_claude_api_key

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

## 🏃‍♂️ Running the Server

### Development Mode

```bash
npm run dev
```

Server will start at http://localhost:5000 with hot reload enabled.

### Production Mode

```bash
npm run prod
```

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**

```json
{
	"token": "jwt_token_here",
	"user": {
		"id": "user_id",
		"email": "user@example.com",
		"name": "John Doe"
	}
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### 📺 Video Processing Endpoints

#### Process YouTube Video

```http
POST /api/videos/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**

```json
{
	"id": "processing_id",
	"status": "processing",
	"videoId": "VIDEO_ID",
	"title": "Video Title",
	"estimatedTime": "2-3 minutes"
}
```

#### Get Video Status

```http
GET /api/videos/:id/status
Authorization: Bearer <token>
```

#### List Videos

```http
GET /api/videos?page=1&limit=10&status=completed
Authorization: Bearer <token>
```

### 📝 Blog Post Endpoints

#### Get All Posts

```http
GET /api/posts?page=1&limit=10&search=keyword&tags=tag1,tag2
Authorization: Bearer <token>
```

#### Get Single Post

```http
GET /api/posts/:id
Authorization: Bearer <token>
```

#### Update Post

```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["tag1", "tag2"],
  "excerpt": "Brief description"
}
```

#### Delete Post

```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

#### Export Post

```http
POST /api/posts/:id/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "markdown" // or "html", "json"
}
```

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── videoController.js
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   └── BlogPost.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── videos.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js
│   │   └── rateLimiter.js
│   ├── services/          # Business logic
│   │   ├── aiService.js
│   │   ├── geminiService.js
│   │   ├── youtubeService.js
│   │   └── youtubeServiceNoAPI.js
│   ├── utils/             # Helper functions
│   │   └── validators.js
│   └── app.js            # Express app setup
├── env.example           # Environment template
├── package.json          # Dependencies
└── README.md            # This file
```

## 🛡️ Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Token Validation**: Middleware for protected routes
- **Session Management**: Automatic token refresh

### Data Protection

- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Controlled cross-origin requests

### Rate Limiting

- **Authentication**: 5-10 requests per 15 minutes
- **Video Processing**: 10 requests per hour
- **General API**: 100 requests per 15 minutes
- **Premium Users**: Higher limits available

## ⚠️ Error Handling

### Consistent Error Responses

```json
{
	"error": "Error message",
	"code": "ERROR_CODE",
	"details": {},
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Types

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error (server issues)

## 🚀 Services Architecture

### AI Service Integration

- **OpenAI GPT**: Primary AI service for content generation
- **Anthropic Claude**: Alternative AI service
- **Gemini**: Google's AI service integration
- **Fallback Logic**: Automatic service switching

### YouTube Integration

- **YouTube Data API**: Official API for metadata
- **Alternative Service**: Non-API method for transcript extraction
- **Error Handling**: Graceful fallbacks for API limits

### Database Operations

- **MongoDB**: Primary database with Mongoose ODM
- **Connection Pooling**: Optimized database connections
- **Indexing**: Performance-optimized queries
- **Data Validation**: Schema-based validation

## 🧪 Testing

### Run Test Suite

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Testing Stack

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory testing database

## 🚀 Deployment

### Production Setup

1. **Environment Configuration:**

   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=secure-production-secret
   ```

2. **Process Management:**

   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start src/app.js --name "yttotext-api"
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy (Nginx):**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Configuration:**
   ```bash
   # Using Certbot
   sudo certbot --nginx -d your-domain.com
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Recommended Tools

- **Application Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Logging**: Winston + CloudWatch
- **Performance**: APM tools

### Health Checks

```http
GET /api/health
```

Response:

```json
{
	"status": "healthy",
	"timestamp": "2024-01-01T00:00:00.000Z",
	"services": {
		"database": "connected",
		"ai": "operational",
		"youtube": "operational"
	}
}
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Write tests** for new functionality
4. **Follow coding standards**: ESLint configuration
5. **Update documentation** if needed
6. **Submit a Pull Request**

### Code Standards

- Use ES6+ features
- Follow JSDoc conventions
- Write comprehensive tests
- Handle errors gracefully
- Use meaningful variable names

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check existing documentation
- Review API examples above
