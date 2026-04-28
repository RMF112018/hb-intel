/**
 * PCC fixture — sample approval checkpoints and reviewer actions.
 *
 * Deterministic, non-secret. Phase 3 / Wave 1 / Prompt 06.
 */

import type {
  IApprovalCheckpoint,
  IReviewerActionRecord,
} from '../ApprovalCheckpoint.js';
import type {
  PccApprovalCheckpointId,
  PccWorkflowItemId,
} from '../types.js';

const PM_UPN = 'pm-sample@example.com';
const PE_UPN = 'pe-sample@example.com';
const SUPER_UPN = 'super-sample@example.com';

export const SAMPLE_APPROVAL_CHECKPOINTS: readonly IApprovalCheckpoint[] = [
  {
    id: 'fixture-cp-001' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-001' as PccWorkflowItemId,
    requiredPersona: 'project-executive',
    state: 'pending',
    requestedAtUtc: '2026-04-25T08:30:00Z',
    checkpointType: 'startup-readiness',
    authorityType: 'project-executive',
  },
  {
    id: 'fixture-cp-002' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-002' as PccWorkflowItemId,
    requiredPersona: 'pcc-admin',
    state: 'approved',
    requestedAtUtc: '2026-04-24T08:00:00Z',
    decidedAtUtc: '2026-04-26T10:15:00Z',
    decidedByUpn: 'admin-sample@example.com',
    decisionNote: 'Permit submission package complete.',
    checkpointType: 'permit-issuance',
    authorityType: 'pcc-admin',
  },
  {
    id: 'fixture-cp-003' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-003' as PccWorkflowItemId,
    requiredPersona: 'project-manager',
    state: 'rejected',
    requestedAtUtc: '2026-04-23T08:00:00Z',
    decidedAtUtc: '2026-04-23T16:00:00Z',
    decidedByUpn: PM_UPN,
    decisionNote: 'Inspection prerequisites incomplete; rework needed.',
    checkpointType: 'inspection-pass',
    authorityType: 'project-manager',
  },
  {
    id: 'fixture-cp-004' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-002' as PccWorkflowItemId,
    requiredPersona: 'project-executive',
    state: 'waived',
    requestedAtUtc: '2026-04-22T08:00:00Z',
    decidedAtUtc: '2026-04-22T11:00:00Z',
    decidedByUpn: PE_UPN,
    decisionNote: 'Waived per documented exception in startup register.',
    checkpointType: 'generic',
    authorityType: 'combined',
  },
];

export const SAMPLE_REVIEWER_ACTIONS: readonly IReviewerActionRecord[] = [
  {
    id: 'fixture-ra-001',
    checkpointId: 'fixture-cp-001' as PccApprovalCheckpointId,
    action: 'request-changes',
    actorUpn: PE_UPN,
    actorPersona: 'project-executive',
    occurredAtUtc: '2026-04-25T13:00:00Z',
    note: 'Need updated cost forecast before approval.',
  },
  {
    id: 'fixture-ra-002',
    checkpointId: 'fixture-cp-002' as PccApprovalCheckpointId,
    action: 'approve',
    actorUpn: 'admin-sample@example.com',
    actorPersona: 'pcc-admin',
    occurredAtUtc: '2026-04-26T10:15:00Z',
  },
  {
    id: 'fixture-ra-003',
    checkpointId: 'fixture-cp-001' as PccApprovalCheckpointId,
    action: 'delegate',
    actorUpn: PM_UPN,
    actorPersona: 'project-manager',
    delegatedToUpn: SUPER_UPN,
    occurredAtUtc: '2026-04-25T16:00:00Z',
    note: 'Delegating mobilization sub-checkpoint to superintendent.',
  },
];
