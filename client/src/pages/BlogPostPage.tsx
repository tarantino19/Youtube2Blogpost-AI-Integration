import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import { useState } from 'react';
import { Loader2, Download, Edit2, Save, X, Trash2, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function BlogPostPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [editedContent, setEditedContent] = useState('');
	const [editedTitle, setEditedTitle] = useState('');

	const { data: post, isLoading } = useQuery({
		queryKey: ['post', id],
		queryFn: () => postService.getPost(id!),
		enabled: !!id,
	});

	const updateMutation = useMutation({
		mutationFn: (updates: any) => postService.updatePost(id!, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['post', id] });
			setIsEditing(false);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => postService.deletePost(id!),
		onSuccess: () => {
			navigate('/posts');
		},
	});

	const exportMutation = useMutation({
		mutationFn: (format: 'markdown' | 'html' | 'pdf') => postService.exportPost(id!, format),
		onSuccess: (blob, format) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${post?.generatedContent?.title || 'blog-post'}.${format}`;
			a.click();
			URL.revokeObjectURL(url);
		},
	});

	const handleEdit = () => {
		setEditedTitle(post?.generatedContent?.title || '');
		setEditedContent(post?.generatedContent?.content || '');
		setIsEditing(true);
	};

	const handleSave = () => {
		updateMutation.mutate({
			generatedContent: {
				...post?.generatedContent,
				title: editedTitle,
				content: editedContent,
			},
		});
	};

	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this post?')) {
			deleteMutation.mutate();
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<Loader2 className='h-8 w-8 animate-spin text-red-600' />
			</div>
		);
	}

	if (!post) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-600'>Post not found</p>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='bg-white rounded-lg shadow-lg'>
				{/* Header */}
				<div className='border-b px-6 py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-4'>
							<h1 className='text-2xl font-bold text-gray-900'>
								{isEditing ? (
									<input
										type='text'
										value={editedTitle}
										onChange={(e) => setEditedTitle(e.target.value)}
										className='w-full px-3 py-1 border border-gray-300 rounded-md'
									/>
								) : (
									post.generatedContent?.title || post.videoTitle
								)}
							</h1>
						</div>

						<div className='flex items-center space-x-2'>
							{isEditing ? (
								<>
									<button
										onClick={handleSave}
										disabled={updateMutation.isPending}
										className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700'
									>
										<Save className='h-4 w-4 mr-1' />
										Save
									</button>
									<button
										onClick={() => setIsEditing(false)}
										className='inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
									>
										<X className='h-4 w-4 mr-1' />
										Cancel
									</button>
								</>
							) : (
								<>
									<button
										onClick={handleEdit}
										className='inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
									>
										<Edit2 className='h-4 w-4 mr-1' />
										Edit
									</button>
									<button
										onClick={() => exportMutation.mutate('markdown')}
										disabled={exportMutation.isPending}
										className='inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
									>
										<Download className='h-4 w-4 mr-1' />
										Export
									</button>
									<button
										onClick={handleDelete}
										disabled={deleteMutation.isPending}
										className='inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50'
									>
										<Trash2 className='h-4 w-4 mr-1' />
										Delete
									</button>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Meta Information */}
				<div className='px-6 py-4 bg-gray-50 border-b'>
					<div className='flex items-center justify-between text-sm text-gray-600'>
						<div className='flex items-center space-x-4'>
							<span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
							<span>•</span>
							<span>{post.generatedContent?.content?.split(' ').length || 0} words</span>
							<span>•</span>
							<a
								href={post.videoUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='inline-flex items-center text-red-600 hover:text-red-700'
							>
								View Original Video
								<ExternalLink className='h-3 w-3 ml-1' />
							</a>
						</div>
					</div>

					{post.generatedContent?.tags && post.generatedContent.tags.length > 0 && (
						<div className='mt-3 flex flex-wrap gap-2'>
							{post.generatedContent.tags.map((tag, index) => (
								<span key={index} className='inline-block px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full'>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Content */}
				<div className='px-6 py-8'>
					{post.generatedContent?.summary && !isEditing && (
						<div className='mb-6 p-4 bg-blue-50 rounded-lg'>
							<h2 className='text-sm font-semibold text-blue-900 mb-2'>Summary</h2>
							<p className='text-sm text-blue-800'>{post.generatedContent.summary}</p>
						</div>
					)}

					<div className='prose prose-lg max-w-none'>
						{isEditing ? (
							<textarea
								value={editedContent}
								onChange={(e) => setEditedContent(e.target.value)}
								className='w-full h-96 px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
								placeholder='Write your blog post content in Markdown format...'
							/>
						) : (
							<div className='prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-600 prose-strong:text-gray-900'>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{post.generatedContent?.content || 'No content available'}
								</ReactMarkdown>
							</div>
						)}
					</div>
				</div>

				{/* Export Options */}
				{!isEditing && (
					<div className='px-6 py-4 bg-gray-50 border-t'>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-gray-600'>Export as:</span>
							<div className='flex space-x-2'>
								<button
									onClick={() => exportMutation.mutate('markdown')}
									disabled={exportMutation.isPending}
									className='text-sm text-red-600 hover:text-red-700 font-medium'
								>
									Markdown
								</button>
								<span className='text-gray-400'>|</span>
								<button
									onClick={() => exportMutation.mutate('html')}
									disabled={exportMutation.isPending}
									className='text-sm text-red-600 hover:text-red-700 font-medium'
								>
									HTML
								</button>
								<span className='text-gray-400'>|</span>
								<button
									onClick={() => exportMutation.mutate('pdf')}
									disabled={exportMutation.isPending}
									className='text-sm text-red-600 hover:text-red-700 font-medium'
								>
									PDF
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
