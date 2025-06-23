import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { videoService } from '@/services/videoService';
import { Loader2, Youtube, AlertCircle } from 'lucide-react';

export function ProcessVideoPage() {
	const [videoUrl, setVideoUrl] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const processMutation = useMutation({
		mutationFn: videoService.processVideo,
		onSuccess: (data) => {
			navigate(`/posts/${data.postId}`);
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

		processMutation.mutate({ videoUrl });
	};

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='bg-white rounded-lg shadow-lg p-8'>
				<div className='text-center mb-8'>
					<Youtube className='h-16 w-16 text-red-600 mx-auto mb-4' />
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>Process YouTube Video</h1>
					<p className='text-gray-600'>Enter a YouTube URL to convert it into a blog post</p>
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

					<div className='flex justify-center'>
						<button
							type='submit'
							disabled={processMutation.isPending || !videoUrl}
							className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{processMutation.isPending ? (
								<>
									<Loader2 className='h-5 w-5 mr-2 animate-spin' />
									Processing Video...
								</>
							) : (
								'Process Video'
							)}
						</button>
					</div>
				</form>

				{processMutation.isPending && (
					<div className='mt-8 text-center'>
						<div className='bg-blue-50 rounded-lg p-6'>
							<p className='text-sm text-blue-800 mb-2'>
								<strong>Processing your video...</strong>
							</p>
							<p className='text-sm text-blue-600'>This may take a few minutes depending on the video length.</p>
							<div className='mt-4 space-y-2'>
								<div className='flex items-center justify-center text-sm text-blue-600'>
									<span className='animate-pulse'>• Extracting transcript...</span>
								</div>
								<div className='flex items-center justify-center text-sm text-blue-600'>
									<span className='animate-pulse'>• Analyzing content...</span>
								</div>
								<div className='flex items-center justify-center text-sm text-blue-600'>
									<span className='animate-pulse'>• Generating blog post...</span>
								</div>
							</div>
						</div>
					</div>
				)}

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
