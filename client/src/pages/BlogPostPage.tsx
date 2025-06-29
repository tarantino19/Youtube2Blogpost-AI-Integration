import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/postService';
import { useState } from 'react';
import { Loader2, Download, Edit2, Save, X, Trash2, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@/styles/blog-content.css';

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
		onSuccess: (updatedPost) => {
			console.log('Post updated successfully:', updatedPost);
			queryClient.invalidateQueries({ queryKey: ['post', id] });
			queryClient.invalidateQueries({ queryKey: ['posts'] });
			setIsEditing(false);
		},
		onError: (error) => {
			console.error('Failed to update post:', error);
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
		console.log('Saving post with:', {
			title: editedTitle,
			content: editedContent.substring(0, 100) + '...',
		});

		updateMutation.mutate({
			title: editedTitle,
			content: editedContent,
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
		<div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50'>
			<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden'>
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
								<span>{Math.ceil((post.generatedContent?.content?.split(' ').length || 0) / 200)} min read</span>
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
					<div className='px-6 py-8 bg-white'>
						{post.generatedContent?.summary && !isEditing && (
							<div className='mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm'>
								<h2 className='text-lg font-semibold text-blue-900 mb-3 flex items-center'>
									<span className='w-2 h-2 bg-blue-500 rounded-full mr-3'></span>
									Summary
								</h2>
								<p className='text-blue-800 leading-relaxed text-base'>{post.generatedContent.summary}</p>
							</div>
						)}

						{post.generatedContent?.keyTakeaways && post.generatedContent.keyTakeaways.length > 0 && !isEditing && (
							<div className='mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm'>
								<h2 className='text-lg font-semibold text-green-900 mb-4 flex items-center'>
									<span className='w-2 h-2 bg-green-500 rounded-full mr-3'></span>
									Key Takeaways
								</h2>
								<ul className='space-y-3'>
									{post.generatedContent.keyTakeaways.map((takeaway, index) => (
										<li key={index} className='flex items-start text-base text-green-800'>
											<span className='flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5'>
												{index + 1}
											</span>
											<span className='leading-relaxed'>{takeaway}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{post.generatedContent?.sections && post.generatedContent.sections.length > 0 && !isEditing && (
							<div className='mb-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm'>
								<h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
									<span className='w-2 h-2 bg-gray-500 rounded-full mr-3'></span>
									Table of Contents
								</h2>
								<nav>
									<ul className='space-y-2'>
										{post.generatedContent.sections.map((section, index) => (
											<li key={index} className='flex items-center'>
												<span className='flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm font-semibold mr-3'>
													{index + 1}
												</span>
												<a
													href={`#section-${index}`}
													className='text-base text-red-600 hover:text-red-700 hover:underline font-medium transition-colors duration-200'
												>
													{section.heading}
												</a>
											</li>
										))}
									</ul>
								</nav>
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
								<article
									className='blog-content prose prose-lg max-w-none bg-white rounded-lg shadow-sm border border-gray-100 p-8 mt-6'
									style={{
										lineHeight: '1.8',
									}}
								>
									<ReactMarkdown remarkPlugins={[remarkGfm]}>
										{(() => {
											let content = post.generatedContent?.content || 'No content available';

											// Check if content is wrapped in markdown code blocks (```json...```)
											if (typeof content === 'string' && content.trim().startsWith('```')) {
												try {
													// Remove markdown code block wrapper
													let jsonString = content;
													if (content.trim().startsWith('```json') && content.trim().endsWith('```')) {
														jsonString = content
															.replace(/^```json\s*/, '')
															.replace(/\s*```$/, '')
															.trim();
													} else if (content.trim().startsWith('```') && content.trim().endsWith('```')) {
														jsonString = content
															.replace(/^```[a-z]*\s*/, '')
															.replace(/\s*```$/, '')
															.trim();
													}

													const parsed = JSON.parse(jsonString);
													console.log('Parsed content from code block:', parsed);

													if (parsed.content && typeof parsed.content === 'string') {
														content = parsed.content;
													}
												} catch (error) {
													console.log('Failed to parse code block content, trying other methods');
												}
											}

											// Check if content is accidentally stringified JSON
											if (typeof content === 'string' && content.trim().startsWith('{')) {
												try {
													const parsed = JSON.parse(content);
													console.log('Parsed content object:', parsed);

													// If it's a JSON object with content property, use that
													if (parsed.content && typeof parsed.content === 'string') {
														content = parsed.content;
													}
													// If the whole thing is the content structure, extract the content
													else if (parsed.title && parsed.content) {
														content = parsed.content;
													}
													// Otherwise, use the original content
													else {
														content = post.generatedContent?.content;
													}
												} catch (error) {
													console.log('Failed to parse content as JSON, using as-is');
													// If JSON parsing fails, use content as-is
													content = post.generatedContent?.content;
												}
											}

											// Check if content is still JSON-like but as string (double stringified)
											if (typeof content === 'string' && content.includes('\\"title\\"') && content.includes('\\"content\\"')) {
												try {
													// Try to parse escaped JSON
													const unescaped = content.replace(/\\"/g, '"').replace(/\\n/g, '\n');
													const parsed = JSON.parse(unescaped);
													if (parsed.content) {
														content = parsed.content;
													}
												} catch (error) {
													console.log('Failed to parse escaped JSON, using as-is');
												}
											}

											return content;
										})()}
									</ReactMarkdown>
								</article>
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
		</div>
	);
}
