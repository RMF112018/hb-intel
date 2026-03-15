/**
 * useDraftStore — compatibility adapter for @hbc/step-wizard
 *
 * Wraps the async useDraft hook to provide the synchronous read()/write()
 * interface that step-wizard and step-progress hooks expect.
 *
 * Note: read() returns the latest reactively-loaded value. On the first
 * render before the async load completes, it returns null.
 */
import { useRef, useMemo } from 'react';
import { useDraft } from './useDraft.js';

export interface IUseDraftStoreResult {
  read<T>(): T | null;
  write(data: unknown): void;
}

export function useDraftStore(draftKey: string | null): IUseDraftStoreResult {
  const { value, save } = useDraft<unknown>(draftKey ?? '__noop__');

  // Keep a ref so read() always returns the latest value
  const valueRef = useRef<unknown>(null);
  valueRef.current = value;

  const isActive = draftKey != null;

  return useMemo(
    () => ({
      read<T>(): T | null {
        return valueRef.current as T | null;
      },
      write(data: unknown): void {
        if (isActive) save(data);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save identity is stable per draftKey
    [isActive, save],
  );
}
