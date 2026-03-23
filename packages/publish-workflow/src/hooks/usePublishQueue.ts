/**
 * SF25-T04 — Publish queue management hook.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { IPublishRequest } from '../types/index.js';
import type { IPublishStorageAdapter, IPublishStorageRecord } from '../storage/IPublishStorageAdapter.js';
import { transitionPublishState } from '../model/lifecycle.js';

export interface UsePublishQueueOptions { adapter: IPublishStorageAdapter; }

export interface UsePublishQueueResult {
  pendingRequests: IPublishStorageRecord[];
  pendingCount: number;
  isLoading: boolean;
  error: Error | null;
  startPublish: (requestId: string) => Promise<IPublishRequest>;
  refetch: () => Promise<void>;
}

export function usePublishQueue(options: UsePublishQueueOptions): UsePublishQueueResult {
  const { adapter } = options;
  const [pendingRequests, setPendingRequests] = useState<IPublishStorageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setPendingRequests(await adapter.listPendingSync()); }
    catch (err) { setError(err instanceof Error ? err : new Error(String(err))); }
    finally { setIsLoading(false); }
  }, [adapter]);

  useEffect(() => { void load(); }, [load]);

  const startPublish = useCallback(async (requestId: string): Promise<IPublishRequest> => {
    const record = await adapter.getByRequestId(requestId);
    if (!record) throw new Error(`PublishQueue: not found: ${requestId}`);
    const updated = transitionPublishState(record.request, 'publishing');
    await adapter.update(requestId, updated);
    void load();
    return updated;
  }, [adapter, load]);

  const pendingCount = useMemo(() => pendingRequests.length, [pendingRequests]);

  return { pendingRequests, pendingCount, isLoading, error, startPublish, refetch: load };
}
