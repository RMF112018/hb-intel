/**
 * SF23-T04 — Core record form state hook.
 *
 * Loads form state from storage, derives explanation/validation/confidence/
 * recommended action. Adapters must not re-compute lifecycle truth outside
 * this hook's derived selectors.
 *
 * Governing: SF23-T04, L-01 (primitive ownership)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  IRecordFormState,
  IRecordNextRecommendedAction,
  RecordBlockedReasonCode,
} from '../types/index.js';
import type { IRecordFormStorageAdapter } from '../storage/IRecordFormStorageAdapter.js';

export interface UseRecordFormStateOptions {
  adapter: IRecordFormStorageAdapter;
  moduleId: string;
  projectId: string;
}

export interface UseRecordFormStateResult {
  forms: IRecordFormState[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  blockedReasons: RecordBlockedReasonCode[];
  topRecommended: IRecordNextRecommendedAction | null;
  pendingCount: number;
  refetch: () => Promise<void>;
}

const PENDING_SYNC_STATES = new Set(['saved-locally', 'queued-to-sync']);

export function useRecordFormState(
  options: UseRecordFormStateOptions,
): UseRecordFormStateResult {
  const { adapter, projectId } = options;

  const [forms, setForms] = useState<IRecordFormState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await adapter.listByProject(projectId);
      setForms(records.map(r => r.state));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [adapter, projectId]);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const blockedReasons = useMemo(
    () => forms.flatMap(f => f.explanation.blockReasons.map(b => b.reasonCode)),
    [forms],
  );

  const topRecommended = useMemo(() => {
    const active = forms.find(f => f.explanation.isBlocked || f.explanation.hasWarnings);
    return active?.nextRecommendedAction ?? null;
  }, [forms]);

  const pendingCount = useMemo(
    () => forms.filter(f => PENDING_SYNC_STATES.has(f.sync.state)).length,
    [forms],
  );

  return {
    forms,
    isLoading,
    isError: error !== null,
    error,
    blockedReasons,
    topRecommended,
    pendingCount,
    refetch: loadForms,
  };
}
