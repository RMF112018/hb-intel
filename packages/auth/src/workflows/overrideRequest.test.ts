import { describe, expect, it } from 'vitest';
import {
  createStructuredOverrideRequest,
  validateStructuredOverrideRequest,
} from './overrideRequest.js';

const baseCommand = {
  requestId: 'req-100',
  targetUserId: 'user-1',
  baseRoleId: 'project-manager',
  requestedChange: {
    mode: 'grant' as const,
    grants: ['project-hub:approve'],
  },
  businessReason: 'Need temporary approval rights during closeout signoff window.',
  targetFeatureId: 'project-hub',
  targetAction: 'approve',
  requesterId: 'manager-1',
  requestedDurationHours: 72,
};

describe('overrideRequest workflow', () => {
  it('validates required structured request fields', () => {
    const result = validateStructuredOverrideRequest({
      ...baseCommand,
      businessReason: 'short',
      requestedDurationHours: undefined,
      requestedExpiresAt: undefined,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('creates structured request with normalized grants and calculated expiration', () => {
    const request = createStructuredOverrideRequest({
      ...baseCommand,
      requestedChange: {
        mode: 'grant',
        grants: ['project-hub:approve', 'project-hub:approve'],
      },
      requestedAt: '2026-03-06T00:00:00.000Z',
    });

    expect(request.requestedChange.grants).toEqual(['project-hub:approve']);
    expect(request.requestedExpiresAt).toBe('2026-03-09T00:00:00.000Z');
  });
});
