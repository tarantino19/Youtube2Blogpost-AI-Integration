# YTtoText - YouTube to Blog Post Converter

TEST
Convert YouTube videos into well-structured, SEO-optimized blog posts using AI.

> **🚀 New Features**: Improved transcript extraction with multiple fallback methods, better environment configuration for easy deployment, and Docker support!

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- API Keys (at least one AI provider):
  - YouTube Data API key (required)
  - AI Provider keys (one or more):
    - OpenAI API key
    - Anthropic API key
    - Google/Gemini API key
    - xAI API key
    - Groq API key
    - Mistral API key
    - Cohere API key
    - AWS credentials (for Bedrock)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd yttotext-mernAItemplate
   ```

2. **Run the setup script:**

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment variables:**

   - Copy `server/.env` from `server/env.example` (done by setup script)
   - Update the following in `server/.env`:
     - `YOUTUBE_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/)
     - `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/)
     - `JWT_SECRET` - Generate a secure random string
     - `MONGODB_URI` - Your MongoDB connection string (if not using local)

4. **Start MongoDB** (if using local):

   ```bash
   mongod
   ```

5. **Start the development servers:**

   Terminal 1 - Backend:

   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 - Frontend:

   ```bash
   cd client
   npm run dev
   ```

6. **Access the application:**
   Open http://localhost:3000 in your browser

## 📝 Manual Setup (Alternative)

If the setup script doesn't work on your system:

### Server Setup:

```bash
cd server
cp env.example .env
# Edit .env with your API keys
npm install
npm run dev
```

### Client Setup:

```bash
cd client
cp env.example .env
npm install
npm run dev
```

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB connection error:**

   - Ensure MongoDB is running: `mongod`
   - Check MongoDB URI in `.env` file
   - For cloud MongoDB, ensure IP whitelist includes your IP

2. **API key errors:**

   - Verify YouTube Data API is enabled in Google Cloud Console
   - Check API key permissions and quotas
   - Ensure OpenAI account has credits

3. **Port already in use:**

   - Server runs on port 5000, client on port 3000
   - Change ports in `.env` and `vite.config.ts` if needed

4. **TypeScript errors:**
   - Run `npm install` in both client and server directories
   - Ensure Node.js version is 18 or higher

## 🚀 Features

- **YouTube Video Processing**: Extract transcripts from any YouTube video
- **AI-Powered Content Generation**: Convert video transcripts into structured blog posts using **20+ AI models** from 8 providers
- **Multi-Model Support**: Choose from OpenAI, Anthropic, Google, xAI, Groq, Mistral, Cohere, and AWS Bedrock models
- **User Authentication**: Secure JWT-based authentication system
- **Content Management**: Full CRUD operations for generated blog posts
- **Export Options**: Export posts in Markdown, HTML, or PDF formats
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Processing**: Live updates on video processing status
- **Powered by Vercel AI SDK**: Unified interface for all AI providers

## 🛠️ Tech Stack

### Frontend

- React 18 with TypeScript
- React Router 7 for routing
- Tailwind CSS for styling
- React Query for server state management
- Vite for build tooling

### Backend

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- YouTube Data API v3
- OpenAI/Claude API for content generation

## 📁 Project Structure

```
yttotext-mernAItemplate/
├── .gitignore              # Git ignore patterns
├── setup.sh               # Automated setup script
├── README.md              # This file
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   └── layouts/   # Layout components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript definitions
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # Additional styles
│   │   ├── router.tsx     # React Router configuration
│   │   ├── main.tsx       # Application entry point
│   │   └── index.css      # Global styles
│   ├── env.example        # Environment template
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   ├── vite.config.ts     # Vite configuration
│   └── README.md          # Frontend documentation
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Utility functions
│   │   └── app.js         # Express app setup
│   ├── env.example        # Environment template
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
└── docs/                  # Documentation files (gitignored)
    ├── AUTHENTICATION_GUIDE.md
    ├── PROJECT_PLAN.md
    ├── SETUP_COMPLETE.md
    └── TECHNICAL_IMPLEMENTATION.md
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Video Processing

- `POST /api/videos/process` - Process YouTube URL
- `GET /api/videos/:id` - Get video details

### Blog Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/export` - Export post

## 🎯 Usage

1. **Register/Login**: Create an account or login to access the application
2. **Process Video**: Navigate to "Process Video" and paste a YouTube URL
3. **Wait for Processing**: The AI will extract the transcript and generate a blog post
4. **Edit & Export**: Review the generated content, make edits, and export in your preferred format

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Password hashing using bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting on API endpoints
- Environment variable protection with `.gitignore`

## 📊 Development

### Environment Variables

The project uses environment variables for configuration:

**Server (.env):**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yttotext
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:3000
```

**Client (.env):**

```env
VITE_API_URL=http://localhost:5000/api
```

### Git Configuration

The project includes a comprehensive `.gitignore` file that excludes:

- Node modules and dependencies
- Environment files with sensitive data
- Build outputs and cache files
- IDE/editor configuration files
- OS-specific files (`.DS_Store`, `Thumbs.db`)
- All documentation `.md` files except `README.md` files

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production` in server environment
2. Use production MongoDB database
3. Generate secure JWT secrets
4. Configure HTTPS with SSL certificates
5. Set up reverse proxy (Nginx recommended)
6. Use process manager (PM2 recommended)
7. Configure monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m "Add feature"`
6. Push to branch: `git push origin feature-name`
7. Submit a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- YouTube Data API for video information
- OpenAI/Anthropic for AI-powered content generation
- The open-source community for the amazing tools and libraries
