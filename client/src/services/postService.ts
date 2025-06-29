import { api } from './api';
import { BlogPost } from '@/types';

export const postService = {
	async getPosts(): Promise<BlogPost[]> {
		const { data } = await api.get<{ posts: BlogPost[]; pagination: any }>('/posts');
		return data.posts || [];
	},

	async getPost(id: string): Promise<BlogPost> {
		const { data } = await api.get<{ post: BlogPost }>(`/posts/${id}`);
		return data.post;
	},

	async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
		const { data } = await api.put<{ message: string; post: BlogPost }>(`/posts/${id}`, updates);
		return data.post;
	},

	async deletePost(id: string): Promise<void> {
		await api.delete(`/posts/${id}`);
	},

	async exportPost(id: string, format: 'markdown' | 'html' | 'pdf'): Promise<Blob> {
		const { data } = await api.post(
			`/posts/${id}/export`,
			{ format },
			{
				responseType: 'blob',
			}
		);
		return data;
	},
};
