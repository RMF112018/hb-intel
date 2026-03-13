import type { IAutopsyTelemetryState } from '@hbc/post-bid-autopsy';

export const ESTIMATING_POST_BID_LEARNING_TELEMETRY = Object.freeze([
  'estimating-post-bid-learning.profile-viewed',
  'estimating-post-bid-learning.evidence-reviewed',
] as const);

export const createEstimatingPostBidLearningTelemetry = (
  telemetry: IAutopsyTelemetryState
) => ({
  corroborationRate: telemetry.corroborationRate,
  revalidationLatency: telemetry.revalidationLatency,
  events: ESTIMATING_POST_BID_LEARNING_TELEMETRY,
});
