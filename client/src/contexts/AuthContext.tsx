import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, name: string) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (token) {
			authService
				.getProfile()
				.then((userData) => {
					setUser(userData);
				})
				.catch(() => {
					localStorage.removeItem('token');
					setToken(null);
				})
				.finally(() => {
					setIsLoading(false);
				});
		} else {
			setIsLoading(false);
		}
	}, [token]);

	const login = async (email: string, password: string) => {
		const response = await authService.login(email, password);
		setToken(response.token);
		setUser(response.user);
		localStorage.setItem('token', response.token);
	};

	const register = async (email: string, password: string, name: string) => {
		const response = await authService.register(email, password, name);
		setToken(response.token);
		setUser(response.user);
		localStorage.setItem('token', response.token);
	};

	const refreshUser = async () => {
		if (token) {
			try {
				const userData = await authService.getProfile();
				setUser(userData);
			} catch (error) {
				console.error('Failed to refresh user data:', error);
			}
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('token');
	};

	return (
		<AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
