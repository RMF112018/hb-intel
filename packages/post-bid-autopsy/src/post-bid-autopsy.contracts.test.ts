import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
  AutopsyStatus,
  ConfidenceTier,
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
  createPostBidAutopsyPublicationGateQueryKey,
  createPostBidAutopsyRecord,
  createPostBidAutopsyRecordQueryKey,
  createPostBidAutopsyReviewGovernanceQueryKey,
  createPostBidAutopsySyncQueueQueryKey,
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

    expectTypeOf<(typeof AUTOPSY_STATUS_ORDER)[number]>().toEqualTypeOf<AutopsyStatus>();
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

    expect(createPostBidAutopsyRecordQueryKey('aut-1')).toEqual(['post-bid-autopsy', 'record', 'aut-1']);
    expect(createPostBidAutopsyReviewGovernanceQueryKey('aut-1')).toEqual([
      'post-bid-autopsy',
      'review-governance',
      'aut-1',
    ]);
    expect(createPostBidAutopsyPublicationGateQueryKey('aut-1')).toEqual([
      'post-bid-autopsy',
      'publication-gate',
      'aut-1',
    ]);
    expect(createPostBidAutopsySyncQueueQueryKey('aut-1')).toEqual([
      'post-bid-autopsy',
      'sync-queue',
      'aut-1',
    ]);
    expect(queueState.syncQueueKey).toBe(AUTOPSY_SYNC_QUEUE_KEY);
    expect(commitMetadata.source).toBe('offline-queue');
    expect(completeness.evidenceComplete).toBe(false);
    expect(blockers.blockers).toEqual(['missing-evidence']);
    expect(POST_BID_AUTOPSY_HOOK_SURFACES).toHaveLength(4);

    expectTypeOf<IUsePostBidAutopsyResult['state']>().toEqualTypeOf<typeof autopsy | null>();
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
