import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { videoService, AvailableModel } from '@/services/videoService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Youtube, AlertCircle } from 'lucide-react';
import { ProcessingLoader } from '@/components/ProcessingLoader';
import { ShareButton } from '@/components/ShareButton';

export function ProcessVideoPage() {
	const [videoUrl, setVideoUrl] = useState('');
	const [selectedModel, setSelectedModel] = useState('');
	const [error, setError] = useState('');
	const [processingPostId, setProcessingPostId] = useState<string | null>(null);
	const navigate = useNavigate();
	const { refreshUser } = useAuth();

	// Fetch available models
	const { data: modelsData, isLoading: isLoadingModels } = useQuery({
		queryKey: ['available-models'],
		queryFn: videoService.getAvailableModels,
	});

	// Set default model when models are loaded
	useEffect(() => {
		if (modelsData?.models?.length && !selectedModel) {
			// Try to set a default model (prefer Gemini Flash as it has higher free tier limits)
			const defaultModel =
				modelsData.models.find((m) => m.id === 'gemini-1.5-flash') ||
				modelsData.models.find((m) => m.id === 'gpt-3.5-turbo') ||
				modelsData.models[0];
			if (defaultModel) {
				setSelectedModel(defaultModel.id);
			}
		}
	}, [modelsData, selectedModel]);

	// Group models by provider for better UX
	const modelsByProvider = modelsData?.models?.reduce((acc, model) => {
		if (!acc[model.provider]) {
			acc[model.provider] = [];
		}
		acc[model.provider].push(model);
		return acc;
	}, {} as Record<string, AvailableModel[]>);

	const processMutation = useMutation({
		mutationFn: videoService.processVideo,
		onSuccess: (data) => {
			// Instead of immediately navigating, show the loading component
			setProcessingPostId(data.postId);
			// Refresh user data to update credits
			refreshUser();
		},
		onError: (err: any) => {
			setError(err.response?.data?.error || 'Failed to process video');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		// Basic YouTube URL validation
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
		if (!youtubeRegex.test(videoUrl)) {
			setError('Please enter a valid YouTube URL');
			return;
		}

		processMutation.mutate({ videoUrl, modelId: selectedModel });
	};

	const handleProcessingComplete = () => {
		if (processingPostId) {
			navigate(`/posts/${processingPostId}`);
		}
	};

	const handleProcessingError = (errorMsg: string) => {
		setError(errorMsg);
		setProcessingPostId(null);
	};

	// Show processing loader if we have a post ID
	if (processingPostId) {
		return (
			<ProcessingLoader postId={processingPostId} onComplete={handleProcessingComplete} onError={handleProcessingError} />
		);
	}

	return (
		<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='bg-white rounded-xl shadow-xl p-8 lg:p-12'>
				<div className='text-center mb-10'>
					<Youtube className='h-20 w-20 text-red-600 mx-auto mb-6' />
					<h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>Process YouTube Video</h1>
					<p className='text-lg text-gray-600 max-w-2xl mx-auto'>Enter a YouTube URL to convert it into a professionally formatted, SEO-optimized blog post</p>
					<div className='flex justify-center mt-6'>
						<ShareButton />
					</div>
				</div>

				<form onSubmit={handleSubmit} className='space-y-8'>
					{error && (
						<div className='bg-red-50 border-l-4 border-red-400 rounded-lg p-4'>
							<div className='flex items-center'>
								<AlertCircle className='h-5 w-5 text-red-400 mr-3 flex-shrink-0' />
								<p className='text-sm text-red-800 font-medium'>{error}</p>
							</div>
						</div>
					)}

					<div className='bg-gray-50 rounded-lg p-6'>
						<label htmlFor='video-url' className='block text-base font-semibold text-gray-800 mb-3'>
							YouTube Video URL
						</label>
						<input
							id='video-url'
							type='url'
							value={videoUrl}
							onChange={(e) => setVideoUrl(e.target.value)}
							placeholder='https://www.youtube.com/watch?v=...'
							className='w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-lg transition-all duration-200'
							required
							disabled={processMutation.isPending}
						/>
						<p className='mt-3 text-sm text-gray-600 leading-relaxed'>
							Paste any YouTube video URL. We'll extract the transcript and generate a professionally formatted blog post.
						</p>
					</div>

					<div className='bg-gray-50 rounded-lg p-6'>
						<label htmlFor='model-select' className='block text-base font-semibold text-gray-800 mb-3'>
							Select AI Model
						</label>
						{isLoadingModels ? (
							<div className='w-full px-4 py-4 border-2 border-gray-200 rounded-lg bg-white flex items-center justify-center'>
								<Loader2 className='h-5 w-5 animate-spin text-red-500' />
								<span className='ml-2 text-gray-600'>Loading models...</span>
							</div>
						) : modelsByProvider && Object.keys(modelsByProvider).length > 0 ? (
							<select
								id='model-select'
								value={selectedModel}
								onChange={(e) => setSelectedModel(e.target.value)}
								className='w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-lg transition-all duration-200'
								disabled={processMutation.isPending}
							>
								{Object.entries(modelsByProvider).map(([provider, models]) => (
									<optgroup key={provider} label={provider.charAt(0).toUpperCase() + provider.slice(1)}>
										{models.map((model) => (
											<option key={model.id} value={model.id}>
												{model.name} ({model.maxTokens.toLocaleString()} tokens)
											</option>
										))}
									</optgroup>
								))}
							</select>
						) : (
							<div className='w-full px-4 py-4 border-2 border-yellow-200 rounded-lg bg-yellow-50'>
								<p className='text-sm font-medium text-yellow-800'>No AI models available. Please configure API keys.</p>
							</div>
						)}
						<p className='mt-3 text-sm text-gray-600 leading-relaxed'>
							Choose the AI model to generate your blog post. Different models have different capabilities and costs.
						</p>
					</div>

					<div className='flex justify-center pt-4'>
						<button
							type='submit'
							disabled={processMutation.isPending || !videoUrl || !selectedModel || isLoadingModels}
							className='inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none'
						>
							{processMutation.isPending ? (
								<>
									<Loader2 className='h-5 w-5 mr-3 animate-spin' />
									Starting Processing...
								</>
							) : (
								'Process Video'
							)}
						</button>
					</div>
				</form>

				<div className='mt-10 bg-blue-50 rounded-lg p-6'>
					<h2 className='text-xl font-semibold text-gray-900 mb-5 flex items-center'>
						<div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
						Tips for Best Results
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='flex items-start space-x-3'>
							<div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
							</div>
							<p className='text-sm text-gray-700 leading-relaxed'>Choose videos with clear audio and good captions for better transcription</p>
						</div>
						<div className='flex items-start space-x-3'>
							<div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
							</div>
							<p className='text-sm text-gray-700 leading-relaxed'>Educational and tutorial videos work best for blog post conversion</p>
						</div>
						<div className='flex items-start space-x-3'>
							<div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
							</div>
							<p className='text-sm text-gray-700 leading-relaxed'>Longer videos (10-30 minutes) typically produce more comprehensive posts</p>
						</div>
						<div className='flex items-start space-x-3'>
							<div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
							</div>
							<p className='text-sm text-gray-700 leading-relaxed'>You can edit the generated content after processing</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
