/**
 * @hbc/health-indicator
 *
 * Canonical health-indicator runtime ownership for profile resolution,
 * deterministic summary composition, and KPI telemetry projection.
 *
 * @design D-SF18-T06
 */

export type {
  IHealthIndicatorVersionedRecord,
  IHealthIndicatorGovernanceMetadata,
  IHealthIndicatorCompletenessMetadata,
  IHealthIndicatorCriterion,
  IHealthIndicatorProfile,
  IHealthIndicatorCriterionOverride,
  IHealthIndicatorAdminOverride,
  IHealthIndicatorResolvedConfig,
  IHealthIndicatorReadinessScore,
  IHealthIndicatorCategoryBreakdown,
  IHealthIndicatorRecommendationAction,
  IHealthIndicatorRecommendation,
  IHealthIndicatorSummary,
  HealthIndicatorStatus,
  HealthIndicatorScoringBand,
} from './runtime.js';

export {
  resolveHealthIndicatorProfileConfig,
  buildHealthIndicatorSummary,
} from './runtime.js';

export type {
  HealthIndicatorComplexity,
  HealthIndicatorTelemetryAudience,
  IHealthIndicatorTelemetrySnapshot,
} from './telemetry.js';

export {
  createHealthIndicatorKpiSnapshot,
  getHealthIndicatorTelemetryView,
  healthIndicatorKpiEmitter,
} from './telemetry.js';
