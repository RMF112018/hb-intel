/**
 * PCC approval checkpoint read-model.
 *
 * Wave 1 surfaces approval state without an approval engine. Decision routing,
 * notifications, and persistence are out of scope for these types.
 *
 * Phase 3 / Wave 1 / Prompt 04 adds explicit checkpoint type, authority type,
 * and reviewer-action vocabulary. The `IApprovalCheckpoint.checkpointType`
 * and `IApprovalCheckpoint.authorityType` fields are **optional** to keep the
 * Prompt 02 shape backward-compatible; tightening to required is deferred
 * until later waves with confirmed consumers.
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

export const APPROVAL_CHECKPOINT_TYPES = [
  'startup-readiness',
  'permit-issuance',
  'inspection-pass',
  'team-access-grant',
  'site-health-repair-acknowledgment',
  'closeout-acceptance',
  'buyout-commitment',
  'document-control-exception',
  'integration-configuration',
  'generic',
] as const;

export type ApprovalCheckpointType = (typeof APPROVAL_CHECKPOINT_TYPES)[number];

export const APPROVAL_AUTHORITY_TYPES = [
  'it-admin',
  'pcc-admin',
  'project-executive',
  'project-manager',
  'combined',
  'checkpoint-specific',
] as const;

export type ApprovalAuthorityType = (typeof APPROVAL_AUTHORITY_TYPES)[number];

export const REVIEWER_ACTIONS = [
  'approve',
  'reject',
  'request-changes',
  'delegate',
  'cancel',
] as const;

export type ReviewerAction = (typeof REVIEWER_ACTIONS)[number];

export interface IReviewerActionRecord {
  id: string;
  checkpointId: PccApprovalCheckpointId;
  action: ReviewerAction;
  actorUpn: string;
  actorPersona?: PccPersona;
  /** Populated only when `action === 'delegate'`. */
  delegatedToUpn?: string;
  /** ISO 8601 UTC. */
  occurredAtUtc: string;
  note?: string;
}

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
  /**
   * Phase 3 / Wave 1 / Prompt 04 vocabulary fields. Optional to preserve
   * Prompt 02 shape backward compatibility.
   */
  checkpointType?: ApprovalCheckpointType;
  authorityType?: ApprovalAuthorityType;
}
