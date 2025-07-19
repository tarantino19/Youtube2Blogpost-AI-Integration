import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Star, TrendingUp, Clock, Zap, Shield, Users } from 'lucide-react';
import { useState } from 'react';

export function UpgradePlanPage() {
	const { user } = useAuth();
	const [selectedPlan, setSelectedPlan] = useState('creator');
	const [showROICalculator, setShowROICalculator] = useState(false);
	const [roiInputs, setRoiInputs] = useState({
		videosPerMonth: 4,
		avgViewsPerVideo: 10000,
		conversionRate: 2,
		avgOrderValue: 50
	});

	const currentPlan = user?.subscription?.plan || 'free';
	const creditsUsed = 5 - (user?.subscription?.creditsRemaining || 5);

	const plans = [
		{
			id: 'free',
			name: 'Free',
			price: 0,
			credits: 5,
			description: 'Perfect for testing the waters',
			features: [
				'5 blog posts per month',
				'Basic AI models',
				'Standard processing',
				'Email support',
				'Basic SEO optimization'
			],
			limitations: [
				'Limited AI model access',
				'Slower processing times',
				'Basic templates only'
			],
			cta: 'Current Plan',
			popular: false
		},
		{
			id: 'creator',
			name: 'Creator',
			price: 29,
			credits: 50,
			description: 'For serious content creators',
			features: [
				'50 blog posts per month',
				'Premium AI models (GPT-4, Claude)',
				'Priority processing',
				'Advanced SEO optimization',
				'Custom templates',
				'Analytics dashboard',
				'Priority email support',
				'Export to multiple formats'
			],
			limitations: [],
			cta: 'Start Free Trial',
			popular: true,
			savings: 'Less than $1 per blog post'
		},
		{
			id: 'business',
			name: 'Business',
			price: 99,
			credits: 500,
			description: 'For agencies and scaling businesses',
			features: [
				'500 blog posts per month',
				'All premium AI models',
				'Instant processing',
				'Advanced SEO & keyword research',
				'White-label options',
				'API access',
				'Team collaboration',
				'Custom integrations',
				'Phone + email support',
				'Content calendar',
				'Bulk processing'
			],
			limitations: [],
			cta: 'Start Free Trial',
			popular: false,
			savings: '20¢ per blog post vs $50+ manual creation'
		},
		{
			id: 'enterprise',
			name: 'Enterprise',
			price: 'Custom',
			credits: 'Unlimited',
			description: 'For enterprises with massive content needs',
			features: [
				'Unlimited blog posts',
				'Custom AI model training',
				'Dedicated account manager',
				'Custom integrations',
				'SLA guarantees',
				'Advanced analytics',
				'Multi-brand management',
				'Custom workflows',
				'24/7 phone support',
				'Training & onboarding'
			],
			limitations: [],
			cta: 'Contact Sales',
			popular: false
		}
	];

	const calculateROI = () => {
		const { videosPerMonth, avgViewsPerVideo, conversionRate, avgOrderValue } = roiInputs;
		const blogPostsFromVideos = videosPerMonth * 4; // 4 blog posts per video
		const additionalTraffic = blogPostsFromVideos * avgViewsPerVideo * 0.3; // 30% additional traffic from SEO
		const additionalConversions = (additionalTraffic * conversionRate) / 100;
		const additionalRevenue = additionalConversions * avgOrderValue;
		return Math.round(additionalRevenue);
	};

	const testimonials = [
		{
			name: "Sarah Chen",
			role: "YouTube Creator",
			avatar: "SC",
			content: "I turned 12 YouTube videos into 48 blog posts in one month. The SEO traffic alone generated $15,000 in additional revenue.",
			results: "+300% organic traffic"
		},
		{
			name: "Marcus Rodriguez",
			role: "Digital Marketing Agency",
			avatar: "MR",
			content: "We're now offering blog content creation as a service to our clients. YTtoText has become our secret weapon for scaling content.",
			results: "+$50k monthly revenue"
		},
		{
			name: "Jennifer Walsh",
			role: "Course Creator",
			avatar: "JW",
			content: "Every video I create now becomes 4-5 blog posts automatically. My content reaches 10x more people with zero extra effort.",
			results: "+1000% content output"
		}
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-br from-red-600 to-red-700 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Stop Leaving Money on the Table
						</h1>
						<p className="text-xl md:text-2xl mb-8 text-red-100">
							Turn Every YouTube Video Into Revenue-Generating Content
						</p>
						<p className="text-lg mb-8 max-w-3xl mx-auto text-red-50">
							You're already creating great videos. Now multiply their impact with unlimited AI-powered blog posts that rank, convert, and scale your business.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
								Start Your 7-Day Free Trial
							</button>
							<button 
								onClick={() => setShowROICalculator(!showROICalculator)}
								className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors"
							>
								Calculate Your ROI
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Social Proof Bar */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-red-600" />
							<span className="font-semibold">10,000+</span>
							<span>Content Creators</span>
						</div>
						<div className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-red-600" />
							<span className="font-semibold">2.5M+</span>
							<span>Blog Posts Generated</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-red-600" />
							<span className="font-semibold">500,000+</span>
							<span>Hours Saved</span>
						</div>
					</div>
				</div>
			</div>

			{/* Current Usage Alert */}
			{currentPlan === 'free' && creditsUsed > 0 && (
				<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex">
							<div className="ml-3">
								<p className="text-sm text-yellow-700">
									<strong>You've used {creditsUsed} of your 5 free credits this month.</strong> 
									{creditsUsed >= 4 && " You're running low! Upgrade now to keep creating content."}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ROI Calculator */}
			{showROICalculator && (
				<div className="bg-blue-50 py-12">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
						<h2 className="text-3xl font-bold text-center mb-8">Calculate Your Potential ROI</h2>
						<div className="bg-white rounded-lg shadow-lg p-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<h3 className="text-xl font-semibold mb-4">Your Current Metrics</h3>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Videos per month
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
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Conversion rate (%)
											</label>
											<input
												type="number"
												step="0.1"
												value={roiInputs.conversionRate}
												onChange={(e) => setRoiInputs({...roiInputs, conversionRate: parseFloat(e.target.value) || 0})}
												className="w-full px-3 py-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Average order value ($)
											</label>
											<input
												type="number"
												value={roiInputs.avgOrderValue}
												onChange={(e) => setRoiInputs({...roiInputs, avgOrderValue: parseInt(e.target.value) || 0})}
												className="w-full px-3 py-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-4">Your Potential Results</h3>
									<div className="bg-green-50 rounded-lg p-6">
										<div className="text-center">
											<div className="text-4xl font-bold text-green-600 mb-2">
												${calculateROI().toLocaleString()}
											</div>
											<div className="text-lg text-green-700 mb-4">
												Additional monthly revenue
											</div>
											<div className="text-sm text-green-600 space-y-1">
												<p>• {roiInputs.videosPerMonth * 4} additional blog posts</p>
												<p>• 30% more organic traffic from SEO</p>
												<p>• Multiple touchpoints for conversions</p>
												<p>• Compound growth over time</p>
											</div>
										</div>
									</div>
									<div className="mt-6 text-center">
										<p className="text-sm text-gray-600 mb-4">
											ROI: {calculateROI() > 0 ? Math.round((calculateROI() / 29) * 100) : 0}% return on Creator plan investment
										</p>
										<button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
											Start Earning More Today
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Problem Section */}
			<div className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
							Every Day You Wait, Competitors Get Ahead
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							While you're manually creating one piece of content, smart creators are turning each video into 4-5 blog posts, capturing search traffic, and multiplying their reach.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<Clock className="h-8 w-8 text-red-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Time Wasted</h3>
							<p className="text-gray-600">Manual content repurposing takes 4-6 hours per video. That's time you could spend creating or growing your business.</p>
						</div>
						<div className="text-center">
							<div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<TrendingUp className="h-8 w-8 text-red-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Missed Revenue</h3>
							<p className="text-gray-600">Every video could generate 10x more traffic through SEO-optimized blog posts. You're leaving money on the table.</p>
						</div>
						<div className="text-center">
							<div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<Users className="h-8 w-8 text-red-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Limited Reach</h3>
							<p className="text-gray-600">YouTube-only content misses millions of Google searchers who prefer reading. Expand your audience instantly.</p>
						</div>
					</div>
				</div>
			</div>

			{/* Pricing Section */}
			<div className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
							Choose Your Growth Plan
						</h2>
						<p className="text-xl text-gray-600">
							Start free, scale as you grow. Cancel anytime.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{plans.map((plan) => (
							<div
								key={plan.id}
								className={`relative bg-white rounded-lg shadow-lg p-8 ${
									plan.popular ? 'ring-2 ring-red-500 transform scale-105' : ''
								} ${currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
							>
								{plan.popular && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
											Most Popular
										</span>
									</div>
								)}
								{currentPlan === plan.id && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
											Current Plan
										</span>
									</div>
								)}

								<div className="text-center mb-6">
									<h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
									<div className="mb-2">
										{typeof plan.price === 'number' ? (
											<>
												<span className="text-4xl font-bold text-gray-900">${plan.price}</span>
												<span className="text-gray-600">/month</span>
											</>
										) : (
											<span className="text-4xl font-bold text-gray-900">{plan.price}</span>
										)}
									</div>
									<p className="text-gray-600 text-sm">{plan.description}</p>
									{plan.savings && (
										<p className="text-green-600 text-sm font-semibold mt-1">{plan.savings}</p>
									)}
								</div>

								<div className="mb-6">
									<div className="text-center mb-4">
										<span className="text-2xl font-bold text-red-600">{plan.credits}</span>
										<span className="text-gray-600 ml-1">credits/month</span>
									</div>
								</div>

								<ul className="space-y-3 mb-8">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start">
											<Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
											<span className="text-gray-700 text-sm">{feature}</span>
										</li>
									))}
									{plan.limitations.map((limitation, index) => (
										<li key={index} className="flex items-start">
											<X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
											<span className="text-gray-500 text-sm">{limitation}</span>
										</li>
									))}
								</ul>

								<button
									className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
										currentPlan === plan.id
											? 'bg-gray-100 text-gray-500 cursor-not-allowed'
											: plan.popular
											? 'bg-red-600 text-white hover:bg-red-700'
											: 'bg-gray-900 text-white hover:bg-gray-800'
									}`}
									disabled={currentPlan === plan.id}
								>
									{currentPlan === plan.id ? 'Current Plan' : plan.cta}
								</button>
							</div>
						))}
					</div>

					<div className="text-center mt-12">
						<p className="text-gray-600 mb-4">
							🔒 30-day money-back guarantee • Cancel anytime • No setup fees
						</p>
						<div className="flex justify-center items-center gap-4 text-sm text-gray-500">
							<span>Trusted by 10,000+ creators</span>
							<span>•</span>
							<span>99.9% uptime</span>
							<span>•</span>
							<span>24/7 support</span>
						</div>
					</div>
				</div>
			</div>

			{/* Testimonials */}
			<div className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
							Real Results from Real Creators
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<div key={index} className="bg-gray-50 rounded-lg p-6">
								<div className="flex items-center mb-4">
									<div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold">
										{testimonial.avatar}
									</div>
									<div className="ml-4">
										<h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
										<p className="text-gray-600 text-sm">{testimonial.role}</p>
									</div>
								</div>
								<p className="text-gray-700 mb-4">"{testimonial.content}"</p>
								<div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
									{testimonial.results}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* FAQ Section */}
			<div className="py-16 bg-gray-50">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-6">
							Frequently Asked Questions
						</h2>
					</div>
					<div className="space-y-6">
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
								q: "Do you support all YouTube video types?",
								a: "We support most YouTube videos including tutorials, vlogs, interviews, and educational content. Videos need to have clear audio for best results."
							},
							{
								q: "How accurate is the AI-generated content?",
								a: "Our AI achieves 95%+ accuracy using advanced models like GPT-4 and Claude. All content is optimized for SEO and readability."
							}
						].map((faq, index) => (
							<div key={index} className="bg-white rounded-lg shadow p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
								<p className="text-gray-700">{faq.a}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Final CTA */}
			<div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Ready to 10x Your Content Output?
					</h2>
					<p className="text-xl mb-8 text-red-100">
						Join thousands of creators who've already transformed their content strategy
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
							Start Your Free Trial Now
						</button>
						<button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition-colors">
							Talk to Sales
						</button>
					</div>
					<p className="text-red-200 text-sm mt-6">
						No credit card required • 7-day free trial • Cancel anytime
					</p>
				</div>
			</div>

			{/* Trust Signals */}
			<div className="bg-gray-900 text-white py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
						<div className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							<span>SOC 2 Compliant</span>
						</div>
						<div className="flex items-center gap-2">
							<Zap className="h-5 w-5" />
							<span>99.9% Uptime SLA</span>
						</div>
						<div className="flex items-center gap-2">
							<Star className="h-5 w-5" />
							<span>4.9/5 Customer Rating</span>
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							<span>24/7 Support</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}