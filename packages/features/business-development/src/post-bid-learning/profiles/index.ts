import type { AutopsyStatus, ConfidenceTier } from '@hbc/post-bid-autopsy';

export interface IBusinessDevelopmentPostBidLearningProfile {
  readonly profileId: string;
  readonly domain: 'business-development';
  readonly primaryStatuses: readonly AutopsyStatus[];
  readonly minimumPublishConfidence: ConfidenceTier;
  readonly emphasizeRootCauseDomains: readonly string[];
}

export const businessDevelopmentPostBidLearningProfile: IBusinessDevelopmentPostBidLearningProfile =
  {
    profileId: 'bd-post-bid-learning',
    domain: 'business-development',
    primaryStatuses: ['draft', 'review', 'approved', 'published'],
    minimumPublishConfidence: 'moderate',
    emphasizeRootCauseDomains: ['strategy', 'market', 'client'],
  };
