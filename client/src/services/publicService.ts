import { PublicStats } from '@/types';

export const getPublicStats = async (): Promise<PublicStats> => {
	const response = await fetch('/api/public/stats');
	if (!response.ok) {
		throw new Error('Failed to fetch public stats');
	}
	return response.json();
};