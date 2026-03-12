/**
 * SF18 readiness constants and derived contract unions.
 *
 * @design D-SF18-T02
 */

/** Readiness lifecycle states for bid readiness scoring output. */
export const READINESS_STATES = [
  'ready',
  'nearly-ready',
  'attention-needed',
  'not-ready',
] as const;

/** Readiness score bands used by summary and dashboard displays. */
export const SCORING_BANDS = [
  'excellent',
  'strong',
  'moderate',
  'weak',
] as const;

/** Qualification and delivery risk level taxonomy. */
export const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'] as const;

/** Recommendation categories exposed by readiness guidance surfaces. */
export const RECOMMENDATION_CATEGORIES = [
  'blocker-resolution',
  'coverage-improvement',
  'documentation-completion',
  'qualification-follow-up',
  'governance-remediation',
] as const;

/** Priority levels for readiness recommendations and actions. */
export const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

/** Governance state taxonomy for audit and approval traceability. */
export const GOVERNANCE_STATES = [
  'draft',
  'review',
  'approved',
  'frozen',
  'superseded',
] as const;

/** Telemetry key identifiers for readiness KPI projections. */
export const TELEMETRY_KEYS = [
  'time-to-readiness',
  'blocker-resolution-latency',
  'ready-to-bid-rate',
  'submission-error-rate-reduction',
  'checklist-ces',
] as const;

/** Readiness profile identifiers supported in this adapter phase. */
export const READINESS_PROFILE_IDENTIFIERS = ['estimating-bid-readiness'] as const;

/** Offline/optimistic synchronization indicators for readiness views. */
export const BID_READINESS_SYNC_INDICATORS = [
  'synced',
  'saved-locally',
  'queued-to-sync',
] as const;

/** Confidence level taxonomy for risk and recommendation metadata. */
export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'] as const;

/** Severity level taxonomy for risk and governance issue metadata. */
export const SEVERITY_LEVELS = ['minor', 'major', 'critical'] as const;

export type ReadinessState = (typeof READINESS_STATES)[number];
export type ScoringBand = (typeof SCORING_BANDS)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];
export type GovernanceState = (typeof GOVERNANCE_STATES)[number];
export type TelemetryKey = (typeof TELEMETRY_KEYS)[number];
export type ReadinessProfileIdentifier = (typeof READINESS_PROFILE_IDENTIFIERS)[number];
export type SyncIndicator = (typeof BID_READINESS_SYNC_INDICATORS)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];
