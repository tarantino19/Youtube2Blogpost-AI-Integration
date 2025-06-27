#!/bin/bash

echo "🔧 Installing optional dependencies for enhanced transcript extraction..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    echo "   Visit: https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python3 is installed: $(python3 --version)"

# Install yt-dlp
echo "📦 Installing yt-dlp..."
if pip3 install yt-dlp; then
    echo "✅ yt-dlp installed successfully"
else
    echo "⚠️  Failed to install yt-dlp. Trying alternative methods..."
    
    # Try with user flag
    if pip3 install --user yt-dlp; then
        echo "✅ yt-dlp installed successfully (user mode)"
    else
        echo "❌ Failed to install yt-dlp. Please install manually:"
        echo "   pip3 install yt-dlp"
        echo "   or visit: https://github.com/yt-dlp/yt-dlp#installation"
    fi
fi

# Check if ffmpeg is installed
if command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg is already installed: $(ffmpeg -version | head -n1)"
else
    echo "⚠️  ffmpeg not found. This is optional but recommended."
    echo "   Install instructions:"
    echo "   • macOS: brew install ffmpeg"
    echo "   • Ubuntu/Debian: sudo apt install ffmpeg"
    echo "   • Windows: Download from https://ffmpeg.org/download.html"
fi

echo ""
echo "🎉 Optional dependencies setup complete!"
echo "   Run 'node scripts/check-dependencies.js' to verify installation." 