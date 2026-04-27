import { describe, expect, it } from 'vitest';
import type { ManagerOperationsCount } from '../managerOperationsViewModel.js';
import { buildRecommendedNextAction } from '../recommendedNextAction.js';

const baseCounts: ReadonlyArray<ManagerOperationsCount> = [
  { id: 'live', label: 'Live', value: 0 },
  { id: 'staged', label: 'Staged', value: 0 },
  { id: 'blocked', label: 'Blocked', value: 0 },
  { id: 'unassigned', label: 'Unassigned', value: 0 },
];

function counts(overrides: Partial<Record<ManagerOperationsCount['id'], number>>): ReadonlyArray<ManagerOperationsCount> {
  return baseCounts.map((entry) => ({ ...entry, value: overrides[entry.id] ?? entry.value }));
}

describe('buildRecommendedNextAction', () => {
  it('routes to admin diagnostics when token-acquisition is degraded', () => {
    const action = buildRecommendedNextAction({
      counts: counts({ blocked: 5 }),
      tokenAcquisitionDegraded: true,
      canSync: true,
      contentLoaded: 5,
    });
    expect(action.id).toBe('token-degraded');
    expect(action.target).toEqual({ kind: 'select-nav', key: 'admin-config' });
    expect(action.cta).toBe('Open Admin / Config');
  });

  it('routes to admin diagnostics when sync is blocked', () => {
    const action = buildRecommendedNextAction({
      counts: counts({}),
      tokenAcquisitionDegraded: false,
      canSync: false,
      contentLoaded: 0,
    });
    expect(action.id).toBe('sync-blocked');
    expect(action.target).toEqual({ kind: 'select-nav', key: 'admin-config' });
  });

  it('focuses the blocked inbox bucket when blocked > 0 and other states exist', () => {
    const action = buildRecommendedNextAction({
      counts: counts({ blocked: 2, unassigned: 5, staged: 1, live: 1 }),
      tokenAcquisitionDegraded: false,
      canSync: true,
      contentLoaded: 9,
    });
    expect(action.id).toBe('resolve-blocked');
    expect(action.target).toEqual({ kind: 'focus-bucket', bucketId: 'blocked' });
    expect(action.headline).toMatch(/2 lanes or records are blocked/);
  });

  it('uses singular copy when blocked count is exactly one', () => {
    const action = buildRecommendedNextAction({
      counts: counts({ blocked: 1 }),
      tokenAcquisitionDegraded: false,
      canSync: true,
      contentLoaded: 1,
    });
    expect(action.headline).toMatch(/^1 lane or record is blocked/);
  });

  it('focuses unassigned bucket when no blockers but unassigned > 0', () => {
    const action = buildRecommendedNextAction({
      counts: counts({ unassigned: 4, staged: 2 }),
      tokenAcquisitionDegraded: false,
      canSync: true,
      contentLoaded: 6,
    });
    expect(action.id).toBe('review-unassigned');
    expect(action.target).toEqual({ kind: 'focus-bucket', bucketId: 'unassigned' });
  });

  it('routes to lane board when only staged content remains', () => {
    const action = buildRecommendedNextAction({
      counts: counts({ staged: 3, live: 1 }),
      tokenAcquisitionDegraded: false,
      canSync: true,
      contentLoaded: 4,
    });
    expect(action.id).toBe('place-staged');
    expect(action.target).toEqual({ kind: 'select-nav', key: 'lane-board' });
  });

  it('reports stable state when only live content present', () => {
    const action = buildRecommendedNextAction({
      counts: counts({ live: 3 }),
      tokenAcquisitionDegraded: false,
      canSync: true,
      contentLoaded: 3,
    });
    expect(action.id).toBe('all-stable');
    expect(action.cta).toBeNull();
    expect(action.target).toBeNull();
  });

  it('reports no content state when nothing is loaded', () => {
    const action = buildRecommendedNextAction({
      counts: counts({}),
      tokenAcquisitionDegraded: false,
      canSync: true,
      contentLoaded: 0,
    });
    expect(action.id).toBe('no-content');
    expect(action.cta).toBeNull();
  });
});
