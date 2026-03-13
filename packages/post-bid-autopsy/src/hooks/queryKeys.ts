export const createPostBidAutopsyStateQueryKey = (pursuitId: string) =>
  ['post-bid-autopsy', pursuitId] as const;

export const createPostBidAutopsySectionsQueryKey = (pursuitId: string) =>
  ['post-bid-autopsy', pursuitId, 'sections'] as const;

export const createPostBidAutopsyReviewQueryKey = (pursuitId: string) =>
  ['post-bid-autopsy', pursuitId, 'review'] as const;

export const createPostBidAutopsyQueueQueryKey = (pursuitId: string) =>
  ['post-bid-autopsy', pursuitId, 'queue'] as const;

export const createPostBidAutopsyInvalidationKeys = (pursuitId: string) =>
  [
    createPostBidAutopsyStateQueryKey(pursuitId),
    createPostBidAutopsySectionsQueryKey(pursuitId),
    createPostBidAutopsyReviewQueryKey(pursuitId),
    createPostBidAutopsyQueueQueryKey(pursuitId),
  ] as const;
