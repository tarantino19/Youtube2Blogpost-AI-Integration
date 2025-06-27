# Technical Implementation Guide

## Backend Implementation

### 1. Project Setup

#### Initialize Backend

```bash
mkdir server && cd server
npm init -y
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

#### Server Configuration (server/src/app.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/posts', require('./routes/posts'));

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
```

### 2. Database Models

#### User Model (server/src/models/User.js)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	subscription: {
		plan: {
			type: String,
			enum: ['free', 'basic', 'pro'],
			default: 'free',
		},
		creditsRemaining: {
			type: Number,
			default: 5,
		},
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

#### BlogPost Model (server/src/models/BlogPost.js)

```javascript
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	videoUrl: {
		type: String,
		required: true,
	},
	videoId: {
		type: String,
		required: true,
	},
	videoTitle: String,
	videoThumbnail: String,
	videoDuration: Number,
	transcript: {
		type: String,
		required: true,
	},
	generatedContent: {
		title: String,
		content: String,
		summary: String,
		tags: [String],
		metaDescription: String,
		sections: [
			{
				heading: String,
				content: String,
			},
		],
	},
	status: {
		type: String,
		enum: ['processing', 'completed', 'failed'],
		default: 'processing',
	},
	wordCount: Number,
	language: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
```

### 3. YouTube Integration Service

#### YouTube Service (server/src/services/youtubeService.js)

```javascript
const axios = require('axios');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

const apiKey = process.env.YOUTUBE_API_KEY;

// Extract video ID from URL
const extractVideoId = (url) => {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
		/youtube\.com\/embed\/([^&\n?#]+)/,
		/youtube\.com\/v\/([^&\n?#]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	throw new Error('Invalid YouTube URL');
};

// Parse ISO 8601 duration to seconds
const parseDuration = (duration) => {
	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
	const hours = parseInt(match[1]) || 0;
	const minutes = parseInt(match[2]) || 0;
	const seconds = parseInt(match[3]) || 0;
	return hours * 3600 + minutes * 60 + seconds;
};

// Get video metadata
const getVideoMetadata = async (videoId) => {
	try {
		const response = await youtube.videos.list({
			key: apiKey,
			part: 'snippet,contentDetails',
			id: videoId,
		});

		if (!response.data.items.length) {
			throw new Error('Video not found');
		}

		const video = response.data.items[0];
		return {
			title: video.snippet.title,
			description: video.snippet.description,
			thumbnail: video.snippet.thumbnails.high.url,
			duration: parseDuration(video.contentDetails.duration),
			channelTitle: video.snippet.channelTitle,
		};
	} catch (error) {
		throw new Error(`Failed to fetch video metadata: ${error.message}`);
	}
};

// Get video transcript
const getTranscript = async (videoId) => {
	try {
		// First, try to get captions list
		const captionsResponse = await youtube.captions.list({
			key: apiKey,
			part: 'snippet',
			videoId: videoId,
		});

		if (captionsResponse.data.items.length > 0) {
			// Get the first available caption track
			const captionId = captionsResponse.data.items[0].id;

			// Note: Downloading captions requires OAuth2, so we'll use a third-party service
			// In production, you might want to use youtube-transcript package
			const transcriptUrl = `https://youtube-transcript-api.herokuapp.com/api/transcript?video_id=${videoId}`;
			const response = await axios.get(transcriptUrl);

			return response.data.map((item) => item.text).join(' ');
		}

		throw new Error('No captions available for this video');
	} catch (error) {
		throw new Error(`Failed to fetch transcript: ${error.message}`);
	}
};

