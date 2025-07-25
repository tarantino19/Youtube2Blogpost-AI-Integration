import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
	ArrowRight, 
	Users, 
	Video, 
	Clock, 
	FileText, 
	BookOpen,
	TrendingUp,
	Star,
	Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PublicStats } from '@/types';
import { getPublicStats } from '@/services/publicService';

export function LandingPage() {
	const { user } = useAuth();
	const [stats, setStats] = useState<PublicStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const data = await getPublicStats();
				setStats(data);
			} catch (error) {
				console.error('Failed to fetch stats:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
		
		// Refresh stats every 30 seconds
		const interval = setInterval(fetchStats, 30000);
		return () => clearInterval(interval);
	}, []);

	const formatNumber = (num: number) => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	};

	return (
		<div className="flex flex-col">
			{/* Hero Section with Live Metrics */}
			<section className="bg-gradient-to-b from-red-50 to-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
							Turn YouTube Videos into
							<span className="text-red-600"> High-Converting</span> Blog Posts
						</h1>
						<p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
							Join {stats ? formatNumber(stats.totalUsers) : '...'} content creators who've transformed {stats ? formatNumber(stats.totalVideosProcessed) : '...'} videos into engaging blog content using AI
						</p>

						{/* Live Metrics Bar */}
						{!loading && stats && (
							<div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-4xl mx-auto">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
									<div>
										<div className="text-2xl font-bold text-red-600">{formatNumber(stats.totalUsers)}</div>
										<div className="text-sm text-gray-600">Active Users</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-red-600">{formatNumber(stats.totalVideosProcessed)}</div>
										<div className="text-sm text-gray-600">Videos Processed</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-red-600">{formatNumber(stats.totalMinutesProcessed)}</div>
										<div className="text-sm text-gray-600">Minutes Converted</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-red-600">{stats.successRate}%</div>
										<div className="text-sm text-gray-600">Success Rate</div>
									</div>
								</div>
							</div>
						)}

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							{user ? (
								<Link
									to="/process"
									className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
								>
									Start Converting Videos
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							) : (
								<>
									<Link
										to="/register"
										className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
									>
										Start Free Trial
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
									<Link
										to="/login"
										className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
									>
										Sign In
									</Link>
								</>
							)}
						</div>
						
						<p className="text-sm text-gray-500 mt-4">Free plan available • No credit card required</p>
					</div>
				</div>
			</section>

			{/* Social Proof Section */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted by Content Creators Worldwide</h2>
						<p className="text-lg sm:text-xl text-gray-600">See what our community has accomplished</p>
					</div>

					{!loading && stats && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
							<div className="bg-white rounded-lg p-6 text-center shadow-sm">
								<div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
									<FileText className="h-8 w-8 text-red-600" />
								</div>
								<div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(stats.totalWordsGenerated)}</div>
								<div className="text-gray-600">Words Generated</div>
								<div className="text-sm text-gray-500 mt-2">Equivalent to {Math.round(stats.totalWordsGenerated / 1000)} full articles</div>
							</div>

							<div className="bg-white rounded-lg p-6 text-center shadow-sm">
								<div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
									<BookOpen className="h-8 w-8 text-red-600" />
								</div>
								<div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(stats.totalReadingHours)}</div>
								<div className="text-gray-600">Reading Hours Created</div>
								<div className="text-sm text-gray-500 mt-2">Content that keeps audiences engaged</div>
							</div>

							<div className="bg-white rounded-lg p-6 text-center shadow-sm">
								<div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
									<TrendingUp className="h-8 w-8 text-red-600" />
								</div>
								<div className="text-3xl font-bold text-gray-900 mb-2">{stats.successRate}%</div>
								<div className="text-gray-600">Success Rate</div>
								<div className="text-sm text-gray-500 mt-2">Reliable AI-powered conversion</div>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* Problem/Solution Section */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">Stop Spending Hours Writing Blog Posts From Scratch</h2>
							<div className="space-y-4 mb-8">
								<div className="flex items-start">
									<div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
										<div className="w-2 h-2 bg-red-600 rounded-full"></div>
									</div>
									<div className="ml-3 text-gray-600">
										Content creators waste 6+ hours per blog post researching, writing, and optimizing
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
										<div className="w-2 h-2 bg-red-600 rounded-full"></div>
									</div>
									<div className="ml-3 text-gray-600">
										Writer's block and blank page syndrome kill productivity
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
										<div className="w-2 h-2 bg-red-600 rounded-full"></div>
									</div>
									<div className="ml-3 text-gray-600">
										Existing content on YouTube isn't being leveraged for blog traffic
									</div>
								</div>
							</div>
						</div>
						<div>
							<div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-8 text-white">
								<h3 className="text-2xl font-bold mb-4">The Solution: AI-Powered Content Conversion</h3>
								<ul className="space-y-3">
									<li className="flex items-center">
										<Check className="h-5 w-5 mr-3 flex-shrink-0" />
										<span>Convert any YouTube video in under 5 minutes</span>
									</li>
									<li className="flex items-center">
										<Check className="h-5 w-5 mr-3 flex-shrink-0" />
										<span>20+ AI models from 8 different providers</span>
									</li>
									<li className="flex items-center">
										<Check className="h-5 w-5 mr-3 flex-shrink-0" />
										<span>SEO-optimized, structured blog posts</span>
									</li>
									<li className="flex items-center">
										<Check className="h-5 w-5 mr-3 flex-shrink-0" />
										<span>Export to multiple formats instantly</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
						<p className="text-lg sm:text-xl text-gray-600">Three simple steps to transform videos into blog posts</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
						<div className="text-center relative">
							<div className="flex items-center justify-center w-20 h-20 bg-red-600 text-white rounded-full mx-auto mb-6 text-xl font-bold shadow-lg">
								1
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Paste YouTube URL</h3>
							<p className="text-gray-600 leading-relaxed">Simply copy and paste any YouTube video URL into our platform</p>
							{/* Connector line - hidden on mobile */}
							<div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-red-200 transform -translate-x-1/2"></div>
						</div>

						<div className="text-center relative">
							<div className="flex items-center justify-center w-20 h-20 bg-red-600 text-white rounded-full mx-auto mb-6 text-xl font-bold shadow-lg">
								2
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">AI Processes Content</h3>
							<p className="text-gray-600 leading-relaxed">Our AI extracts, structures, and optimizes the content for blog format</p>
							{/* Connector line - hidden on mobile */}
							<div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-red-200 transform -translate-x-1/2"></div>
						</div>

						<div className="text-center">
							<div className="flex items-center justify-center w-20 h-20 bg-red-600 text-white rounded-full mx-auto mb-6 text-xl font-bold shadow-lg">
								3
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">Export & Publish</h3>
							<p className="text-gray-600 leading-relaxed">Download your SEO-optimized blog post and publish anywhere</p>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Tease */}
			<section className="py-20 bg-white">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Start Free, Scale as You Grow</h2>
					<p className="text-lg sm:text-xl text-gray-600 mb-8">Choose the plan that fits your content creation needs</p>
					
					<div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-8 mb-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
							<div>
								<div className="text-2xl font-bold text-red-600">Free Plan</div>
								<div className="text-gray-600">2 videos/month</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-red-600">Basic Plan</div>
								<div className="text-gray-600">15 videos/month</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-red-600">Pro Plan</div>
								<div className="text-gray-600">Unlimited videos</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						{user ? (
							<Link
								to="/process"
								className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
							>
								Start Converting Now
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						) : (
							<Link
								to="/register"
								className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
							>
								Start Your Free Trial
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						)}
						<Link
							to="/upgrade"
							className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
						>
							View All Plans
						</Link>
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Content Strategy?</h2>
					<p className="text-lg sm:text-xl text-red-100 mb-8">
						Join thousands of creators who've revolutionized their content workflow
					</p>
					
					{!loading && stats && (
						<div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 mb-8 text-red-100">
							<div className="text-center">
								<span className="block text-2xl sm:text-3xl font-bold text-white">{formatNumber(stats.totalUsers)}</span>
								<div className="text-sm sm:text-base">Happy Users</div>
							</div>
							<div className="text-center">
								<span className="block text-2xl sm:text-3xl font-bold text-white">{stats.successRate}%</span>
								<div className="text-sm sm:text-base">Success Rate</div>
							</div>
							<div className="text-center">
								<span className="block text-2xl sm:text-3xl font-bold text-white">{formatNumber(stats.totalVideosProcessed)}</span>
								<div className="text-sm sm:text-base">Videos Converted</div>
							</div>
						</div>
					)}

					{user ? (
						<Link
							to="/process"
							className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 transition-colors"
						>
							Process Your First Video
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>
					) : (
						<Link
							to="/register"
							className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 transition-colors"
						>
							Get Started Free Today
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>
					)}
					
					<p className="text-red-100 text-sm mt-4">No credit card required • Cancel anytime</p>
				</div>
			</section>
		</div>
	);
}