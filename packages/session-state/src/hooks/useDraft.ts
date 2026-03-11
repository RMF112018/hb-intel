/**
 * useDraft hook — SF12-T05, D-07
 */
import { useState, useEffect, useCallback } from 'react';
import type { IUseDraftResult } from '../types/index.js';
import { saveDraft, loadDraft, clearDraft } from '../db/DraftStore.js';

export function useDraft<T>(draftKey: string, ttlHours?: number): IUseDraftResult<T> {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadDraft<T>(draftKey).then((loaded) => {
      if (!cancelled) {
        setValue(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [draftKey]);

  const save = useCallback(
    (newValue: T, overrideTtl?: number) => {
      setValue(newValue);
      void saveDraft(draftKey, newValue, overrideTtl ?? ttlHours);
    },
    [draftKey, ttlHours],
  );

  const clear = useCallback(() => {
    setValue(null);
    void clearDraft(draftKey);
  }, [draftKey]);

  return { value, save, clear };
}
