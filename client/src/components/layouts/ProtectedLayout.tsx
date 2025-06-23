import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedLayout() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loader2 className='h-8 w-8 animate-spin text-red-600' />
			</div>
		);
	}

	if (!user) {
		return <Navigate to='/login' replace />;
	}

	return <Outlet />;
}
