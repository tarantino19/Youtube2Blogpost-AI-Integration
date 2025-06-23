import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import { Link } from 'react-router-dom';
import { FileText, Video, Clock, TrendingUp } from 'lucide-react';

export function DashboardPage() {
	const { user } = useAuth();

	const { data: posts = [] } = useQuery({
		queryKey: ['posts'],
		queryFn: postService.getPosts,
	});

	// Ensure posts is always an array
	const postsArray = Array.isArray(posts) ? posts : [];

	const stats = {
		totalPosts: postsArray.length,
		totalWords: postsArray.reduce((acc, post) => acc + (post.generatedContent?.content?.split(' ').length || 0), 0),
		averageProcessingTime: '2.5 minutes',
		creditsRemaining: user?.subscription?.creditsRemaining || 0,
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900'>Welcome back, {user?.name}!</h1>
				<p className='mt-2 text-gray-600'>Here's an overview of your content creation activity</p>
			</div>

			{/* Stats Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<div className='bg-white rounded-lg shadow p-6'>
					<div className='flex items-center'>
						<div className='bg-red-100 rounded-full p-3'>
							<FileText className='h-6 w-6 text-red-600' />
						</div>
						<div className='ml-4'>
							<p className='text-sm text-gray-600'>Total Posts</p>
							<p className='text-2xl font-semibold text-gray-900'>{stats.totalPosts}</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-lg shadow p-6'>
					<div className='flex items-center'>
						<div className='bg-blue-100 rounded-full p-3'>
							<TrendingUp className='h-6 w-6 text-blue-600' />
						</div>
						<div className='ml-4'>
							<p className='text-sm text-gray-600'>Total Words</p>
							<p className='text-2xl font-semibold text-gray-900'>{stats.totalWords.toLocaleString()}</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-lg shadow p-6'>
					<div className='flex items-center'>
						<div className='bg-green-100 rounded-full p-3'>
							<Clock className='h-6 w-6 text-green-600' />
						</div>
						<div className='ml-4'>
							<p className='text-sm text-gray-600'>Avg. Processing</p>
							<p className='text-2xl font-semibold text-gray-900'>{stats.averageProcessingTime}</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-lg shadow p-6'>
					<div className='flex items-center'>
						<div className='bg-purple-100 rounded-full p-3'>
							<Video className='h-6 w-6 text-purple-600' />
						</div>
						<div className='ml-4'>
							<p className='text-sm text-gray-600'>Credits Left</p>
							<p className='text-2xl font-semibold text-gray-900'>{stats.creditsRemaining}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className='bg-white rounded-lg shadow p-6 mb-8'>
				<h2 className='text-xl font-semibold text-gray-900 mb-4'>Quick Actions</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<Link
						to='/process'
						className='flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
					>
						Process New Video
					</Link>
					<Link
						to='/posts'
						className='flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
					>
						View All Posts
					</Link>
					<button className='flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
						Upgrade Plan
					</button>
				</div>
			</div>

			{/* Recent Posts */}
			<div className='bg-white rounded-lg shadow'>
				<div className='p-6 border-b'>
					<h2 className='text-xl font-semibold text-gray-900'>Recent Posts</h2>
				</div>
				<div className='divide-y divide-gray-200'>
					{postsArray.slice(0, 5).map((post) => (
						<Link key={post._id} to={`/posts/${post._id}`} className='block p-6 hover:bg-gray-50 transition-colors'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<h3 className='text-lg font-medium text-gray-900'>{post.generatedContent?.title || post.videoTitle}</h3>
									<p className='mt-1 text-sm text-gray-600'>{post.generatedContent?.summary?.substring(0, 150)}...</p>
									<div className='mt-2 flex items-center text-sm text-gray-500'>
										<span>{new Date(post.createdAt).toLocaleDateString()}</span>
										<span className='mx-2'>•</span>
										<span>{post.generatedContent?.content?.split(' ').length || 0} words</span>
									</div>
								</div>
								{post.videoThumbnail && (
									<img src={post.videoThumbnail} alt={post.videoTitle} className='ml-4 h-20 w-32 object-cover rounded' />
								)}
							</div>
						</Link>
					))}
				</div>
				{postsArray.length > 5 && (
					<div className='p-4 text-center'>
						<Link to='/posts' className='text-sm text-red-600 hover:text-red-700 font-medium'>
							View all posts →
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
