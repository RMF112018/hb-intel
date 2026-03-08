# SF06-T02 — TypeScript Contracts

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01 (scaffold)
**Blocks:** T03 (diff engine), T04 (hooks), T05 (components), T06 (components), T07 (API), T08 (testing)

---

## Objective

Define every interface, type, enum, constant, and pure utility function used across the package. Every type referenced in T03–T08 is defined here. No implementation logic lives in this file beyond pure, stateless utility functions that derive values from the type system.

---

## File: `src/types/IVersionedRecord.ts`

```typescript
import type { IBicOwner } from './IBicOwner';

// ---------------------------------------------------------------------------
// Core enums and union types
// ---------------------------------------------------------------------------

/**
 * Workflow state tag applied to a version snapshot.
 * `'superseded'` is exclusive to D-03: marks versions that were rolled past
 * during a rollback. It is distinct from `'archived'` (a workflow terminal state).
 */
export type VersionTag =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'handoff'
  | 'superseded';

/**
 * Events that trigger snapshot creation. Consuming modules declare which
 * triggers apply to their record type via `IVersionedRecordConfig.triggers`.
 */
export type VersionTrigger =
  | 'on-submit'
  | 'on-approve'
  | 'on-reject'
  | 'on-handoff'
  | 'on-explicit-save'
  | 'on-stage-change';

/**
 * Display mode for `HbcVersionDiff`. Side-by-side is the default for desktop;
 * unified is used on narrow viewports or when the user toggles.
 */
export type DiffMode = 'side-by-side' | 'unified';

/**
 * The nature of a field-level change between two snapshots.
 */
export type ChangeType = 'added' | 'removed' | 'modified';

// ---------------------------------------------------------------------------
// Core snapshot and metadata interfaces
// ---------------------------------------------------------------------------

/**
 * A complete, self-contained version snapshot (D-01).
 * Every field in `snapshot` is the full serialized record at this version.
 * `snapshotId` is a stable GUID used for cross-package references (D-07).
 */
export interface IVersionSnapshot<T> {
  /** GUID primary key — stable across list migrations; used for acknowledgment pinning (D-07). */
  snapshotId: string;
  /** Auto-incremented version number per recordId. Starts at 1. */
  version: number;
  /** ISO 8601 UTC timestamp. */
  createdAt: string;
  /** Author of this version. */
  createdBy: IBicOwner;
  /** Human-readable change summary (provided by author or from `generateChangeSummary`). */
  changeSummary: string;
  /** Workflow state at the time of snapshot creation. */
  tag: VersionTag;
  /** Full serialized record payload — excludes any fields in `IVersionedRecordConfig.excludeFields`. */
  snapshot: T;
}

/**
 * Lightweight metadata row returned by `VersionApi.getMetadataList()` and
 * `useVersionHistory` (D-06). The `snapshot` payload is intentionally absent
 * and loaded on demand via `useVersionSnapshot`.
 */
export interface IVersionMetadata {
  snapshotId: string;
  version: number;
  createdAt: string;
  createdBy: IBicOwner;
  changeSummary: string;
  tag: VersionTag;
  /**
   * Set only when the snapshot payload is stored in the SP file library (D-02).
   * Internal to `VersionApi`; exposed here so `useVersionSnapshot` can detect
   * the storage path without re-fetching the list row.
   */
  storageRef?: string;
}

// ---------------------------------------------------------------------------
// Configuration contract
// ---------------------------------------------------------------------------

/**
 * Per-record-type versioning configuration. Consuming modules define one
 * config object per record type and pass it to `VersionApi` and hooks.
 */
export interface IVersionedRecordConfig<T> {
  /**
   * Unique namespace identifying this record type in storage.
   * Used as the `RecordType` column value in `HbcVersionSnapshots`.
   * Convention: `'{module}-{recordType}'` e.g. `'bd-scorecard'`, `'project-pmp'`.
   */
  recordType: string;

  /**
   * Which trigger events create a snapshot for this record type.
   * Consuming module calls `VersionApi.createSnapshot()` on the appropriate
   * lifecycle events; this array documents the intended trigger set.
   */
  triggers: VersionTrigger[];

  /**
   * Optional function to auto-generate a human-readable change summary by
   * comparing the previous and current record state. Called by consuming
   * modules before invoking `VersionApi.createSnapshot()`.
   * `previous` is `null` for the initial (v1) snapshot.
   */
  generateChangeSummary?: (previous: T | null, current: T) => string;

  /**
   * Fields to exclude from the snapshot payload (e.g. ephemeral UI-only state).
   * Applied by `VersionApi.createSnapshot()` before serialization.
   */
  excludeFields?: ReadonlyArray<keyof T>;

  /**
   * Maximum number of versions to retain per record. Older versions are
   * tagged `'archived'` and purged from active storage (metadata retained).
   * `0` = unlimited (required for legal records such as BD scorecard and PMP).
   */
  maxVersions?: number;

  /**
   * Returns the list of `userId` strings for users who should receive a
   * `'version.created'` notification after a snapshot is written (D-09).
   * Called by `VersionApi.createSnapshot()` after the write succeeds.
   */
  getStakeholders: (snapshot: IVersionSnapshot<T>) => string[];

  /**
   * Optional callback fired after a snapshot is successfully written.
   * Use for side effects beyond notifications (e.g. optimistic cache update).
   */
  onVersionCreated?: (snapshot: IVersionSnapshot<T>) => void;
}

// ---------------------------------------------------------------------------
// Diff contract
// ---------------------------------------------------------------------------

/**
 * A single field-level change between two version snapshots.
 * Produced by `diffEngine.computeDiff()`.
 */
export interface IVersionDiff {
  /** Dot-notation field path, e.g. `'scoring.totalScore'` or `'projectName'`. */
  fieldName: string;
  /** Human-readable label for display in `HbcVersionDiff`. */
  label: string;
  /** Serialized previous value. Empty string for `'added'` changes. */
  previousValue: string;
  /** Serialized current value. Empty string for `'removed'` changes. */
  currentValue: string;
  changeType: ChangeType;
  /**
   * For numeric fields: pre-formatted delta string, e.g. `'+25'` or `'-3'`.
   * `undefined` for non-numeric fields.
   */
  numericDelta?: string;
}

// ---------------------------------------------------------------------------
// API input / output contracts
// ---------------------------------------------------------------------------

/**
 * Input to `VersionApi.createSnapshot()`.
 */
export interface ICreateSnapshotInput<T> {
  recordType: string;
  recordId: string;
  config: IVersionedRecordConfig<T>;
  snapshot: T;
  tag: VersionTag;
  changeSummary: string;
  createdBy: IBicOwner;
}

/**
 * Input to `VersionApi.restoreSnapshot()`. Creates a new snapshot whose
 * payload is a copy of the target version (D-03).
 */
export interface IRestoreSnapshotInput<T> {
  recordType: string;
  recordId: string;
  targetSnapshotId: string;
  restoredBy: IBicOwner;
  config: IVersionedRecordConfig<T>;
}

/**
 * Result of `VersionApi.restoreSnapshot()`. Provides both the new
 * restored snapshot and the list of IDs that were tagged `'superseded'`.
 */
export interface IRestoreSnapshotResult<T> {
  restoredSnapshot: IVersionSnapshot<T>;
  supersededSnapshotIds: string[];
}

// ---------------------------------------------------------------------------
// Hook return types
// ---------------------------------------------------------------------------

export interface IUseVersionHistoryResult {
  metadata: IVersionMetadata[];
  isLoading: boolean;
  error: Error | null;
  showSuperseded: boolean;
  setShowSuperseded: (show: boolean) => void;
  refresh: () => void;
}

export interface IUseVersionSnapshotResult<T> {
  snapshot: IVersionSnapshot<T> | null;
  isLoading: boolean;
  error: Error | null;
}

export interface IUseVersionDiffResult {
  diffs: IVersionDiff[];
  isComputing: boolean;
  error: Error | null;
  metadataA: IVersionMetadata | null;
  metadataB: IVersionMetadata | null;
}

// ---------------------------------------------------------------------------
// Component prop types
// ---------------------------------------------------------------------------

export interface HbcVersionHistoryProps<T> {
  recordType: string;
  recordId: string;
  config: IVersionedRecordConfig<T>;
  /** Fires when user clicks a version entry to view it. */
  onVersionSelect?: (metadata: IVersionMetadata) => void;
  /** Whether the rollback CTA is shown. Role logic is the consuming module's responsibility (D-04). */
  allowRollback?: boolean;
  /** Fires after a rollback is confirmed and the restore snapshot has been written. */
  onRollback?: (result: IRestoreSnapshotResult<T>) => void;
  /** The currently authenticated user — required for rollback authorship. */
  currentUser?: IBicOwner;
}

export interface HbcVersionDiffProps<T> {
  recordType: string;
  recordId: string;
  /** Version number of the baseline (left / "before"). */
  versionA: number;
  /** Version number of the comparison (right / "after"). */
  versionB: number;
  config: IVersionedRecordConfig<T>;
  diffMode?: DiffMode;
  /** Fires when user toggles between side-by-side and unified modes. */
  onDiffModeChange?: (mode: DiffMode) => void;
}

export interface HbcVersionBadgeProps {
  currentVersion: number;
  currentTag?: VersionTag;
  /** Opens the version history panel. */
  onClick?: () => void;
}
```

