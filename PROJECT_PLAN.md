# YouTube to Text Blog Generator - MERN Stack Application

## Project Overview

A full-stack web application that converts YouTube videos into well-formatted blog posts using AI technology.

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Services**: OpenAI API (GPT-4) or Claude API
- **Authentication**: JWT tokens
- **Video Processing**: YouTube Data API v3, YouTube Transcript API

## Core Features

### 1. User Authentication

- User registration and login
- JWT-based authentication
- Protected routes for saved content

### 2. YouTube Video Processing

- Input YouTube URL validation
- Extract video metadata (title, description, thumbnail)
- Retrieve video transcripts/captions
- Support for multiple languages

### 3. AI-Powered Blog Generation

- Convert raw transcripts to structured blog posts
- Generate SEO-friendly titles
- Create section headings
- Add relevant formatting (paragraphs, bullet points)
- Generate meta descriptions
- Extract key takeaways

### 4. Content Management

- Save generated blog posts
- Edit and customize content
- Export options (Markdown, HTML, PDF)
- History of processed videos

### 5. User Dashboard

- View all generated blog posts
- Analytics (word count, processing time)
- Usage limits and quotas

## Project Structure

```
yttotext/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── package.json
│   └── .env
├── docker-compose.yml
├── README.md
└── .gitignore
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Video Processing

- `POST /api/videos/process` - Process YouTube URL
- `GET /api/videos/:id` - Get processed video details
- `GET /api/videos` - List user's processed videos

### Blog Posts

- `GET /api/posts` - Get all blog posts
- `GET /api/posts/:id` - Get specific blog post
- `PUT /api/posts/:id` - Update blog post
- `DELETE /api/posts/:id` - Delete blog post
- `POST /api/posts/:id/export` - Export blog post

## Database Schema

### User Model

```javascript
{
  email: String,
  password: String (hashed),
  name: String,
  createdAt: Date,
  subscription: {
    plan: String,
    creditsRemaining: Number
  }
}
```

### BlogPost Model

```javascript
{
  userId: ObjectId,
  videoUrl: String,
  videoTitle: String,
  videoThumbnail: String,
  transcript: String,
  generatedContent: {
    title: String,
    content: String,
    summary: String,
    tags: [String],
    metaDescription: String
  },
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Implementation Phases

### Phase 1: Project Setup (Week 1)

1. Initialize MERN stack project structure
2. Set up MongoDB database
3. Configure development environment
4. Implement basic authentication

### Phase 2: YouTube Integration (Week 2)

1. Integrate YouTube Data API
2. Implement transcript extraction
3. Create video processing endpoints
4. Handle error cases

### Phase 3: AI Integration (Week 3)

1. Set up OpenAI/Claude API
2. Create prompt templates
3. Implement blog generation logic
4. Add content formatting

### Phase 4: Frontend Development (Week 4-5)

1. Design UI/UX with Figma
2. Implement React components
3. Create responsive layouts
4. Add state management (Redux/Context)

### Phase 5: Testing & Deployment (Week 6)

1. Write unit and integration tests
2. Performance optimization
3. Deploy to cloud (AWS/Vercel/Heroku)
4. Set up CI/CD pipeline

## Environment Variables

```
# Server
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yttotext
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# AI Service
OPENAI_API_KEY=your_openai_api_key
# or
ANTHROPIC_API_KEY=your_claude_api_key

# Client
REACT_APP_API_URL=http://localhost:5000/api
```

## Security Considerations

- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- API key encryption
- User data privacy
- HTTPS enforcement

## Monetization Options

1. Freemium model (X videos/month free)
2. Credit-based system
3. Subscription tiers
4. API access for developers

## Future Enhancements

1. Support for podcast transcription
2. Multi-language support
3. Custom AI fine-tuning
4. WordPress/Medium integration
5. Team collaboration features
6. Browser extension
7. Mobile app
