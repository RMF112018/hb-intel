// src/utils/__tests__/versionUtils.test.ts
import { describe, it, expect } from 'vitest';
import {
  isVisibleByDefault,
  filterMetadataForDisplay,
  serializeSnapshot,
  requiresFileStorage,
  getSnapshotIdsToSupersede,
  nextVersionNumber,
  VERSION_TAG_LABELS,
  LARGE_SNAPSHOT_THRESHOLD_BYTES,
} from '../versionUtils';
import type { IVersionMetadata } from '../../types';

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
