/**
 * Bid Readiness — barrel export for the SF18 adapter surface.
 *
 * Re-exports profiles, adapters, hooks, components, and telemetry
 * that compose Estimating's domain view over `@hbc/health-indicator`.
 */

// Profiles
export { estimatingBidReadinessProfile } from './profiles/index.js';

// Adapters
export {
  mapPursuitToHealthIndicatorItem,
  mapHealthIndicatorStateToBidReadinessView,
} from './adapters/index.js';

// Hooks
export { useBidReadiness } from './hooks/index.js';

// Components
export {
  BidReadinessSignal,
  BidReadinessDashboard,
  BidReadinessChecklist,
} from './components/index.js';

// Telemetry
export { bidReadinessKpiEmitter } from './telemetry/index.js';
