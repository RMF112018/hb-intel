import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  ConfidenceTier,
  IPostBidAutopsyStateView,
  IUseAutopsyPublicationGateResult,
  IUseAutopsyReviewGovernanceResult,
  IUseAutopsySyncQueueResult,
  IUsePostBidAutopsyResult,
  PostBidLearningSignal,
} from '@hbc/post-bid-autopsy';
import {
  AUTOPSY_MIN_PUBLISH_CONFIDENCE,
  AUTOPSY_STATUS_ORDER,
  AUTOPSY_SYNC_QUEUE_KEY,
  POST_BID_AUTOPSY_HOOK_SURFACES,
  createAutopsyCommitMetadata,
  createAutopsyCompletenessState,
  createAutopsyPublicationBlockerSummary,
  createAutopsyQueueState,
  createPostBidAutopsyQueueQueryKey,
  createPostBidAutopsyRecord,
  createPostBidAutopsyReviewQueryKey,
  createPostBidAutopsySectionsQueryKey,
  createPostBidAutopsyStateQueryKey,
} from '@hbc/post-bid-autopsy';
import {
  createMockBenchmarkDatasetSignal,
  createMockPostBidAutopsyRecord,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy contracts', () => {
  it('keeps status and confidence constants aligned with the public unions', () => {
    expect(AUTOPSY_STATUS_ORDER).toEqual([
      'draft',
      'review',
      'approved',
      'published',
      'superseded',
      'archived',
      'overdue',
    ]);
    expect(AUTOPSY_SYNC_QUEUE_KEY).toBe('post-bid-autopsy-sync-queue');
    expect(AUTOPSY_MIN_PUBLISH_CONFIDENCE).toBe('moderate');

    expectTypeOf<(typeof AUTOPSY_STATUS_ORDER)[number]>().toMatchTypeOf<
      | 'draft'
      | 'review'
      | 'approved'
      | 'published'
      | 'superseded'
      | 'archived'
      | 'overdue'
    >();
    expectTypeOf<typeof AUTOPSY_MIN_PUBLISH_CONFIDENCE>().toEqualTypeOf<ConfidenceTier>();
  });

  it('exports explicit primitive hook contract shapes and query keys', () => {
    const autopsy = createPostBidAutopsyRecord({
      evidence: [],
      publicationGate: {
        publishable: false,
        blockers: ['missing-evidence'],
        minimumConfidenceTier: 'moderate',
        requiredEvidenceCount: 2,
      },
    });

    const queueState = createAutopsyQueueState({ pendingMutationCount: 2 });
    const commitMetadata = createAutopsyCommitMetadata({ source: 'offline-queue' });
    const completeness = createAutopsyCompletenessState(autopsy);
    const blockers = createAutopsyPublicationBlockerSummary(autopsy);

    expect(createPostBidAutopsyStateQueryKey('pursuit-1')).toEqual(['post-bid-autopsy', 'pursuit-1']);
    expect(createPostBidAutopsySectionsQueryKey('pursuit-1')).toEqual([
      'post-bid-autopsy',
      'pursuit-1',
      'sections',
    ]);
    expect(createPostBidAutopsyReviewQueryKey('pursuit-1')).toEqual([
      'post-bid-autopsy',
      'pursuit-1',
      'review',
    ]);
    expect(createPostBidAutopsyQueueQueryKey('pursuit-1')).toEqual([
      'post-bid-autopsy',
      'pursuit-1',
      'queue',
    ]);
    expect(queueState.syncQueueKey).toBe(AUTOPSY_SYNC_QUEUE_KEY);
    expect(commitMetadata.source).toBe('offline-queue');
    expect(completeness.evidenceComplete).toBe(false);
    expect(blockers.blockers).toEqual(['missing-evidence']);
    expect(POST_BID_AUTOPSY_HOOK_SURFACES).toHaveLength(4);

    expectTypeOf<IUsePostBidAutopsyResult['state']>().toEqualTypeOf<IPostBidAutopsyStateView>();
    expectTypeOf<IUseAutopsyReviewGovernanceResult['queueStatus']>().toEqualTypeOf<typeof queueState>();
    expectTypeOf<IUseAutopsyPublicationGateResult['publicationBlockers']>().toEqualTypeOf<
      typeof blockers
    >();
    expectTypeOf<IUseAutopsySyncQueueResult['commitMetadata']>().toEqualTypeOf<typeof commitMetadata>();
  });

  it('preserves published learning-signal compatibility and testing entrypoint resolution', () => {
    const signal: PostBidLearningSignal = createMockBenchmarkDatasetSignal({ signalId: 'signal-1' });
    const record = createMockPostBidAutopsyRecord({ status: 'review' });

    expect(signal.signalId).toBe('signal-1');
    expect(record.status).toBe('review');
  });
});
