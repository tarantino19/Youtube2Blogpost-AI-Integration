import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, name: string) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Try to get user profile on app start to check if user is authenticated via cookies
		authService
			.getProfile()
			.then((userData) => {
				console.log('User authenticated:', userData);
				setUser(userData);
			})
			.catch((error) => {
				// User is not authenticated, this is fine
				console.log('User not authenticated (expected):', error.response?.status);
				setUser(null);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const login = async (email: string, password: string) => {
		console.log('Attempting login for:', email);
		const response = await authService.login(email, password);
		console.log('Login successful:', response);
		setUser(response.user);
	};

	const register = async (email: string, password: string, name: string) => {
		const response = await authService.register(email, password, name);
		setUser(response.user);
	};

	const refreshUser = async () => {
		try {
			const userData = await authService.getProfile();
			setUser(userData);
		} catch (error) {
			console.error('Failed to refresh user data:', error);
			setUser(null);
		}
	};

	const logout = () => {
		setUser(null);
		// Call the logout endpoint to clear server-side cookies
		authService.logout().catch(console.error);
	};

	return (
		<AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading }}>
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
