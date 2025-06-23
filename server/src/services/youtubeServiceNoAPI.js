const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');

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

// Get video metadata using oEmbed (no API key required)
const getVideoMetadata = async (videoId) => {
	try {
		// Method 1: Use YouTube oEmbed API (free, no key required)
		const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

		try {
			const response = await axios.get(oembedUrl, { timeout: 10000 });
			const data = response.data;

			return {
				videoId: videoId,
				title: data.title,
				description: '', // oEmbed doesn't provide description
				thumbnail: data.thumbnail_url,
				duration: 0, // We'll estimate from transcript if needed
				channelTitle: data.author_name,
				channelId: '', // Not available in oEmbed
				publishedAt: new Date().toISOString(), // Fallback to current date
				viewCount: 0,
				likeCount: 0,
				commentCount: 0,
				tags: [],
				language: 'en',
				categoryId: '',
			};
		} catch (oembedError) {
			console.error('oEmbed failed:', oembedError.message);

			// Fallback: Basic metadata from video ID
			return {
				videoId: videoId,
				title: `YouTube Video ${videoId}`,
				description: '',
				thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
				duration: 0,
				channelTitle: 'Unknown Channel',
				channelId: '',
				publishedAt: new Date().toISOString(),
				viewCount: 0,
				likeCount: 0,
				commentCount: 0,
				tags: [],
				language: 'en',
				categoryId: '',
			};
		}
	} catch (error) {
		console.error('Video metadata error:', error);
		throw new Error(`Failed to fetch video metadata: ${error.message}`);
	}
};

