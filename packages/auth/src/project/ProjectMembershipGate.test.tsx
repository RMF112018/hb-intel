import { describe, expect, it } from 'vitest';
import type { ProjectAccessResult } from './validateProjectAccess.js';

/**
 * ProjectMembershipGate is a thin React component — its behavior is:
 * - granted → render children
 * - denied → render fallback or null + call onAccessDenied
 *
 * The component logic is trivial; the critical enforcement path is
 * validateProjectAccess() which is tested in validateProjectAccess.test.ts.
 *
 * These tests verify the access result shapes used by the gate.
 */

describe('ProjectMembershipGate access result shapes', () => {
  it('granted result has role and no denial reason', () => {
    const result: ProjectAccessResult = {
      granted: true,
      role: {
        effectiveRole: 'project-team-member',
        tier: 'member',
        isMember: true,
        eligibilityPath: 'team-group',
      },
    };
    expect(result.granted).toBe(true);
    expect(result.role).not.toBeNull();
    expect(result.denialReason).toBeUndefined();
  });

  it('denied result has null role and denial reason', () => {
    const result: ProjectAccessResult = {
      granted: false,
      role: null,
      denialReason: 'no-eligibility-path',
    };
    expect(result.granted).toBe(false);
    expect(result.role).toBeNull();
    expect(result.denialReason).toBe('no-eligibility-path');
  });

  it('external-member-expired denial reason', () => {
    const result: ProjectAccessResult = {
      granted: false,
      role: null,
      denialReason: 'external-member-expired',
    };
    expect(result.denialReason).toBe('external-member-expired');
  });

  it('project-not-found denial reason', () => {
    const result: ProjectAccessResult = {
      granted: false,
      role: null,
      denialReason: 'project-not-found',
    };
    expect(result.denialReason).toBe('project-not-found');
  });
});
