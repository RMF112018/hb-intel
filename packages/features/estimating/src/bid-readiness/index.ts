/**
 * Bid Readiness — barrel export for the SF18 adapter surface.
 *
 * Re-exports profiles, adapters, hooks, components, and telemetry
 * that compose Estimating's domain view over `@hbc/health-indicator`.
 */

// Profiles
export {
  estimatingBidReadinessProfile,
  resolveBidReadinessProfileConfig,
  buildReadinessSummary,
  evaluateReadinessSummary,
} from './profiles/index.js';

export type {
  ICriterionOverride,
  IEstimatingBidReadinessAdminOverride,
  IResolvedBidReadinessConfig,
} from './profiles/index.js';

// Adapters
export {
  mapPursuitToHealthIndicatorItem,
  mapHealthIndicatorStateToBidReadinessView,
} from './adapters/index.js';

export type {
  IEstimatingPursuitReadinessInput,
} from './adapters/index.js';

// Hooks
export {
  useBidReadiness,
  useBidReadinessProfile,
  useBidReadinessTelemetry,
  useBidReadinessChecklist,
  useBidReadinessAdminConfig,
} from './hooks/index.js';

export type {
  UseBidReadinessParams,
  UseBidReadinessProfileParams,
  UseBidReadinessTelemetryParams,
  UseBidReadinessChecklistParams,
  UseBidReadinessAdminConfigParams,
} from './hooks/index.js';

// Checklist model
export {
  createChecklistItems,
  sortChecklistItems,
  groupChecklistItems,
  computeChecklistCompletion,
  applyChecklistDraft,
  validateAdminChecklistDefinitions,
} from './checklist/index.js';

// Integrations
export {
  projectBidReadinessToBicNextMove,
  resolveBidReadinessNotifications,
  createBidReadinessVersionedSnapshot,
  gateBidReadinessByComplexity,
  resolveBidReadinessApprovalAuthority,
  createBidReadinessReferenceIntegrations,
} from './integrations/index.js';

export type {
  IBicNextMoveReferenceAction,
  IBidReadinessBicNextMoveProjection,
  BidReadinessNotificationType,
  BidReadinessNotificationUrgency,
  IBidReadinessNotificationReference,
  IBidReadinessVersionedSnapshot,
  BidReadinessComplexityTier,
  BidReadinessGovernanceAudience,
  IBidReadinessComplexityGatedView,
  IBidReadinessApprovalRequirement,
  IBidReadinessApprovalResolution,
  IBidReadinessReferenceIntegrations,
} from './integrations/index.js';

// Components
export {
  BidReadinessSignal,
  BidReadinessDashboard,
  BidReadinessChecklist,
  ChecklistItem,
  ChecklistCompletionIndicator,
  ChecklistSection,
  BidReadinessAdminConfig,
  ReadinessCriteriaEditor,
  ChecklistDefinitionEditor,
  ScoringWeightEditor,
} from './components/index.js';

export type {
  BidReadinessComplexityMode,
  BidReadinessSignalProps,
  BidReadinessDashboardProps,
  BidReadinessChecklistProps,
  ChecklistItemProps,
  ChecklistCompletionIndicatorProps,
  ChecklistSectionProps,
  BidReadinessAdminConfigProps,
  ReadinessCriteriaEditorProps,
  ChecklistDefinitionEditorProps,
  ScoringWeightEditorProps,
} from './components/index.js';

// Telemetry
export {
  createBidReadinessKpiSnapshot,
  getTelemetryView,
  bidReadinessKpiEmitter,
} from './telemetry/index.js';

export type {
  BidReadinessComplexity,
  BidReadinessTelemetryAudience,
  IBidReadinessTelemetrySnapshot,
} from './telemetry/index.js';
