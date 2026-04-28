/**
 * PCC approval checkpoint read-model.
 *
 * Wave 1 surfaces approval state without an approval engine. Decision routing,
 * notifications, and persistence are out of scope for these types.
 */

import type { PccApprovalCheckpointId, PccWorkflowItemId } from './types.js';
import type { PccPersona } from './PccUserRoles.js';

export const APPROVAL_CHECKPOINT_STATES = [
  'pending',
  'approved',
  'rejected',
  'waived',
] as const;

export type ApprovalCheckpointState = (typeof APPROVAL_CHECKPOINT_STATES)[number];

export interface IApprovalCheckpoint {
  id: PccApprovalCheckpointId;
  workflowItemId: PccWorkflowItemId;
  requiredPersona: PccPersona;
  state: ApprovalCheckpointState;
  /** ISO 8601 UTC. */
  requestedAtUtc: string;
  /** ISO 8601 UTC; populated once decided. */
  decidedAtUtc?: string;
  decidedByUpn?: string;
  decisionNote?: string;
}
