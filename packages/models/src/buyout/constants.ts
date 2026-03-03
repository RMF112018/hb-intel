import { BuyoutStatus } from './BuyoutEnums.js';

/**
 * Buyout-specific constants.
 *
 * @module buyout/constants
 */

/** Human-readable labels for buyout statuses. */
export const BUYOUT_STATUS_LABELS: Record<BuyoutStatus, string> = {
  [BuyoutStatus.Pending]: 'Pending',
  [BuyoutStatus.InProgress]: 'In Progress',
  [BuyoutStatus.Committed]: 'Committed',
  [BuyoutStatus.Complete]: 'Complete',
};

/** Threshold percentage below which a project buyout is considered at-risk. */
export const BUYOUT_AT_RISK_THRESHOLD = 50;
