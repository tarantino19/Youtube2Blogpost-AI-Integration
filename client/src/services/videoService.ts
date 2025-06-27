import { api } from './api';
import { ProcessVideoResponse } from '@/types';

export interface ProcessVideoRequest {
	videoUrl: string;
	modelId?: string;
}

export interface AvailableModel {
	id: string;
	provider: string;
	model: string;
	name: string;
	maxTokens: number;
}

export const videoService = {
	// Get available AI models
	getAvailableModels: async (): Promise<{ models: AvailableModel[] }> => {
		const { data } = await api.get('/videos/models');
		return data;
	},

	// Process a new video
	processVideo: async (params: ProcessVideoRequest): Promise<ProcessVideoResponse> => {
		const { data } = await api.post('/videos/process', params);
		return data;
	},

	// Get video processing status
	getVideoStatus: async (postId: string) => {
		const response = await api.get(`/videos/status/${postId}`);
		return response.data;
	},

	async getVideos() {
		const { data } = await api.get('/videos');
		return data;
	},
};