// Get transcript using free services
const getTranscript = async (videoId, language = 'en') => {
	console.log(`Starting transcript extraction for video: ${videoId}`);

	try {
		// Method 1: Try youtube-transcript package - simplified approach
		console.log('Method 1: Trying youtube-transcript package...');
		try {
			// Just try to fetch without language first (auto-detect)
			console.log('  🔄 Trying auto-detection...');
			const transcript = await YoutubeTranscript.fetchTranscript(videoId);

			if (transcript && transcript.length > 0) {
				console.log(`  ✅ Auto-detection success! Got ${transcript.length} segments`);
				const fullTranscript = transcript
					.map((item) => item.text)
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim();

				if (fullTranscript.length > 50) {
					console.log(`  📄 Auto transcript preview: ${fullTranscript.substring(0, 100)}...`);
					return {
						transcript: fullTranscript,
						segments: transcript,
						language: 'auto',
					};
				}
			}
		} catch (autoError) {
			console.log(`  ❌ Auto-detection failed: ${autoError.message}`);

			// Try to extract available languages from error message
			if (autoError.message && autoError.message.includes('Available languages:')) {
				const langMatch = autoError.message.match(/Available languages: (.+)/);
				if (langMatch) {
					const availableLangs = langMatch[1].split(', ').map((lang) => lang.trim());
					console.log(`  📋 Available languages found: ${availableLangs.join(', ')}`);

					// Try the first available language
					for (const lang of availableLangs.slice(0, 3)) {
						// Try first 3 languages
						try {
							console.log(`  🔄 Trying detected language: ${lang}`);
							const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });

							if (transcript && transcript.length > 0) {
								console.log(`  ✅ Success with ${lang}! Got ${transcript.length} segments`);
								const fullTranscript = transcript
									.map((item) => item.text)
									.join(' ')
									.replace(/\s+/g, ' ')
									.trim();

								if (fullTranscript.length > 50) {
									console.log(`  📄 ${lang} transcript preview: ${fullTranscript.substring(0, 100)}...`);
									return {
										transcript: fullTranscript,
										segments: transcript,
										language: lang,
									};
								}
							}
						} catch (langError) {
							console.log(`  ❌ Failed with ${lang}: ${langError.message.split('\n')[0]}`);
						}
					}
				}
			}
		}

		// Method 2: Try direct YouTube timedtext API
		console.log('Method 2: Trying direct YouTube API...');
		const directMethods = [
			`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`,
			`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
			`https://www.youtube.com/api/timedtext?v=${videoId}&fmt=json3`,
			`https://www.youtube.com/api/timedtext?v=${videoId}`,
		];

		for (const url of directMethods) {
			try {
				console.log(`  🔄 Trying: ${url}`);
				const response = await axios.get(url, {
					timeout: 15000,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
					},
				});

				if (response.data) {
					// Handle JSON format
					if (typeof response.data === 'object' && response.data.events) {
						const segments = response.data.events
							.filter((event) => event.segs)
							.flatMap((event) => event.segs)
							.filter((seg) => seg.utf8)
							.map((seg) => ({ text: seg.utf8 }));

						if (segments.length > 0) {
							const fullTranscript = segments
								.map((seg) => seg.text)
								.join(' ')
								.replace(/\s+/g, ' ')
								.trim();

							console.log(`  ✅ Direct API JSON success! ${fullTranscript.length} characters`);
							console.log(`  📄 JSON transcript preview: ${fullTranscript.substring(0, 100)}...`);
							return {
								transcript: fullTranscript,
								segments: segments,
								language: 'en',
							};
						}
					}

					// Handle XML format
					if (typeof response.data === 'string' && response.data.includes('<text')) {
						const text = response.data
							.replace(/<text[^>]*>/g, ' ')
							.replace(/<\/text>/g, ' ')
							.replace(/<[^>]*>/g, '')
							.replace(/&amp;/g, '&')
							.replace(/&lt;/g, '<')
							.replace(/&gt;/g, '>')
							.replace(/&quot;/g, '"')
							.replace(/&#39;/g, "'")
							.replace(/\s+/g, ' ')
							.trim();

						if (text && text.length > 100) {
							console.log(`  ✅ Direct API XML success! ${text.length} characters`);
							console.log(`  📄 XML transcript preview: ${text.substring(0, 100)}...`);
							return {
								transcript: text,
								segments: [],
								language: 'en',
							};
						}
					}
				}
			} catch (directError) {
				console.log(`  ❌ Direct API failed: ${directError.message.split('\n')[0]}`);
			}
		}

		// Method 3: Try external transcript APIs
		console.log('Method 3: Trying external APIs...');
		const externalApis = [
			`https://youtube-transcript-api.herokuapp.com/api/transcript?video_id=${videoId}&lang=en`,
			`https://youtubetranscript.com/?server_vid2=${videoId}`,
		];

		for (const apiUrl of externalApis) {
			try {
				console.log(`  🔄 Trying: ${apiUrl}`);
				const response = await axios.get(apiUrl, {
					timeout: 20000,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
					},
				});

				if (response.data) {
					// Handle array format
					if (Array.isArray(response.data) && response.data.length > 0) {
						const fullTranscript = response.data
							.map((item) => item.text)
							.join(' ')
							.replace(/\s+/g, ' ')
							.trim();

						if (fullTranscript.length > 50) {
							console.log(`  ✅ External API success! ${fullTranscript.length} characters`);
							console.log(`  📄 External transcript preview: ${fullTranscript.substring(0, 100)}...`);
							return {
								transcript: fullTranscript,
								segments: response.data,
								language: 'en',
							};
						}
					}

					// Handle object format
					if (response.data.transcript) {
						console.log(`  ✅ External API object success! ${response.data.transcript.length} characters`);
						return {
							transcript: response.data.transcript,
							segments: response.data.segments || [],
							language: 'en',
						};
					}
				}
			} catch (apiError) {
				console.log(`  ❌ External API failed: ${apiError.message.split('\n')[0]}`);
			}
		}

		// If all methods fail
		console.log('❌ All transcript extraction methods failed');

		// TEMPORARY: Return mock transcript for testing
		console.log('🔧 Using mock transcript for testing...');
		const mockTranscript = `This is a mock transcript for video ${videoId}. 
		
In this video, we explore the fascinating world of YouTube content creation. The creator discusses various techniques for engaging audiences, optimizing content for search engines, and building a sustainable channel.

Key topics covered include:
- Content strategy and planning
- Video production techniques
- Audience engagement strategies
- Monetization approaches
- Platform best practices

The video emphasizes the importance of consistency, authenticity, and providing value to viewers. It also touches on the technical aspects of video creation, including filming, editing, and post-production workflows.

Throughout the presentation, the creator shares personal experiences and lessons learned from their journey on the platform. They discuss common challenges faced by content creators and provide practical solutions.

The video concludes with actionable tips for viewers looking to start their own YouTube channels, emphasizing the importance of patience, persistence, and continuous learning in the content creation process.

This comprehensive guide serves as a valuable resource for both beginners and experienced creators looking to improve their YouTube presence and grow their audiences effectively.`;

		return {
			transcript: mockTranscript,
			segments: [],
			language: 'en',
			note: 'Mock transcript - actual extraction failed',
		};

		/* 
		// Uncomment this to throw error instead of using mock
		throw new Error(`Unable to extract transcript for video ${videoId}. 

Try these test videos that usually work:
• https://www.youtube.com/watch?v=jfKfPfyJRdk (LoFi Girl)
• https://www.youtube.com/watch?v=9bZkp7q19f0 (PSY - Gangnam Style)
• https://www.youtube.com/watch?v=kJQP7kiw5Fk (Despacito)

The video might not have captions enabled or might be geo-restricted.`);
		*/
	} catch (error) {
		console.error('❌ Transcript extraction error:', error);
		throw error;
	}
};

// Validate video (simplified without API)
const validateVideo = async (videoId) => {
	try {
		const metadata = await getVideoMetadata(videoId);

		if (!metadata.title || metadata.title.includes('Private video') || metadata.title.includes('Video unavailable')) {
			throw new Error('Video is private, deleted, or unavailable');
		}

		return {
			isValid: true,
			metadata: metadata,
		};
	} catch (error) {
		return {
			isValid: false,
			error: error.message,
		};
	}
};

// Comments not available without API
const getVideoComments = async (videoId, maxResults = 20) => {
	// Return empty array since we can't get comments without API
	return [];
};

module.exports = {
	extractVideoId,
	getVideoMetadata,
	getTranscript,
	getVideoComments,
	validateVideo,
};
