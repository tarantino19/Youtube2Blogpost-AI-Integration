import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface UserProfile {
	id: string;
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	subscription?: {
		plan: string;
		creditsRemaining: number;
		resetDate: string;
	};
	createdAt: string;
}

export const ProfilePage = () => {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
	});
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await api.get('/auth/profile');
			// Backend returns { user: profileData }, so extract the user object
			const profileData = response.data.user || response.data;
			setProfile(profileData);
			setFormData({
				firstName: profileData.firstName || '',
				lastName: profileData.lastName || '',
				email: profileData.email || '',
			});
		} catch (error) {
			console.error('Failed to fetch profile:', error);
			setError('Failed to load profile');
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMessage('');

		try {
			const response = await api.put('/auth/profile', formData);
			// Backend returns { user: userData }, so extract the user object
			const userData = response.data.user || response.data;
			setProfile(userData);
			setEditing(false);
			setMessage('Profile updated successfully!');
		} catch (error: any) {
			setError(error.response?.data?.error || 'Failed to update profile');
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMessage('');

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setError('New passwords do not match');
			return;
		}

		try {
			await api.put('/auth/password', {
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			});
			setMessage('Password changed successfully!');
			setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setShowPasswordForm(false);
		} catch (error: any) {
			setError(error.response?.data?.error || 'Failed to change password');
		}
	};

	const handleDeleteAccount = async () => {
		if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
			return;
		}

		try {
			await api.delete('/auth/account');
			setMessage('Account deleted successfully');
			// Redirect to home page or logout
			window.location.href = '/';
		} catch (error: any) {
			setError(error.response?.data?.error || 'Failed to delete account');
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading profile...</p>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-red-600'>Failed to load profile</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='bg-white shadow rounded-lg'>
					<div className='px-6 py-4 border-b border-gray-200'>
						<h1 className='text-2xl font-bold text-gray-900'>Profile</h1>
					</div>

					{message && (
						<div className='mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded'>{message}</div>
					)}

					{error && <div className='mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>{error}</div>}

					<div className='p-6 space-y-6'>
						{/* Account Information */}
						<div>
							<h2 className='text-lg font-medium text-gray-900 mb-4'>Account Information</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700'>Username</label>
									<p className='mt-1 text-sm text-gray-900'>{profile.username}</p>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>Member Since</label>
									<p className='mt-1 text-sm text-gray-900'>{new Date(profile.createdAt).toLocaleDateString()}</p>
								</div>
							</div>
						</div>

						{/* Subscription Information */}
						<div>
							<h2 className='text-lg font-medium text-gray-900 mb-4'>Subscription</h2>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700'>Plan</label>
									<p className='mt-1 text-sm text-gray-900 capitalize'>{profile.subscription?.plan || 'Not subscribed'}</p>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>Credits Remaining</label>
									<p className='mt-1 text-sm text-gray-900'>{profile.subscription?.creditsRemaining || '0'}</p>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700'>Reset Date</label>
									<p className='mt-1 text-sm text-gray-900'>
										{profile.subscription?.resetDate ? new Date(profile.subscription.resetDate).toLocaleDateString() : 'Not set'}
									</p>
								</div>
							</div>
						</div>

						{/* Personal Information */}
						<div>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-lg font-medium text-gray-900'>Personal Information</h2>
								{!editing && (
									<button
										onClick={() => setEditing(true)}
										className='px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700'
									>
										Edit
									</button>
								)}
							</div>

							{editing ? (
								<form onSubmit={handleUpdateProfile} className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<label className='block text-sm font-medium text-gray-700'>First Name</label>
											<input
												type='text'
												value={formData.firstName}
												onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
												className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
											/>
										</div>
										<div>
											<label className='block text-sm font-medium text-gray-700'>Last Name</label>
											<input
												type='text'
												value={formData.lastName}
												onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
												className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
											/>
										</div>
									</div>
									<div>
										<label className='block text-sm font-medium text-gray-700'>Email</label>
										<input
											type='email'
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
									</div>
									<div className='flex space-x-4'>
										<button type='submit' className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'>
											Save
										</button>
										<button
											type='button'
											onClick={() => setEditing(false)}
											className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
										>
											Cancel
										</button>
									</div>
								</form>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label className='block text-sm font-medium text-gray-700'>First Name</label>
										<p className='mt-1 text-sm text-gray-900'>{profile.firstName || 'Not set'}</p>
									</div>
									<div>
										<label className='block text-sm font-medium text-gray-700'>Last Name</label>
										<p className='mt-1 text-sm text-gray-900'>{profile.lastName || 'Not set'}</p>
									</div>
									<div className='md:col-span-2'>
										<label className='block text-sm font-medium text-gray-700'>Email</label>
										<p className='mt-1 text-sm text-gray-900'>{profile.email}</p>
									</div>
								</div>
							)}
						</div>

						{/* Security Section */}
						<div>
							<h2 className='text-lg font-medium text-gray-900 mb-4'>Security</h2>
							{!showPasswordForm ? (
								<button
									onClick={() => setShowPasswordForm(true)}
									className='px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700'
								>
									Change Password
								</button>
							) : (
								<form onSubmit={handleChangePassword} className='space-y-4'>
									<div>
										<label className='block text-sm font-medium text-gray-700'>Current Password</label>
										<input
											type='password'
											value={passwordData.currentPassword}
											onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
											className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
											required
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-gray-700'>New Password</label>
										<input
											type='password'
											value={passwordData.newPassword}
											onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
											className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
											required
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-gray-700'>Confirm New Password</label>
										<input
											type='password'
											value={passwordData.confirmPassword}
											onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
											className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
											required
										/>
									</div>
									<div className='flex space-x-4'>
										<button type='submit' className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'>
											Change Password
										</button>
										<button
											type='button'
											onClick={() => setShowPasswordForm(false)}
											className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>

						{/* Danger Zone */}
						<div className='border-t border-gray-200 pt-6'>
							<h2 className='text-lg font-medium text-red-900 mb-4'>Danger Zone</h2>
							<button onClick={handleDeleteAccount} className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'>
								Delete Account
							</button>
							<p className='mt-2 text-sm text-gray-600'>
								This action cannot be undone. All your data will be permanently deleted.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
