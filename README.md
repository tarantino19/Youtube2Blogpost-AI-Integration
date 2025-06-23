# YTtoText - YouTube to Blog Post Converter

Convert YouTube videos into well-structured, SEO-optimized blog posts using AI.

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- API Keys:
  - YouTube Data API key
  - OpenAI API key (or Anthropic Claude API key)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd yttotext
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
- **AI-Powered Content Generation**: Convert video transcripts into structured blog posts
- **User Authentication**: Secure JWT-based authentication system
- **Content Management**: Full CRUD operations for generated blog posts
- **Export Options**: Export posts in Markdown, HTML, or PDF formats
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Processing**: Live updates on video processing status

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

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- YouTube Data API key
- OpenAI API key or Claude API key

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/yttotext.git
cd yttotext
```

2. Install backend dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

4. Set up environment variables:

Create `.env` file in the server directory:

```env
# Server
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yttotext
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# AI Service (choose one)
OPENAI_API_KEY=your_openai_api_key
# or
ANTHROPIC_API_KEY=your_claude_api_key

# Client URL
CLIENT_URL=http://localhost:3000
```

Create `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

1. Start the backend server:

```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend:

```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
yttotext/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- YouTube Data API for video information
- OpenAI/Anthropic for AI-powered content generation
- The open-source community for the amazing tools and libraries
