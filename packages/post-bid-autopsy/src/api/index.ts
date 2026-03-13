import type { IPostBidAutopsyApiSurface } from '../types/index.js';

export const POST_BID_AUTOPSY_API_SURFACES: readonly IPostBidAutopsyApiSurface[] = Object.freeze([
  {
    surfaceId: 'post-bid-autopsy.runtime',
    ownership: 'primitive',
    responsibilities: Object.freeze(['record-contract', 'boundary-aggregation', 'publication-ownership']),
  },
  {
    surfaceId: 'post-bid-autopsy.testing',
    ownership: 'primitive',
    responsibilities: Object.freeze(['fixture-creation', 'public-test-entrypoint']),
  },
]);

export const createPostBidAutopsyApiScaffold = () => ({
  surfaces: POST_BID_AUTOPSY_API_SURFACES,
});
