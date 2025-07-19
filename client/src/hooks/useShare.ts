import { useState, useEffect, useCallback } from "react";
import { shareService, ShareStatus } from "@/services/shareService";
import { useAuth } from "@/contexts/AuthContext";

interface UseShareOptions {
  shareText?: string;
  shareUrl?: string;
}

interface UseShareReturn {
  shareStatus: ShareStatus | null;
  isLoading: boolean;
  isClaimingReward: boolean;
  rewardMessage: string | null;
  copyMessage: string | null;
  hasShared: boolean;
  claimReward: () => Promise<void>;
  copyLink: () => Promise<void>;
  trackShare: (platform: string) => void;
  clearMessages: () => void;
  refreshShareStatus: () => Promise<void>;
}

export function useShare({
  shareText = "Check out YTtoText - Convert any YouTube video into a structured blog post using AI!",
  shareUrl = window.location.origin,
}: UseShareOptions = {}): UseShareReturn {
  const [shareStatus, setShareStatus] = useState<ShareStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [hasShared, setHasShared] = useState(false);

  const { user, refreshUser } = useAuth();

  const fetchShareStatus = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const status = await shareService.getShareStatus();
      setShareStatus(status);
    } catch (error) {
      console.error("Error fetching share status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshShareStatus = useCallback(async () => {
    await fetchShareStatus();
  }, [fetchShareStatus]);

  useEffect(() => {
    fetchShareStatus();
  }, [fetchShareStatus]);

  const claimReward = useCallback(async () => {
    if (!shareStatus?.canEarnReward || isClaimingReward) return;

    setIsClaimingReward(true);
    try {
      const response = await shareService.claimShareReward();
      setRewardMessage(response.message);

      await refreshUser();
      await fetchShareStatus();

      // Auto-hide success message
      setTimeout(() => {
        setRewardMessage(null);
      }, 4000);
    } catch (error: any) {
      console.error("Error claiming reward:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to claim reward. Please try again.";
      setRewardMessage(errorMessage);
      setTimeout(() => setRewardMessage(null), 5000);
    } finally {
      setIsClaimingReward(false);
    }
  }, [shareStatus, isClaimingReward, refreshUser, fetchShareStatus]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("Link copied successfully!");
      setHasShared(true);

      // Track the copy action
      if (window.gtag) {
        window.gtag("event", "share", {
          method: "copy_link",
          content_type: "url",
          item_id: "yttotext_share",
        });
      }

      setTimeout(() => setCopyMessage(null), 3000);
    } catch (error) {
      console.error("Error copying link:", error);
      setCopyMessage(
        "Failed to copy link. Please try manually selecting the URL.",
      );
      setTimeout(() => setCopyMessage(null), 4000);
    }
  }, [shareUrl]);

  const trackShare = useCallback((platform: string) => {
    // Track share action
    if (window.gtag) {
      window.gtag("event", "share", {
        method: platform,
        content_type: "url",
        item_id: "yttotext_share",
      });
    }

    setHasShared(true);
  }, []);

  const clearMessages = useCallback(() => {
    setRewardMessage(null);
    setCopyMessage(null);
  }, []);

  return {
    shareStatus,
    isLoading,
    isClaimingReward,
    rewardMessage,
    copyMessage,
    hasShared,
    claimReward,
    copyLink,
    trackShare,
    clearMessages,
    refreshShareStatus,
  };
}

// Utility function to generate share URLs
export function generateShareUrls(shareText: string, shareUrl: string) {
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };
}

// Share options configuration
export const shareOptions = [
  {
    id: "twitter",
    name: "Twitter",
    color: "text-sky-500",
    hoverColor: "hover:bg-sky-50 hover:border-sky-200",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "text-blue-600",
    hoverColor: "hover:bg-blue-50 hover:border-blue-200",
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "text-blue-500",
    hoverColor: "hover:bg-blue-50 hover:border-blue-200",
  },
] as const;
