/**
 * Counts hook — SF29-T04
 * Fetches feed and computes counts via computeCounts.
 */

import { useQuery } from '@tanstack/react-query';
import { useMyWorkContext } from './MyWorkContext.js';
import { myWorkKeys } from './queryKeys.js';
import { aggregateFeed } from '../api/aggregateFeed.js';
import { computeCounts } from '../normalization/projectFeed.js';
import type { IMyWorkQuery, IMyWorkCounts } from '../types/index.js';

export interface IUseMyWorkCountsResult {
  counts: IMyWorkCounts | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function useMyWorkCounts(query?: IMyWorkQuery): IUseMyWorkCountsResult {
  const { context, defaultQuery } = useMyWorkContext();
  const mergedQuery: IMyWorkQuery = { ...defaultQuery, ...query };
  const userId = context.currentUserId;

  const result = useQuery({
    queryKey: myWorkKeys.counts(userId, mergedQuery),
    queryFn: async () => {
      const feedResult = await aggregateFeed({ query: mergedQuery, context });
      return computeCounts(feedResult.items);
    },
  });

  return {
    counts: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
