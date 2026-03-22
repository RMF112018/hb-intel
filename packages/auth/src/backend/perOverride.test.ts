import { describe, expect, it } from 'vitest';
import {
  createPerOverrideRequest,
  isPerOverride,
  getPerOverridesForUser,
  getPerOverridesForProject,
  suspendPerOverridesForDepartmentChange,
} from './perOverride.js';
import { approveOverrideRequest, createOverrideRequest } from './overrideRecord.js';

function makeActivePerOverride(overrides: {
  id: string;
  targetUserId: string;
  projectIds: string[];
  department: string;
}) {
  const pending = createPerOverrideRequest({
    ...overrides,
    reason: 'Out-of-scope review access.',
    requesterId: 'opex-manager',
    expiresAt: '2026-12-31T00:00:00.000Z',
  });
  return approveOverrideRequest(pending, {
    approverId: 'opex-manager',
    approverScope: 'company-wide',
  });
}

function makeGeneralOverride(id: string, userId: string) {
  const pending = createOverrideRequest({
    id,
    targetUserId: userId,
    baseRoleId: 'member',
    requestedChange: { mode: 'grant', grants: ['project:edit'] },
    reason: 'General coverage override.',
    requesterId: 'manager-1',
    emergency: false,
    expiresAt: '2026-12-31T00:00:00.000Z',
  });
  return approveOverrideRequest(pending, { approverId: 'manager-1' });
}

describe('perOverride', () => {
  describe('createPerOverrideRequest', () => {
    it('creates a PER override with correct defaults', () => {
      const record = createPerOverrideRequest({
        id: 'per-001',
        targetUserId: 'exec-1',
        projectIds: ['proj-a', 'proj-b'],
        department: 'Healthcare',
        reason: 'Cross-department portfolio review.',
        requesterId: 'opex-manager',
        expiresAt: '2026-06-01T00:00:00.000Z',
      });

      expect(record.overrideType).toBe('out-of-scope-per');
      expect(record.projectIds).toEqual(['proj-a', 'proj-b']);
      expect(record.department).toBe('Healthcare');
      expect(record.baseRoleId).toBe('portfolio-executive-reviewer');
      expect(record.emergency).toBe(false);
      expect(record.review.reviewRequired).toBe(true);
      expect(record.approval.state).toBe('pending');
      expect(record.requestedChange.mode).toBe('grant');
      expect(record.requestedChange.grants).toContain('per:read');
      expect(record.requestedChange.grants).toContain('per:annotate');
      expect(record.requestedChange.grants).toContain('per:push-to-team');
      expect(record.requestedChange.grants).toContain('per:report-review-run');
    });
  });

  describe('isPerOverride', () => {
    it('returns true for PER overrides', () => {
      const record = createPerOverrideRequest({
        id: 'per-002',
        targetUserId: 'exec-1',
        projectIds: ['proj-a'],
        department: 'Commercial',
        reason: 'Review.',
        requesterId: 'opex-manager',
        expiresAt: '2026-06-01T00:00:00.000Z',
      });
      expect(isPerOverride(record)).toBe(true);
    });

    it('returns false for general overrides', () => {
      const record = makeGeneralOverride('gen-001', 'user-1');
      expect(isPerOverride(record)).toBe(false);
    });
  });

  describe('getPerOverridesForUser', () => {
    it('returns only active PER overrides for the specified user', () => {
      const perExec1 = makeActivePerOverride({
        id: 'per-u1',
        targetUserId: 'exec-1',
        projectIds: ['proj-a'],
        department: 'Healthcare',
      });
      const perExec2 = makeActivePerOverride({
        id: 'per-u2',
        targetUserId: 'exec-2',
        projectIds: ['proj-b'],
        department: 'Commercial',
      });
      const general = makeGeneralOverride('gen-u1', 'exec-1');

      const result = getPerOverridesForUser([perExec1, perExec2, general], 'exec-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('per-u1');
    });
  });

  describe('getPerOverridesForProject', () => {
    it('returns active PER overrides containing the specified project', () => {
      const per1 = makeActivePerOverride({
        id: 'per-p1',
        targetUserId: 'exec-1',
        projectIds: ['proj-a', 'proj-b'],
        department: 'Healthcare',
      });
      const per2 = makeActivePerOverride({
        id: 'per-p2',
        targetUserId: 'exec-2',
        projectIds: ['proj-c'],
        department: 'Commercial',
      });

      const result = getPerOverridesForProject([per1, per2], 'proj-b');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('per-p1');
    });

    it('returns empty when no PER overrides match the project', () => {
      const per = makeActivePerOverride({
        id: 'per-p3',
        targetUserId: 'exec-1',
        projectIds: ['proj-x'],
        department: 'Healthcare',
      });

      expect(getPerOverridesForProject([per], 'proj-z')).toHaveLength(0);
    });
  });

  describe('suspendPerOverridesForDepartmentChange', () => {
    it('revokes PER overrides matching the user and previous department', () => {
      const per = makeActivePerOverride({
        id: 'per-s1',
        targetUserId: 'exec-1',
        projectIds: ['proj-a'],
        department: 'Healthcare',
      });
      const unrelated = makeActivePerOverride({
        id: 'per-s2',
        targetUserId: 'exec-2',
        projectIds: ['proj-b'],
        department: 'Healthcare',
      });
      const general = makeGeneralOverride('gen-s1', 'exec-1');

      const result = suspendPerOverridesForDepartmentChange(
        [per, unrelated, general],
        'exec-1',
        'Healthcare',
      );

      expect(result[0].status).toBe('revoked');
      expect(result[1].status).toBe('active'); // different user
      expect(result[2].status).toBe('active'); // not a PER override
    });

    it('does not revoke overrides from a different department', () => {
      const per = makeActivePerOverride({
        id: 'per-s3',
        targetUserId: 'exec-1',
        projectIds: ['proj-a'],
        department: 'Commercial',
      });

      const result = suspendPerOverridesForDepartmentChange([per], 'exec-1', 'Healthcare');
      expect(result[0].status).toBe('active');
    });
  });
});
