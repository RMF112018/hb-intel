/**
 * SF25-T04 — Primary publish workflow state hook.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { IPublishRequest } from '../types/index.js';
import type { IPublishStorageAdapter } from '../storage/IPublishStorageAdapter.js';

export interface UsePublishWorkflowStateOptions { adapter: IPublishStorageAdapter; sourceModuleKey: string; projectId: string; }

export interface UsePublishWorkflowStateResult {
  requests: IPublishRequest[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pendingCount: number;
  refetch: () => Promise<void>;
}

export function usePublishWorkflowState(options: UsePublishWorkflowStateOptions): UsePublishWorkflowStateResult {
  const { adapter, projectId } = options;
  const [requests, setRequests] = useState<IPublishRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const records = await adapter.listByProject(projectId); setRequests(records.map(r => r.request)); }
    catch (err) { setError(err instanceof Error ? err : new Error(String(err))); }
    finally { setIsLoading(false); }
  }, [adapter, projectId]);

  useEffect(() => { void load(); }, [load]);

  const pendingCount = useMemo(() => requests.filter(r => r.state === 'draft' || r.state === 'ready-for-review').length, [requests]);

  return { requests, isLoading, isError: error !== null, error, pendingCount, refetch: load };
}
