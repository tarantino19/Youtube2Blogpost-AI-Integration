import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, name: string) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
	refreshTokens: () => Promise<boolean>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const queryClient = useQueryClient();

	useEffect(() => {
		console.log('AuthContext: Initializing authentication check');
		// Try to get user profile on app start to check if user is authenticated via cookies
		authService
			.getProfile()
			.then((userData) => {
				console.log('AuthContext: Profile loaded successfully', userData);
				setUser(userData);
			})
			.catch(async (error) => {
				console.log('AuthContext: Profile check failed', error.response?.status);
				// If profile check fails with 401, try to refresh tokens
				if (error.response?.status === 401) {
					console.log('AuthContext: Attempting token refresh');
					try {
						await authService.refreshToken();
						console.log('AuthContext: Token refresh successful');
						const userData = await authService.getProfile();
						console.log('AuthContext: Profile loaded after refresh', userData);
						setUser(userData);
					} catch (refreshError) {
						console.log('AuthContext: Token refresh failed', refreshError);
						// Both access and refresh tokens are invalid
						setUser(null);
					}
				} else {
					console.log('AuthContext: Non-401 error, user not authenticated');
					// Other error, user is not authenticated
					setUser(null);
				}
			})
			.finally(() => {
				console.log('AuthContext: Authentication check complete');
				setIsLoading(false);
			});
	}, []);

	const login = async (email: string, password: string) => {
		console.log('AuthContext: Login attempt for', email);
		const response = await authService.login(email, password);
		console.log('AuthContext: Login successful', response.user);
		setUser(response.user);
	};

	const register = async (email: string, password: string, name: string) => {
		console.log('AuthContext: Register attempt for', email, name);
		const response = await authService.register(email, password, name);
		console.log('AuthContext: Registration successful', response.user);
		setUser(response.user);
	};

	const refreshTokens = async (): Promise<boolean> => {
		console.log('AuthContext: Refreshing tokens');
		try {
			await authService.refreshToken();
			console.log('AuthContext: Token refresh successful');
			const userData = await authService.getProfile();
			console.log('AuthContext: Profile loaded after token refresh', userData);
			setUser(userData);
			return true;
		} catch (error) {
			console.error('AuthContext: Token refresh failed:', error);
			setUser(null);
			return false;
		}
	};

	const refreshUser = async () => {
		console.log('AuthContext: Refreshing user data');
		try {
			const userData = await authService.getProfile();
			console.log('AuthContext: User data refreshed', userData);
			setUser(userData);
		} catch (error) {
			console.log('AuthContext: User refresh failed', error.response?.status);
			// If profile fetch fails with 401, try to refresh tokens
			if (error.response?.status === 401) {
				console.log('AuthContext: Attempting token refresh from refreshUser');
				const refreshSuccess = await refreshTokens();
				if (!refreshSuccess) {
					console.error('AuthContext: Failed to refresh tokens and get user data');
				}
			} else {
				console.error('AuthContext: Failed to refresh user data:', error);
				setUser(null);
			}
		}
	};

	const logout = () => {
		console.log('AuthContext: Logging out user');
		setUser(null);
		// Clear all cached queries to prevent data leakage between users
		queryClient.clear();
		// Call the logout endpoint to clear server-side cookies
		authService.logout().catch(console.error);
		console.log('AuthContext: Logout complete');
	};

	return (
		<AuthContext.Provider value={{ user, login, register, logout, refreshUser, refreshTokens, isLoading }}>
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
