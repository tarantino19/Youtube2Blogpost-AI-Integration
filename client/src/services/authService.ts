import { api } from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
	async login(email: string, password: string): Promise<AuthResponse> {
		const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
		return data;
	},

	async register(email: string, password: string, name: string): Promise<AuthResponse> {
		const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name });
		return data;
	},

	async getProfile(): Promise<User> {
		const { data } = await api.get<{ user: User }>('/auth/profile');
		return data.user;
	},

	async refreshToken(): Promise<{ token: string }> {
		const { data } = await api.post<{ token: string }>('/auth/refresh');
		return data;
	},

	async logout(): Promise<void> {
		await api.post('/auth/logout');
	},
};
