import { describe, expect, it } from 'vitest';
import { createOverrideRequest } from '../backend/index.js';
import {
  applyEmergencyReviewDecision,
  applyOverrideReviewDecision,
  applyRenewalRequest,
  isRenewalDue,
  resolveRoleChangeReview,
} from './workflows.js';

function createSampleOverride() {
  return createOverrideRequest({
    id: 'override-sample',
    targetUserId: 'user-1',
    baseRoleId: 'project-manager',
    requestedChange: {
      mode: 'grant',
      grants: ['project-hub:approve'],
    },
    reason: 'Support controlled release approval coverage for project closeout.',
    requesterId: 'user-requester',
    requestedAt: '2026-03-06T10:00:00.000Z',
    expiresAt: '2026-03-12T00:00:00.000Z',
    emergency: false,
  });
}

describe('admin workflows', () => {
  it('approves pending overrides', () => {
    const result = applyOverrideReviewDecision(createSampleOverride(), {
      reviewerId: 'security-1',
      decision: 'approve',
    });

    expect(result.ok).toBe(true);
    expect(result.updatedOverride?.approval.state).toBe('approved');
  });

  it('requires rejection reason', () => {
    const result = applyOverrideReviewDecision(createSampleOverride(), {
      reviewerId: 'security-1',
      decision: 'reject',
    });

    expect(result.ok).toBe(false);
  });

  it('handles renewal requests with justification', () => {
    const approved = applyOverrideReviewDecision(createSampleOverride(), {
      reviewerId: 'security-1',
      decision: 'approve',
    }).updatedOverride;

    if (!approved) {
      throw new Error('Expected approved override in renewal test.');
    }

    const result = applyRenewalRequest(approved, {
      reviewerId: 'security-1',
      reason: 'Renewal approved for continued operational continuity coverage.',
      expiresAt: '2026-03-25T00:00:00.000Z',
    });

    expect(result.ok).toBe(true);
    expect(result.updatedOverride?.expiration.renewalState).toBe('renewed');
  });

  it('flags near-term expirations for renewal queue handling', () => {
    const due = isRenewalDue(createSampleOverride(), 24 * 14, new Date('2026-03-06T00:00:00.000Z'));
    expect(due).toBe(true);
  });

  it('resolves role-change review flags', () => {
    const flagged = {
      ...createSampleOverride(),
      review: {
        reviewRequired: true,
        reviewReason: 'Base role changed',
      },
    };

    const result = resolveRoleChangeReview(flagged, {
      reviewerId: 'security-1',
      reason: 'Impact reviewed and accepted.',
    });

    expect(result.ok).toBe(true);
    expect(result.updatedOverride?.review.reviewRequired).toBe(false);
  });

  it('requires detailed reason for emergency review', () => {
    const emergency = createOverrideRequest({
      id: 'override-emergency',
      targetUserId: 'user-1',
      baseRoleId: 'project-manager',
      requestedChange: {
        mode: 'grant',
        grants: ['project-hub:approve'],
      },
      reason: 'Emergency release gate coverage needed immediately.',
      requesterId: 'user-requester',
      expiresAt: '2026-03-06T18:00:00.000Z',
      emergency: true,
    });

    const result = applyEmergencyReviewDecision(emergency, {
      reviewerId: 'security-1',
      decision: 'approve',
      reason: 'short',
    });

    expect(result.ok).toBe(false);
  });
});
