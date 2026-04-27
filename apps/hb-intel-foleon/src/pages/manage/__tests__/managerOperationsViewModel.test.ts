import { describe, expect, it } from 'vitest';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../../types/foleon-management.types.js';
import type { FoleonLaneViewModel } from '../manageLaneViewModel.js';
import { buildManagerOperationsCounts } from '../managerOperationsViewModel.js';

describe('buildManagerOperationsCounts', () => {
  it('returns four ordered count entries with stable ids', () => {
    const counts = buildManagerOperationsCounts({ content: [], placements: [], lanes: [] });
    expect(counts.map((entry) => entry.id)).toEqual(['live', 'staged', 'blocked', 'unassigned']);
  });

  it('counts lanes by state', () => {
    const counts = buildManagerOperationsCounts({
      content: [],
      placements: [],
      lanes: [
        lane('project-spotlight', 'Live'),
        lane('company-pulse', 'Preview'),
        lane('leadership-message', 'Blocked'),
      ],
    });
    expect(byId(counts, 'live')).toBe(1);
    expect(byId(counts, 'staged')).toBe(1);
    expect(byId(counts, 'blocked')).toBe(1);
  });

  it('treats Config Incomplete lanes as blocked', () => {
    const counts = buildManagerOperationsCounts({
      content: [],
      placements: [],
      lanes: [lane('project-spotlight', 'Config Incomplete')],
    });
    expect(byId(counts, 'blocked')).toBe(1);
  });

  it('does not count Empty lanes as blocked', () => {
    const counts = buildManagerOperationsCounts({
      content: [],
      placements: [],
      lanes: [lane('project-spotlight', 'Empty')],
    });
    expect(byId(counts, 'blocked')).toBe(0);
    expect(byId(counts, 'staged')).toBe(0);
    expect(byId(counts, 'live')).toBe(0);
  });

  it('counts content records with no placement as unassigned', () => {
    const counts = buildManagerOperationsCounts({
      content: [content({ foleonDocId: 100 }), content({ id: 'c-2', foleonDocId: 200 })],
      placements: [placement({ foleonDocId: 100 })],
      lanes: [],
    });
    expect(byId(counts, 'unassigned')).toBe(1);
  });

  it('reports zero unassigned when there is no content', () => {
    const counts = buildManagerOperationsCounts({
      content: [],
      placements: [placement({ foleonDocId: 100 })],
      lanes: [],
    });
    expect(byId(counts, 'unassigned')).toBe(0);
  });

  it('does not invent a "new" count when no recency field exists', () => {
    const counts = buildManagerOperationsCounts({ content: [content()], placements: [], lanes: [] });
    expect(counts.some((entry) => entry.id === 'new')).toBe(false);
  });
});

function content(overrides: Partial<FoleonManagedContent> = {}): FoleonManagedContent {
  return {
    id: 'c-1',
    sharePointItemId: 1,
    etag: '"1"',
    title: 'Record',
    foleonDocId: 1,
    contentTypeKey: 'Project Spotlight',
    publishStatus: 'Published',
    isVisible: true,
    isHomepageEligible: true,
    validationStatus: 'valid',
    blockingReasons: [],
    ...overrides,
  };
}

function placement(overrides: Partial<FoleonPlacement> = {}): FoleonPlacement {
  return {
    id: 'p-1',
    sharePointItemId: 10,
    etag: '"1"',
    title: 'Placement',
    placementKey: 'Project Spotlight Active',
    contentItemId: 1,
    foleonDocId: 1,
    isActive: true,
    sortRank: 1,
    validationStatus: 'valid',
    blockingReasons: [],
    ...overrides,
  };
}

function lane(
  laneKey: FoleonLaneViewModel['lane'],
  state: FoleonLaneViewModel['state'],
): FoleonLaneViewModel {
  return {
    lane: laneKey,
    label: laneKey,
    readerKey: laneKey,
    placementKey: 'Project Spotlight Active',
    state,
    nextAction: '',
    warnings: [],
    checklist: [],
  };
}

function byId(
  counts: ReadonlyArray<{ readonly id: string; readonly value: number }>,
  id: string,
): number {
  return counts.find((entry) => entry.id === id)?.value ?? -1;
}
