import { describe, expect, it } from 'vitest';
import { applyOverrideApprovalAction } from './overrideApproval.js';
import { createStructuredOverrideRequest } from './overrideRequest.js';

function createRequest() {
  return createStructuredOverrideRequest({
    requestId: 'req-approve-1',
    targetUserId: 'user-1',
    baseRoleId: 'project-manager',
    requestedChange: {
      mode: 'grant',
      grants: ['project-hub:approve'],
    },
    businessReason: 'Temporary approval needed for contract release process.',
    targetFeatureId: 'project-hub',
    targetAction: 'approve',
    requesterId: 'manager-1',
    requestedAt: '2026-03-06T00:00:00.000Z',
    requestedDurationHours: 24,
  });
}

describe('overrideApproval workflow', () => {
  it('approves with default expiration when no permanent flag is provided', () => {
    const result = applyOverrideApprovalAction({
      request: createRequest(),
      command: {
        reviewerId: 'admin-1',
        decision: 'approve',
      },
    });

    expect(result.ok).toBe(true);
    expect(result.override?.approval.state).toBe('approved');
    expect(result.override?.expiration.expiresAt).toBeTruthy();
    expect(result.audit?.eventType).toBe('request-approved');
  });

  it('blocks permanent access when explicit justification is missing', () => {
    const result = applyOverrideApprovalAction({
      request: createRequest(),
      command: {
        reviewerId: 'admin-1',
        decision: 'approve',
        markPermanent: true,
      },
    });

    expect(result.ok).toBe(false);
  });

  it('rejects requests only with rejection reason', () => {
    const result = applyOverrideApprovalAction({
      request: createRequest(),
      command: {
        reviewerId: 'admin-1',
        decision: 'reject',
      },
    });

    expect(result.ok).toBe(false);
  });

  it('emits request-rejected when rejection succeeds', () => {
    const result = applyOverrideApprovalAction({
      request: createRequest(),
      command: {
        reviewerId: 'admin-1',
        decision: 'reject',
        rejectionReason: 'Insufficient business justification for elevated access.',
      },
    });

    expect(result.ok).toBe(true);
    expect(result.audit?.eventType).toBe('request-rejected');
  });
});
