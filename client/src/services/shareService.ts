import { api } from './api';

export interface ShareStatus {
  canEarnReward: boolean;
  lastRewardDate: string | null;
  totalShareRewards: number;
  daysUntilNextReward: number;
  rewardAmount: number;
}

export interface ClaimRewardResponse {
  message: string;
  creditsAdded: number;
  newCreditsBalance: number;
}

export const shareService = {
  async getShareStatus(): Promise<ShareStatus> {
    const response = await api.get('/shares/share-status');
    return response.data;
  },

  async claimShareReward(): Promise<ClaimRewardResponse> {
    const response = await api.post('/shares/claim-reward');
    return response.data;
  },
};