---

## File: `src/types/IBicOwner.ts`

```typescript
/**
 * Minimal identity shape used across HB Intel packages.
 * Re-exported from `@hbc/versioned-record` so consuming modules
 * do not need to import it from a separate package.
 */
export interface IBicOwner {
  userId: string;
  displayName: string;
  role: string;
}
```

---

## File: `src/types/index.ts`

```typescript
export type {
  VersionTag,
  VersionTrigger,
  DiffMode,
  ChangeType,
  IVersionSnapshot,
  IVersionMetadata,
  IVersionedRecordConfig,
  IVersionDiff,
  ICreateSnapshotInput,
  IRestoreSnapshotInput,
  IRestoreSnapshotResult,
  IUseVersionHistoryResult,
  IUseVersionSnapshotResult,
  IUseVersionDiffResult,
  HbcVersionHistoryProps,
  HbcVersionDiffProps,
  HbcVersionBadgeProps,
} from './IVersionedRecord';

export type { IBicOwner } from './IBicOwner';
```

---

## Pure Utility Functions

These functions are stateless, exported from `src/types/IVersionedRecord.ts`, and unit-testable in isolation. They codify business rules derived from the locked decisions.

### `src/utils/versionUtils.ts`

```typescript
import type {
  VersionTag,
  IVersionMetadata,
  IVersionSnapshot,
  IVersionedRecordConfig,
} from '../types';

// ---------------------------------------------------------------------------
// Tag classification utilities
// ---------------------------------------------------------------------------

/** Returns true if the tag represents a terminal positive state. */
export function isApprovedTag(tag: VersionTag): boolean {
  return tag === 'approved';
}

/** Returns true if the tag represents a version that was rolled past (D-03). */
export function isSupersededTag(tag: VersionTag): boolean {
  return tag === 'superseded';
}

/**
 * Returns true if the tag should be shown in the default version list
 * (i.e., not hidden behind the "Show archived versions" toggle).
 * Hidden by default: 'superseded' and 'archived' (D-03).
 */
export function isVisibleByDefault(tag: VersionTag): boolean {
  return tag !== 'superseded' && tag !== 'archived';
}

/** Human-readable label for each tag value. */
export const VERSION_TAG_LABELS: Record<VersionTag, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
  handoff: 'Handoff',
  superseded: 'Superseded',
} as const;

/** CSS class suffix for tag badge coloring. */
export const VERSION_TAG_COLORS: Record<VersionTag, string> = {
  draft: 'grey',
  submitted: 'blue',
  approved: 'green',
  rejected: 'red',
  archived: 'grey',
  handoff: 'purple',
  superseded: 'grey',
} as const;

// ---------------------------------------------------------------------------
// Snapshot serialization utilities
// ---------------------------------------------------------------------------

/**
 * Serializes a record to a JSON string, omitting any fields listed in
 * `config.excludeFields`. Used by `VersionApi.createSnapshot()` before
 * measuring payload size.
 */
export function serializeSnapshot<T extends Record<string, unknown>>(
  record: T,
  excludeFields?: ReadonlyArray<keyof T>
): string {
  if (!excludeFields || excludeFields.length === 0) {
    return JSON.stringify(record);
  }
  const excluded = new Set(excludeFields as string[]);
  const filtered = Object.fromEntries(
    Object.entries(record).filter(([key]) => !excluded.has(key))
  );
  return JSON.stringify(filtered);
}

/**
 * Returns the byte length of a serialized snapshot string.
 * Used by `VersionApi` to determine inline vs. file-library routing (D-02).
 */
export function getPayloadByteSize(serialized: string): number {
  return new TextEncoder().encode(serialized).byteLength;
}

/** The threshold in bytes above which payloads are routed to the SP file library (D-02). */
export const LARGE_SNAPSHOT_THRESHOLD_BYTES = 255 * 1024; // 255KB

/** Returns true when the serialized payload should be stored in the file library. */
export function requiresFileStorage(serialized: string): boolean {
  return getPayloadByteSize(serialized) > LARGE_SNAPSHOT_THRESHOLD_BYTES;
}

// ---------------------------------------------------------------------------
// Version filtering utilities (D-03)
// ---------------------------------------------------------------------------

/**
 * Filters a metadata list based on the `showSuperseded` toggle state.
 * When false (default), `'superseded'` and `'archived'` versions are hidden.
 */
export function filterMetadataForDisplay(
  metadata: IVersionMetadata[],
  showSuperseded: boolean
): IVersionMetadata[] {
  if (showSuperseded) return metadata;
  return metadata.filter((m) => isVisibleByDefault(m.tag));
}

/**
 * Counts how many superseded versions exist in a metadata list.
 * Used to decide whether to show the "Show archived versions" toggle at all.
 */
export function countSupersededVersions(metadata: IVersionMetadata[]): number {
  return metadata.filter((m) => isSupersededTag(m.tag)).length;
}

// ---------------------------------------------------------------------------
// Change summary generation utility
// ---------------------------------------------------------------------------

/**
 * Produces a default change summary when the consuming module does not
 * provide a `generateChangeSummary` function in config.
 */
export function defaultChangeSummary<T>(
  config: IVersionedRecordConfig<T>,
  previous: T | null,
  current: T
): string {
  if (config.generateChangeSummary) {
    return config.generateChangeSummary(previous, current);
  }
  if (previous === null) return 'Initial version';
  return `Updated ${config.recordType}`;
}

// ---------------------------------------------------------------------------
// Version number utilities
// ---------------------------------------------------------------------------

/**
 * Derives the next version number from an existing metadata list.
 * Returns 1 when the list is empty (first snapshot).
 */
export function nextVersionNumber(existingMetadata: IVersionMetadata[]): number {
  if (existingMetadata.length === 0) return 1;
  return Math.max(...existingMetadata.map((m) => m.version)) + 1;
}

/**
 * Finds the metadata entry matching a given version number.
 * Returns `undefined` if not found.
 */
export function findMetadataByVersion(
  metadata: IVersionMetadata[],
  version: number
): IVersionMetadata | undefined {
  return metadata.find((m) => m.version === version);
}

/**
 * Finds the metadata entry matching a given snapshotId.
 * Returns `undefined` if not found.
 */
export function findMetadataBySnapshotId(
  metadata: IVersionMetadata[],
  snapshotId: string
): IVersionMetadata | undefined {
  return metadata.find((m) => m.snapshotId === snapshotId);
}

// ---------------------------------------------------------------------------
// Rollback utility (D-03)
// ---------------------------------------------------------------------------

/**
 * Given a list of metadata and the snapshotId being restored to,
 * returns the snapshotIds of all versions that are newer than the target
 * and should be tagged `'superseded'`.
 */
export function getSnapshotIdsToSupersede(
  metadata: IVersionMetadata[],
  targetSnapshotId: string
): string[] {
  const target = findMetadataBySnapshotId(metadata, targetSnapshotId);
  if (!target) return [];
  return metadata
    .filter((m) => m.version > target.version && m.tag !== 'superseded')
    .map((m) => m.snapshotId);
}
```

