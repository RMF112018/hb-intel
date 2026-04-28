import { describe, it, expect } from 'vitest';
import {
  APPROVAL_CHECKPOINT_STATES,
  APPROVAL_CHECKPOINT_TYPES,
  APPROVAL_AUTHORITY_TYPES,
  REVIEWER_ACTIONS,
  type IApprovalCheckpoint,
  type IReviewerActionRecord,
} from './ApprovalCheckpoint.js';
import type {
  PccApprovalCheckpointId,
  PccWorkflowItemId,
} from './types.js';

const cpId = 'cp-001' as PccApprovalCheckpointId;
const itemId = 'wi-001' as PccWorkflowItemId;

describe('PCC approval checkpoints', () => {
  it('APPROVAL_CHECKPOINT_TYPES matches the locked literal set', () => {
    expect([...APPROVAL_CHECKPOINT_TYPES]).toEqual([
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
    ]);
  });

  it('APPROVAL_AUTHORITY_TYPES matches the locked literal set', () => {
    expect([...APPROVAL_AUTHORITY_TYPES]).toEqual([
      'it-admin',
      'pcc-admin',
      'project-executive',
      'project-manager',
      'combined',
      'checkpoint-specific',
    ]);
  });

  it('REVIEWER_ACTIONS matches the locked literal set', () => {
    expect([...REVIEWER_ACTIONS]).toEqual([
      'approve',
      'reject',
      'request-changes',
      'delegate',
      'cancel',
    ]);
  });

  it('APPROVAL_CHECKPOINT_STATES is unchanged', () => {
    expect([...APPROVAL_CHECKPOINT_STATES]).toEqual(['pending', 'approved', 'rejected', 'waived']);
  });

  it('Prompt 02 IApprovalCheckpoint shape (without checkpointType/authorityType) still accepted', () => {
    const cp: IApprovalCheckpoint = {
      id: cpId,
      workflowItemId: itemId,
      requiredPersona: 'project-manager',
      state: 'pending',
      requestedAtUtc: '2026-04-28T12:00:00Z',
    };
    expect(cp.id).toBe(cpId);
    expect(cp.checkpointType).toBeUndefined();
    expect(cp.authorityType).toBeUndefined();
  });

  it('extended IApprovalCheckpoint accepts checkpointType and authorityType', () => {
    const cp: IApprovalCheckpoint = {
      id: cpId,
      workflowItemId: itemId,
      requiredPersona: 'project-executive',
      state: 'approved',
      requestedAtUtc: '2026-04-28T12:00:00Z',
      decidedAtUtc: '2026-04-28T13:00:00Z',
      decidedByUpn: 'pe@example.com',
      decisionNote: 'looks good',
      checkpointType: 'startup-readiness',
      authorityType: 'project-executive',
    };
    expect(cp.checkpointType).toBe('startup-readiness');
    expect(cp.authorityType).toBe('project-executive');
  });

  it('IReviewerActionRecord action is constrained to REVIEWER_ACTIONS', () => {
    const record: IReviewerActionRecord = {
      id: 'ra-1',
      checkpointId: cpId,
      action: 'delegate',
      actorUpn: 'pm@example.com',
      actorPersona: 'project-manager',
      delegatedToUpn: 'super@example.com',
      occurredAtUtc: '2026-04-28T12:30:00Z',
    };
    expect(REVIEWER_ACTIONS).toContain(record.action);
    expect(record.delegatedToUpn).toBe('super@example.com');
  });
});
