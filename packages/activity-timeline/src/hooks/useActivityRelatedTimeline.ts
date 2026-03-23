/**
 * SF28-T04 — Related-scope activity timeline convenience hook.
 */
import type { IActivityStorageAdapter } from '../storage/IActivityStorageAdapter.js';
import type { IActivityTimelineQuery } from '../types/index.js';
import { useActivityTimeline, type UseActivityTimelineResult } from './useActivityTimeline.js';

export function useActivityRelatedTimeline(
  adapter: IActivityStorageAdapter,
  projectId: string,
  relatedRecordIds: string[],
  overrides?: Partial<Omit<IActivityTimelineQuery, 'projectId' | 'mode'>>,
): UseActivityTimelineResult {
  return useActivityTimeline({
    adapter,
    query: { projectId, mode: 'related', relatedRecordIds, ...overrides },
  });
}
