import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Coffee, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';

interface ProcessingLoaderProps {
	postId: string;
	onComplete: () => void;
	onError: (error: string) => void;
}

interface VideoStatus {
	id: string;
	status: 'processing' | 'completed' | 'failed';
	processingStep?:
		| 'extracting_transcript'
		| 'fetching_comments'
		| 'generating_content'
		| 'extracting_keywords'
		| 'saving_content'
		| 'finalizing';
	error?: string;
	videoTitle: string;
	videoThumbnail: string;
	createdAt: string;
}

export function ProcessingLoader({ postId, onComplete, onError }: ProcessingLoaderProps) {
	const [currentStep, setCurrentStep] = useState<string>('extracting_transcript');
	const [elapsed, setElapsed] = useState(0);
	const queryClient = useQueryClient();

	const stepConfig = {
		extracting_transcript: { icon: '🎬', text: 'Extracting video transcript...', order: 0 },
		fetching_comments: { icon: '💬', text: 'Fetching video comments...', order: 1 },
		generating_content: { icon: '🧠', text: 'Generating blog content with AI...', order: 2 },
		extracting_keywords: { icon: '🔍', text: 'Extracting SEO keywords...', order: 3 },
		saving_content: { icon: '💾', text: 'Saving your blog post...', order: 4 },
		finalizing: { icon: '✨', text: 'Adding final touches...', order: 5 },
	};

	const allSteps = Object.keys(stepConfig).sort(
		(a, b) => stepConfig[a as keyof typeof stepConfig].order - stepConfig[b as keyof typeof stepConfig].order
	);

	useEffect(() => {
		const timeInterval = setInterval(() => {
			setElapsed((prev) => prev + 1);
		}, 1000);

		// Poll for status updates every 2 seconds
		const pollInterval = setInterval(async () => {
			try {
				const response = await api.get(`/videos/${postId}/status`);
				const data: VideoStatus = response.data;

				if (data.status === 'completed') {
					clearInterval(pollInterval);
					clearInterval(timeInterval);
					// Invalidate posts cache so the new post appears in the list immediately
					queryClient.invalidateQueries({ queryKey: ['posts'] });
					// Also invalidate the individual post query
					queryClient.invalidateQueries({ queryKey: ['post', postId] });
					onComplete();
				} else if (data.status === 'failed') {
					clearInterval(pollInterval);
					clearInterval(timeInterval);
					onError(data.error || 'Processing failed');
				} else if (data.status === 'processing' && data.processingStep) {
					setCurrentStep(data.processingStep);
				}
			} catch (error) {
				console.error('Error polling status:', error);
			}
		}, 2000);

		return () => {
			clearInterval(timeInterval);
			clearInterval(pollInterval);
		};
	}, [postId, onComplete, onError, queryClient]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const getCurrentStepConfig = () => {
		return stepConfig[currentStep as keyof typeof stepConfig] || stepConfig.extracting_transcript;
	};

	const getProgressPercentage = () => {
		const currentStepIndex = allSteps.indexOf(currentStep);
		return ((currentStepIndex + 1) / allSteps.length) * 100;
	};

	const isStepCompleted = (step: string) => {
		const currentStepIndex = allSteps.indexOf(currentStep);
		const stepIndex = allSteps.indexOf(step);
		return stepIndex < currentStepIndex;
	};

	const isStepCurrent = (step: string) => {
		return step === currentStep;
	};

	return (
		<div className='max-w-2xl mx-auto px-4 py-12'>
			<div className='bg-white rounded-xl shadow-lg p-8 text-center'>
				{/* Main Icon */}
				<div className='mb-6'>
					<div className='w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'>
						<span className='text-3xl'>{getCurrentStepConfig().icon}</span>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 mb-2'>Processing Your Video</h2>
					<p className='text-gray-600'>We're working our magic to turn your video into an amazing blog post!</p>
				</div>

				{/* Progress Steps */}
				<div className='mb-8'>
					<div className='flex items-center justify-center mb-4'>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-red-500 rounded-full animate-pulse'></div>
							<span className='text-lg font-medium text-gray-800'>{getCurrentStepConfig().text}</span>
						</div>
					</div>

					<div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
						<div
							className='bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out'
							style={{ width: `${getProgressPercentage()}%` }}
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
						Why not grab your favorite beverage while our AI works its magic? ☕
						<br />
						We'll have your perfectly formatted blog post ready when you return!
					</p>
				</div>

				{/* Detailed Progress Steps */}
				<div className='text-left space-y-3'>
					<h4 className='font-semibold text-gray-900 text-center mb-3'>What's happening behind the scenes:</h4>
					<div className='grid gap-3'>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									isStepCompleted('extracting_transcript')
										? 'bg-green-500'
										: isStepCurrent('extracting_transcript')
										? 'bg-blue-500 animate-pulse'
										: 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{isStepCompleted('extracting_transcript') ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>Extracting Transcript:</span>
								<span className='text-gray-600 ml-1'>Using multiple methods for best accuracy</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									isStepCompleted('fetching_comments')
										? 'bg-green-500'
										: isStepCurrent('fetching_comments')
										? 'bg-blue-500 animate-pulse'
										: 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{isStepCompleted('fetching_comments') ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>Fetching Comments:</span>
								<span className='text-gray-600 ml-1'>Gathering additional context from viewers</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									isStepCompleted('generating_content')
										? 'bg-green-500'
										: isStepCurrent('generating_content')
										? 'bg-blue-500 animate-pulse'
										: 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{isStepCompleted('generating_content') ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>AI Content Generation:</span>
								<span className='text-gray-600 ml-1'>Creating engaging, SEO-optimized content</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									isStepCompleted('extracting_keywords')
										? 'bg-green-500'
										: isStepCurrent('extracting_keywords')
										? 'bg-blue-500 animate-pulse'
										: 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{isStepCompleted('extracting_keywords') ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>SEO Keywords:</span>
								<span className='text-gray-600 ml-1'>Extracting relevant keywords for search optimization</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									isStepCompleted('saving_content')
										? 'bg-green-500'
										: isStepCurrent('saving_content')
										? 'bg-blue-500 animate-pulse'
										: 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{isStepCompleted('saving_content') ? (
									<CheckCircle className='w-3 h-3 text-white' />
								) : (
									<div className='w-2 h-2 bg-white rounded-full'></div>
								)}
							</div>
							<div>
								<span className='font-medium text-gray-800'>Saving Content:</span>
								<span className='text-gray-600 ml-1'>Organizing and storing your blog post</span>
							</div>
						</div>
						<div className='flex items-start space-x-3'>
							<div
								className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded-full ${
									isStepCompleted('finalizing')
										? 'bg-green-500'
										: isStepCurrent('finalizing')
										? 'bg-blue-500 animate-pulse'
										: 'bg-gray-300'
								} flex items-center justify-center`}
							>
								{isStepCompleted('finalizing') ? (
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