module.exports = {
	extractVideoId,
	getVideoMetadata,
	getTranscript,
};
```

### 4. AI Blog Generation Service

#### AI Service (server/src/services/aiService.js)

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const generateBlogPost = async (transcript, videoTitle, videoDescription) => {
	const prompt = `
      Convert the following YouTube video transcript into a well-structured, engaging blog post.
      
      Video Title: ${videoTitle}
      Video Description: ${videoDescription}
      
      Transcript: ${transcript}
      
      Please create a blog post with:
      1. An engaging, SEO-friendly title
      2. A compelling introduction
      3. Well-organized sections with clear headings
      4. Key takeaways or summary points
      5. A conclusion
      6. 5-7 relevant tags
      7. A meta description (150-160 characters)
      
      Format the response as JSON with the following structure:
      {
        "title": "Blog post title",
        "content": "Full blog post content in markdown",
        "summary": "Brief summary",
        "sections": [
          {
            "heading": "Section heading",
            "content": "Section content"
          }
        ],
        "tags": ["tag1", "tag2"],
        "metaDescription": "Meta description"
      }
    `;

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				{
					role: 'system',
					content: 'You are a professional content writer who creates engaging blog posts from video transcripts.',
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			temperature: 0.7,
			max_tokens: 3000,
		});

		const content = response.choices[0].message.content;
		return JSON.parse(content);
	} catch (error) {
		throw new Error(`AI generation failed: ${error.message}`);
	}
};

const improveContent = async (content, instructions) => {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				{
					role: 'system',
					content: 'You are a professional editor who improves blog post content.',
				},
				{
					role: 'user',
					content: `Improve the following blog post based on these instructions: ${instructions}\n\nContent: ${content}`,
				},
			],
			temperature: 0.7,
			max_tokens: 3000,
		});

		return response.choices[0].message.content;
	} catch (error) {
		throw new Error(`Content improvement failed: ${error.message}`);
	}
};

module.exports = {
	generateBlogPost,
	improveContent,
};
```

### 5. API Controllers

#### Video Controller (server/src/controllers/videoController.js)

```javascript
const BlogPost = require('../models/BlogPost');
const youtubeService = require('../services/youtubeService');
const aiService = require('../services/aiService');

exports.processVideo = async (req, res) => {
	try {
		const { videoUrl } = req.body;
		const userId = req.user.id;

		// Check user credits
		const user = await User.findById(userId);
		if (user.subscription.creditsRemaining <= 0) {
			return res.status(403).json({ error: 'No credits remaining' });
		}

		// Extract video ID
		const videoId = youtubeService.extractVideoId(videoUrl);

		// Check if already processed
		const existingPost = await BlogPost.findOne({ userId, videoId });
		if (existingPost) {
			return res.json({
				message: 'Video already processed',
				postId: existingPost._id,
			});
		}

		// Create initial blog post record
		const blogPost = new BlogPost({
			userId,
			videoUrl,
			videoId,
			status: 'processing',
		});
		await blogPost.save();

		// Process video asynchronously
		processVideoAsync(blogPost._id, videoId, user);

		res.json({
			message: 'Video processing started',
			postId: blogPost._id,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

async function processVideoAsync(blogPostId, videoId, user) {
	try {
		const blogPost = await BlogPost.findById(blogPostId);

		// Get video metadata
		const metadata = await youtubeService.getVideoMetadata(videoId);
		blogPost.videoTitle = metadata.title;
		blogPost.videoThumbnail = metadata.thumbnail;
		blogPost.videoDuration = metadata.duration;

		// Get transcript
		const transcript = await youtubeService.getTranscript(videoId);
		blogPost.transcript = transcript;

		// Generate blog post with AI
		const generatedContent = await aiService.generateBlogPost(transcript, metadata.title, metadata.description);

		blogPost.generatedContent = generatedContent;
		blogPost.wordCount = generatedContent.content.split(' ').length;
		blogPost.status = 'completed';

		await blogPost.save();

		// Deduct credit
		user.subscription.creditsRemaining -= 1;
		await user.save();
	} catch (error) {
		await BlogPost.findByIdAndUpdate(blogPostId, {
			status: 'failed',
			error: error.message,
		});
	}
}

exports.getVideoStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const blogPost = await BlogPost.findOne({ _id: id, userId });
		if (!blogPost) {
			return res.status(404).json({ error: 'Blog post not found' });
		}

		res.json(blogPost);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
```

## Frontend Implementation

### 1. React Setup

#### Initialize Frontend

```bash
npx create-react-app client --template typescript
cd client
npm install axios react-router-dom @tanstack/react-query
npm install -D @types/react-router-dom tailwindcss
```

### 2. Main Components

#### Video Input Component (client/src/components/VideoInput.tsx)

```typescript
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface VideoInputProps {
	onSuccess: (postId: string) => void;
}

export const VideoInput: React.FC<VideoInputProps> = ({ onSuccess }) => {
	const [url, setUrl] = useState('');

	const processVideo = useMutation({
		mutationFn: async (videoUrl: string) => {
			const response = await axios.post('/api/videos/process', { videoUrl });
			return response.data;
		},
		onSuccess: (data) => {
			onSuccess(data.postId);
			setUrl('');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (url.trim()) {
			processVideo.mutate(url);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='max-w-2xl mx-auto'>
			<div className='flex gap-4'>
				<input
					type='url'
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder='Enter YouTube URL...'
					className='flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2'
					required
				/>
				<button
					type='submit'
					disabled={processVideo.isLoading}
					className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
				>
					{processVideo.isLoading ? 'Processing...' : 'Convert to Blog'}
				</button>
			</div>
			{processVideo.isError && <p className='mt-2 text-red-600'>Error: {processVideo.error?.message}</p>}
		</form>
	);
};
```