---

## Exported Constants

```typescript
// src/constants.ts
export const VERSIONED_RECORD_PACKAGE = '@hbc/versioned-record' as const;
export const NOTIFICATION_EVENT_VERSION_CREATED = 'version.created' as const;
export const LARGE_SNAPSHOT_THRESHOLD_BYTES = 255 * 1024 as const;
export const SP_LIST_NAME = 'HbcVersionSnapshots' as const;
export const SP_FILE_LIBRARY_PATH = 'sites/hb-intel/Shared Documents/System/Snapshots' as const;
export const DEFAULT_MAX_VERSIONS = 0 as const; // 0 = unlimited
```

---

## `src/index.ts` (updated — adds utils and constants)

```typescript
// Types
export type {
  IVersionSnapshot,
  IVersionMetadata,
  IVersionedRecordConfig,
  IVersionDiff,
  VersionTag,
  VersionTrigger,
  DiffMode,
  ChangeType,
  ICreateSnapshotInput,
  IRestoreSnapshotInput,
  IRestoreSnapshotResult,
  IUseVersionHistoryResult,
  IUseVersionSnapshotResult,
  IUseVersionDiffResult,
  HbcVersionHistoryProps,
  HbcVersionDiffProps,
  HbcVersionBadgeProps,
  IBicOwner,
} from './types';

// Constants
export {
  NOTIFICATION_EVENT_VERSION_CREATED,
  LARGE_SNAPSHOT_THRESHOLD_BYTES,
  SP_LIST_NAME,
  SP_FILE_LIBRARY_PATH,
  DEFAULT_MAX_VERSIONS,
} from './constants';

// Utils (pure, testable)
export {
  isApprovedTag,
  isSupersededTag,
  isVisibleByDefault,
  VERSION_TAG_LABELS,
  VERSION_TAG_COLORS,
  serializeSnapshot,
  getPayloadByteSize,
  requiresFileStorage,
  filterMetadataForDisplay,
  countSupersededVersions,
  defaultChangeSummary,
  nextVersionNumber,
  findMetadataByVersion,
  findMetadataBySnapshotId,
  getSnapshotIdsToSupersede,
} from './utils/versionUtils';

// API
export { VersionApi } from './api/VersionApi';

// Hooks
export { useVersionHistory } from './hooks/useVersionHistory';
export { useVersionSnapshot } from './hooks/useVersionSnapshot';
export { useVersionDiff } from './hooks/useVersionDiff';

// Components
export { HbcVersionHistory } from './components/HbcVersionHistory';
export { HbcVersionDiff } from './components/HbcVersionDiff';
export { HbcVersionBadge } from './components/HbcVersionBadge';
```

---

## Representative Unit Tests

```typescript
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
```

---

## Verification Commands

```bash
cd packages/versioned-record

# TypeScript strict-mode check with no errors
pnpm typecheck

# Run utility unit tests
pnpm test -- --reporter=verbose src/utils/__tests__/versionUtils.test.ts

# Confirm all types are exported from the public barrel
node -e "const m = require('./dist/index.js'); console.log(Object.keys(m).join('\n'))"
```
