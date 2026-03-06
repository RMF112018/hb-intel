import { describe, expect, it } from 'vitest';
import {
  createRenewalRequest,
  isOverrideExpired,
  runRenewalWorkflow,
} from './renewalWorkflow.js';
import { DEFAULT_OVERRIDE_REQUEST_POLICY } from './overrideRequest.js';
import { createOverrideRequest } from '../backend/overrideRecord.js';

describe('renewalWorkflow', () => {
  it('detects expired overrides and prevents silent continuation', () => {
    const override = createOverrideRequest({
      id: 'ovr-expired-1',
      targetUserId: 'user-1',
      baseRoleId: 'project-manager',
      requestedChange: {
        mode: 'grant',
        grants: ['project-hub:approve'],
      },
      reason: 'Previous approval window.',
      requesterId: 'manager-1',
      expiresAt: '2026-03-01T00:00:00.000Z',
      emergency: false,
    });

    expect(isOverrideExpired(override, new Date('2026-03-06T00:00:00.000Z'))).toBe(true);
  });

  it('requires updated justification for renewal request', () => {
    expect(() =>
      createRenewalRequest(
        {
          renewalRequestId: 'req-renew-1',
          previousRequestId: 'req-prev',
          targetUserId: 'user-1',
          baseRoleId: 'project-manager',
          requestedChange: {
            mode: 'grant',
            grants: ['project-hub:approve'],
          },
          targetFeatureId: 'project-hub',
          targetAction: 'approve',
          requesterId: 'manager-1',
          updatedJustification: 'short',
          requestedDurationHours: 48,
        },
        DEFAULT_OVERRIDE_REQUEST_POLICY,
      ),
    ).toThrowError(/Updated justification/);
  });

  it('runs renewal with fresh approval', () => {
    const result = runRenewalWorkflow({
      action: {
        renewalRequestId: 'req-renew-2',
        previousRequestId: 'req-prev',
        targetUserId: 'user-1',
        baseRoleId: 'project-manager',
        requestedChange: {
          mode: 'grant',
          grants: ['project-hub:approve'],
        },
        targetFeatureId: 'project-hub',
        targetAction: 'approve',
        requesterId: 'manager-1',
        updatedJustification: 'Renewal requested due to ongoing closeout gate responsibilities.',
        requestedDurationHours: 48,
      },
      policy: DEFAULT_OVERRIDE_REQUEST_POLICY,
      approvalCommand: {
        reviewerId: 'admin-1',
        decision: 'approve',
      },
    });

    expect(result.ok).toBe(true);
    expect(result.override?.approval.state).toBe('approved');
  });
});
