/**
 * HbcRelatedItemsGovernance — D-SF14-T01, D-01
 *
 * Admin governance surface for managing relationship priorities, visibility,
 * and archiving across modules.
 *
 * TODO: SF14-T05 — Implement governance UI with priority editing,
 * role-visibility controls, Preview as Role, and activity-timeline emission.
 */
import type { FC } from 'react';

export interface HbcRelatedItemsGovernanceProps {
  /** Record type to manage governance for. */
  recordType?: string;
}

/** Admin governance surface for related-items configuration. */
export const HbcRelatedItemsGovernance: FC<HbcRelatedItemsGovernanceProps> = () => {
  // TODO: SF14-T05
  return null;
};

HbcRelatedItemsGovernance.displayName = 'HbcRelatedItemsGovernance';
