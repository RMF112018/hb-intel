import type {
  VersionTag,
  IVersionMetadata,
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
