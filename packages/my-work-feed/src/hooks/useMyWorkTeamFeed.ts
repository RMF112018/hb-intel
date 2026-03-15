/**
 * Team feed projections hook — SF29-T04
 * Filters feed items by owner scope and computes team-specific counts.
 */

import { useQuery } from '@tanstack/react-query';
import { useMyWorkContext } from './MyWorkContext.js';
import { myWorkKeys } from './queryKeys.js';
import { aggregateFeed } from '../api/aggregateFeed.js';
import type { IMyWorkQuery, IMyWorkItem, IMyWorkTeamFeedResult } from '../types/index.js';

export type MyWorkOwnerScope = 'delegated-by-me' | 'my-team' | 'escalation-candidate';

export interface IUseMyWorkTeamFeedOptions {
  ownerScope: MyWorkOwnerScope;
  query?: IMyWorkQuery;
  enabled?: boolean;
}

export interface IUseMyWorkTeamFeedResult {
  teamFeed: IMyWorkTeamFeedResult | undefined;
  isLoading: boolean;
  isError: boolean;
}

function isEscalationCandidate(item: IMyWorkItem): boolean {
  return item.isOverdue || item.isBlocked || item.state === 'blocked';
}

export function projectTeamFeed(
  items: IMyWorkItem[],
  ownerScope: MyWorkOwnerScope,
  lastRefreshedIso: string,
): IMyWorkTeamFeedResult {
  let filtered: IMyWorkItem[];
  switch (ownerScope) {
    case 'delegated-by-me':
      filtered = items.filter((i) => !!i.delegatedTo);
      break;
    case 'my-team':
      filtered = items.filter((i) => !!i.delegatedBy || !!i.delegatedTo);
      break;
    case 'escalation-candidate':
      filtered = items.filter(isEscalationCandidate);
      break;
  }

  let agingCount = 0;
  let blockedCount = 0;
  let escalationCandidateCount = 0;

  for (const item of filtered) {
    if (item.isOverdue) agingCount++;
    if (item.isBlocked || item.state === 'blocked') blockedCount++;
    if (isEscalationCandidate(item)) escalationCandidateCount++;
  }

  return {
    items: filtered,
    totalCount: filtered.length,
    agingCount,
    blockedCount,
    escalationCandidateCount,
    lastRefreshedIso,
  };
}

export function useMyWorkTeamFeed(options: IUseMyWorkTeamFeedOptions): IUseMyWorkTeamFeedResult {
  const { context, defaultQuery } = useMyWorkContext();
  const mergedQuery: IMyWorkQuery = { ...defaultQuery, ...options.query };
  const userId = context.currentUserId;

  const result = useQuery({
    queryKey: myWorkKeys.team(userId, options.ownerScope, mergedQuery),
    queryFn: async () => {
      const feedResult = await aggregateFeed({ query: mergedQuery, context });
      return projectTeamFeed(feedResult.items, options.ownerScope, feedResult.lastRefreshedIso);
    },
    enabled: options.enabled ?? true,
  });

  return {
    teamFeed: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
