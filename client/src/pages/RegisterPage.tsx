import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User } from 'lucide-react';

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
		<div className='min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Create your account</h2>
					<p className='mt-2 text-center text-sm text-gray-600'>
						Or{' '}
						<Link to='/login' className='font-medium text-red-600 hover:text-red-500'>
							sign in to existing account
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
							className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : 'Create account'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
