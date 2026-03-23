/**
 * SF24-T04 — Core export runtime state hook.
 *
 * Loads export requests from a storage adapter, derives explainability
 * fields (suppressed formats, top recommended export, queue count),
 * and provides a stable return shape across loading/success/error.
 *
 * Adapters must not re-compute lifecycle truth, artifact confidence, or
 * top recommended export outside this hook's derived selectors.
 *
 * Governing: SF24-T04, L-01 (primitive ownership)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  IExportRequest,
  IExportSuppressedFormatState,
  IExportNextRecommendedAction,
} from '../types/index.js';
import { EXPORT_RUNTIME_SYNC_STATUSES } from '../types/index.js';
import type { IExportStorageAdapter } from '../storage/IExportStorageAdapter.js';

// ── Options / Result Types ───────────────────────────────────────────────

export interface UseExportRuntimeStateOptions {
  /** Storage adapter for loading export requests. */
  adapter: IExportStorageAdapter;
  /** Module key for scoping queries. */
  moduleKey: string;
  /** Project ID for filtering requests. */
  projectId: string;
}

export interface UseExportRuntimeStateResult {
  /** Export requests for the current module/project scope. */
  requests: IExportRequest[];
  /** Whether the initial load is in progress. */
  isLoading: boolean;
  /** Whether an error occurred during load. */
  isError: boolean;
  /** Error object if isError is true (null otherwise). */
  error: Error | null;
  /** Collected suppressed formats across all active requests. */
  suppressedFormats: IExportSuppressedFormatState[];
  /** Top recommended export action from the most recent non-terminal request. */
  topRecommended: IExportNextRecommendedAction | null;
  /** Number of requests in offline-queued states. */
  queueCount: number;
  /** Reload requests from the storage adapter. */
  refetch: () => Promise<void>;
}

// ── Terminal statuses (no further transitions expected) ──────────────────

const TERMINAL_STATUSES = new Set(['complete', 'failed', 'restored-receipt']);
const SYNC_STATUS_SET = new Set<string>(EXPORT_RUNTIME_SYNC_STATUSES);

// ── Hook ─────────────────────────────────────────────────────────────────

/**
 * Load and derive export runtime state for a module within a project.
 *
 * @param options - Adapter, module key, and project ID.
 * @returns Stable result shape with requests, derived state, and refetch.
 */
export function useExportRuntimeState(
  options: UseExportRuntimeStateOptions,
): UseExportRuntimeStateResult {
  const { adapter, projectId } = options;

  const [requests, setRequests] = useState<IExportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await adapter.listByProject(projectId);
      setRequests(records.map(r => r.request));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [adapter, projectId]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  // Derive suppressed formats (collected across all active requests)
  const suppressedFormats = useMemo(
    () => requests.flatMap(r => r.suppressedFormats),
    [requests],
  );

  // Derive top recommended action from most recent non-terminal request
  const topRecommended = useMemo(() => {
    const active = requests.find(
      r => r.receipt !== null && !TERMINAL_STATUSES.has(r.receipt.status),
    );
    return active?.nextRecommendedAction ?? null;
  }, [requests]);

  // Derive queue count (requests in sync statuses)
  const queueCount = useMemo(
    () => requests.filter(r => r.receipt !== null && SYNC_STATUS_SET.has(r.receipt.status)).length,
    [requests],
  );

  return {
    requests,
    isLoading,
    isError: error !== null,
    error,
    suppressedFormats,
    topRecommended,
    queueCount,
    refetch: loadRequests,
  };
}
