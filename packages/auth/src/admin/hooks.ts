import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildAuditOperationalVisibility,
  getStructuredAuditEvents,
  sortAuditEventsNewestFirst,
} from '../audit/auditLogger.js';
import {
  defaultAccessControlAdminRepository,
} from './inMemoryRepository.js';
import type {
  AccessControlAdminAuditVisibility,
  AccessControlAdminQuery,
  AccessControlAdminRepository,
  AccessControlAdminSnapshot,
  AccessControlAuditEventRecord,
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
    auditVisibility: toAdminAuditOperationalVisibility(snapshot?.auditEvents),
  };
}

/**
 * Build Phase 5.13 operational audit visibility from current admin snapshot
 * plus centralized auth/workflow audit stream entries.
 */
export function toAdminAuditOperationalVisibility(
  auditEvents?: AccessControlAuditEventRecord[],
): AccessControlAdminAuditVisibility {
  const merged = mergeAuditEvents(auditEvents ?? [], getStructuredAuditEvents());
  return buildAuditOperationalVisibility({
    events: merged,
  });
}

function mergeAuditEvents(
  left: AccessControlAuditEventRecord[],
  right: AccessControlAuditEventRecord[],
): AccessControlAuditEventRecord[] {
  const byId = new Map<string, AccessControlAuditEventRecord>();

  for (const event of [...left, ...right]) {
    byId.set(event.eventId, event);
  }

  return sortAuditEventsNewestFirst(Array.from(byId.values()));
}
