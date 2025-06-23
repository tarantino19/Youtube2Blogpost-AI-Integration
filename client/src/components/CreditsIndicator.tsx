import { useAuth } from '@/contexts/AuthContext';
import { Coins } from 'lucide-react';

export function CreditsIndicator() {
	const { user } = useAuth();

	if (!user?.subscription) return null;

	const { creditsRemaining, plan } = user.subscription;
	const isLowCredits = creditsRemaining <= 5;

	return (
		<div
			className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
				isLowCredits ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
			}`}
		>
			<Coins className={`h-4 w-4 mr-1.5 ${isLowCredits ? 'text-red-500' : 'text-green-500'}`} />
			<span className='font-semibold'>{creditsRemaining}</span>
			<span className='ml-1 text-xs opacity-75'>credits</span>
			<span className='ml-2 px-1.5 py-0.5 bg-white rounded text-xs font-medium capitalize border'>{plan}</span>
		</div>
	);
}
