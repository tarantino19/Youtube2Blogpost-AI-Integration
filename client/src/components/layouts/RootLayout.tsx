import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Youtube, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';
import { CreditsIndicator } from '@/components/CreditsIndicator';

export function RootLayout() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<nav className='bg-white shadow-sm border-b'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16'>
						<div className='flex items-center'>
							<Link to='/' className='flex items-center space-x-2'>
								<Youtube className='h-8 w-8 text-red-600' />
								<span className='font-bold text-xl text-gray-900'>YTtoText</span>
							</Link>

							<div className='hidden md:ml-10 md:flex md:space-x-8'>
								<Link to='/' className='text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
									Home
								</Link>
								{user && (
									<>
										<Link to='/dashboard' className='text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
											Dashboard
										</Link>
										<Link to='/process' className='text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
											Process Video
										</Link>
										<Link to='/posts' className='text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
											My Posts
										</Link>
									</>
								)}
							</div>
						</div>

						<div className='hidden md:flex items-center space-x-4'>
							{user ? (
								<div className='flex items-center space-x-4'>
									<CreditsIndicator />
									<Link
										to='/profile'
										className='flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium'
									>
										<User className='h-4 w-4' />
										<span>Profile</span>
									</Link>
									<div className='flex items-center space-x-2'>
										<span className='text-sm text-gray-700'>{user.name}</span>
									</div>
									<button
										onClick={handleLogout}
										className='flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium'
									>
										<LogOut className='h-4 w-4' />
										<span>Logout</span>
									</button>
								</div>
							) : (
								<>
									<Link to='/login' className='text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
										Login
									</Link>
									<Link
										to='/register'
										className='bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium'
									>
										Get Started
									</Link>
								</>
							)}
						</div>

						<div className='md:hidden flex items-center'>
							<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='text-gray-700 hover:text-gray-900 p-2'>
								{isMobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile menu */}
				<div className={cn('md:hidden', isMobileMenuOpen ? 'block' : 'hidden')}>
					<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
						<Link
							to='/'
							className='block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
						>
							Home
						</Link>
						{user && (
							<>
								<Link
									to='/dashboard'
									className='block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
								>
									Dashboard
								</Link>
								<Link
									to='/profile'
									className='block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
								>
									Profile
								</Link>
								<Link
									to='/process'
									className='block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
								>
									Process Video
								</Link>
								<Link
									to='/posts'
									className='block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
								>
									My Posts
								</Link>
							</>
						)}
						{user ? (
							<button
								onClick={handleLogout}
								className='w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
							>
								Logout
							</button>
						) : (
							<>
								<Link
									to='/login'
									className='block text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
								>
									Login
								</Link>
								<Link
									to='/register'
									className='block bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-base font-medium'
								>
									Get Started
								</Link>
							</>
						)}
					</div>
				</div>
			</nav>

			<main>
				<Outlet />
			</main>

			<footer className='bg-white border-t mt-auto'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<div className='text-center text-sm text-gray-600'>© 2025 YTtoText. All rights reserved.</div>
				</div>
			</footer>
		</div>
	);
}
