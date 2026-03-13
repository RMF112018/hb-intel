export {
  createPostBidAutopsyStateQueryKey,
  createPostBidAutopsySectionsQueryKey,
  createPostBidAutopsyReviewQueryKey,
  createPostBidAutopsyQueueQueryKey,
  createPostBidAutopsyInvalidationKeys,
} from './queryKeys.js';

import {
  createPostBidAutopsyQueueQueryKey,
  createPostBidAutopsyReviewQueryKey,
  createPostBidAutopsySectionsQueryKey,
  createPostBidAutopsyStateQueryKey,
} from './queryKeys.js';
import type { IPostBidAutopsyHookSurface } from '../types/index.js';

export const POST_BID_AUTOPSY_HOOK_SURFACES: readonly IPostBidAutopsyHookSurface[] = Object.freeze([
  {
    surfaceId: 'post-bid-autopsy.state',
    ownership: 'primitive',
    queryKey: createPostBidAutopsyStateQueryKey('pursuit-template'),
  },
  {
    surfaceId: 'post-bid-autopsy.sections',
    ownership: 'primitive',
    queryKey: createPostBidAutopsySectionsQueryKey('pursuit-template'),
  },
  {
    surfaceId: 'post-bid-autopsy.review',
    ownership: 'primitive',
    queryKey: createPostBidAutopsyReviewQueryKey('pursuit-template'),
  },
  {
    surfaceId: 'post-bid-autopsy.queue',
    ownership: 'primitive',
    queryKey: createPostBidAutopsyQueueQueryKey('pursuit-template'),
  },
]);

export const createPostBidAutopsyHookScaffold = () => ({
  surfaces: POST_BID_AUTOPSY_HOOK_SURFACES,
});

export {
  getPostBidAutopsyApi,
  setPostBidAutopsyApi,
  getReplayProjection,
  setReplayProjection,
  resetPostBidAutopsyStateStore,
} from './stateStore.js';

export {
  createAutopsyQueueState,
  createAutopsyCommitMetadata,
  createAutopsyCompletenessState,
  createAutopsyPublicationBlockerSummary,
  createAutopsyQueryInvalidationResult,
  selectAutopsyStateView,
  selectAutopsySectionsState,
  selectAutopsyReviewGovernanceState,
  selectDisagreementTriageState,
  selectAutopsyQueueState,
  selectOptimisticStatusLabel,
} from './selectors.js';

export { usePostBidAutopsyState } from './usePostBidAutopsyState.js';
export { usePostBidAutopsySections } from './usePostBidAutopsySections.js';
export { usePostBidAutopsyReview } from './usePostBidAutopsyReview.js';
export { usePostBidAutopsyQueue } from './usePostBidAutopsyQueue.js';
