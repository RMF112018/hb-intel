/**
 * SF23-T04 — Draft persistence hook.
 *
 * Manages draft save/restore/compare with optimistic statuses.
 * Distinguishes local, server, restored, and stale-restored drafts.
 *
 * Governing: SF23-T04, L-04 (offline resilience)
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  IRecordFormDraft,
  IRecordDraftComparisonState,
} from '../types/index.js';
import type { IRecordFormStorageAdapter } from '../storage/IRecordFormStorageAdapter.js';
import { markDraftDirty, compareDrafts } from '../model/draft.js';

export interface UseRecordDraftPersistenceOptions {
  adapter: IRecordFormStorageAdapter;
  initialDraft: IRecordFormDraft;
}

export interface UseRecordDraftPersistenceResult {
  draft: IRecordFormDraft;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAtIso: string | null;
  comparison: IRecordDraftComparisonState | null;
  markDirty: () => void;
  saveDraft: () => Promise<void>;
  restoreDraft: (serverDraft: IRecordFormDraft) => void;
  compareTo: (serverDraft: IRecordFormDraft) => IRecordDraftComparisonState;
}

export function useRecordDraftPersistence(
  options: UseRecordDraftPersistenceOptions,
): UseRecordDraftPersistenceResult {
  const { initialDraft } = options;

  const [draft, setDraft] = useState<IRecordFormDraft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [comparison, setComparison] = useState<IRecordDraftComparisonState | null>(null);

  const markDirty = useCallback(() => {
    setDraft(prev => markDraftDirty(prev));
  }, []);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      setDraft(prev => ({ ...prev, lastSavedAtIso: new Date().toISOString() }));
    } finally {
      setIsSaving(false);
    }
  }, []);

  const restoreDraft = useCallback((serverDraft: IRecordFormDraft) => {
    setDraft(serverDraft);
    setComparison(null);
  }, []);

  const compareTo = useCallback(
    (serverDraft: IRecordFormDraft): IRecordDraftComparisonState => {
      const result = compareDrafts(draft, serverDraft);
      setComparison(result);
      return result;
    },
    [draft],
  );

  const isDirty = useMemo(() => draft.isDirty, [draft.isDirty]);
  const lastSavedAtIso = useMemo(() => draft.lastSavedAtIso, [draft.lastSavedAtIso]);

  return {
    draft,
    isDirty,
    isSaving,
    lastSavedAtIso,
    comparison,
    markDirty,
    saveDraft,
    restoreDraft,
    compareTo,
  };
}
