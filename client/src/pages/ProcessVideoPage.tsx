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
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='bg-white rounded-lg shadow-lg p-8'>
				<div className='flex justify-between items-start mb-8'>
					<div className='text-center flex-1'>
						<Youtube className='h-16 w-16 text-red-600 mx-auto mb-4' />
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>Process YouTube Video</h1>
						<p className='text-gray-600'>Enter a YouTube URL to convert it into a blog post</p>
					</div>
					<div className='flex-shrink-0'>
						<ShareButton />
					</div>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<div className='flex'>
								<AlertCircle className='h-5 w-5 text-red-400 mr-2' />
								<p className='text-sm text-red-800'>{error}</p>
							</div>
						</div>
					)}

					<div>
						<label htmlFor='video-url' className='block text-sm font-medium text-gray-700 mb-2'>
							YouTube Video URL
						</label>
						<input
							id='video-url'
							type='url'
							value={videoUrl}
							onChange={(e) => setVideoUrl(e.target.value)}
							placeholder='https://www.youtube.com/watch?v=...'
							className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
							required
							disabled={processMutation.isPending}
						/>
						<p className='mt-2 text-sm text-gray-500'>
							Paste any YouTube video URL. We'll extract the transcript and generate a blog post.
						</p>
					</div>

					<div>
						<label htmlFor='model-select' className='block text-sm font-medium text-gray-700 mb-2'>
							Select AI Model
						</label>
						{isLoadingModels ? (
							<div className='w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50'>
								<Loader2 className='h-5 w-5 animate-spin mx-auto' />
							</div>
						) : modelsByProvider && Object.keys(modelsByProvider).length > 0 ? (
							<select
								id='model-select'
								value={selectedModel}
								onChange={(e) => setSelectedModel(e.target.value)}
								className='w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
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
							<div className='w-full px-4 py-3 border border-gray-300 rounded-md bg-yellow-50'>
								<p className='text-sm text-yellow-800'>No AI models available. Please configure API keys.</p>
							</div>
						)}
						<p className='mt-2 text-sm text-gray-500'>
							Choose the AI model to generate your blog post. Different models have different capabilities and costs.
						</p>
					</div>

					<div className='flex justify-center'>
						<button
							type='submit'
							disabled={processMutation.isPending || !videoUrl || !selectedModel || isLoadingModels}
							className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{processMutation.isPending ? (
								<>
									<Loader2 className='h-5 w-5 mr-2 animate-spin' />
									Starting Processing...
								</>
							) : (
								'Process Video'
							)}
						</button>
					</div>
				</form>

				<div className='mt-8 border-t pt-8'>
					<h2 className='text-lg font-semibold text-gray-900 mb-4'>Tips for Best Results</h2>
					<ul className='space-y-2 text-sm text-gray-600'>
						<li className='flex items-start'>
							<span className='text-red-600 mr-2'>•</span>
							Choose videos with clear audio and good captions for better transcription
						</li>
						<li className='flex items-start'>
							<span className='text-red-600 mr-2'>•</span>
							Educational and tutorial videos work best for blog post conversion
						</li>
						<li className='flex items-start'>
							<span className='text-red-600 mr-2'>•</span>
							Longer videos (10-30 minutes) typically produce more comprehensive posts
						</li>
						<li className='flex items-start'>
							<span className='text-red-600 mr-2'>•</span>
							You can edit the generated content after processing
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
