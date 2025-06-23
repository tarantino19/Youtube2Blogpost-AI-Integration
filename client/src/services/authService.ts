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
		const { data } = await api.get<User>('/auth/profile');
		return data;
	},

	async refreshToken(): Promise<{ token: string }> {
		const { data } = await api.post<{ token: string }>('/auth/refresh');
		return data;
	},
};
