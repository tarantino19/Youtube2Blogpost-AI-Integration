import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import { Link } from 'react-router-dom';
import { FileText, Video, Clock, TrendingUp, AlertTriangle, ChevronRight, Star, Zap, DollarSign, Eye } from 'lucide-react';
import { useState } from 'react';

export function DashboardPage() {
	const { user } = useAuth();
	const [showMiniROI, setShowMiniROI] = useState(false);
	const [roiInputs, setRoiInputs] = useState({
		videosPerMonth: 4,
		avgViewsPerVideo: 5000
	});

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
		creditsTotal: user?.subscription?.plan === 'free' ? 5 : user?.subscription?.plan === 'creator' ? 50 : 500,
		plan: user?.subscription?.plan || 'free',
	};

	// Calculate credit usage as percentage
	const creditUsagePercent = ((stats.creditsTotal - stats.creditsRemaining) / stats.creditsTotal) * 100;
	
	// Calculate estimated ROI
	const calculateROI = () => {
		const { videosPerMonth, avgViewsPerVideo } = roiInputs;
		const blogPostsFromVideos = videosPerMonth * 4; // 4 blog posts per video on average
		const additionalTraffic = blogPostsFromVideos * avgViewsPerVideo * 0.3; // 30% additional traffic from SEO
		const conversionRate = 2; // 2% conversion rate
		const avgOrderValue = 50; // $50 average order value
		const additionalConversions = (additionalTraffic * conversionRate) / 100;
		const additionalRevenue = additionalConversions * avgOrderValue;
		return Math.round(additionalRevenue);
	};

	// Get upgrade incentive message based on credit usage
	const getUpgradeMessage = () => {
		if (stats.plan !== 'free') return null;
		
		if (stats.creditsRemaining <= 1) {
			return {
				title: "You're out of credits!",
				message: "Upgrade now to keep creating content and drive more traffic to your site.",
				severity: "high",
			};
		} else if (stats.creditsRemaining <= 2) {
			return {
				title: "Running low on credits",
				message: "Upgrade to our Creator plan to get 10x more content creation power.",
				severity: "medium",
			};
		} else {
			return {
				title: "Maximize your content strategy",
				message: "Get unlimited access to premium AI models and create 10x more content.",
				severity: "low",
			};
		}
	};

	const upgradeMessage = getUpgradeMessage();

	// Success stories - social proof
	const successStories = [
		{
			name: "Sarah C.",
			result: "+300% traffic",
			quote: "Upgraded last month, now getting 3x more leads from my content"
		},
		{
			name: "Marco R.",
			result: "+$12K revenue",
			quote: "Each video now generates 4 blog posts that bring in new customers"
		}
	];

	// Premium features to preview
	const premiumFeatures = [
		{
			name: "Advanced AI Models",
			description: "Access GPT-4, Claude, and other premium models",
			icon: <Zap className="h-5 w-5 text-yellow-500" />,
			available: stats.plan !== 'free'
		},
		{
			name: "Bulk Processing",
			description: "Process multiple videos in one go",
			icon: <FileText className="h-5 w-5 text-blue-500" />,
			available: stats.plan === 'business' || stats.plan === 'enterprise'
		},
		{
			name: "Priority Processing",
			description: "Skip the queue with high-priority processing",
			icon: <Clock className="h-5 w-5 text-green-500" />,
			available: stats.plan !== 'free'
		}
	];

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			{/* Header Section with Plan Badge */}
			<div className='mb-8 flex justify-between items-start'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900'>Welcome back, {user?.name}!</h1>
					<p className='mt-2 text-gray-600'>Here's an overview of your content creation activity</p>
				</div>
				<div className='flex flex-col items-end'>
					<div className={`px-3 py-1 rounded-full text-sm font-semibold ${
						stats.plan === 'free' ? 'bg-gray-200 text-gray-800' : 
						stats.plan === 'creator' ? 'bg-red-100 text-red-800' :
						stats.plan === 'business' ? 'bg-blue-100 text-blue-800' :
						'bg-purple-100 text-purple-800'
					}`}>
						{stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)} Plan
					</div>
					{stats.plan === 'free' && (
						<Link to="/upgrade" className="text-red-600 text-sm font-medium mt-2 hover:text-red-800">
							Upgrade for 10x more content →
						</Link>
					)}
				</div>
			</div>

			{/* Upgrade Alert for Free Users */}
			{upgradeMessage && (
				<div className={`mb-8 rounded-lg p-4 border ${
					upgradeMessage.severity === 'high' ? 'bg-red-50 border-red-200' :
					upgradeMessage.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
					'bg-blue-50 border-blue-200'
				}`}>
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<AlertTriangle className={`h-5 w-5 mr-3 ${
								upgradeMessage.severity === 'high' ? 'text-red-500' :
								upgradeMessage.severity === 'medium' ? 'text-yellow-500' :
								'text-blue-500'
							}`} />
							<div>
								<h3 className="font-semibold">{upgradeMessage.title}</h3>
								<p className="text-sm">{upgradeMessage.message}</p>
							</div>
						</div>
						<Link
							to="/upgrade"
							className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
								upgradeMessage.severity === 'high' ? 'bg-red-600 hover:bg-red-700' :
								upgradeMessage.severity === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
								'bg-blue-600 hover:bg-blue-700'
							}`}
						>
							Upgrade Now
						</Link>
					</div>
				</div>
			)}

			{/* Stats Grid with Enhanced Credit Visualization */}
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

				{/* Enhanced Credit Visualization */}
				<div className='bg-white rounded-lg shadow p-6'>
					<div className='flex items-center mb-3'>
						<div className='bg-purple-100 rounded-full p-3'>
							<Video className='h-6 w-6 text-purple-600' />
						</div>
						<div className='ml-4'>
							<p className='text-sm text-gray-600'>Credits Left</p>
							<p className='text-2xl font-semibold text-gray-900'>
								{stats.creditsRemaining} <span className="text-sm font-normal text-gray-500">/ {stats.creditsTotal}</span>
							</p>
						</div>
					</div>
					{/* Progress bar for credit usage */}
					<div className="w-full bg-gray-200 rounded-full h-2.5">
						<div 
							className={`h-2.5 rounded-full ${
								creditUsagePercent > 80 ? 'bg-red-600' :
								creditUsagePercent > 50 ? 'bg-yellow-500' :
								'bg-green-500'
							}`}
							style={{ width: `${creditUsagePercent}%` }}>
						</div>
					</div>
					{stats.plan === 'free' && stats.creditsRemaining < 3 && (
						<p className="mt-2 text-sm text-red-600 font-medium">
							Running low! <Link to="/upgrade" className="underline">Upgrade now</Link>
						</p>
					)}
				</div>
			</div>

			{/* Value Comparison + ROI Section for Free Users */}
			{stats.plan === 'free' && (
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
					{/* Value Comparison */}
					<div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Unlock Premium Features</h2>
						<div className="space-y-4">
							{premiumFeatures.map((feature, index) => (
								<div key={index} className="flex items-start">
									<div className="mt-1 mr-4">
										{feature.icon}
									</div>
									<div className="flex-1">
										<div className="flex items-center">
											<h3 className="font-medium text-gray-900">{feature.name}</h3>
											{!feature.available && (
												<span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
													Creator Plan+
												</span>
											)}
										</div>
										<p className="text-sm text-gray-600">{feature.description}</p>
									</div>
									{!feature.available && (
										<Link to="/upgrade" className="text-red-600 hover:text-red-800">
											<ChevronRight className="h-5 w-5" />
										</Link>
									)}
								</div>
							))}
						</div>
						<div className="mt-6">
							<Link
								to="/upgrade"
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
							>
								Compare All Plans
							</Link>
						</div>
					</div>

					{/* Mini ROI Calculator */}
					<div className="lg:col-span-2 bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Calculate Your ROI</h2>
						{!showMiniROI ? (
							<div className="space-y-4">
								<p className="text-sm text-gray-700">
									See how much revenue you could generate by upgrading your plan and creating more content.
								</p>
								<button
									onClick={() => setShowMiniROI(true)}
									className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
								>
									Show ROI Calculator
								</button>
								<div className="pt-2">
									<p className="text-sm font-medium text-gray-900 mb-2">Creator success stories:</p>
									{successStories.map((story, index) => (
										<div key={index} className="flex items-start mb-2">
											<Star className="h-4 w-4 text-yellow-500 mt-1 mr-2" />
											<div>
												<p className="text-sm font-medium">{story.name} • <span className="text-green-600">{story.result}</span></p>
												<p className="text-xs text-gray-600">"{story.quote}"</p>
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Videos you create per month
									</label>
									<input
										type="number"
										value={roiInputs.videosPerMonth}
										onChange={(e) => setRoiInputs({...roiInputs, videosPerMonth: parseInt(e.target.value) || 0})}
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Average views per video
									</label>
									<input
										type="number"
										value={roiInputs.avgViewsPerVideo}
										onChange={(e) => setRoiInputs({...roiInputs, avgViewsPerVideo: parseInt(e.target.value) || 0})}
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
									/>
								</div>
								<div className="bg-white rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-600">Potential monthly revenue:</span>
										<span className="text-2xl font-bold text-green-600">${calculateROI()}</span>
									</div>
									<div className="flex items-center text-xs text-gray-600 mb-1">
										<DollarSign className="h-3 w-3 mr-1" />
										<span>Based on 2% conversion rate, $50 avg order</span>
									</div>
									<div className="flex items-center text-xs text-gray-600">
										<Eye className="h-3 w-3 mr-1" />
										<span>+{Math.round(roiInputs.videosPerMonth * 4 * roiInputs.avgViewsPerVideo * 0.3).toLocaleString()} potential monthly views</span>
									</div>
								</div>
								<Link
									to="/upgrade"
									className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
								>
									Upgrade to Creator Plan
								</Link>
							</div>
						)}
					</div>
				</div>
			)}

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
					{stats.plan === 'free' ? (
						<Link
							to='/upgrade'
							className='flex items-center justify-center px-4 py-3 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100'
						>
							Upgrade Plan
						</Link>
					) : (
						<Link
							to='/stats'
							className='flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
						>
							View Analytics
						</Link>
					)}
				</div>
			</div>

			{/* Recent Posts with Conversion Elements */}
			<div className='bg-white rounded-lg shadow'>
				<div className='p-6 border-b'>
					<div className="flex justify-between items-center">
						<h2 className='text-xl font-semibold text-gray-900'>Recent Posts</h2>
						{stats.plan === 'free' && stats.totalPosts >= 3 && (
							<span className="text-sm text-gray-600">
								<span className="font-medium text-red-600">{Math.min(stats.creditsRemaining, 2)}</span> credits remaining this month
							</span>
						)}
					</div>
				</div>
				<div className='divide-y divide-gray-200'>
					{postsArray.length === 0 ? (
						<div className="p-6 text-center">
							<p className="text-gray-600 mb-4">You haven't created any blog posts yet.</p>
							<Link
								to='/process'
								className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
							>
								Process Your First Video
							</Link>
						</div>
					) : (
						postsArray.slice(0, 5).map((post) => (
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
						))
					)}
				</div>
				{postsArray.length > 5 && (
					<div className='p-4 flex justify-between items-center border-t'>
						<Link to='/posts' className='text-sm text-red-600 hover:text-red-700 font-medium'>
							View all posts →
						</Link>
						{stats.plan === 'free' && (
							<span className="text-xs text-gray-600">
								Upgrade to store unlimited posts in your archive
							</span>
						)}
					</div>
				)}
				{stats.plan === 'free' && postsArray.length > 0 && postsArray.length < 5 && (
					<div className='p-4 text-center border-t'>
						<p className="text-sm text-gray-600 mb-2">
							<span className="font-medium">Pro Tip:</span> The Creator plan lets you create 10x more content
						</p>
						<Link to='/upgrade' className='text-sm text-red-600 hover:text-red-700 font-medium'>
							See upgrade options →
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}