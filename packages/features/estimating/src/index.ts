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

// Bid Readiness (SF18 adapter surface)
export {
  estimatingBidReadinessProfile,
  mapPursuitToHealthIndicatorItem,
  mapHealthIndicatorStateToBidReadinessView,
  useBidReadiness,
  BidReadinessSignal,
  BidReadinessDashboard,
  BidReadinessChecklist,
  bidReadinessKpiEmitter,
} from './bid-readiness/index.js';
