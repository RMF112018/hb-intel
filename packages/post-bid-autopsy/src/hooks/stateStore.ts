import type { IAutopsyQueueReplayProjection } from '../types/index.js';
import { PostBidAutopsyApi } from '../api/index.js';

const DEFAULT_SCOPE = '__default__';

const apiRegistry = new Map<string, PostBidAutopsyApi>();
const replayProjectionRegistry = new Map<string, IAutopsyQueueReplayProjection>();

const clone = <T>(value: T): T => structuredClone(value);

const resolveScope = (scope?: string): string => scope && scope.length > 0 ? scope : DEFAULT_SCOPE;

export const getPostBidAutopsyApi = (scope?: string): PostBidAutopsyApi => {
  const resolvedScope = resolveScope(scope);
  const existing = apiRegistry.get(resolvedScope);
  if (existing) {
    return existing;
  }

  const created = new PostBidAutopsyApi();
  apiRegistry.set(resolvedScope, created);
  return created;
};

export const setPostBidAutopsyApi = (scope: string, api: PostBidAutopsyApi): PostBidAutopsyApi => {
  apiRegistry.set(resolveScope(scope), api);
  return api;
};

export const resetPostBidAutopsyStateStore = (): void => {
  apiRegistry.clear();
  replayProjectionRegistry.clear();
};

export const getReplayProjection = (pursuitId: string): IAutopsyQueueReplayProjection => {
  return (
    clone(replayProjectionRegistry.get(resolveScope(pursuitId)) ?? {
      completedAt: null,
      version: null,
      replayedMutationIds: [],
      resultingSyncStatus: 'synced',
    })
  );
};

export const setReplayProjection = (
  pursuitId: string,
  projection: IAutopsyQueueReplayProjection
): IAutopsyQueueReplayProjection => {
  replayProjectionRegistry.set(resolveScope(pursuitId), clone(projection));
  return projection;
};
