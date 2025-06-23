import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock } from 'lucide-react';

export function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || '/dashboard';

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			await login(email, password);
			navigate(from, { replace: true });
		} catch (err: any) {
			setError(err.response?.data?.error || 'Failed to login');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Sign in to your account</h2>
					<p className='mt-2 text-center text-sm text-gray-600'>
						Or{' '}
						<Link to='/register' className='font-medium text-red-600 hover:text-red-500'>
							create a new account
						</Link>
					</p>
				</div>

				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					{error && (
						<div className='rounded-md bg-red-50 p-4'>
							<p className='text-sm text-red-800'>{error}</p>
						</div>
					)}

					<div className='rounded-md shadow-sm -space-y-px'>
						<div>
							<label htmlFor='email' className='sr-only'>
								Email address
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className='appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
									placeholder='Email address'
								/>
							</div>
						</div>
						<div>
							<label htmlFor='password' className='sr-only'>
								Password
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='password'
									name='password'
									type='password'
									autoComplete='current-password'
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
									placeholder='Password'
								/>
							</div>
						</div>
					</div>

					<div>
						<button
							type='submit'
							disabled={isLoading}
							className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : 'Sign in'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
