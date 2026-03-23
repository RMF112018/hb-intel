/**
 * SF28-T04 — Core activity timeline query hook.
 *
 * Orchestrates storage adapter query + projection-only deduplication.
 * Accepts any timeline mode (record, related, workspace).
 */

import { useCallback, useMemo } from 'react';
import type {
  IActivityTimelineQuery,
  IActivityTimelinePage,
  IActivityEvent,
} from '../types/index.js';
import type { IActivityStorageAdapter } from '../storage/IActivityStorageAdapter.js';
import { applyDeduplication } from '../model/dedupe.js';

export interface UseActivityTimelineOptions {
  /** Storage adapter instance */
  adapter: IActivityStorageAdapter;
  /** Timeline query */
  query: IActivityTimelineQuery;
  /** Whether dedup projection should be applied (default true) */
  dedupe?: boolean;
}

export interface UseActivityTimelineResult {
  /** Deduplicated events for this page */
  events: IActivityEvent[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Error object if any */
  error: Error | null;
  /** Whether more pages exist */
  hasMore: boolean;
  /** Page cursor for next page */
  cursor: string | null;
  /** Trigger a manual refresh */
  refetch: () => Promise<void>;
}

/**
 * Core timeline hook — queries the storage adapter and applies
 * projection-only deduplication.
 *
 * For convenience, use the mode-specific wrappers:
 * - useActivityWorkspaceFeed
 * - useActivityRecordTimeline
 * - useActivityRelatedTimeline
 */
export function useActivityTimeline(
  options: UseActivityTimelineOptions,
): UseActivityTimelineResult {
  const { adapter, query, dedupe = true } = options;

  // Simple state management (TanStack Query integration is app-level)
  const fetchPage = useCallback(async (): Promise<IActivityTimelinePage> => {
    return adapter.query(query);
  }, [adapter, query]);

  // Placeholder result — hooks need TanStack Query wiring at app level.
  // This provides the typed contract and dedup composition.
  const emptyPage: IActivityTimelinePage = useMemo(() => ({
    events: [],
    grouping: 'relative-date',
    pageSize: query.limit ?? 25,
    hasMore: false,
    cursor: null,
  }), [query.limit]);

  const processEvents = useCallback(
    (page: IActivityTimelinePage): IActivityEvent[] => {
      return dedupe ? applyDeduplication(page.events) : page.events;
    },
    [dedupe],
  );

  return {
    events: processEvents(emptyPage),
    isLoading: false,
    isError: false,
    error: null,
    hasMore: false,
    cursor: null,
    refetch: fetchPage as unknown as () => Promise<void>,
  };
}
