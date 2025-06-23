import { useEffect, useState } from 'react';
import { Coffee, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ProcessingLoaderProps {
	postId: string;
	onComplete: () => void;
	onError: (error: string) => void;
}

export function ProcessingLoader({ postId, onComplete, onError }: ProcessingLoaderProps) {
	const [step, setStep] = useState(0);
	const [elapsed, setElapsed] = useState(0);

	const steps = [
		{ icon: '🎬', text: 'Extracting video transcript...' },
		{ icon: '🧠', text: 'Analyzing content with AI...' },
		{ icon: '✍️', text: 'Generating blog post...' },
		{ icon: '🎨', text: 'Formatting and structuring...' },
	];

	useEffect(() => {
		const stepInterval = setInterval(() => {
			setStep((prev) => (prev + 1) % steps.length);
		}, 3000);

		const timeInterval = setInterval(() => {
			setElapsed((prev) => prev + 1);
		}, 1000);

		// Poll for completion every 5 seconds
		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch(`/api/videos/${postId}/status`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.status === 'completed') {
						clearInterval(pollInterval);
						clearInterval(stepInterval);
						clearInterval(timeInterval);
						onComplete();
					} else if (data.status === 'failed') {
						clearInterval(pollInterval);
						clearInterval(stepInterval);
						clearInterval(timeInterval);
						onError(data.error || 'Processing failed');
					}
				}
			} catch (error) {
				console.error('Error polling status:', error);
			}
		}, 5000);

		return () => {
			clearInterval(stepInterval);
			clearInterval(timeInterval);
			clearInterval(pollInterval);
		};
	}, [postId, onComplete, onError]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className='max-w-2xl mx-auto px-4 py-12'>
			<div className='bg-white rounded-xl shadow-lg p-8 text-center'>
				{/* Main Icon */}
				<div className='mb-6'>
					<div className='w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'>
						<span className='text-3xl'>{steps[step].icon}</span>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 mb-2'>Processing Your Video</h2>
					<p className='text-gray-600'>We're working our magic to turn your video into an amazing blog post!</p>
				</div>

				{/* Progress Steps */}
				<div className='mb-8'>
					<div className='flex items-center justify-center mb-4'>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-red-500 rounded-full animate-pulse'></div>
							<span className='text-lg font-medium text-gray-800'>{steps[step].text}</span>
						</div>
					</div>

					<div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
						<div
							className='bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out'
							style={{ width: `${((step + 1) / steps.length) * 100}%` }}
						></div>
					</div>

					<div className='flex items-center justify-center space-x-4 text-sm text-gray-500'>
						<div className='flex items-center space-x-1'>
							<Clock className='w-4 h-4' />
							<span>Elapsed: {formatTime(elapsed)}</span>
						</div>
						<span>•</span>
						<span>Est. 2-3 minutes</span>
					</div>
				</div>

				{/* Coffee Break Message */}
				<div className='bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6'>
					<div className='flex items-center justify-center mb-3'>
						<Coffee className='w-8 h-8 text-amber-600 mr-3' />
						<h3 className='text-lg font-semibold text-amber-800'>Perfect Time for a Coffee Break!</h3>
					</div>
					<p className='text-amber-700 text-sm leading-relaxed'>
						Why not grab your favorite beverage while our AI works its magic? ☕<br />
						We'll have your perfectly formatted blog post ready when you return!
					</p>
				</div>

				{/* Fun Facts */}
				<div className='text-left space-y-3'>
					<h4 className='font-semibold text-gray-900 text-center mb-3'>What's happening behind the scenes:</h4>
					<div className='grid gap-3'>
						<div className='flex items-start space-x-3'>
							<CheckCircle className='w-5 h-5 text-green-500 mt-0.5 flex-shrink-0' />
							<div>
								<span className='font-medium text-gray-800'>Extracting Transcript:</span>
								<span className='text-gray-600 ml-1'>Using multiple methods for best accuracy</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									step >= 1 ? 'bg-green-500' : 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{step >= 1 ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>AI Analysis:</span>
								<span className='text-gray-600 ml-1'>Understanding content and structure</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									step >= 2 ? 'bg-green-500' : 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{step >= 2 ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>Content Generation:</span>
								<span className='text-gray-600 ml-1'>Creating engaging, SEO-optimized content</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									step >= 3 ? 'bg-green-500' : 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{step >= 3 ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>Final Polish:</span>
								<span className='text-gray-600 ml-1'>Adding sections, tags, and formatting</span>
							</div>
						</div>
					</div>
				</div>

				{/* Tip */}
				<div className='mt-6 p-4 bg-blue-50 rounded-lg'>
					<p className='text-sm text-blue-800'>
						<span className='font-medium'>💡 Pro tip:</span> You can edit and enhance the generated content after it's ready!
					</p>
				</div>
			</div>
		</div>
	);
}
