# Troubleshooting Guide

This guide covers common issues and their solutions for the YouTube-to-Text application.

## Quick Health Check

Run the health check script to diagnose issues:

```bash
npm run health
```

For continuous monitoring:

```bash
npm run health:monitor
```

## Common Issues

### 1. Database Connection Issues

**Symptoms:**

- Server fails to start
- "MongoDB connection error" messages
- Database-related API endpoints fail

**Solutions:**

1. **Check MongoDB is running:**

   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb  # macOS
   sudo systemctl status mongod       # Linux
   ```

2. **Verify connection string:**

   ```bash
   # Check your .env file
   cat .env | grep MONGODB_URI
   ```

3. **Test connection manually:**

   ```bash
   mongosh "your-mongodb-uri-here"
   ```

4. **Common fixes:**
   - Restart MongoDB service
   - Check firewall settings
   - Verify authentication credentials
   - Ensure database exists

### 2. AI Service Failures

**Symptoms:**

- "AI_NoObjectGeneratedError" errors
- API quota exceeded (429 errors)
- All AI models failing

**Solutions:**

1. **Check API keys:**

   ```bash
   npm run deps:check
   ```

2. **Test individual AI providers:**

   ```bash
   npm run test:ai
   ```

3. **API quota issues:**

   - Check your API usage in provider dashboards
   - Switch to different models with higher limits
   - Use fallback models (Gemini 1.5 Flash has higher free limits)

4. **Model-specific fixes:**
   - OpenAI: Check billing and usage limits
   - Gemini: Verify Google AI Studio quota
   - Anthropic: Check Claude API credits

### 3. Transcript Extraction Failures

**Symptoms:**

- "Failed to extract transcript" errors
- "yt-dlp not installed" messages
- Empty transcript results

**Solutions:**

1. **Install optional dependencies:**

   ```bash
   npm run deps:install
   ```

2. **Manual installation:**

   ```bash
   # Install yt-dlp
   pip install yt-dlp

   # Install ffmpeg (optional)
   brew install ffmpeg  # macOS
   sudo apt install ffmpeg  # Ubuntu/Debian
   ```

3. **Test with known working videos:**

   - https://www.youtube.com/watch?v=jfKfPfyJRdk (LoFi Girl)
   - https://www.youtube.com/watch?v=9bZkp7q19f0 (PSY - Gangnam Style)

4. **Alternative methods:**
   - Try different YouTube videos
   - Check if video has captions enabled
   - Use videos with auto-generated captions

### 4. Server Startup Issues

**Symptoms:**

- Server crashes on startup
- Port already in use errors
- Module not found errors

**Solutions:**

1. **Port conflicts:**

   ```bash
   # Check what's using port 5001
   lsof -i :5001

   # Kill process if needed
   kill -9 <PID>

   # Or change port in .env
   PORT=5002
   ```

2. **Missing dependencies:**

   ```bash
   npm install
   npm run deps:check
   ```

3. **Environment variables:**

   ```bash
   # Copy example env file
   cp env.example .env

   # Edit with your values
   nano .env
   ```

### 5. Frontend Connection Issues

**Symptoms:**

- "Network Error" in browser
- CORS errors
- API endpoints not responding

**Solutions:**

1. **Check server is running:**

   ```bash
   curl http://localhost:5001/api/health
   ```

2. **CORS configuration:**

   - Verify CLIENT_URL in .env matches your frontend URL
   - Check browser console for CORS errors

3. **API endpoint testing:**

   ```bash
   # Test available models endpoint
   curl http://localhost:5001/api/videos/models

   # Test auth endpoint
   curl http://localhost:5001/api/auth/profile
   ```

## Performance Issues

### 1. Slow AI Generation

**Symptoms:**

- Long processing times
- Timeouts during generation

**Solutions:**

1. **Use faster models:**

   - Switch to Gemini 1.5 Flash (fastest)
   - Use GPT-3.5 Turbo instead of GPT-4
   - Try Groq models for speed

2. **Optimize content length:**

   - Process shorter videos
   - Split long transcripts

3. **Check API latency:**
   ```bash
   npm run test:ai
   ```

### 2. Memory Issues

**Symptoms:**

- Server crashes with memory errors
- Slow response times
- High memory usage

**Solutions:**

1. **Increase Node.js memory limit:**

   ```bash
   node --max-old-space-size=4096 src/app.js
   ```

2. **Process smaller chunks:**

   - Limit video length
   - Process in batches

3. **Monitor memory usage:**
   ```bash
   # Monitor Node.js process
   top -p $(pgrep -f "node src/app.js")
   ```

## Backup and Recovery

### 1. Create Backup

```bash
# Create database backup
npm run backup

# Manual backup
node scripts/backup-database.js create
```

### 2. Restore from Backup

```bash
# List available backups
ls -la backups/

# Restore specific backup
npm run restore backups/backup-2024-01-01T10-00-00-000Z.json
```

### 3. Emergency Recovery

If the system is completely broken:

1. **Stop all services:**

   ```bash
   pkill -f "node src/app.js"
   pkill -f "nodemon"
   ```

2. **Reset database (CAUTION):**

   ```bash
   mongosh
   > use yttotext
   > db.dropDatabase()
   ```

3. **Restore from backup:**

   ```bash
   npm run restore backups/latest-backup.json
   ```

4. **Restart services:**
   ```bash
   npm run dev
   ```

## Monitoring and Maintenance

### 1. Regular Health Checks

```bash
# Run daily health check
npm run health

# Set up monitoring
npm run health:monitor 10  # Check every 10 minutes
```

### 2. Log Analysis

```bash
# Check application logs
tail -f logs/app.log

# Check system logs
journalctl -u your-app-service -f
```

### 3. Performance Monitoring

```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null http://localhost:5001/api/health

# Check database performance
mongosh --eval "db.stats()"
```

## Getting Help

If you're still experiencing issues:

1. **Check logs for specific error messages**
2. **Run the health check script**
3. **Test individual components**
4. **Check GitHub issues for similar problems**
5. **Create a detailed bug report with:**
   - Error messages
   - Steps to reproduce
   - System information
   - Health check results

## Useful Commands

```bash
# Full system check
npm run health && npm run deps:check && npm run test:integration

# Quick restart
pkill -f "node src/app.js" && npm run dev

# Clean restart
npm install && npm run health && npm run dev

# Emergency backup
npm run backup && echo "Backup created in backups/ directory"
```
