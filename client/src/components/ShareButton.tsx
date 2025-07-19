import { useState, useRef, useEffect } from "react";
import {
  Share,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Gift,
  CheckCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { useShare, generateShareUrls, shareOptions } from "@/hooks/useShare";

interface ShareButtonProps {
  shareText?: string;
  shareUrl?: string;
}

export function ShareButton({
  shareText = "Check out YTtoText - Convert any YouTube video into a structured blog post using AI!",
  shareUrl = window.location.origin,
}: ShareButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    shareStatus,
    isLoading,
    isClaimingReward,
    rewardMessage,
    copyMessage,
    hasShared,
    claimReward,
    copyLink,
    trackShare,
  } = useShare({ shareText, shareUrl });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showDropdown) return;

      switch (event.key) {
        case "Escape":
          setShowDropdown(false);
          buttonRef.current?.focus();
          break;
        case "Tab":
          // Let natural tab behavior work within dropdown
          break;
      }
    };

    if (showDropdown) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showDropdown]);

  const handleSocialShare = (platform: string, url: string) => {
    trackShare(platform.toLowerCase());
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const shareUrls = generateShareUrls(shareText, shareUrl);
  const canShowReward = shareStatus && !isLoading;
  const showRewardButton =
    canShowReward && (hasShared || !shareStatus.canEarnReward);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={showDropdown}
        aria-describedby="share-dropdown"
      >
        <Share className="h-4 w-4 mr-2" />
        <span>Share</span>
        {canShowReward && shareStatus.canEarnReward && (
          <div className="flex items-center ml-2">
            <Gift className="h-4 w-4 text-yellow-300" />
            <span className="ml-1 text-sm font-medium">
              +{shareStatus.rewardAmount}
            </span>
          </div>
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          id="share-dropdown"
          className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 transform transition-all duration-200 opacity-100 scale-100"
          role="dialog"
          aria-label="Share options"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Share YTtoText</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Close share menu"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Reward Section */}
            {canShowReward && (
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Gift className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Earn Credits
                      </h4>
                      <p className="text-sm text-gray-600">
                        Share and get rewarded
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      +{shareStatus.rewardAmount}
                    </span>
                    <p className="text-xs text-gray-500">credits</p>
                  </div>
                </div>

                {shareStatus.canEarnReward ? (
                  <div className="space-y-3">
                    {!hasShared ? (
                      <p className="text-sm text-gray-600">
                        Share our app on social media or copy the link, then
                        claim your reward!
                      </p>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Ready to claim your reward!
                          </span>
                        </div>
                      </div>
                    )}

                    {showRewardButton && (
                      <button
                        onClick={claimReward}
                        disabled={isClaimingReward}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-4 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        {isClaimingReward ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Claiming...
                          </div>
                        ) : (
                          "Claim Reward"
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">
                      ✨ You've already earned your monthly share reward!
                    </p>
                    <p className="text-xs text-gray-500">
                      Next reward available in {shareStatus.daysUntilNextReward}{" "}
                      days
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Status Messages */}
            {rewardMessage && (
              <div
                className={`p-3 rounded-lg border ${
                  rewardMessage.includes("successfully")
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                <div className="flex items-center">
                  {rewardMessage.includes("successfully") && (
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="text-sm">{rewardMessage}</span>
                </div>
              </div>
            )}

            {copyMessage && (
              <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{copyMessage}</span>
                </div>
              </div>
            )}

            {/* Share Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">
                Choose how to share:
              </h4>

              <div className="space-y-2">
                {shareOptions.map((option) => {
                  const Icon =
                    option.id === "twitter"
                      ? Twitter
                      : option.id === "linkedin"
                        ? Linkedin
                        : Facebook;
                  const url =
                    option.id === "twitter"
                      ? shareUrls.twitter
                      : option.id === "linkedin"
                        ? shareUrls.linkedin
                        : shareUrls.facebook;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSocialShare(option.name, url)}
                      className={`flex items-center w-full p-3 border border-gray-200 rounded-lg transition-all duration-200 ${option.hoverColor} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${option.color}`} />
                      <span className="text-gray-700 font-medium">
                        Share on {option.name}
                      </span>
                      <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                    </button>
                  );
                })}

                <button
                  onClick={copyLink}
                  className="flex items-center w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  <Copy className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-700 font-medium">Copy Link</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Help others discover YTtoText and earn rewards! 🎉
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
