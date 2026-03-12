/**
 * SF18-T05 component exports for Bid Readiness signal and dashboard surfaces.
 *
 * @design D-SF18-T05, D-SF18-T04, D-SF18-T03, D-SF18-T02
 */

export {
  BidReadinessSignal,
} from './BidReadinessSignal.js';

export type {
  BidReadinessComplexityMode,
  BidReadinessSignalProps,
} from './BidReadinessSignal.js';

export {
  BidReadinessDashboard,
} from './BidReadinessDashboard.js';

export type {
  BidReadinessDashboardProps,
} from './BidReadinessDashboard.js';

/**
 * Checklist is implemented in SF18-T06.
 *
 * @design D-SF18-T05
 */
export function BidReadinessChecklist(): null {
  return null;
}
