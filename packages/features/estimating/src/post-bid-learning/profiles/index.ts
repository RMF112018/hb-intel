import type { AutopsyStatus, ConfidenceTier } from '@hbc/post-bid-autopsy';

export interface IEstimatingPostBidLearningProfile {
  readonly profileId: string;
  readonly domain: 'estimating';
  readonly workflowStatuses: readonly AutopsyStatus[];
  readonly minimumPublishConfidence: ConfidenceTier;
  readonly emphasizeRootCauseDomains: readonly string[];
}

export const estimatingPostBidLearningProfile: IEstimatingPostBidLearningProfile = {
  profileId: 'estimating-post-bid-learning',
  domain: 'estimating',
  workflowStatuses: ['draft', 'review', 'approved', 'published', 'overdue'],
  minimumPublishConfidence: 'moderate',
  emphasizeRootCauseDomains: ['pricing', 'scope', 'execution', 'coordination'],
};
