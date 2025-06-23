# Build stage for client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Build stage for server
FROM node:18-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install yt-dlp for better transcript extraction
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --no-cache-dir yt-dlp

# Copy server files
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Copy client build
COPY --from=client-build /app/client/dist ./client/dist

# Serve client files from server
RUN mkdir -p ./server/public && \
    cp -r ./client/dist/* ./server/public/

WORKDIR /app/server

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

# Start server
CMD ["node", "src/app.js"] 