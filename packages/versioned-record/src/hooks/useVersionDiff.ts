import { useState, useEffect, useMemo } from 'react';
import { VersionApi } from '../api/VersionApi';
import { computeDiff } from '../engine/diffEngine';
import { findMetadataByVersion } from '../utils/versionUtils';
import type {
  IVersionedRecordConfig,
  IVersionSnapshot,
  IVersionMetadata,
  IVersionDiff,
  IUseVersionDiffResult,
} from '../types';

/**
 * Computes a field-level diff between two version snapshots (D-05).
 *
 * Loading sequence:
 * 1. Fetch both full snapshots in parallel via `VersionApi.getSnapshot`.
 * 2. Fetch metadata list (needed for metadata display in the diff header).
 * 3. In a deferred `useEffect`, run `diffEngine.computeDiff()` off the
 *    synchronous rendering path to avoid main-thread blocking on large records.
 *
 * `isComputing` is true during both the fetch and the diff computation phases.
 */
export function useVersionDiff<T>(
  recordType: string,
  recordId: string,
  versionA: number,
  versionB: number,
  config: IVersionedRecordConfig<T>
): IUseVersionDiffResult {
  const [snapshotA, setSnapshotA] = useState<IVersionSnapshot<T> | null>(null);
  const [snapshotB, setSnapshotB] = useState<IVersionSnapshot<T> | null>(null);
  const [metadataList, setMetadataList] = useState<IVersionMetadata[]>([]);
  const [diffs, setDiffs] = useState<IVersionDiff[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Phase 1: fetch both snapshots + metadata list in parallel
  useEffect(() => {
    if (!recordType || !recordId || versionA <= 0 || versionB <= 0) return;
    if (versionA === versionB) {
      setDiffs([]);
      return;
    }

    let cancelled = false;
    setIsFetching(true);
    setError(null);
    setDiffs([]);

    Promise.all([
      VersionApi.getSnapshot<T>(recordType, recordId, versionA),
      VersionApi.getSnapshot<T>(recordType, recordId, versionB),
      VersionApi.getMetadataList(recordType, recordId),
    ])
      .then(([snapA, snapB, meta]) => {
        if (cancelled) return;
        setSnapshotA(snapA);
        setSnapshotB(snapB);
        setMetadataList(meta);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recordType, recordId, versionA, versionB]);

  // Phase 2: deferred diff computation — runs after snapshots are loaded (D-05)
  useEffect(() => {
    if (!snapshotA || !snapshotB) return;

    setIsComputing(true);

    // Use a microtask to defer computation off the synchronous render path
    const handle = setTimeout(() => {
      try {
        const excludeFields = (config.excludeFields ?? []) as unknown as string[];
        const result = computeDiff(
          snapshotA.snapshot as Record<string, unknown>,
          snapshotB.snapshot as Record<string, unknown>,
          excludeFields
        );
        setDiffs(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsComputing(false);
      }
    }, 0);

    return () => clearTimeout(handle);
  }, [snapshotA, snapshotB, config.excludeFields]);

  const metadataA = useMemo(
    () => findMetadataByVersion(metadataList, versionA) ?? null,
    [metadataList, versionA]
  );

  const metadataB = useMemo(
    () => findMetadataByVersion(metadataList, versionB) ?? null,
    [metadataList, versionB]
  );

  return {
    diffs,
    isComputing: isFetching || isComputing,
    error,
    metadataA,
    metadataB,
  };
}
