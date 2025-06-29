export interface User {
	_id: string;
	email: string;
	name?: string;
	createdAt: string;
	subscription?: {
		plan: string;
		creditsRemaining: number;
		resetDate: string;
		isActive: boolean;
	};
}

export interface BlogPost {
	_id: string;
	userId: string;
	videoUrl: string;
	videoTitle: string;
	videoThumbnail: string;
	transcript: string;
	generatedContent: {
		title: string;
		content: string;
		summary: string;
		tags: string[];
		metaDescription: string;
		keyTakeaways?: string[];
		sections?: Array<{
			heading: string;
			content: string;
		}>;
		keywords?: string[];
	};
	status: 'processing' | 'completed' | 'failed';
	processingStep?:
		| 'extracting_transcript'
		| 'fetching_comments'
		| 'generating_content'
		| 'extracting_keywords'
		| 'saving_content'
		| 'finalizing';
	wordCount?: number;
	readingTime?: number;
	createdAt: string;
	updatedAt: string;
}

export interface AuthResponse {
	user: User;
}

export interface ProcessVideoRequest {
	videoUrl: string;
}

export interface ProcessVideoResponse {
	postId: string;
	message: string;
}