#### Blog Post Display (client/src/components/BlogPostDisplay.tsx)

```typescript
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
	_id: string;
	videoTitle: string;
	videoThumbnail: string;
	generatedContent: {
		title: string;
		content: string;
		tags: string[];
		metaDescription: string;
	};
	wordCount: number;
	createdAt: string;
}

interface BlogPostDisplayProps {
	post: BlogPost;
	onEdit: () => void;
}

export const BlogPostDisplay: React.FC<BlogPostDisplayProps> = ({ post, onEdit }) => {
	const handleExport = (format: 'markdown' | 'html') => {
		// Export logic here
	};

	return (
		<article className='max-w-4xl mx-auto p-6'>
			<div className='mb-6'>
				<img src={post.videoThumbnail} alt={post.videoTitle} className='w-full h-64 object-cover rounded-lg' />
			</div>

			<h1 className='text-4xl font-bold mb-4'>{post.generatedContent.title}</h1>

			<div className='flex items-center gap-4 mb-6 text-gray-600'>
				<span>{new Date(post.createdAt).toLocaleDateString()}</span>
				<span>•</span>
				<span>{post.wordCount} words</span>
			</div>

			<div className='prose prose-lg max-w-none mb-6'>
				<ReactMarkdown>{post.generatedContent.content}</ReactMarkdown>
			</div>

			<div className='flex flex-wrap gap-2 mb-6'>
				{post.generatedContent.tags.map((tag) => (
					<span key={tag} className='px-3 py-1 bg-gray-200 rounded-full text-sm'>
						#{tag}
					</span>
				))}
			</div>

			<div className='flex gap-4'>
				<button onClick={onEdit} className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'>
					Edit
				</button>
				<button
					onClick={() => handleExport('markdown')}
					className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
				>
					Export as Markdown
				</button>
				<button onClick={() => handleExport('html')} className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'>
					Export as HTML
				</button>
			</div>
		</article>
	);
};
```

### 3. API Integration

#### API Client (client/src/services/api.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add auth token to requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Handle token refresh logic
		}
		return Promise.reject(error);
	}
);

export const authAPI = {
	login: (email: string, password: string) => api.post('/auth/login', { email, password }),
	register: (data: any) => api.post('/auth/register', data),
	refresh: () => api.post('/auth/refresh'),
};

export const videoAPI = {
	process: (videoUrl: string) => api.post('/videos/process', { videoUrl }),
	getStatus: (id: string) => api.get(`/videos/${id}`),
	list: () => api.get('/videos'),
};

export const postAPI = {
	get: (id: string) => api.get(`/posts/${id}`),
	update: (id: string, data: any) => api.put(`/posts/${id}`, data),
	delete: (id: string) => api.delete(`/posts/${id}`),
	export: (id: string, format: string) => api.post(`/posts/${id}/export`, { format }),
};

export default api;
```

## Deployment Configuration

### Docker Setup (docker-compose.yml)

```yaml
version: '3.8'

services:
	mongodb:
		image: mongo:6
		ports:
			- '27017:27017'
		environment:
			MONGO_INITDB_ROOT_USERNAME: admin
			MONGO_INITDB_ROOT_PASSWORD: password
		volumes:
			- mongodb_data:/data/db

	backend:
		build: ./server
		ports:
			- '5000:5000'
		environment:
			- NODE_ENV=production
			- MONGODB_URI=mongodb://admin:password@mongodb:27017/yttotext?authSource=admin
		depends_on:
			- mongodb
		volumes:
			- ./server:/app
			- /app/node_modules

	frontend:
		build: ./client
		ports:
			- '3000:3000'
		depends_on:
			- backend
		volumes:
			- ./client:/app
			- /app/node_modules

volumes:
	mongodb_data:
```

### Production Deployment Script

```bash
#!/bin/bash
# deploy.sh

# Build and push Docker images
docker build -t yttotext-backend ./server
docker build -t yttotext-frontend ./client

# Deploy to cloud provider (example with AWS ECS)
aws ecs update-service --cluster yttotext-cluster --service backend-service --force-new-deployment
aws ecs update-service --cluster yttotext-cluster --service frontend-service --force-new-deployment

# Run database migrations
docker run --rm yttotext-backend npm run migrate

echo "Deployment completed!"
```
