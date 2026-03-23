/**
 * SF28-T04 — Activity event emission wrapper hook.
 *
 * Wraps normalizeActivityEvent with validation guard.
 * Does NOT append — just normalizes. Caller handles persistence.
 */
import { useCallback } from 'react';
import type { IActivityEmissionInput, IActivityEvent } from '../types/index.js';
import { normalizeActivityEvent } from '../model/normalize.js';

export interface UseActivityEmitterResult {
  /** Normalize and validate an emission input. Throws on invalid input. */
  emit: (input: IActivityEmissionInput) => IActivityEvent;
}

export function useActivityEmitter(): UseActivityEmitterResult {
  const emit = useCallback((input: IActivityEmissionInput): IActivityEvent => {
    return normalizeActivityEvent(input);
  }, []);

  return { emit };
}
