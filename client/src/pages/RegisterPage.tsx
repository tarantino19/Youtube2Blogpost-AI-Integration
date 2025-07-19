import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, CheckCircle, Zap, Clock, Sparkles } from 'lucide-react';

export function RegisterPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}

		setIsLoading(true);

		try {
			await register(email, password, name);
			navigate('/dashboard');
		} catch (err: any) {
			setError(err.response?.data?.error || 'Failed to create account');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
					<div className='text-center'>
						<div className='flex items-center justify-center gap-2 mb-4'>
							<div className='p-2 bg-red-100 rounded-lg'>
								<Clock className='h-6 w-6 text-red-600' />
							</div>
							<span className='text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full'>Join 10,000+ Content Creators</span>
						</div>
						<h2 className='text-3xl font-extrabold text-gray-900'>Start Creating Amazing Content</h2>
						<p className='mt-3 text-gray-600'>
							Join thousands of creators who save 5+ hours per blog post with our AI-powered platform
						</p>
						<p className='mt-2 text-center text-sm text-gray-600'>
							Already have an account?{' '}
							<Link to='/login' className='font-medium text-red-600 hover:text-red-500'>
								Sign in here
							</Link>
						</p>
					</div>

				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					{error && (
						<div className='rounded-md bg-red-50 p-4'>
							<p className='text-sm text-red-800'>{error}</p>
						</div>
					)}

					<div className='space-y-4'>
						<div>
							<label htmlFor='name' className='sr-only'>
								Name
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<User className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='name'
									name='name'
									type='text'
									autoComplete='name'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className='appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
									placeholder='Full name'
								/>
							</div>
						</div>

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
									className='appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
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
									autoComplete='new-password'
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
									placeholder='Password'
								/>
							</div>
						</div>

						<div>
							<label htmlFor='confirm-password' className='sr-only'>
								Confirm Password
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' />
								</div>
								<input
									id='confirm-password'
									name='confirm-password'
									type='password'
									autoComplete='new-password'
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className='appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
									placeholder='Confirm password'
								/>
							</div>
						</div>
					</div>

					<div>
						<button
							type='submit'
							disabled={isLoading}
							className='group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg'
						>
							{isLoading ? (
								<>
									<Loader2 className='h-5 w-5 animate-spin mr-2' />
									Creating your account...
								</>
							) : (
								<>
									<Sparkles className='h-5 w-5 mr-2' />
									Start Creating for Free
								</>
							)}
						</button>
					</div>

					<div className='mt-6'>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-300' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-gray-50 text-gray-500'>Or continue with</span>
							</div>
						</div>

						<div className='mt-6'>
							<a
								href={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:4001'}/api/auth/google`}
								className='w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
							>
								<svg className='w-5 h-5' viewBox='0 0 24 24'>
									<path
										fill='currentColor'
										d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
									/>
									<path
										fill='currentColor'
										d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
									/>
									<path
										fill='currentColor'
										d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
									/>
									<path
										fill='currentColor'
										d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
									/>
								</svg>
								<span className='ml-2'>Sign up with Google</span>
							</a>
						</div>
					</div>

					{/* Trust indicators */}
					<div className='text-center space-y-3'>
						<div className='flex items-center justify-center gap-4 text-xs text-gray-500'>
							<div className='flex items-center gap-1'>
								<CheckCircle className='h-3 w-3 text-green-500' />
								<span>No credit card required</span>
							</div>
							<div className='flex items-center gap-1'>
								<CheckCircle className='h-3 w-3 text-green-500' />
								<span>5 free blog posts</span>
							</div>
						</div>
						<p className='text-xs text-gray-500'>
							By signing up, you agree to our Terms of Service and Privacy Policy
						</p>
					</div>
				</form>

				{/* Value props at bottom with centered text */}
				<div className='mt-8 bg-white rounded-xl p-6 shadow-lg'>
					<h3 className='font-bold text-gray-900 mb-4 text-center'>Why creators love YTtoText:</h3>
					<div className='space-y-3 text-sm text-center'>
						<div className='flex items-center justify-center gap-2'>
							<CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
							<span>Transform videos to blogs in under 5 minutes</span>
						</div>
						<div className='flex items-center justify-center gap-2'>
							<CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
							<span>20+ AI models for perfect content every time</span>
						</div>
						<div className='flex items-center justify-center gap-2'>
							<CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
							<span>Export to WordPress, Medium, and more</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
