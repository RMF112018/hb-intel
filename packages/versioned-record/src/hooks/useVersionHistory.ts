import { useState, useEffect, useCallback } from 'react';
import { VersionApi } from '../api/VersionApi';
import { filterMetadataForDisplay, countSupersededVersions } from '../utils/versionUtils';
import type {
  IVersionedRecordConfig,
  IVersionMetadata,
  IUseVersionHistoryResult,
} from '../types';

/**
 * Loads the metadata-first version list for a record (D-06).
 * Fetches all version metadata rows (no snapshot payloads) in a single query.
 * Provides `showSuperseded` toggle to reveal/hide versions tagged 'superseded' (D-03).
 */
export function useVersionHistory<T>(
  recordType: string,
  recordId: string,
  _config: IVersionedRecordConfig<T>
): IUseVersionHistoryResult {
  const [allMetadata, setAllMetadata] = useState<IVersionMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showSuperseded, setShowSuperseded] = useState(false);

  const load = useCallback(async () => {
    if (!recordType || !recordId) return;
    setIsLoading(true);
    setError(null);
    try {
      const rows = await VersionApi.getMetadataList(recordType, recordId);
      // Newest first
      setAllMetadata([...rows].sort((a, b) => b.version - a.version));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [recordType, recordId]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleMetadata = filterMetadataForDisplay(allMetadata, showSuperseded);
  const hasSuperseded = countSupersededVersions(allMetadata) > 0;

  return {
    metadata: visibleMetadata,
    isLoading,
    error,
    showSuperseded,
    // Only expose the setter when there are actually superseded versions to show
    setShowSuperseded: hasSuperseded ? setShowSuperseded : () => undefined,
    hasSuperseded,
    refresh: load,
  };
}
