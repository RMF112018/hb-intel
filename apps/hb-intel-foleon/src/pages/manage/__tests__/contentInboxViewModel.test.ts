import { describe, expect, it } from 'vitest';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../../types/foleon-management.types.js';
import {
  buildContentInboxBuckets,
  type ContentInboxBucketId,
} from '../contentInboxViewModel.js';

describe('buildContentInboxBuckets', () => {
  it('returns five buckets in fixed priority order', () => {
    const buckets = buildContentInboxBuckets({ content: [], placements: [] });
    expect(buckets.map((b) => b.id)).toEqual([
      'blocked',
      'unassigned',
      'live',
      'staged',
      'published-eligible',
    ]);
  });

  it('routes a record with validationStatus blocked into the blocked bucket', () => {
    const record = content({ id: 'c-1', foleonDocId: 1, validationStatus: 'blocked' });
    const buckets = buildContentInboxBuckets({ content: [record], placements: [] });
    expect(idsIn(buckets, 'blocked')).toEqual(['c-1']);
    expect(idsIn(buckets, 'unassigned')).toEqual([]);
  });

  it('routes a record with blockingReasons into blocked even when validationStatus is valid', () => {
    const record = content({ id: 'c-2', foleonDocId: 2, blockingReasons: ['needs review'] });
    const buckets = buildContentInboxBuckets({ content: [record], placements: [] });
    expect(idsIn(buckets, 'blocked')).toEqual(['c-2']);
  });

  it('routes a record with no placement into unassigned', () => {
    const record = content({ id: 'c-3', foleonDocId: 3 });
    const buckets = buildContentInboxBuckets({ content: [record], placements: [] });
    expect(idsIn(buckets, 'unassigned')).toEqual(['c-3']);
  });

  it('routes an actively-placed record into live', () => {
    const record = content({ id: 'c-4', foleonDocId: 4 });
    const buckets = buildContentInboxBuckets({
      content: [record],
      placements: [placement({ foleonDocId: 4, isActive: true })],
    });
    expect(idsIn(buckets, 'live')).toEqual(['c-4']);
    expect(idsIn(buckets, 'unassigned')).toEqual([]);
  });

  it('routes a placed-but-inactive Published+visible+homepage-eligible record into published-eligible', () => {
    const record = content({
      id: 'c-5',
      foleonDocId: 5,
      publishStatus: 'Published',
      isVisible: true,
      isHomepageEligible: true,
    });
    const buckets = buildContentInboxBuckets({
      content: [record],
      placements: [placement({ foleonDocId: 5, isActive: false })],
    });
    expect(idsIn(buckets, 'published-eligible')).toEqual(['c-5']);
  });

  it('routes a placed-but-inactive draft into staged', () => {
    const record = content({
      id: 'c-6',
      foleonDocId: 6,
      publishStatus: 'Draft',
      isVisible: false,
      isHomepageEligible: true,
    });
    const buckets = buildContentInboxBuckets({
      content: [record],
      placements: [placement({ foleonDocId: 6, isActive: false })],
    });
    expect(idsIn(buckets, 'staged')).toEqual(['c-6']);
  });

  it('places each record in exactly one bucket', () => {
    const records = [
      content({ id: 'c-1', foleonDocId: 1, validationStatus: 'blocked' }),
      content({ id: 'c-2', foleonDocId: 2 }),
      content({ id: 'c-3', foleonDocId: 3 }),
      content({ id: 'c-4', foleonDocId: 4, publishStatus: 'Published', isVisible: true, isHomepageEligible: true }),
    ];
    const placements = [
      placement({ foleonDocId: 3, isActive: true }),
      placement({ foleonDocId: 4, isActive: false }),
    ];
    const buckets = buildContentInboxBuckets({ content: records, placements });
    const allIds = buckets.flatMap((b) => b.items.map((i) => i.id));
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
    expect(unique.size).toBe(records.length);
  });
});

function content(overrides: Partial<FoleonManagedContent> = {}): FoleonManagedContent {
  return {
    id: 'c-x',
    sharePointItemId: 1,
    etag: '"1"',
    title: 'Record',
    foleonDocId: 100,
    contentTypeKey: 'Project Spotlight',
    publishStatus: 'Draft',
    isVisible: true,
    isHomepageEligible: true,
    validationStatus: 'valid',
    blockingReasons: [],
    ...overrides,
  };
}

function placement(overrides: Partial<FoleonPlacement> = {}): FoleonPlacement {
  return {
    id: 'p-x',
    sharePointItemId: 10,
    etag: '"1"',
    title: 'Placement',
    placementKey: 'Project Spotlight Active',
    contentItemId: 1,
    foleonDocId: 100,
    isActive: true,
    sortRank: 1,
    validationStatus: 'valid',
    blockingReasons: [],
    ...overrides,
  };
}

function idsIn(buckets: ReadonlyArray<{ readonly id: ContentInboxBucketId; readonly items: ReadonlyArray<{ readonly id: string }> }>, bucketId: ContentInboxBucketId): string[] {
  return buckets.find((b) => b.id === bucketId)?.items.map((i) => i.id) ?? [];
}
