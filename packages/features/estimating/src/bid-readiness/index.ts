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
} from './hooks/index.js';

export type {
  UseBidReadinessParams,
  UseBidReadinessProfileParams,
  UseBidReadinessTelemetryParams,
} from './hooks/index.js';

// Components
export {
  BidReadinessSignal,
  BidReadinessDashboard,
  BidReadinessChecklist,
} from './components/index.js';

export type {
  BidReadinessComplexityMode,
  BidReadinessSignalProps,
  BidReadinessDashboardProps,
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
