import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export function ErrorPage() {
	const error = useRouteError() as any;

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-md'>
				<div className='text-center'>
					<AlertTriangle className='mx-auto h-16 w-16 text-red-600' />
					<h1 className='mt-4 text-3xl font-bold text-gray-900'>
						{error?.status === 404 ? 'Page Not Found' : 'Oops! Something went wrong'}
					</h1>
					<p className='mt-2 text-gray-600'>
						{error?.status === 404
							? "The page you're looking for doesn't exist."
							: error?.statusText || error?.message || 'An unexpected error occurred.'}
					</p>

					<div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
						<Link
							to='/'
							className='inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
						>
							<Home className='h-4 w-4 mr-2' />
							Go to Homepage
						</Link>
						<button
							onClick={() => window.history.back()}
							className='inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
						>
							Go Back
						</button>
					</div>
				</div>

				{process.env.NODE_ENV === 'development' && error?.stack && (
					<div className='mt-8'>
						<details className='bg-gray-100 p-4 rounded-lg'>
							<summary className='cursor-pointer text-sm font-medium text-gray-700'>Error Details (Development Only)</summary>
							<pre className='mt-2 text-xs text-gray-600 overflow-auto'>{error.stack}</pre>
						</details>
					</div>
				)}
			</div>
		</div>
	);
}
