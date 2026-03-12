import type { IPortfolioTriageProjection, PulseConfidenceTier } from '../types/index.js';

/**
 * SF21-T02 contract constants.
 * Values are locked for contract stability; runtime behavior arrives in later SF21 tasks.
 */
export const HEALTH_STALENESS_THRESHOLD_DAYS_DEFAULT = 14;

export const HEALTH_DIMENSION_LEADING_WEIGHT = 0.7;

export const HEALTH_DIMENSION_LAGGING_WEIGHT = 0.3;

export const HEALTH_PULSE_ADMIN_CONFIG_LIST_TITLE = 'HBC_HealthPulseAdminConfig';

export const HEALTH_PULSE_TRIAGE_BUCKETS = [
  'attention-now',
  'trending-down',
  'data-quality-risk',
  'recovering',
] as const satisfies ReadonlyArray<IPortfolioTriageProjection['bucket']>;

export const HEALTH_PULSE_CONFIDENCE_TIERS = ['high', 'moderate', 'low', 'unreliable'] as const satisfies ReadonlyArray<PulseConfidenceTier>;
