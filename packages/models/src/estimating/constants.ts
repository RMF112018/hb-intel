import { EstimatingStatus } from './EstimatingEnums.js';

/**
 * Estimating-specific constants.
 *
 * @module estimating/constants
 */

/** Human-readable labels for estimating statuses. */
export const ESTIMATING_STATUS_LABELS: Record<EstimatingStatus, string> = {
  [EstimatingStatus.Draft]: 'Draft',
  [EstimatingStatus.InProgress]: 'In Progress',
  [EstimatingStatus.Submitted]: 'Submitted',
  [EstimatingStatus.Awarded]: 'Awarded',
  [EstimatingStatus.Lost]: 'Lost',
};
