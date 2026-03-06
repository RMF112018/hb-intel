import { describe, expect, it } from 'vitest';
import {
  approveOverrideRequest,
  createOverrideRequest,
  markDependentOverridesForRoleReview,
  renewOverrideRecord,
  resolveOverrideLifecycleStatus,
  revokeOverrideRecord,
} from './overrideRecord.js';

describe('overrideRecord', () => {
  it('creates override requests with all required governance metadata', () => {
    const record = createOverrideRequest({
      id: 'override-1',
      targetUserId: 'user-1',
      baseRoleId: 'member',
      requestedChange: {
        mode: 'grant',
        grants: ['project:approve', 'project:approve'],
      },
      reason: 'Temporary month-end approval coverage for finance handoff.',
      requesterId: 'manager-1',
      emergency: false,
      expiresAt: '2026-03-10T00:00:00.000Z',
    });

    expect(record.approval.state).toBe('pending');
    expect(record.requestedChange.grants).toEqual(['project:approve']);
    expect(record.status).toBe('active');
  });

  it('enforces emergency override reason and expiration requirements', () => {
    expect(() =>
      createOverrideRequest({
        id: 'override-2',
        targetUserId: 'user-2',
        baseRoleId: 'member',
        requestedChange: {
          mode: 'restriction',
          grants: ['project:edit'],
        },
        reason: 'too short',
        requesterId: 'manager-2',
        emergency: true,
      }),
    ).toThrowError(/detailed reason/i);
  });

  it('supports approval, renewal, and expiration lifecycle transitions', () => {
    const requested = createOverrideRequest({
      id: 'override-3',
      targetUserId: 'user-3',
      baseRoleId: 'member',
      requestedChange: {
        mode: 'grant',
        grants: ['project:edit'],
      },
      reason: 'Coverage for release period.',
      requesterId: 'manager-1',
      emergency: false,
      expiresAt: '2026-03-04T00:00:00.000Z',
    });
    const approved = approveOverrideRequest(requested, { approverId: 'security-approver' });
    const renewed = renewOverrideRecord(approved, { expiresAt: '2026-03-25T00:00:00.000Z' });

    expect(approved.approval.state).toBe('approved');
    expect(renewed.expiration.renewalState).toBe('renewed');
    expect(resolveOverrideLifecycleStatus(approved, new Date('2026-03-06T00:00:00.000Z'))).toBe(
      'archived',
    );
  });

  it('prevents invalid transitions from archived records', () => {
    const requested = createOverrideRequest({
      id: 'override-4',
      targetUserId: 'user-4',
      baseRoleId: 'member',
      requestedChange: {
        mode: 'grant',
        grants: ['project:view'],
      },
      reason: 'Read-only continuity support.',
      requesterId: 'manager-1',
      emergency: false,
    });
    const revoked = revokeOverrideRecord(requested);

    expect(revoked.status).toBe('revoked');
  });

  it('marks dependent overrides for review when base role versions change', () => {
    const memberOverride = createOverrideRequest({
      id: 'override-5',
      targetUserId: 'user-5',
      baseRoleId: 'member',
      requestedChange: {
        mode: 'grant',
        grants: ['project:approve'],
      },
      reason: 'Critical project gate coverage.',
      requesterId: 'manager-1',
      emergency: false,
    });

    const otherOverride = createOverrideRequest({
      id: 'override-6',
      targetUserId: 'user-6',
      baseRoleId: 'admin',
      requestedChange: {
        mode: 'restriction',
        grants: ['project:delete'],
      },
      reason: 'Temporary safeguard.',
      requesterId: 'manager-1',
      emergency: false,
    });

    const reviewed = markDependentOverridesForRoleReview({
      overrides: [memberOverride, otherOverride],
      changedRoles: [{ roleId: 'member', previousVersion: 1, nextVersion: 2 }],
      markedBy: 'policy-engine',
    });

    expect(reviewed[0].review.reviewRequired).toBe(true);
    expect(reviewed[1].review.reviewRequired).toBe(false);
  });
});
