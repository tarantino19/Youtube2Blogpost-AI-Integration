import { Link } from 'react-router-dom';
import { ArrowRight, Zap, FileText, Brain, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function HomePage() {
	const { user } = useAuth();

	return (
		<div className='flex flex-col'>
			{/* Hero Section */}
			<section className='bg-gradient-to-b from-gray-50 to-white py-20'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center'>
						<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
							Transform YouTube Videos into
							<span className='text-red-600'> Blog Posts</span>
						</h1>
						<p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
							Leverage AI to convert any YouTube video into well-structured, SEO-optimized blog content in minutes.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							{user ? (
								<Link
									to='/process'
									className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
								>
									Process a Video
									<ArrowRight className='ml-2 h-5 w-5' />
								</Link>
							) : (
								<>
									<Link
										to='/register'
										className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
									>
										Get Started Free
										<ArrowRight className='ml-2 h-5 w-5' />
									</Link>
									<Link
										to='/login'
										className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
									>
										Sign In
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 bg-white'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold text-gray-900 mb-4'>Everything You Need to Create Amazing Content</h2>
						<p className='text-xl text-gray-600'>Powerful features to help you convert videos into engaging blog posts</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						<div className='text-center'>
							<div className='bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
								<Zap className='h-8 w-8 text-red-600' />
							</div>
							<h3 className='text-lg font-semibold mb-2'>Lightning Fast</h3>
							<p className='text-gray-600'>Convert videos to blog posts in minutes, not hours</p>
						</div>

						<div className='text-center'>
							<div className='bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
								<Brain className='h-8 w-8 text-red-600' />
							</div>
							<h3 className='text-lg font-semibold mb-2'>AI-Powered</h3>
							<p className='text-gray-600'>Advanced AI creates structured, engaging content</p>
						</div>

						<div className='text-center'>
							<div className='bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
								<FileText className='h-8 w-8 text-red-600' />
							</div>
							<h3 className='text-lg font-semibold mb-2'>SEO Optimized</h3>
							<p className='text-gray-600'>Generated content is optimized for search engines</p>
						</div>

						<div className='text-center'>
							<div className='bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
								<Download className='h-8 w-8 text-red-600' />
							</div>
							<h3 className='text-lg font-semibold mb-2'>Export Options</h3>
							<p className='text-gray-600'>Export to Markdown, HTML, or PDF formats</p>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='py-20 bg-gray-50'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl font-bold text-gray-900 mb-4'>How It Works</h2>
						<p className='text-xl text-gray-600'>Three simple steps to transform your videos</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						<div className='text-center'>
							<div className='bg-white rounded-lg shadow-sm p-8'>
								<div className='text-3xl font-bold text-red-600 mb-4'>1</div>
								<h3 className='text-xl font-semibold mb-2'>Paste YouTube URL</h3>
								<p className='text-gray-600'>Simply paste the URL of any YouTube video you want to convert</p>
							</div>
						</div>

						<div className='text-center'>
							<div className='bg-white rounded-lg shadow-sm p-8'>
								<div className='text-3xl font-bold text-red-600 mb-4'>2</div>
								<h3 className='text-xl font-semibold mb-2'>AI Processing</h3>
								<p className='text-gray-600'>Our AI analyzes the video and generates structured content</p>
							</div>
						</div>

						<div className='text-center'>
							<div className='bg-white rounded-lg shadow-sm p-8'>
								<div className='text-3xl font-bold text-red-600 mb-4'>3</div>
								<h3 className='text-xl font-semibold mb-2'>Edit & Export</h3>
								<p className='text-gray-600'>Review, edit, and export your blog post in your preferred format</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			{!user && (
				<section className='py-20 bg-red-600'>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
						<h2 className='text-3xl font-bold text-white mb-4'>Ready to Start Creating?</h2>
						<p className='text-xl text-red-100 mb-8'>Join thousands of content creators using YTtoText</p>
						<Link
							to='/register'
							className='inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-red-600 bg-white hover:bg-gray-100'
						>
							Get Started Free
							<ArrowRight className='ml-2 h-5 w-5' />
						</Link>
					</div>
				</section>
			)}
		</div>
	);
}
