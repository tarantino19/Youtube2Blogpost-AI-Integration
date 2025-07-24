import { useAuth } from '@/contexts/AuthContext';
import {
	Check,
	Star,
	Clock,
	Zap,
	Shield,
	Users,
	Sparkles,
	Target,
	BarChart3,
	Globe,
	ChevronDown,
	DollarSign,
	Timer
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function UpgradePlanPage() {
	const { user } = useAuth();
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
	const [showROICalculator, setShowROICalculator] = useState(false);
	const [showComparison, setShowComparison] = useState(false);
	const [liveStats, setLiveStats] = useState({
		blogPostsToday: 1247,
		activeUsers: 892,
		revenueGenerated: 2847392
	});
	const [roiInputs, setRoiInputs] = useState({
		videosPerMonth: 4,
		avgViewsPerVideo: 10000,
		conversionRate: 2,
		avgOrderValue: 50
	});

	const currentPlan = user?.subscription?.plan || 'free';
	const creditsUsed = 5 - (user?.subscription?.creditsRemaining || 5);

	// Simulate live stats updates
	useEffect(() => {
		const interval = setInterval(() => {
			setLiveStats(prev => ({
				blogPostsToday: prev.blogPostsToday + Math.floor(Math.random() * 3),
				activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
				revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 1000)
			}));
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const getAnnualDiscount = (monthlyPrice: number) => {
		return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
	};

	const plans = [
		{
			id: 'free',
			name: 'Free',
			monthlyPrice: 0,
			annualPrice: 0,
			credits: 5,
			description: 'Perfect for testing the waters',
			badge: null,
			features: [
				'5 blog posts per month',
				'Basic AI models (GPT-3.5)',
				'Standard processing (5-10 min)',
				'Email support',
				'Basic SEO optimization',
				'Export to TXT/MD'
			],
			limitations: [
				'Limited AI model access',
				'Slower processing times',
				'Basic templates only',
				'No priority support'
			],
			cta: 'Current Plan',
			popular: false,
			value: 'Free forever'
		},
		{
			id: 'creator',
			name: 'Creator',
			monthlyPrice: 29,
			annualPrice: getAnnualDiscount(29),
			credits: 50,
			description: 'For serious content creators',
			badge: 'Most Popular',
			features: [
				'50 blog posts per month',
				'Premium AI models (GPT-4, Claude)',
				'Priority processing (2-3 min)',
				'Advanced SEO optimization',
				'Custom templates & styles',
				'Analytics dashboard',
				'Priority email support',
				'Export to multiple formats',
				'API access (basic)',
				'WordPress integration'
			],
			limitations: [],
			cta: 'Start 7-Day Free Trial',
			popular: true,
			value: 'Less than $1 per blog post',
			savings: billingCycle === 'annual' ? 'Save $70/year' : null
		},
		{
			id: 'business',
			name: 'Business',
			monthlyPrice: 99,
			annualPrice: getAnnualDiscount(99),
			credits: 500,
			description: 'For agencies and scaling businesses',
			badge: 'Best Value',
			features: [
				'500 blog posts per month',
				'All premium AI models',
				'Instant processing (<1 min)',
				'Advanced SEO & keyword research',
				'White-label options',
				'Full API access',
				'Team collaboration (5 seats)',
				'Custom integrations',
				'Phone + email support',
				'Content calendar',
				'Bulk processing',
				'A/B testing tools',
				'Custom branding'
			],
			limitations: [],
			cta: 'Start 7-Day Free Trial',
			popular: false,
			value: '20¢ per blog post vs $50+ manual creation',
			savings: billingCycle === 'annual' ? 'Save $238/year' : null
		},
		{
			id: 'enterprise',
			name: 'Enterprise',
			monthlyPrice: 'Custom',
			annualPrice: 'Custom',
			credits: 'Unlimited',
			description: 'For enterprises with massive content needs',
			badge: 'Custom Solutions',
			features: [
				'Unlimited blog posts',
				'Custom AI model training',
				'Dedicated account manager',
				'Custom integrations',
				'SLA guarantees (99.9%)',
				'Advanced analytics',
				'Multi-brand management',
				'Custom workflows',
				'24/7 phone support',
				'Training & onboarding',
				'SAML SSO',
				'Advanced security',
				'Custom contracts'
			],
			limitations: [],
			cta: 'Contact Sales',
			popular: false,
			value: 'Tailored to your needs'
		}
	];

	const calculateROI = () => {
		const { videosPerMonth, avgViewsPerVideo, conversionRate, avgOrderValue } = roiInputs;
		const blogPostsFromVideos = videosPerMonth * 4;
		const additionalTraffic = blogPostsFromVideos * avgViewsPerVideo * 0.3;
		const additionalConversions = (additionalTraffic * conversionRate) / 100;
		const additionalRevenue = additionalConversions * avgOrderValue;
		return Math.round(additionalRevenue);
	};

	const testimonials = [
		{
			name: "Sarah Chen",
			role: "YouTube Creator • 245K Subscribers",
			avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=100&h=100&fit=crop&crop=face",
			content: "YTtoText transformed my content strategy. I went from 12 YouTube videos to 48 SEO-optimized blog posts in one month. The organic traffic boost generated $15,000 in additional course sales.",
			results: "+300% organic traffic",
			metrics: "$15K additional revenue"
		},
		{
			name: "Marcus Rodriguez",
			role: "Digital Marketing Agency Owner",
			avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
			content: "We now offer blog content creation as a premium service to our clients. YTtoText has become our secret weapon for scaling content production without hiring more writers.",
			results: "+$50K monthly revenue",
			metrics: "400% faster delivery"
		},
		{
			name: "Jennifer Walsh",
			role: "Course Creator • 7-Figure Business",
			avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
			content: "Every video I create now becomes 4-5 blog posts automatically. My content reaches 10x more people with zero extra effort. The ROI is incredible.",
			results: "+1000% content output",
			metrics: "Zero extra time investment"
		}
	];

	const competitors = [
		{
			feature: "Processing Speed",
			us: "2-3 minutes",
			competitor1: "15-30 minutes",
			competitor2: "Manual only"
		},
		{
			feature: "AI Models",
			us: "GPT-4, Claude, Gemini",
			competitor1: "GPT-3.5 only",
			competitor2: "No AI"
		},
		{
			feature: "SEO Optimization",
			us: "Advanced + Keywords",
			competitor1: "Basic",
			competitor2: "None"
		},
		{
			feature: "Export Formats",
			us: "10+ formats",
			competitor1: "3 formats",
			competitor2: "Copy/paste"
		},
		{
			feature: "Price per Post",
			us: "$0.58",
			competitor1: "$4.99",
			competitor2: "$50+"
		}
	];

	const getCurrentPrice = (plan: typeof plans[0]) => {
		if (typeof plan.monthlyPrice === 'number' && typeof plan.annualPrice === 'number') {
			return billingCycle === 'monthly'
				? plan.monthlyPrice
				: Math.round(plan.annualPrice / 12);
		}
		return plan.monthlyPrice;
};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
							<Sparkles className="h-4 w-4" />
							<span className="text-sm font-medium">Join 10,000+ creators already scaling their content</span>
						</div>

						<h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
							Turn Every Video Into
							<span className="block text-yellow-300">Revenue-Generating Content</span>
						</h1>

						<p className="text-xl md:text-2xl mb-8 text-red-100 max-w-4xl mx-auto">
							Stop leaving money on the table. Transform your YouTube videos into SEO-optimized blog posts that rank, convert, and scale your business automatically.
						</p>

						{/* Live Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<div className="text-2xl font-bold text-yellow-300">{liveStats.blogPostsToday.toLocaleString()}</div>
								<div className="text-sm text-red-100">Blog posts created today</div>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<div className="text-2xl font-bold text-yellow-300">{liveStats.activeUsers}</div>
								<div className="text-sm text-red-100">Creators online now</div>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<div className="text-2xl font-bold text-yellow-300">${(liveStats.revenueGenerated / 1000).toFixed(0)}K+</div>
								<div className="text-sm text-red-100">Revenue generated this month</div>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-50 transition-all transform hover:scale-105 shadow-lg"
								onClick={() => {/* Handle upgrade click */}}
							>
								🚀 Start Your 7-Day Free Trial
							</button>
							<button
								onClick={() => setShowROICalculator(!showROICalculator)}
								className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-all"
							>
								📊 Calculate Your ROI
							</button>
						</div>

						<p className="text-red-200 text-sm mt-6">
							✅ No credit card required • ✅ Cancel anytime • ✅ 30-day money-back guarantee
						</p>
					</div>
				</div>
			</div>

			{/* Urgency Bar */}
			<div className="bg-yellow-400 text-black py-3">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<p className="font-semibold">
						⚡ Limited Time: Early Bird Pricing - Save 20% on Annual Plans (Ending Soon)
					</p>
				</div>
			</div>

			{/* Current Usage Alert */}
			{currentPlan === 'free' && creditsUsed > 0 && (
				<div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-6">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center">
							<Timer className="h-6 w-6 text-orange-500 mr-3" />
							<div>
								<p className="text-orange-800 font-semibold">
									You've used {creditsUsed} of your 5 free credits this month.
								</p>
								<p className="text-orange-700 text-sm mt-1">
									{creditsUsed >= 4
										? "⚠️ Running low! Upgrade now to keep creating content without interruption."
										: "Upgrade to unlock unlimited content creation and premium features."
									}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Social Proof Bar */}
			<div className="bg-white border-b shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted by Leading Creators & Brands</h3>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
						{[
							"TechCrunch Featured",
							"Product Hunt #1",
							"Creator Economy Top 50",
							"SaaS Tool of the Month"
						].map((badge, index) => (
							<div key={index} className="text-center">
								<div className="bg-gray-100 rounded-lg p-4 mb-2">
									<Star className="h-8 w-8 text-yellow-500 mx-auto" />
								</div>
								<p className="text-sm font-medium text-gray-700">{badge}</p>
							</div>
						))}
					</div>

					<div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 mt-8 pt-6 border-t">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-red-600" />
							<span className="font-semibold">10,000+</span>
							<span>Content Creators</span>
						</div>
						<div className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5 text-red-600" />
							<span className="font-semibold">2.5M+</span>
							<span>Blog Posts Generated</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-red-600" />
							<span className="font-semibold">500K+</span>
							<span>Hours Saved</span>
						</div>
						<div className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-red-600" />
							<span className="font-semibold">$50M+</span>
							<span>Revenue Generated</span>
						</div>
					</div>
				</div>
			</div>

			{/* ROI Calculator */}
			{showROICalculator && (
				<div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">Calculate Your Revenue Potential</h2>
							<p className="text-lg text-gray-600">See how much additional revenue you could generate</p>
						</div>
						<div className="bg-white rounded-xl shadow-xl p-8">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
								<div>
									<h3 className="text-xl font-semibold mb-6 text-gray-900">Your Current Metrics</h3>
									<div className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Videos you create per month
											</label>
											<input
												type="number"
												value={roiInputs.videosPerMonth}
												onChange={(e) => setRoiInputs({...roiInputs, videosPerMonth: parseInt(e.target.value) || 0})}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												placeholder="e.g., 4"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Average views per video
											</label>
											<input
												type="number"
												value={roiInputs.avgViewsPerVideo}
												onChange={(e) => setRoiInputs({...roiInputs, avgViewsPerVideo: parseInt(e.target.value) || 0})}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												placeholder="e.g., 10,000"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Your conversion rate (%)
											</label>
											<input
												type="number"
												step="0.1"
												value={roiInputs.conversionRate}
												onChange={(e) => setRoiInputs({...roiInputs, conversionRate: parseFloat(e.target.value) || 0})}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												placeholder="e.g., 2.0"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Average order value ($)
											</label>
											<input
												type="number"
												value={roiInputs.avgOrderValue}
												onChange={(e) => setRoiInputs({...roiInputs, avgOrderValue: parseInt(e.target.value) || 0})}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												placeholder="e.g., 50"
											/>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-xl font-semibold mb-6 text-gray-900">Your Revenue Potential</h3>
									<div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-8">
										<div className="text-center">
											<div className="text-5xl font-bold text-green-600 mb-4">
												${calculateROI().toLocaleString()}
											</div>
											<div className="text-xl text-green-700 mb-6">
												Additional monthly revenue potential
											</div>
											<div className="space-y-3 text-sm text-green-700 mb-6">
												<div className="flex items-center justify-between">
													<span>Additional blog posts:</span>
													<span className="font-semibold">{roiInputs.videosPerMonth * 4}</span>
												</div>
												<div className="flex items-center justify-between">
													<span>Extra organic traffic:</span>
													<span className="font-semibold">+30% from SEO</span>
												</div>
												<div className="flex items-center justify-between">
													<span>ROI on Creator plan:</span>
													<span className="font-semibold">{calculateROI() > 0 ? Math.round((calculateROI() / 29) * 100) : 0}%</span>
												</div>
											</div>
											<button
												className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
												onClick={() => {/* Handle upgrade */}}
											>
												Start Earning ${calculateROI().toLocaleString()} More Today
											</button>
										</div>
									</div>
									<div className="mt-6 text-xs text-gray-500 text-center">
										* Based on industry averages and customer data. Results may vary.
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Problem/Solution Section */}
			<div className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-6">
							Stop Wasting Your Content's Potential
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Every video you create has the potential to become 4-5 SEO-optimized blog posts.
							While you're creating one piece of content, smart creators are multiplying their reach.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<div>
							<h3 className="text-2xl font-bold text-red-600 mb-8">❌ The Old Way (Manual)</h3>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="bg-red-100 rounded-full p-2 mt-1">
										<Clock className="h-5 w-5 text-red-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">4-6 Hours Per Video</h4>
										<p className="text-gray-600">Manually transcribing, editing, and formatting each video into blog content</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="bg-red-100 rounded-full p-2 mt-1">
										<DollarSign className="h-5 w-5 text-red-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">$50+ Per Blog Post</h4>
										<p className="text-gray-600">Hiring writers or spending your valuable time doing it yourself</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="bg-red-100 rounded-full p-2 mt-1">
										<Target className="h-5 w-5 text-red-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">Inconsistent Quality</h4>
										<p className="text-gray-600">Manual work leads to inconsistent SEO optimization and formatting</p>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-2xl font-bold text-green-600 mb-8">✅ The YTtoText Way</h3>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="bg-green-100 rounded-full p-2 mt-1">
										<Zap className="h-5 w-5 text-green-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">2-3 Minutes Automated</h4>
										<p className="text-gray-600">AI-powered conversion from video to multiple blog posts instantly</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="bg-green-100 rounded-full p-2 mt-1">
										<DollarSign className="h-5 w-5 text-green-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">$0.58 Per Blog Post</h4>
										<p className="text-gray-600">Fraction of the cost with premium AI models and advanced features</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="bg-green-100 rounded-full p-2 mt-1">
										<Star className="h-5 w-5 text-green-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">SEO-Optimized Every Time</h4>
										<p className="text-gray-600">Advanced AI ensures perfect formatting, keywords, and structure</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Pricing Section */}
			<div className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-6">
							Choose Your Content Scaling Plan
						</h2>
						<p className="text-xl text-gray-600 mb-8">
							Start free, scale as you grow. Cancel anytime.
						</p>

						{/* Billing Toggle */}
						<div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border">
							<button
								className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
									billingCycle === 'monthly'
										? 'bg-red-600 text-white shadow-sm'
										: 'text-gray-700 hover:text-gray-900'
								}`}
								onClick={() => setBillingCycle('monthly')}
							>
								Monthly
							</button>
							<button
								className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
									billingCycle === 'annual'
										? 'bg-red-600 text-white shadow-sm'
										: 'text-gray-700 hover:text-gray-900'
								}`}
								onClick={() => setBillingCycle('annual')}
							>
								Annual
								<span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
									Save 20%
								</span>
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{plans.map((plan) => (
							<div
								key={plan.id}
								className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
									plan.popular ? 'ring-2 ring-red-500 transform scale-105' : ''
								} ${currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
							>
								{plan.badge && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center">
										<span className={`px-4 py-1 rounded-full text-sm font-semibold ${
											plan.popular
												? 'bg-red-500 text-white'
												: plan.id === 'business'
												? 'bg-green-500 text-white'
												: 'bg-blue-500 text-white'
										}`}>
											{plan.badge}
										</span>
									</div>
								)}

								<div className="p-8">
									<div className="text-center mb-8">
										<h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
										<div className="mb-2">
											{typeof getCurrentPrice(plan) === 'number' ? (
												<>
													<span className="text-4xl font-bold text-gray-900">
														${getCurrentPrice(plan)}
													</span>
													<span className="text-gray-600">/month</span>
													{billingCycle === 'annual' && (
														<div className="text-sm text-gray-500 mt-1">
															Billed annually (${plan.annualPrice})
														</div>
													)}
												</>
											) : (
												<span className="text-4xl font-bold text-gray-900">{getCurrentPrice(plan)}</span>
											)}
										</div>
										<p className="text-gray-600 text-sm mb-2">{plan.description}</p>
										<p className="text-green-600 text-sm font-semibold">{plan.value}</p>
										{plan.savings && billingCycle === 'annual' && (
											<p className="text-green-600 text-sm font-medium mt-1">{plan.savings}</p>
										)}
									</div>

									<div className="text-center mb-6">
										<div className="bg-gray-50 rounded-lg p-4">
											<span className="text-3xl font-bold text-red-600">{plan.credits}</span>
											<span className="text-gray-600 ml-1 block text-sm">credits/month</span>
										</div>
									</div>

									<ul className="space-y-3 mb-8">
										{plan.features.map((feature, index) => (
											<li key={index} className="flex items-start">
												<Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
												<span className="text-gray-700 text-sm">{feature}</span>
											</li>
										))}
									</ul>

									<button
										className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
											currentPlan === plan.id
												? 'bg-gray-100 text-gray-500 cursor-not-allowed'
												: plan.popular
												? 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
												: 'bg-gray-900 text-white hover:bg-gray-800'
										}`}
										disabled={currentPlan === plan.id}
										onClick={() => {/* Handle plan selection */}}
									>
										{currentPlan === plan.id ? 'Current Plan' : plan.cta}
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="text-center mt-12">
						<div className="bg-white rounded-lg shadow-sm p-6 inline-block">
							<p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
								<Shield className="h-5 w-5 text-green-500" />
								30-day money-back guarantee • Cancel anytime • No setup fees
							</p>
							<div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
								<span className="flex items-center gap-1">
									<Users className="h-4 w-4" />
									Trusted by 10,000+ creators
								</span>
								<span>•</span>
								<span className="flex items-center gap-1">
									<Shield className="h-4 w-4" />
									99.9% uptime SLA
								</span>
								<span>•</span>
								<span className="flex items-center gap-1">
									<Star className="h-4 w-4" />
									4.9/5 customer rating
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Comparison Table */}
			<div className="py-20 bg-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-6">
							How We Compare to Alternatives
						</h2>
						<button
							onClick={() => setShowComparison(!showComparison)}
							className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
						>
							{showComparison ? 'Hide' : 'Show'} Detailed Comparison
							<ChevronDown className={`h-4 w-4 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
						</button>
					</div>

					{showComparison && (
						<div className="bg-gray-50 rounded-xl p-8">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
											<th className="text-center py-4 px-4 font-semibold text-red-600 bg-red-50 rounded-t-lg">
												YTtoText
											</th>
											<th className="text-center py-4 px-4 font-semibold text-gray-600">Competitor A</th>
											<th className="text-center py-4 px-4 font-semibold text-gray-600">Manual Process</th>
										</tr>
									</thead>
									<tbody>
										{competitors.map((row, index) => (
											<tr key={index} className="border-b border-gray-100">
												<td className="py-4 px-4 font-medium text-gray-900">{row.feature}</td>
												<td className="py-4 px-4 text-center bg-red-50 font-semibold text-red-600">
													{row.us}
												</td>
												<td className="py-4 px-4 text-center text-gray-600">{row.competitor1}</td>
												<td className="py-4 px-4 text-center text-gray-600">{row.competitor2}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Enhanced Testimonials */}
			<div className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-6">
							Real Results from Real Creators
						</h2>
						<p className="text-xl text-gray-600">
							Join thousands who've already transformed their content strategy
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8">
								<div className="flex items-center mb-6">
									<img
										src={testimonial.avatar}
										alt={testimonial.name}
										className="w-16 h-16 rounded-full object-cover mr-4"
									/>
									<div>
										<h4 className="font-bold text-gray-900">{testimonial.name}</h4>
										<p className="text-gray-600 text-sm">{testimonial.role}</p>
									</div>
								</div>

								<blockquote className="text-gray-700 mb-6 italic">
									"{testimonial.content}"
								</blockquote>

								<div className="flex gap-2">
									<div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
										{testimonial.results}
									</div>
									<div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
										{testimonial.metrics}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* FAQ Section */}
			<div className="py-20 bg-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-6">
							Frequently Asked Questions
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{[
							{
								q: "How quickly can I see results?",
								a: "Most users see their first blog post generated within 2-3 minutes. SEO results typically start showing within 2-4 weeks as search engines index your new content."
							},
							{
								q: "What if I'm not satisfied?",
								a: "We offer a 30-day money-back guarantee. If you're not completely satisfied, we'll refund your payment, no questions asked."
							},
							{
								q: "Can I cancel anytime?",
								a: "Yes! You can cancel your subscription at any time. You'll keep access to your account until the end of your billing period."
							},
							{
								q: "How accurate is the AI content?",
								a: "Our AI achieves 95%+ accuracy using advanced models like GPT-4 and Claude. All content is optimized for SEO and readability."
							},
							{
								q: "Do you support all video types?",
								a: "We support most YouTube videos including tutorials, vlogs, interviews, and educational content. Videos need clear audio for best results."
							},
							{
								q: "Is my data secure?",
								a: "Yes! We're SOC 2 compliant with enterprise-grade security. Your content is encrypted and never shared with third parties."
							}
						].map((faq, index) => (
							<div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
								<h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.q}</h3>
								<p className="text-gray-700">{faq.a}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Final CTA */}
			<div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-20 relative overflow-hidden">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Ready to 10x Your Content Output?
					</h2>
					<p className="text-xl mb-8 text-red-100 max-w-2xl mx-auto">
						Join thousands of creators who've already transformed their content strategy and multiplied their revenue
					</p>

					<div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-md mx-auto">
						<div className="text-3xl font-bold text-yellow-300 mb-2">Limited Time Offer</div>
						<div className="text-lg text-red-100">Get 20% off your first year</div>
						<div className="text-sm text-red-200 mt-2">🔥 Only 47 spots left at this price</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
						<button
							className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-50 transition-all transform hover:scale-105 shadow-lg"
							onClick={() => {/* Handle upgrade */}}
						>
							🚀 Claim Your Spot - Start Free Trial
						</button>
						<button
							className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-all"
							onClick={() => {/* Handle contact sales */}}
						>
							💬 Talk to Sales Team
						</button>
					</div>

					<div className="flex flex-wrap justify-center items-center gap-6 text-red-200 text-sm">
						<span>✅ No credit card required</span>
						<span>✅ 7-day free trial</span>
						<span>✅ Cancel anytime</span>
						<span>✅ 30-day guarantee</span>
					</div>
				</div>
			</div>

			{/* Trust Bar */}
			<div className="bg-gray-900 text-white py-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
						<div className="flex items-center gap-2">
							<Shield className="h-5 w-5 text-green-400" />
							<span>SOC 2 Compliant</span>
						</div>
						<div className="flex items-center gap-2">
							<Zap className="h-5 w-5 text-blue-400" />
							<span>99.9% Uptime SLA</span>
						</div>
						<div className="flex items-center gap-2">
							<Star className="h-5 w-5 text-yellow-400" />
							<span>4.9/5 Customer Rating</span>
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-purple-400" />
							<span>24/7 Support</span>
						</div>
						<div className="flex items-center gap-2">
							<Globe className="h-5 w-5 text-cyan-400" />
							<span>Global CDN</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
