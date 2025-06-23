import { api } from './api';
import { ProcessVideoRequest, ProcessVideoResponse } from '@/types';

export const videoService = {
	async processVideo(data: ProcessVideoRequest): Promise<ProcessVideoResponse> {
		const response = await api.post<ProcessVideoResponse>('/videos/process', data);
		return response.data;
	},

	async getVideoStatus(id: string) {
		const { data } = await api.get(`/videos/${id}`);
		return data;
	},

	async getVideos() {
		const { data } = await api.get('/videos');
		return data;
	},
};
