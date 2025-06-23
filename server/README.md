# YouTube to Text Blog Generator - Backend

## Overview

This is the backend server for the YouTube to Text Blog Generator application. It provides APIs for converting YouTube videos into well-formatted blog posts using AI technology.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **YouTube Integration**: Extract video metadata and transcripts
- **AI-Powered Generation**: Convert transcripts to blog posts using OpenAI
- **Content Management**: Full CRUD operations for blog posts
- **Export Options**: Export posts in Markdown, HTML, or JSON formats
- **Rate Limiting**: Protect APIs with intelligent rate limiting
- **Credit System**: Manage user credits and subscription plans

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- YouTube Data API Key
- OpenAI API Key

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the server directory:

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

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run prod
```

## API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login

```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile

```
GET /api/auth/profile
Headers: {
  "Authorization": "Bearer <token>"
}
```

### Video Processing Endpoints

#### Process YouTube Video

```
POST /api/videos/process
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

#### Get Video Status

```
GET /api/videos/:id/status
Headers: {
  "Authorization": "Bearer <token>"
}
```

#### List Videos

```
GET /api/videos?page=1&limit=10&status=completed
Headers: {
  "Authorization": "Bearer <token>"
}
```

### Blog Post Endpoints

#### Get All Posts

```
GET /api/posts?page=1&limit=10&search=keyword&tags=tag1,tag2
Headers: {
  "Authorization": "Bearer <token>"
}
```

#### Get Single Post

```
GET /api/posts/:id
Headers: {
  "Authorization": "Bearer <token>"
}
```

#### Update Post

```
PUT /api/posts/:id
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["tag1", "tag2"]
}
```

#### Export Post

```
POST /api/posts/:id/export
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "format": "markdown" // or "html", "json"
}
```

## Project Structure

```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── app.js          # Express app setup
├── .env                # Environment variables
├── package.json        # Dependencies
└── README.md          # This file
```

## Error Handling

The API returns consistent error responses:

```json
{
	"error": "Error message",
	"details": {} // Optional additional information
}
```

## Rate Limiting

Different endpoints have different rate limits:

- Authentication: 5-10 requests per 15 minutes
- Video Processing: 10 requests per hour
- General API: 100 requests per 15 minutes

Pro users get higher limits.

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- All inputs are sanitized
- CORS is configured for the frontend URL
- Rate limiting prevents abuse

## Testing

Run the test suite:

```bash
npm test
```

## Deployment

1. Set production environment variables
2. Build the application
3. Use PM2 or similar for process management
4. Set up reverse proxy with Nginx
5. Enable HTTPS with SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
