import { useQuery } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Clock, Search } from 'lucide-react';
import { useState } from 'react';

export function BlogPostsPage() {
	const [searchTerm, setSearchTerm] = useState('');

	const { data: posts = [], isLoading } = useQuery({
		queryKey: ['posts'],
		queryFn: postService.getPosts,
	});

	// Ensure posts is always an array
	const postsArray = Array.isArray(posts) ? posts : [];

	const filteredPosts = postsArray.filter((post) => {
		const title = post.generatedContent?.title || post.videoTitle || '';
		const content = post.generatedContent?.content || '';
		const searchLower = searchTerm.toLowerCase();
		return title.toLowerCase().includes(searchLower) || content.toLowerCase().includes(searchLower);
	});

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<div className='text-center'>
					<FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
					<p className='text-gray-600'>Loading your posts...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 mb-4'>My Blog Posts</h1>

				{/* Search Bar */}
				<div className='relative max-w-md'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Search className='h-5 w-5 text-gray-400' />
					</div>
					<input
						type='text'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder='Search posts...'
						className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500'
					/>
				</div>
			</div>

			{filteredPosts.length === 0 ? (
				<div className='bg-white rounded-lg shadow p-12 text-center'>
					<FileText className='h-16 w-16 text-gray-400 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 mb-2'>{searchTerm ? 'No posts found' : 'No blog posts yet'}</h2>
					<p className='text-gray-600 mb-6'>
						{searchTerm ? 'Try adjusting your search terms' : 'Start by processing your first YouTube video'}
					</p>
					{!searchTerm && (
						<Link
							to='/process'
							className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
						>
							Process Your First Video
						</Link>
					)}
				</div>
			) : (
				<div className='grid gap-6'>
					{filteredPosts.map((post) => (
						<div key={post._id} className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow'>
							<Link to={`/posts/${post._id}`} className='block p-6'>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<h2 className='text-xl font-semibold text-gray-900 mb-2'>
											{post.generatedContent?.title || post.videoTitle}
										</h2>

										<p className='text-gray-600 mb-4 line-clamp-2'>
											{post.generatedContent?.summary ||
												post.generatedContent?.content?.substring(0, 200) ||
												'No summary available'}
											...
										</p>

										<div className='flex items-center space-x-4 text-sm text-gray-500'>
											<div className='flex items-center'>
												<Calendar className='h-4 w-4 mr-1' />
												{new Date(post.createdAt).toLocaleDateString()}
											</div>
											<div className='flex items-center'>
												<Clock className='h-4 w-4 mr-1' />
												{post.generatedContent?.content?.split(' ').length || 0} words
											</div>
											<div
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													post.status === 'completed'
														? 'bg-green-100 text-green-800'
														: post.status === 'processing'
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-red-100 text-red-800'
												}`}
											>
												{post.status}
											</div>
										</div>

										{post.generatedContent?.tags && post.generatedContent.tags.length > 0 && (
											<div className='mt-3 flex flex-wrap gap-2'>
												{post.generatedContent.tags.slice(0, 5).map((tag, index) => (
													<span
														key={index}
														className='inline-block px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full'
													>
														{tag}
													</span>
												))}
											</div>
										)}
									</div>

									{post.videoThumbnail && (
										<img
											src={post.videoThumbnail}
											alt={post.videoTitle}
											className='ml-6 w-32 h-20 object-cover rounded-lg flex-shrink-0'
										/>
									)}
								</div>
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
