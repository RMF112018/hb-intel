/**
 * Explainability hook — SF29-T04
 * Fetches feed and builds reasoning payload for a specific item.
 */

import { useQuery } from '@tanstack/react-query';
import { useMyWorkContext } from './MyWorkContext.js';
import { myWorkKeys } from './queryKeys.js';
import { aggregateFeed } from '../api/aggregateFeed.js';
import type { IMyWorkItem, IMyWorkReasoningPayload } from '../types/index.js';

export interface IUseMyWorkReasoningResult {
  reasoning: IMyWorkReasoningPayload | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function buildReasoningPayload(item: IMyWorkItem): IMyWorkReasoningPayload {
  return {
    workItemId: item.workItemId,
    canonicalKey: item.canonicalKey,
    title: item.title,
    rankingReason: item.rankingReason,
    lifecycle: item.lifecycle,
    permissionState: item.permissionState,
    sourceMeta: item.sourceMeta,
    dedupeInfo: item.dedupe,
    supersessionInfo: item.supersession,
  };
}

export function useMyWorkReasoning(itemId: string | null): IUseMyWorkReasoningResult {
  const { context, defaultQuery } = useMyWorkContext();
  const userId = context.currentUserId;

  const result = useQuery({
    queryKey: myWorkKeys.reasoning(userId, itemId ?? ''),
    queryFn: async () => {
      const feedResult = await aggregateFeed({ query: defaultQuery, context });
      const item = feedResult.items.find((i) => i.workItemId === itemId);
      if (!item) return null;
      return buildReasoningPayload(item);
    },
    enabled: !!itemId,
  });

  return {
    reasoning: result.data ?? undefined,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
