/**
 * P3-E6-T05 Peer link rules.
 * Pure functions for cross-ledger link creation and bidirectional consistency.
 */

import type { ICrossLedgerLink } from './types.js';
import type { LedgerType } from './enums.js';

/**
 * Create a bidirectional cross-ledger link.
 * L-05: Both records must carry the reference.
 */
export const createCrossLedgerLink = (params: {
  linkId: string;
  projectId: string;
  sourceRecordId: string;
  sourceLedger: LedgerType;
  targetRecordId: string;
  targetLedger: LedgerType;
  linkedAt: string;
  linkedBy: string;
}): ICrossLedgerLink => ({
  linkId: params.linkId,
  projectId: params.projectId,
  sourceRecordId: params.sourceRecordId,
  sourceLedger: params.sourceLedger,
  targetRecordId: params.targetRecordId,
  targetLedger: params.targetLedger,
  linkedAt: params.linkedAt,
  linkedBy: params.linkedBy,
});

/**
 * L-05: Validate bidirectional link consistency.
 * Checks that if a delay references a change event, the change event also references the delay.
 */
export const validateBidirectionalConsistency = (
  delayLinkedChangeEventIds: readonly string[],
  changeEventLinkedDelayIds: readonly string[],
  delayId: string,
  changeEventId: string,
): { consistent: boolean; issues: readonly string[] } => {
  const issues: string[] = [];

  const delayHasLink = delayLinkedChangeEventIds.includes(changeEventId);
  const changeHasLink = changeEventLinkedDelayIds.includes(delayId);

  if (delayHasLink && !changeHasLink) {
    issues.push(
      `Delay '${delayId}' references Change Event '${changeEventId}', but the Change Event does not reference the Delay. Bidirectional consistency violated.`,
    );
  }

  if (changeHasLink && !delayHasLink) {
    issues.push(
      `Change Event '${changeEventId}' references Delay '${delayId}', but the Delay does not reference the Change Event. Bidirectional consistency violated.`,
    );
  }

  return { consistent: issues.length === 0, issues };
};

/**
 * Get the applicable relationship types for a given object type.
 */
export { RELATIONSHIP_TYPE_MAPPINGS } from './constants.js';
