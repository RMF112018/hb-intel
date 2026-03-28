/**
 * Phase 3 — useProjectActivity hook.
 *
 * Provides project-scoped activity feed data by calling aggregateActivityFeed()
 * with the registered adapters. Replaces mock data in useActivitySummary().
 *
 * Governing: P3-D1 §5 (Query Contract)
 */

import { useCallback, useEffect, useState } from 'react';
import type {
  IActivityFeedResult,
  IActivityQuery,
  ActivityCategory,
  ActivitySignificance,
} from '@hbc/models';
import { aggregateActivityFeed } from './aggregateActivityFeed.js';

export interface UseProjectActivityInput {
  projectId: string;
  userUpn?: string;
  categories?: ActivityCategory[];
  sourceModules?: string[];
  significance?: ActivitySignificance[];
  limit?: number;
}

export interface UseProjectActivityResult {
  feed: IActivityFeedResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const EMPTY_FEED: IActivityFeedResult = {
  events: [],
  totalCount: 0,
  criticalCount: 0,
  notableCount: 0,
  hasMore: false,
  lastRefreshedIso: new Date().toISOString(),
};

export function useProjectActivity(input: UseProjectActivityInput): UseProjectActivityResult {
  const { projectId, userUpn = 'anonymous', categories, sourceModules, significance, limit } = input;
  const [feed, setFeed] = useState<IActivityFeedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const query: IActivityQuery = {
      projectId,
      categories,
      sourceModules,
      significance,
      limit,
    };

    const context = { projectId, userUpn };

    aggregateActivityFeed(query, context)
      .then((result) => {
        if (!cancelled) {
          setFeed(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Activity feed load failed');
          setFeed(EMPTY_FEED);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, userUpn, categories, sourceModules, significance, limit, refreshCounter]);

  return { feed, isLoading, error, refresh };
}
