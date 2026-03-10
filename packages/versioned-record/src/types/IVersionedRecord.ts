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
  hasSuperseded: boolean;
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
