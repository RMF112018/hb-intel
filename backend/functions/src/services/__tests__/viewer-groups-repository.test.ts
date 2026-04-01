import { describe, it, expect } from 'vitest';
import { MockViewerGroupsRepository } from '../viewer-groups-repository.js';
import type { IDepartmentViewerPolicy } from '../viewer-groups-list-contract.js';

function makePolicy(overrides: Partial<IDepartmentViewerPolicy> = {}): IDepartmentViewerPolicy {
  return {
    department: 'Commercial',
    defaultViewerGroupIds: ['group-id-1', 'group-id-2'],
    defaultViewerGroupNames: 'Finance Viewers, Executive Viewers',
    isActive: true,
    lastReviewedAt: '2026-03-15T10:00:00Z',
    notes: undefined,
    ...overrides,
  };
}

describe('MockViewerGroupsRepository', () => {
  describe('getActivePolicies', () => {
    it('returns only active policies', async () => {
      const repo = new MockViewerGroupsRepository([
        makePolicy({ department: 'Commercial', isActive: true }),
        makePolicy({ department: 'Luxury Residential', isActive: false }),
        makePolicy({ department: 'Industrial', isActive: true }),
      ]);

      const active = await repo.getActivePolicies();

      expect(active).toHaveLength(2);
      expect(active.map((p) => p.department)).toEqual(['Commercial', 'Industrial']);
    });

    it('returns empty array when no active policies exist', async () => {
      const repo = new MockViewerGroupsRepository([
        makePolicy({ department: 'Commercial', isActive: false }),
      ]);

      const active = await repo.getActivePolicies();
      expect(active).toEqual([]);
    });

    it('returns empty array for empty repository', async () => {
      const repo = new MockViewerGroupsRepository();
      const active = await repo.getActivePolicies();
      expect(active).toEqual([]);
    });
  });

  describe('getPolicyForDepartment', () => {
    it('returns the correct department policy', async () => {
      const repo = new MockViewerGroupsRepository([
        makePolicy({ department: 'Commercial' }),
        makePolicy({ department: 'Luxury Residential', defaultViewerGroupIds: ['group-lr-1'] }),
      ]);

      const policy = await repo.getPolicyForDepartment('Luxury Residential');

      expect(policy).not.toBeNull();
      expect(policy!.department).toBe('Luxury Residential');
      expect(policy!.defaultViewerGroupIds).toEqual(['group-lr-1']);
    });

    it('returns null for unknown department', async () => {
      const repo = new MockViewerGroupsRepository([
        makePolicy({ department: 'Commercial' }),
      ]);

      const policy = await repo.getPolicyForDepartment('Unknown');
      expect(policy).toBeNull();
    });

    it('returns null for inactive department', async () => {
      const repo = new MockViewerGroupsRepository([
        makePolicy({ department: 'Commercial', isActive: false }),
      ]);

      const policy = await repo.getPolicyForDepartment('Commercial');
      expect(policy).toBeNull();
    });
  });
});
