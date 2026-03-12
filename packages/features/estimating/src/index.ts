/**
 * @hbc/features-estimating
 *
 * Estimating Bid Readiness feature package — domain adapter over
 * `@hbc/health-indicator` for pursuit readiness scoring, dashboards,
 * and KPI telemetry.
 *
 * @see docs/architecture/plans/shared-features/SF18-T01-Package-Scaffold.md
 * @see docs/architecture/plans/shared-features/SF18-Estimating-Bid-Readiness.md
 */

// Empty State (preserved from initial scaffold)
export { estimatingPursuitsEmptyStateConfig } from './empty-state/index.js';

// Types
export type {
  BidReadinessStatus,
  IBicOwner,
  VersionedRecord,
  IReadinessScore,
  ScoringDimensionKey,
  IScoringDimensionScore,
  IReadinessCategoryBreakdown,
  IQualificationMetadata,
  IRiskMetadata,
  ICompletenessMetadata,
  IReadinessActionPayload,
  IReadinessRecommendation,
  IReadinessGovernanceMetadata,
  IReadinessSummaryPayload,
  IEstimatingPackageReadinessCriteria,
  IHealthIndicatorCriterion,
  IHealthIndicatorState,
  IEstimatingBidReadinessProfile,
  IBidReadinessState,
  IBidReadinessViewState,
  BidReadinessDataState,
  UseBidReadinessResult,
  UseBidReadinessProfileResult,
  UseBidReadinessTelemetryResult,
} from './types/index.js';

// Constants
export {
  READINESS_STATES,
  SCORING_BANDS,
  RISK_LEVELS,
  RECOMMENDATION_CATEGORIES,
  PRIORITY_LEVELS,
  GOVERNANCE_STATES,
  TELEMETRY_KEYS,
  READINESS_PROFILE_IDENTIFIERS,
  BID_READINESS_SYNC_INDICATORS,
  CONFIDENCE_LEVELS,
  SEVERITY_LEVELS,
} from './constants/index.js';

export type {
  ReadinessState,
  ScoringBand,
  RiskLevel,
  RecommendationCategory,
  PriorityLevel,
  GovernanceState,
  TelemetryKey,
  ReadinessProfileIdentifier,
  SyncIndicator,
  ConfidenceLevel,
  SeverityLevel,
} from './constants/index.js';

// Bid Readiness (SF18 adapter surface)
export {
  estimatingBidReadinessProfile,
  mapPursuitToHealthIndicatorItem,
  mapHealthIndicatorStateToBidReadinessView,
  useBidReadiness,
  useBidReadinessProfile,
  useBidReadinessTelemetry,
  BidReadinessSignal,
  BidReadinessDashboard,
  BidReadinessChecklist,
  bidReadinessKpiEmitter,
} from './bid-readiness/index.js';

export type {
  UseBidReadinessParams,
  UseBidReadinessProfileParams,
  UseBidReadinessTelemetryParams,
} from './bid-readiness/index.js';
