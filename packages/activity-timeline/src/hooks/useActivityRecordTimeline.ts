/**
 * SF28-T04 — Record-scoped activity timeline convenience hook.
 */
import type { IActivityStorageAdapter } from '../storage/IActivityStorageAdapter.js';
import type { IActivityTimelineQuery } from '../types/index.js';
import { useActivityTimeline, type UseActivityTimelineResult } from './useActivityTimeline.js';

export function useActivityRecordTimeline(
  adapter: IActivityStorageAdapter,
  projectId: string,
  recordId: string,
  overrides?: Partial<Omit<IActivityTimelineQuery, 'projectId' | 'mode'>>,
): UseActivityTimelineResult {
  return useActivityTimeline({
    adapter,
    query: { projectId, mode: 'record', relatedRecordIds: [recordId], ...overrides },
  });
}
