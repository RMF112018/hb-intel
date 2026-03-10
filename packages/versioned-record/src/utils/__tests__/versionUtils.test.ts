// src/utils/__tests__/versionUtils.test.ts
import { describe, it, expect, vi } from 'vitest';
import {
  isApprovedTag,
  isSupersededTag,
  isVisibleByDefault,
  filterMetadataForDisplay,
  serializeSnapshot,
  requiresFileStorage,
  getSnapshotIdsToSupersede,
  nextVersionNumber,
  defaultChangeSummary,
  VERSION_TAG_LABELS,
  LARGE_SNAPSHOT_THRESHOLD_BYTES,
} from '../versionUtils';
import type { IVersionMetadata, IVersionedRecordConfig } from '../../types';

const makeMetadata = (
  version: number,
  tag: IVersionMetadata['tag'],
  snapshotId = `snap-${version}`
): IVersionMetadata => ({
  snapshotId,
  version,
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
  changeSummary: `v${version}`,
  tag,
});

// ---------------------------------------------------------------------------
// isApprovedTag
// ---------------------------------------------------------------------------

describe('isApprovedTag', () => {
  it('returns true for approved', () => {
    expect(isApprovedTag('approved')).toBe(true);
  });
  it('returns false for other tags', () => {
    expect(isApprovedTag('draft')).toBe(false);
    expect(isApprovedTag('superseded')).toBe(false);
    expect(isApprovedTag('submitted')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isSupersededTag
// ---------------------------------------------------------------------------

describe('isSupersededTag', () => {
  it('returns true for superseded', () => {
    expect(isSupersededTag('superseded')).toBe(true);
  });
  it('returns false for other tags', () => {
    expect(isSupersededTag('approved')).toBe(false);
    expect(isSupersededTag('draft')).toBe(false);
    expect(isSupersededTag('archived')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isVisibleByDefault
// ---------------------------------------------------------------------------

describe('isVisibleByDefault', () => {
  it('returns true for draft, submitted, approved, rejected, handoff', () => {
    for (const tag of ['draft', 'submitted', 'approved', 'rejected', 'handoff'] as const) {
      expect(isVisibleByDefault(tag)).toBe(true);
    }
  });
  it('returns false for superseded and archived', () => {
    expect(isVisibleByDefault('superseded')).toBe(false);
    expect(isVisibleByDefault('archived')).toBe(false);
  });
});

describe('filterMetadataForDisplay', () => {
  const list = [
    makeMetadata(1, 'submitted'),
    makeMetadata(2, 'approved'),
    makeMetadata(3, 'superseded'),
  ];
  it('hides superseded by default', () => {
    expect(filterMetadataForDisplay(list, false)).toHaveLength(2);
  });
  it('shows superseded when showSuperseded=true', () => {
    expect(filterMetadataForDisplay(list, true)).toHaveLength(3);
  });
});

describe('serializeSnapshot', () => {
  it('excludes specified fields', () => {
    const record = { name: 'Test', isDirty: true, score: 42 };
    const result = JSON.parse(serializeSnapshot(record, ['isDirty']));
    expect(result).not.toHaveProperty('isDirty');
    expect(result).toHaveProperty('name', 'Test');
  });
  it('serializes all fields when excludeFields is empty', () => {
    const record = { a: 1, b: 2 };
    expect(JSON.parse(serializeSnapshot(record))).toEqual(record);
  });
});

describe('requiresFileStorage', () => {
  it('returns false for small payload', () => {
    expect(requiresFileStorage('{"small":true}')).toBe(false);
  });
  it('returns true for payload exceeding 255KB', () => {
    const large = JSON.stringify({ data: 'x'.repeat(260 * 1024) });
    expect(requiresFileStorage(large)).toBe(true);
  });
});

describe('getSnapshotIdsToSupersede', () => {
  const metadata = [
    makeMetadata(1, 'approved', 'snap-1'),
    makeMetadata(2, 'submitted', 'snap-2'),
    makeMetadata(3, 'draft', 'snap-3'),
  ];
  it('returns snapshotIds for versions newer than the target', () => {
    const result = getSnapshotIdsToSupersede(metadata, 'snap-1');
    expect(result).toEqual(['snap-2', 'snap-3']);
  });
  it('returns empty array when target is the newest version', () => {
    expect(getSnapshotIdsToSupersede(metadata, 'snap-3')).toHaveLength(0);
  });
  it('returns empty array when targetSnapshotId is not found', () => {
    expect(getSnapshotIdsToSupersede(metadata, 'snap-999')).toHaveLength(0);
  });
});

describe('nextVersionNumber', () => {
  it('returns 1 for empty list', () => {
    expect(nextVersionNumber([])).toBe(1);
  });
  it('returns max + 1', () => {
    expect(nextVersionNumber([makeMetadata(3, 'approved'), makeMetadata(1, 'draft')])).toBe(4);
  });
});

describe('VERSION_TAG_LABELS', () => {
  it('has a label for every VersionTag value', () => {
    const tags = ['draft','submitted','approved','rejected','archived','handoff','superseded'] as const;
    for (const tag of tags) {
      expect(VERSION_TAG_LABELS[tag]).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// defaultChangeSummary
// ---------------------------------------------------------------------------

describe('defaultChangeSummary', () => {
  it('uses custom generator when provided', () => {
    const config = {
      recordType: 'bd-scorecard',
      triggers: [],
      getStakeholders: () => [],
      generateChangeSummary: vi.fn().mockReturnValue('Custom summary'),
    } as unknown as IVersionedRecordConfig<{ score: number }>;

    expect(defaultChangeSummary(config, { score: 1 }, { score: 2 })).toBe('Custom summary');
    expect(config.generateChangeSummary).toHaveBeenCalledWith({ score: 1 }, { score: 2 });
  });

  it('returns "Initial version" when previous is null and no generator', () => {
    const config = {
      recordType: 'bd-scorecard',
      triggers: [],
      getStakeholders: () => [],
    } as unknown as IVersionedRecordConfig<{ score: number }>;

    expect(defaultChangeSummary(config, null, { score: 42 })).toBe('Initial version');
  });

  it('returns generic message when previous is non-null and no generator', () => {
    const config = {
      recordType: 'bd-scorecard',
      triggers: [],
      getStakeholders: () => [],
    } as unknown as IVersionedRecordConfig<{ score: number }>;

    expect(defaultChangeSummary(config, { score: 1 }, { score: 2 })).toBe('Updated bd-scorecard');
  });
});
