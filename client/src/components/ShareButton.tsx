import { useState, useEffect } from 'react';
import { Share, Twitter, Linkedin, Facebook, Copy, Gift, CheckCircle } from 'lucide-react';
import { shareService, ShareStatus } from '@/services/shareService';
import { useAuth } from '@/contexts/AuthContext';

interface ShareButtonProps {
  shareText?: string;
  shareUrl?: string;
}

export function ShareButton({ 
  shareText = "Check out YTtoText - Convert any YouTube video into a structured blog post using AI!", 
  shareUrl = window.location.origin 
}: ShareButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareStatus | null>(null);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const fetchShareStatus = async () => {
      if (!user) return;
      
      try {
        const status = await shareService.getShareStatus();
        setShareStatus(status);
      } catch (error) {
        console.error('Error fetching share status:', error);
      }
    };

    fetchShareStatus();
  }, [user]);

  const handleClaimReward = async () => {
    if (!shareStatus?.canEarnReward || isClaimingReward) return;

    setIsClaimingReward(true);
    try {
      const response = await shareService.claimShareReward();
      setRewardMessage(response.message);
      
      // Refresh user data to update credits
      await refreshUser();
      
      // Refresh share status
      const newStatus = await shareService.getShareStatus();
      setShareStatus(newStatus);
      
      setTimeout(() => setRewardMessage(null), 5000);
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      setRewardMessage(error.response?.data?.message || 'Failed to claim reward');
      setTimeout(() => setRewardMessage(null), 5000);
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage('Link copied to clipboard!');
      setTimeout(() => setCopyMessage(null), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      setCopyMessage('Failed to copy link');
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <Share className="h-4 w-4 mr-2" />
        Share & Earn
        {shareStatus?.canEarnReward && (
          <Gift className="h-4 w-4 ml-2 text-yellow-300" />
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <div className="space-y-4">
              {/* Reward Section */}
              {user && shareStatus && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Gift className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">Share Reward</span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">
                      +{shareStatus.rewardAmount} credits
                    </span>
                  </div>
                  
                  {shareStatus.canEarnReward ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Share our app and earn {shareStatus.rewardAmount} free credits!
                      </p>
                      <button
                        onClick={handleClaimReward}
                        disabled={isClaimingReward}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isClaimingReward ? 'Claiming...' : 'Claim Reward'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">
                        You've already earned your share reward this month!
                      </p>
                      <p className="text-xs">
                        Next reward available in {shareStatus.daysUntilNextReward} days
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Success/Error Messages */}
              {rewardMessage && (
                <div className={`p-3 rounded-lg ${
                  rewardMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {rewardMessage.includes('successfully') && (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm">{rewardMessage}</span>
                  </div>
                </div>
              )}

              {copyMessage && (
                <div className="p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{copyMessage}</span>
                  </div>
                </div>
              )}

              {/* Share Options */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Share on social media:</h4>
                
                <div className="space-y-2">
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-700">Share on Twitter</span>
                  </a>
                  
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-700 mr-3" />
                    <span className="text-gray-700">Share on LinkedIn</span>
                  </a>
                  
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Facebook className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Share on Facebook</span>
                  </a>
                  
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="h-5 w-5 text-gray-500 mr-3" />
                    <span className="text-gray-700">Copy Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}