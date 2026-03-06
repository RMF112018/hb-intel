import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  defaultAccessControlAdminRepository,
} from './inMemoryRepository.js';
import type {
  AccessControlAdminQuery,
  AccessControlAdminRepository,
  AccessControlAdminSnapshot,
} from '../types.js';

/**
 * Load a full admin snapshot from the configured repository.
 */
export async function loadAdminAccessControlSnapshot(
  repository: AccessControlAdminRepository,
  query?: AccessControlAdminQuery,
): Promise<AccessControlAdminSnapshot> {
  return repository.getSnapshot(query);
}

/**
 * Utility for normalizing section search input into repository query shape.
 */
export function toAdminSearchQuery(searchTerm: string): AccessControlAdminQuery | undefined {
  const normalized = searchTerm.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  return {
    searchTerm: normalized,
  };
}

/**
 * Hook that owns async loading + refresh for minimal admin UX.
 */
export function useAdminAccessControlData(params?: {
  repository?: AccessControlAdminRepository;
  searchTerm?: string;
}) {
  const repository = params?.repository ?? defaultAccessControlAdminRepository;
  const query = useMemo(() => toAdminSearchQuery(params?.searchTerm ?? ''), [params?.searchTerm]);
  const [snapshot, setSnapshot] = useState<AccessControlAdminSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const next = await loadAdminAccessControlSnapshot(repository, query);
      setSnapshot(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [query, repository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    snapshot,
    loading,
    error,
    refresh,
  };
}
