import type { IAutopsyTelemetryState } from '@hbc/post-bid-autopsy';

export const BUSINESS_DEVELOPMENT_POST_BID_LEARNING_TELEMETRY = Object.freeze([
  'bd-post-bid-learning.profile-viewed',
  'bd-post-bid-learning.publication-reviewed',
] as const);

export const createBusinessDevelopmentPostBidLearningTelemetry = (
  telemetry: IAutopsyTelemetryState
) => ({
  corroborationRate: telemetry.corroborationRate,
  benchmarkAccuracyLift: telemetry.benchmarkAccuracyLift,
  events: BUSINESS_DEVELOPMENT_POST_BID_LEARNING_TELEMETRY,
});
