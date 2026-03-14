/**
 * W0-G3-T05: Debounced auto-save draft hook.
 *
 * Wraps `useDraft<T>` with a configurable debounce (default 1.5 s).
 * Flushes any pending save on unmount to prevent data loss.
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import { useDraft } from './useDraft.js';
import { AUTO_SAVE_DEBOUNCE_MS } from '../constants/index.js';

export interface IAutoSaveDraftResult<T> {
  /** Current draft value (null until first load/save). */
  value: T | null;
  /** Queue a debounced save. Rapid calls collapse into one write. */
  queueSave: (newValue: T) => void;
  /** Clear the draft and reset lastSavedAt. */
  clear: () => void;
  /** ISO timestamp of last successful save, or null. */
  lastSavedAt: string | null;
  /** True while a debounce timer is active (save pending). */
  isSavePending: boolean;
}

export function useAutoSaveDraft<T>(
  draftKey: string,
  ttlHours: number,
  debounceMs: number = AUTO_SAVE_DEBOUNCE_MS,
): IAutoSaveDraftResult<T> {
  const { value, save, clear: draftClear } = useDraft<T>(draftKey, ttlHours);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSavePending, setIsSavePending] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<T | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  const queueSave = useCallback(
    (newValue: T) => {
      pendingValueRef.current = newValue;
      setIsSavePending(true);

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (pendingValueRef.current !== null) {
          saveRef.current(pendingValueRef.current);
          setLastSavedAt(new Date().toISOString());
          pendingValueRef.current = null;
          setIsSavePending(false);
        }
      }, debounceMs);
    },
    [debounceMs],
  );

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingValueRef.current = null;
    setIsSavePending(false);
    setLastSavedAt(null);
    draftClear();
  }, [draftClear]);

  // Flush any pending save on unmount to prevent data loss
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (pendingValueRef.current !== null) {
        saveRef.current(pendingValueRef.current);
        pendingValueRef.current = null;
      }
    };
  }, []);

  return { value, queueSave, clear, lastSavedAt, isSavePending };
}
