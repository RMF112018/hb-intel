import { useState, useEffect } from 'react';
import { VersionApi } from '../api/VersionApi';
import type { IVersionSnapshot, IUseVersionSnapshotResult } from '../types';

/**
 * Loads a full version snapshot on demand by snapshotId (D-06).
 * Called when the user selects a version in `HbcVersionHistory` or
 * when `useVersionDiff` needs to retrieve both comparison payloads.
 * Pass `null` to skip fetching (hook returns idle state).
 */
export function useVersionSnapshot<T>(
  snapshotId: string | null
): IUseVersionSnapshotResult<T> {
  const [snapshot, setSnapshot] = useState<IVersionSnapshot<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!snapshotId) {
      setSnapshot(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    VersionApi.getSnapshotById<T>(snapshotId)
      .then((result) => {
        if (!cancelled) setSnapshot(result);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [snapshotId]);

  return { snapshot, isLoading, error };
}
