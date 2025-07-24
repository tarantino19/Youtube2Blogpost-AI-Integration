# REST API Endpoints

This document provides a comprehensive overview of all REST API endpoints in the YTtoText application, organized by controller.

## Authentication Controller (`/api/auth`)

| Method | Endpoint | Description | File Path |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | User registration | `server/src/controllers/authController.js:6` |
| POST | `/api/auth/login` | User login | `server/src/controllers/authController.js:72` |
| POST | `/api/auth/refresh` | Refresh JWT token | `server/src/controllers/authController.js:149` |
| POST | `/api/auth/logout` | User logout | `server/src/controllers/authController.js:372` |
| GET | `/api/auth/profile` | Get user profile | `server/src/controllers/authController.js:206` |
| PUT | `/api/auth/profile` | Update user profile | `server/src/controllers/authController.js:228` |
| PUT | `/api/auth/password` | Change user password | `server/src/controllers/authController.js:282` |
| DELETE | `/api/auth/account` | Delete/deactivate user account | `server/src/controllers/authController.js:329` |
| GET | `/api/auth/google` | Initiate Google OAuth | `server/src/routes/auth.js:25` |
| GET | `/api/auth/google/callback` | Google OAuth callback | `server/src/controllers/authController.js:400` |

## Video Controller (`/api/videos`)

| Method | Endpoint | Description | File Path |
|--------|----------|-------------|-----------|
| GET | `/api/videos/models` | Get available AI models | `server/src/routes/videos.js:12` |
| POST | `/api/videos/process` | Process YouTube video to blog post | `server/src/controllers/videoController.js:14` |
| GET | `/api/videos/:id/status` | Get video processing status | `server/src/controllers/videoController.js:263` |
| GET | `/api/videos` | List all user videos with pagination | `server/src/controllers/videoController.js:295` |
| POST | `/api/videos/:id/retry` | Retry failed video processing | `server/src/controllers/videoController.js:336` |

## Post Controller (`/api/posts`)

| Method | Endpoint | Description | File Path |
|--------|----------|-------------|-----------|
| GET | `/api/posts` | Get all posts with filtering and pagination | `server/src/controllers/postController.js:13` |
| GET | `/api/posts/stats` | Get post statistics | `server/src/controllers/postController.js:590` |
| GET | `/api/posts/:id` | Get a specific post | `server/src/controllers/postController.js:71` |
| PUT | `/api/posts/:id` | Update a post | `server/src/controllers/postController.js:98` |
| DELETE | `/api/posts/:id` | Delete a post | `server/src/controllers/postController.js:170` |
| POST | `/api/posts/:id/export` | Export post in various formats (markdown, html, json, pdf) | `server/src/controllers/postController.js:209` |
| POST | `/api/posts/:id/improve` | Improve post content with AI | `server/src/controllers/postController.js:529` |

## Share Controller (`/api/shares`)

| Method | Endpoint | Description | File Path |
|--------|----------|-------------|-----------|
| POST | `/api/shares/claim-reward` | Claim share reward credits | `server/src/controllers/shareController.js:4` |
| GET | `/api/shares/share-status` | Get share reward status | `server/src/controllers/shareController.js:39` |

## System Endpoints

| Method | Endpoint | Description | File Path |
|--------|----------|-------------|-----------|
| GET | `/api/health` | Health check endpoint | `server/src/app.js:66` |

## Authentication Requirements

### Public Endpoints (No Authentication Required)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/health`

### Protected Endpoints (Authentication Required)
All other endpoints require valid JWT authentication via cookies or Authorization header.

### Credit-Restricted Endpoints
These endpoints also check user credit balance:
- `POST /api/videos/process`
- `POST /api/videos/:id/retry`

## Rate Limiting

Different endpoints have different rate limiting rules:

- **Register/Login**: Stricter rate limits for security
- **Video Processing**: Limited to prevent abuse of AI services
- **Export**: Limited to prevent server overload
- **AI Improvement**: Limited due to AI service costs
- **General API**: Standard rate limits for all other endpoints

## Request/Response Formats

### Common Request Headers
```
Content-Type: application/json
Authorization: Bearer <token> (for protected routes)
```

### Common Response Format
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

### Pagination Response Format
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Codes

- `400` - Bad Request (validation errors, invalid parameters)
- `401` - Unauthorized (invalid or missing authentication)
- `403` - Forbidden (insufficient credits, account deactivated)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (server-side errors)

## Query Parameters

### Posts Endpoints
- `status`: Filter by post status (`completed`, `processing`, `failed`, `all`)
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `sort`: Sort order (`-createdAt`, `createdAt`, `-updatedAt`, etc.)
- `search`: Search in title and video title
- `tags`: Filter by tags (comma-separated)

### Videos Endpoints
- `status`: Filter by processing status
- `page`: Page number for pagination
- `limit`: Items per page
- `sort`: Sort order

## File Locations

- **Controllers**: `server/src/controllers/`
- **Routes**: `server/src/routes/`
- **Middleware**: `server/src/middleware/`
- **Models**: `server/src/models/`
- **Services**: `server/src/services/`
