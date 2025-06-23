const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkDependencies() {
	console.log('🔍 Checking optional dependencies...\n');

	// Check for yt-dlp
	try {
		const { stdout } = await execAsync('yt-dlp --version');
		console.log('✅ yt-dlp is installed:', stdout.trim());
	} catch (error) {
		console.log('⚠️  yt-dlp not found. Some transcript extraction methods will be unavailable.');
		console.log('   To install: pip install yt-dlp\n');
	}

	// Check for Python
	try {
		const { stdout } = await execAsync('python3 --version');
		console.log('✅ Python is installed:', stdout.trim());
	} catch (error) {
		console.log('⚠️  Python3 not found. yt-dlp installation requires Python.');
		console.log('   To install: https://www.python.org/downloads/\n');
	}

	// Check for ffmpeg (optional for some videos)
	try {
		const { stdout } = await execAsync('ffmpeg -version');
		const version = stdout.split('\n')[0];
		console.log('✅ ffmpeg is installed:', version);
	} catch (error) {
		console.log('ℹ️  ffmpeg not found. Not required but may help with some videos.');
		console.log('   To install: https://ffmpeg.org/download.html\n');
	}

	console.log('\n📌 Note: These are optional dependencies that enhance transcript extraction.');
	console.log('   The application will work without them using fallback methods.\n');
}

// Run the check
checkDependencies().catch(console.error);
