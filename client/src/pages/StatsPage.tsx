import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, FileText, Clock, Calendar } from 'lucide-react';

interface PostStats {
	totalPosts: number;
	totalWords: number;
	totalReadingTime: number;
	averageWordsPerPost: number;
	postsThisMonth: number;
	postsThisWeek: number;
	statusBreakdown: {
		completed: number;
		processing: number;
		failed: number;
	};
	monthlyData: Array<{
		month: string;
		posts: number;
		words: number;
	}>;
}

export const StatsPage = () => {
	const [stats, setStats] = useState<PostStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const response = await api.get('/posts/stats');
			setStats(response.data);
		} catch (error) {
			console.error('Failed to fetch stats:', error);
			setError('Failed to load statistics');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading statistics...</p>
				</div>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-red-600'>{error || 'Failed to load statistics'}</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900'>Analytics & Statistics</h1>
					<p className='mt-2 text-gray-600'>Track your content creation progress and insights</p>
				</div>

				{/* Overview Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
					<div className='bg-white rounded-lg shadow p-6'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<FileText className='h-8 w-8 text-blue-600' />
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-500'>Total Posts</p>
								<p className='text-2xl font-semibold text-gray-900'>{stats.totalPosts}</p>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-lg shadow p-6'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<BarChart3 className='h-8 w-8 text-green-600' />
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-500'>Total Words</p>
								<p className='text-2xl font-semibold text-gray-900'>{stats.totalWords.toLocaleString()}</p>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-lg shadow p-6'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<Clock className='h-8 w-8 text-purple-600' />
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-500'>Reading Time</p>
								<p className='text-2xl font-semibold text-gray-900'>{stats.totalReadingTime} min</p>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-lg shadow p-6'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<TrendingUp className='h-8 w-8 text-orange-600' />
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-500'>Avg Words/Post</p>
								<p className='text-2xl font-semibold text-gray-900'>{Math.round(stats.averageWordsPerPost)}</p>
							</div>
						</div>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Recent Activity */}
					<div className='bg-white rounded-lg shadow'>
						<div className='px-6 py-4 border-b border-gray-200'>
							<h2 className='text-lg font-semibold text-gray-900'>Recent Activity</h2>
						</div>
						<div className='p-6'>
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<Calendar className='h-5 w-5 text-gray-400 mr-3' />
										<span className='text-sm text-gray-600'>Posts this week</span>
									</div>
									<span className='text-sm font-semibold text-gray-900'>{stats.postsThisWeek}</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<Calendar className='h-5 w-5 text-gray-400 mr-3' />
										<span className='text-sm text-gray-600'>Posts this month</span>
									</div>
									<span className='text-sm font-semibold text-gray-900'>{stats.postsThisMonth}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Status Breakdown */}
					<div className='bg-white rounded-lg shadow'>
						<div className='px-6 py-4 border-b border-gray-200'>
							<h2 className='text-lg font-semibold text-gray-900'>Post Status</h2>
						</div>
						<div className='p-6'>
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
										<span className='text-sm text-gray-600'>Completed</span>
									</div>
									<span className='text-sm font-semibold text-gray-900'>{stats.statusBreakdown.completed}</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<div className='w-3 h-3 bg-yellow-500 rounded-full mr-3'></div>
										<span className='text-sm text-gray-600'>Processing</span>
									</div>
									<span className='text-sm font-semibold text-gray-900'>{stats.statusBreakdown.processing}</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center'>
										<div className='w-3 h-3 bg-red-500 rounded-full mr-3'></div>
										<span className='text-sm text-gray-600'>Failed</span>
									</div>
									<span className='text-sm font-semibold text-gray-900'>{stats.statusBreakdown.failed}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Monthly Trend */}
				{stats.monthlyData && stats.monthlyData.length > 0 && (
					<div className='mt-8 bg-white rounded-lg shadow'>
						<div className='px-6 py-4 border-b border-gray-200'>
							<h2 className='text-lg font-semibold text-gray-900'>Monthly Trends</h2>
						</div>
						<div className='p-6'>
							<div className='overflow-x-auto'>
								<table className='min-w-full divide-y divide-gray-200'>
									<thead className='bg-gray-50'>
										<tr>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Month</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Posts</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Words</th>
										</tr>
									</thead>
									<tbody className='bg-white divide-y divide-gray-200'>
										{stats.monthlyData.map((month, index) => (
											<tr key={index}>
												<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{month.month}</td>
												<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{month.posts}</td>
												<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{month.words.toLocaleString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
