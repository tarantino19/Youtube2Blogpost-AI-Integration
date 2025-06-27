const { YoutubeTranscript } = require('youtube-transcript');
const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const config = require('../config/config');

const execAsync = promisify(exec);

// Extract video ID from URL
const extractVideoId = (url) => {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
		/youtube\.com\/embed\/([^&\n?#]+)/,
		/youtube\.com\/v\/([^&\n?#]+)/,
		/^([a-zA-Z0-9_-]{11})$/, // Direct video ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	throw new Error('Invalid YouTube URL');
};

class TranscriptService {
	constructor() {
		this.methods = [
			this.getTranscriptWithYoutubeTranscript.bind(this),
			this.getTranscriptWithYtDlp.bind(this),
			this.getTranscriptFromAPI.bind(this),
			this.getTranscriptFromYouTubeAPI.bind(this),
		];
	}

	async getTranscript(videoId, language = 'en') {
		console.log(`🎯 Starting transcript extraction for video: ${videoId}`);

		const errors = [];

		// Try each method in order
		for (let i = 0; i < this.methods.length; i++) {
			const method = this.methods[i];
			console.log(`\n📍 Attempt ${i + 1}/${this.methods.length}: ${method.name}`);

			try {
				const result = await method(videoId, language);
				if (result && result.transcript && result.transcript.length > 100) {
					console.log(`✅ Success with ${method.name}!`);
					return result;
				}
			} catch (error) {
				console.log(`❌ ${method.name} failed: ${error.message}`);
				errors.push({ method: method.name, error: error.message });
			}
		}

		// If all methods fail, throw detailed error
		throw new Error(
			`Failed to extract transcript. Tried ${this.methods.length} methods:\n` +
				errors.map((e) => `- ${e.method}: ${e.error}`).join('\n') +
				'\n\nTry these videos that usually work:\n' +
				'• https://www.youtube.com/watch?v=jfKfPfyJRdk (LoFi Girl)\n' +
				'• https://www.youtube.com/watch?v=9bZkp7q19f0 (PSY - Gangnam Style)'
		);
	}

	// Method 1: youtube-transcript package
	async getTranscriptWithYoutubeTranscript(videoId, language) {
		console.log('  🔄 Trying youtube-transcript package...');

		// Try with specific language first
		try {
			const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: language });
			if (transcript && transcript.length > 0) {
				const fullTranscript = transcript
					.map((item) => item.text)
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim();

				return {
					transcript: fullTranscript,
					segments: transcript,
					language: language,
					method: 'youtube-transcript',
				};
			}
		} catch (error) {
			console.log(`  ⚠️ Language ${language} not available`);

			// Try auto-detection
			try {
				const transcript = await YoutubeTranscript.fetchTranscript(videoId);
				if (transcript && transcript.length > 0) {
					const fullTranscript = transcript
						.map((item) => item.text)
						.join(' ')
						.replace(/\s+/g, ' ')
						.trim();

					return {
						transcript: fullTranscript,
						segments: transcript,
						language: 'auto',
						method: 'youtube-transcript-auto',
					};
				}
			} catch (autoError) {
				// Extract available languages from error
				if (autoError.message && autoError.message.includes('Available languages:')) {
					const langMatch = autoError.message.match(/Available languages: (.+)/);
					if (langMatch) {
						const availableLangs = langMatch[1].split(', ').map((lang) => lang.trim());
						console.log(`  📋 Available languages: ${availableLangs.join(', ')}`);

						// Try first available language
						for (const lang of availableLangs.slice(0, 3)) {
							try {
								const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
								if (transcript && transcript.length > 0) {
									const fullTranscript = transcript
										.map((item) => item.text)
										.join(' ')
										.replace(/\s+/g, ' ')
										.trim();

									return {
										transcript: fullTranscript,
										segments: transcript,
										language: lang,
										method: `youtube-transcript-${lang}`,
									};
								}
							} catch (langError) {
								continue;
							}
						}
					}
				}
				throw autoError;
			}
		}
	}

	// Method 2: yt-dlp command line tool
	async getTranscriptWithYtDlp(videoId, language) {
		console.log('  🔄 Trying yt-dlp...');

		// Check if yt-dlp is available
		try {
			await execAsync('yt-dlp --version');
		} catch (error) {
			throw new Error(
				'yt-dlp not installed. Install with: pip install yt-dlp or run: bash scripts/install-optional-deps.sh'
			);
		}

		// Try to get subtitles
		const commands = [
			`yt-dlp --write-sub --write-auto-sub --sub-lang ${language} --skip-download --sub-format json3 "https://www.youtube.com/watch?v=${videoId}" -o "transcript"`,
			`yt-dlp --write-sub --write-auto-sub --sub-lang en --skip-download --sub-format json3 "https://www.youtube.com/watch?v=${videoId}" -o "transcript"`,
			`yt-dlp --write-auto-sub --skip-download --sub-format json3 "https://www.youtube.com/watch?v=${videoId}" -o "transcript"`,
		];

		for (const command of commands) {
			try {
				console.log(`  📝 Running: ${command.substring(0, 50)}...`);
				const { stdout, stderr } = await execAsync(command, { timeout: 30000 });

				// Read the generated subtitle file
				const fs = require('fs').promises;
				const files = await fs.readdir('.');
				const subFile = files.find((f) => f.includes('transcript') && (f.endsWith('.json3') || f.endsWith('.vtt')));

				if (subFile) {
					const content = await fs.readFile(subFile, 'utf-8');
					await fs.unlink(subFile); // Clean up

					// Parse based on format
					let transcript = '';
					if (subFile.endsWith('.json3')) {
						const data = JSON.parse(content);
						transcript = data.events
							.filter((e) => e.segs)
							.flatMap((e) => e.segs)
							.filter((s) => s.utf8)
							.map((s) => s.utf8)
							.join(' ');
					} else {
						// VTT format
						transcript = content
							.split('\n')
							.filter((line) => !line.includes('-->') && !line.match(/^\d+$/) && line.trim())
							.join(' ');
					}

					if (transcript.length > 100) {
						return {
							transcript: transcript.trim(),
							segments: [],
							language: language,
							method: 'yt-dlp',
						};
					}
				}
			} catch (error) {
				console.log(`  ⚠️ yt-dlp attempt failed: ${error.message}`);
				continue;
			}
		}

		throw new Error('yt-dlp failed to extract subtitles');
	}

	// Method 3: External transcript APIs
	async getTranscriptFromAPI(videoId, language) {
		console.log('  🔄 Trying external APIs...');

		const apis = [
			{
				name: 'youtube-transcript-api',
				url: `https://youtube-transcript-api.herokuapp.com/api/transcript?video_id=${videoId}&lang=${language}`,
			},
			{
				name: 'youtubetranscript.com',
				url: `https://youtubetranscript.com/?server_vid2=${videoId}`,
			},
		];

		for (const api of apis) {
			try {
				console.log(`  📡 Trying ${api.name}...`);
				const response = await axios.get(api.url, {
					timeout: 20000,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
					},
				});

				if (response.data) {
					let transcript = '';
					let segments = [];

					if (Array.isArray(response.data)) {
						segments = response.data;
						transcript = response.data.map((item) => item.text).join(' ');
					} else if (response.data.transcript) {
						transcript = response.data.transcript;
						segments = response.data.segments || [];
					} else if (typeof response.data === 'string' && response.data.length > 100) {
						transcript = response.data;
					}

					if (transcript.length > 100) {
						return {
							transcript: transcript.trim(),
							segments: segments,
							language: language,
							method: api.name,
						};
					}
				}
			} catch (error) {
				console.log(`  ⚠️ ${api.name} failed: ${error.message}`);
				continue;
			}
		}

		throw new Error('All external APIs failed');
	}

	// Method 4: Direct YouTube API
	async getTranscriptFromYouTubeAPI(videoId, language) {
		console.log('  🔄 Trying direct YouTube API...');

		const urls = [
			`https://www.youtube.com/api/timedtext?lang=${language}&v=${videoId}&fmt=json3`,
			`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`,
			`https://www.youtube.com/api/timedtext?v=${videoId}&fmt=json3`,
		];

		for (const url of urls) {
			try {
				const response = await axios.get(url, {
					timeout: 15000,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
						Accept: 'application/json',
					},
				});

				if (response.data && response.data.events) {
					const transcript = response.data.events
						.filter((event) => event.segs)
						.flatMap((event) => event.segs)
						.filter((seg) => seg.utf8)
						.map((seg) => seg.utf8)
						.join(' ')
						.trim();

					if (transcript.length > 100) {
						return {
							transcript: transcript,
							segments: [],
							language: language,
							method: 'youtube-direct-api',
						};
					}
				}
			} catch (error) {
				continue;
			}
		}

		throw new Error('Direct YouTube API failed');
	}
}

// Create singleton instance
const transcriptService = new TranscriptService();

module.exports = {
	extractVideoId,
	getTranscript: (videoId, language) => transcriptService.getTranscript(videoId, language),
};
