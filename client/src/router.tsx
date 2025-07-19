import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RootLayout } from './components/layouts/RootLayout';
import { ProtectedLayout } from './components/layouts/ProtectedLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProcessVideoPage } from './pages/ProcessVideoPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { BlogPostsPage } from './pages/BlogPostsPage';
import { ProfilePage } from './pages/ProfilePage';
import { StatsPage } from './pages/StatsPage';
import { UpgradePlanPage } from './pages/UpgradePlanPage';
import { ErrorPage } from './pages/ErrorPage';

const RootWithAuth = () => (
	<AuthProvider>
		<RootLayout />
	</AuthProvider>
);

export const router = createBrowserRouter([
	{
		path: '/',
		element: <RootWithAuth />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'login',
				element: <LoginPage />,
			},
			{
				path: 'register',
				element: <RegisterPage />,
			},
			{
				element: <ProtectedLayout />,
				children: [
					{
						path: 'dashboard',
						element: <DashboardPage />,
					},
					{
						path: 'profile',
						element: <ProfilePage />,
					},
					{
						path: 'stats',
						element: <StatsPage />,
					},
					{
						path: 'upgrade',
						element: <UpgradePlanPage />,
					},
					{
						path: 'process',
						element: <ProcessVideoPage />,
					},
					{
						path: 'posts',
						element: <BlogPostsPage />,
					},
					{
						path: 'posts/:id',
						element: <BlogPostPage />,
					},
				],
			},
		],
	},
]);
