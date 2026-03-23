/**
 * SF24-T04 — Export queue management hook.
 *
 * Manages offline-queued export requests, replay transitions,
 * and restored receipt state. Composes model-layer lifecycle
 * functions — does not duplicate transition logic.
 *
 * Governing: SF24-T04, L-04 (offline resilience)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { IExportRequest } from '../types/index.js';
import type { IExportStorageAdapter, IExportStorageRecord } from '../storage/IExportStorageAdapter.js';
import { transitionExportStatus } from '../model/lifecycle.js';

// ── Options / Result Types ───────────────────────────────────────────────

export interface UseExportQueueOptions {
  /** Storage adapter for loading pending exports. */
  adapter: IExportStorageAdapter;
}

export interface UseExportQueueResult {
  /** Export records in pending sync states. */
  pendingRequests: IExportStorageRecord[];
  /** Count of pending requests. */
  pendingCount: number;
  /** Whether the initial load is in progress. */
  isLoading: boolean;
  /** Error object if load failed (null otherwise). */
  error: Error | null;
  /** Transition a queued request to rendering state. */
  replayRequest: (requestId: string) => Promise<IExportRequest>;
  /** Restore a failed/degraded request as restored-receipt. */
  restoreReceipt: (requestId: string) => Promise<IExportRequest>;
  /** Reload pending requests from the storage adapter. */
  refetch: () => Promise<void>;
}

// ── Hook ─────────────────────────────────────────────────────────────────

/**
 * Manage the offline export queue with replay and restore transitions.
 *
 * @param options - Storage adapter.
 * @returns Queue state with mutation actions and refetch.
 */
export function useExportQueue(options: UseExportQueueOptions): UseExportQueueResult {
  const { adapter } = options;

  const [pendingRequests, setPendingRequests] = useState<IExportStorageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await adapter.listPendingSync();
      setPendingRequests(records);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  const replayRequest = useCallback(
    async (requestId: string): Promise<IExportRequest> => {
      const record = await adapter.getByRequestId(requestId);
      if (!record) throw new Error(`ExportQueue: record not found: ${requestId}`);

      const updated = transitionExportStatus(record.request, 'rendering');
      await adapter.update(requestId, updated);
      void loadPending();
      return updated;
    },
    [adapter, loadPending],
  );

  const restoreReceipt = useCallback(
    async (requestId: string): Promise<IExportRequest> => {
      const record = await adapter.getByRequestId(requestId);
      if (!record) throw new Error(`ExportQueue: record not found: ${requestId}`);

      const updated = transitionExportStatus(record.request, 'restored-receipt');
      await adapter.update(requestId, updated);
      void loadPending();
      return updated;
    },
    [adapter, loadPending],
  );

  const pendingCount = useMemo(() => pendingRequests.length, [pendingRequests]);

  return {
    pendingRequests,
    pendingCount,
    isLoading,
    error,
    replayRequest,
    restoreReceipt,
    refetch: loadPending,
  };
}
