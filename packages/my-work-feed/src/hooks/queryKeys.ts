/**
 * Query key factory for TanStack Query — SF29-T04
 * Pure function module, no React dependency.
 */

import type { IMyWorkQuery } from '../types/index.js';
import { MY_WORK_QUERY_KEY_PREFIX } from '../constants/index.js';

export const myWorkKeys = {
  all: (userId: string) => [MY_WORK_QUERY_KEY_PREFIX, userId] as const,
  feed: (userId: string, query: IMyWorkQuery) =>
    [MY_WORK_QUERY_KEY_PREFIX, userId, 'feed', query] as const,
  counts: (userId: string, query: IMyWorkQuery) =>
    [MY_WORK_QUERY_KEY_PREFIX, userId, 'counts', query] as const,
  panel: (userId: string, query: IMyWorkQuery) =>
    [MY_WORK_QUERY_KEY_PREFIX, userId, 'panel', query] as const,
  reasoning: (userId: string, itemId: string) =>
    [MY_WORK_QUERY_KEY_PREFIX, userId, 'reasoning', itemId] as const,
  team: (userId: string, ownerScope: string, query: IMyWorkQuery) =>
    [MY_WORK_QUERY_KEY_PREFIX, userId, 'team', ownerScope, query] as const,
  offline: (userId: string) =>
    [MY_WORK_QUERY_KEY_PREFIX, userId, 'offline'] as const,
} as const;
