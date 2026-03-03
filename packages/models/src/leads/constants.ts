import { LeadStage } from './LeadEnums.js';

/**
 * Lead-specific constants.
 *
 * @module leads/constants
 */

/** Human-readable labels for each lead stage, keyed by enum value. */
export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  [LeadStage.Identified]: 'Identified',
  [LeadStage.Qualifying]: 'Qualifying',
  [LeadStage.BidDecision]: 'Bid Decision',
  [LeadStage.Bidding]: 'Bidding',
  [LeadStage.Awarded]: 'Awarded',
  [LeadStage.Lost]: 'Lost',
  [LeadStage.Declined]: 'Declined',
};

/** Stages that represent an open (in-progress) lead. */
export const ACTIVE_LEAD_STAGES: readonly LeadStage[] = [
  LeadStage.Identified,
  LeadStage.Qualifying,
  LeadStage.BidDecision,
  LeadStage.Bidding,
] as const;
