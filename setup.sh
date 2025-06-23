#!/bin/bash

echo "🚀 Setting up YTtoText project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use a cloud MongoDB service."
else
    echo "✅ MongoDB is available"
fi

# Copy environment files
echo "📋 Creating environment files..."
if [ ! -f server/.env ]; then
    cp server/env.example server/.env
    echo "✅ Created server/.env - Please update it with your API keys"
else
    echo "⚠️  server/.env already exists"
fi

if [ ! -f client/.env ]; then
    cp client/env.example client/.env
    echo "✅ Created client/.env"
else
    echo "⚠️  client/.env already exists"
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "⚠️  Important next steps:"
echo "1. Update server/.env with your API keys:"
echo "   - YouTube Data API key"
echo "   - OpenAI or Anthropic API key"
echo "   - MongoDB connection string (if not using local)"
echo "   - JWT secret key"
echo ""
echo "2. Start MongoDB (if using local):"
echo "   mongod"
echo ""
echo "3. Start the server:"
echo "   cd server && npm run dev"
echo ""
echo "4. Start the client (in a new terminal):"
echo "   cd client && npm run dev"
echo ""
echo "The app will be available at http://localhost:3000" 