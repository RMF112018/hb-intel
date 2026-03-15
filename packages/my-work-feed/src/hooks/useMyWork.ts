/**
 * Core feed hook — SF29-T04
 * Thin orchestration wrapper over aggregateFeed via TanStack Query.
 */

import { useQuery } from '@tanstack/react-query';
import { useMyWorkContext } from './MyWorkContext.js';
import { myWorkKeys } from './queryKeys.js';
import { aggregateFeed } from '../api/aggregateFeed.js';
import type { IMyWorkQuery, IMyWorkFeedResult } from '../types/index.js';

export interface IUseMyWorkOptions {
  query?: IMyWorkQuery;
  enabled?: boolean;
}

export interface IUseMyWorkResult {
  feed: IMyWorkFeedResult | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isStale: boolean;
  refetch: () => void;
}

export function useMyWork(options?: IUseMyWorkOptions): IUseMyWorkResult {
  const { context, defaultQuery } = useMyWorkContext();
  const query: IMyWorkQuery = { ...defaultQuery, ...options?.query };
  const userId = context.currentUserId;

  const result = useQuery({
    queryKey: myWorkKeys.feed(userId, query),
    queryFn: () => aggregateFeed({ query, context }),
    enabled: options?.enabled ?? true,
  });

  return {
    feed: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    isStale: result.isStale,
    refetch: result.refetch,
  };
}
