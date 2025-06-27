# 🚀 YTtoText Deployment Guide

This guide covers deploying YTtoText to various platforms with improved robustness and environment configuration.

## 📋 Table of Contents

- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Platform-Specific Deployments](#platform-specific-deployments)
  - [Render](#render)
  - [Railway](#railway)
  - [Heroku](#heroku)
  - [DigitalOcean App Platform](#digitalocean-app-platform)
- [Transcript Service Setup](#transcript-service-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🔧 Environment Configuration

### Improved Environment Setup

The application now supports environment-specific configuration files:

- `.env` - Default/fallback configuration
- `.env.development` - Local development settings
- `.env.production` - Production settings

### Key Environment Variables

```bash
# Core Configuration
NODE_ENV=production
PORT=5000

# Database (use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yttotext

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=https://your-app-domain.com

# API Keys (at least one AI service required)
YOUTUBE_API_KEY=your-youtube-api-key        # Optional but recommended
OPENAI_API_KEY=your-openai-api-key         # Option 1
ANTHROPIC_API_KEY=your-anthropic-api-key   # Option 2
GEMINI_API_KEY=your-gemini-api-key         # Option 3

# Transcript Service
TRANSCRIPT_SERVICE=auto                     # auto, youtube-transcript, yt-dlp, api
USE_PROXY=false
PROXY_URL=                                  # Optional proxy for geo-restricted videos
```

## 🐳 Docker Deployment

### Local Development with Docker Compose

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Build

```bash
# Build production image
docker build -t yttotext:latest .

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  --env-file .env.production \
  --name yttotext \
  yttotext:latest
```

## 🚀 Platform-Specific Deployments

### Render

1. **Connect GitHub Repository**

   - Sign in to [Render](https://render.com)
   - Connect your GitHub account

2. **Create Services**

   - Use the `render.yaml` blueprint
   - Or create manually:
     - MongoDB: Use MongoDB Atlas instead
     - Web Service: Node.js backend
     - Static Site: React frontend

3. **Configure Environment Variables**

   ```
   NODE_ENV=production
   MONGODB_URI=<MongoDB Atlas URI>
   JWT_SECRET=<generated-secret>
   CLIENT_URL=<frontend-url>
   OPENAI_API_KEY=<your-key>
   ```

4. **Deploy**
   ```bash
   git push origin main
   ```

### Railway

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**

   ```bash
   # Login
   railway login

   # Create new project
   railway new

   # Add MongoDB plugin
   railway add mongodb

   # Set environment variables
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   railway variables set OPENAI_API_KEY=your-key

   # Deploy
   railway up
   ```

### Heroku

1. **Create Heroku App**

   ```bash
   heroku create your-app-name
   ```

2. **Add MongoDB Add-on**

   ```bash
   heroku addons:create mongolab:sandbox
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   heroku config:set OPENAI_API_KEY=your-key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### DigitalOcean App Platform

1. **Create App**

   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Connect GitHub repository

2. **Configure Components**

   - **Database**: Add MongoDB database
   - **Backend**: Node.js service
   - **Frontend**: Static site

3. **Environment Variables**
   - Set in App Settings → Environment Variables
   - Use encrypted variables for sensitive data

## 🎬 Transcript Service Setup

### Fixing Transcript Extraction Issues

The new transcript service (`server/src/services/transcriptService.js`) uses multiple fallback methods:

1. **youtube-transcript package** (Primary)

   - Works for most videos with captions
   - Auto-detects available languages

2. **yt-dlp** (Fallback 1)

   - More robust for geo-restricted content
   - Requires Python installation:
     ```bash
     # In Dockerfile or server
     pip install yt-dlp
     ```

3. **External APIs** (Fallback 2)

   - Uses public transcript APIs
   - No installation required

4. **Direct YouTube API** (Fallback 3)
   - Direct timedtext API access
   - Works for some videos without other methods

### Troubleshooting Transcripts

If transcripts aren't working:

1. **Check Video Availability**

   ```bash
   # Test with known working videos
   https://www.youtube.com/watch?v=jfKfPfyJRdk  # LoFi Girl
   https://www.youtube.com/watch?v=9bZkp7q19f0  # Gangnam Style
   ```

2. **Enable yt-dlp**

   ```bash
   # Install on server
   pip install --upgrade yt-dlp

   # Test manually
   yt-dlp --write-auto-sub --skip-download VIDEO_URL
   ```

3. **Use Proxy for Geo-restricted Content**
   ```env
   USE_PROXY=true
   PROXY_URL=http://proxy-server:port
   ```

## 📊 Monitoring & Maintenance

### Health Checks

The application includes health check endpoints:

```bash
# API Health
curl https://your-app.com/api/health

# Expected response
{"status":"OK","message":"Server is running"}
```

### Logging

Configure logging based on environment:

```javascript
// Production: Error logs only
LOG_LEVEL = error;

// Development: All logs
LOG_LEVEL = debug;
```

### Database Backups

For MongoDB Atlas:

1. Enable automated backups
2. Set retention period
3. Test restore procedures

### Performance Optimization

1. **Enable MongoDB Indexes**

   - Already configured in models
   - Monitor slow queries

2. **Rate Limiting**

   - Configured per environment
   - Adjust based on usage

3. **Caching**
   - Consider Redis for session storage
   - Cache AI responses for identical requests

## 🔒 Security Best Practices

1. **Environment Variables**

   - Never commit `.env` files
   - Use platform-specific secrets management
   - Rotate keys regularly

2. **Database Security**

   - Use connection string with SSL
   - Enable IP whitelisting
   - Use database-level authentication

3. **API Security**
   - Rate limiting enabled
   - CORS configured
   - Helmet.js for headers

## 🆘 Troubleshooting

### Common Issues

1. **"Cannot connect to MongoDB"**

   - Check connection string format
   - Verify IP whitelist includes server IP
   - Ensure database user has correct permissions

2. **"Transcript extraction failed"**

   - Video might not have captions
   - Try different videos to test
   - Check yt-dlp installation
   - Review server logs for specific errors

3. **"AI service not responding"**
   - Verify API key is valid
   - Check API quotas/limits
   - Try alternative AI service

### Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=debug
ENABLE_MOCK_DATA=true  # Use mock data for testing
```

## 📈 Scaling Considerations

As your application grows:

1. **Database**: Upgrade MongoDB cluster
2. **Server**: Add more dynos/instances
3. **CDN**: Use CloudFlare for static assets
4. **Queue**: Add job queue for video processing
5. **Storage**: Use S3 for transcript caching

## 🎉 Next Steps

1. Set up monitoring (e.g., Sentry, LogRocket)
2. Configure automated backups
3. Implement CI/CD pipeline
4. Add custom domain with SSL
5. Set up email notifications for errors

For questions or issues, refer to the main README or create an issue on GitHub.
