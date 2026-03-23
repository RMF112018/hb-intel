/**
 * SF28-T04 — Workspace-scoped activity feed convenience hook.
 */
import type { IActivityStorageAdapter } from '../storage/IActivityStorageAdapter.js';
import type { IActivityTimelineQuery } from '../types/index.js';
import { useActivityTimeline, type UseActivityTimelineResult } from './useActivityTimeline.js';

export function useActivityWorkspaceFeed(
  adapter: IActivityStorageAdapter,
  projectId: string,
  overrides?: Partial<Omit<IActivityTimelineQuery, 'projectId' | 'mode'>>,
): UseActivityTimelineResult {
  return useActivityTimeline({
    adapter,
    query: { projectId, mode: 'workspace', ...overrides },
  });
}
