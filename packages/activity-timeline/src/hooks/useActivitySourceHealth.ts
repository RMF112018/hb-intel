/**
 * SF28-T04 — Activity source health state hook.
 *
 * Reads adapter health and derives degradation messaging.
 */
import { useMemo } from 'react';
import type { IActivitySourceHealthState, ActivityEventConfidence } from '../types/index.js';
import type { IActivityStorageAdapter } from '../storage/IActivityStorageAdapter.js';

export interface UseActivitySourceHealthResult {
  health: IActivitySourceHealthState;
  isDegraded: boolean;
  degradationLabel: string | null;
  confidence: ActivityEventConfidence;
}

export function useActivitySourceHealth(
  adapter: IActivityStorageAdapter,
): UseActivitySourceHealthResult {
  const health = adapter.getHealth();

  return useMemo(() => ({
    health,
    isDegraded: health.confidence !== 'trusted-authoritative',
    degradationLabel: health.degradationReason,
    confidence: health.confidence,
  }), [health]);
}
