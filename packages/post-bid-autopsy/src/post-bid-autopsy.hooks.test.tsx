import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { PostBidAutopsyApi } from './api/index.js';
import {
  createMockAutopsyOwner,
  createMockAutopsyRecordSnapshot,
  createMockAutopsyStorageMutation,
} from '../testing/index.js';
import {
  createPostBidAutopsyQueueQueryKey,
  createPostBidAutopsyReviewQueryKey,
  createPostBidAutopsySectionsQueryKey,
  createPostBidAutopsyStateQueryKey,
  resetPostBidAutopsyStateStore,
  setPostBidAutopsyApi,
  usePostBidAutopsyQueue,
  usePostBidAutopsyReview,
  usePostBidAutopsySections,
  usePostBidAutopsyState,
} from './index.js';

const PURSUIT_ID = 'pursuit-hooks';

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const seedApi = (record = createMockAutopsyRecordSnapshot()): PostBidAutopsyApi => {
  const api = new PostBidAutopsyApi();
  api.setRecordForTesting({
    ...record,
    autopsy: {
      ...record.autopsy,
      pursuitId: PURSUIT_ID,
    },
  });
  setPostBidAutopsyApi(PURSUIT_ID, api);
  return api;
};

describe('post-bid-autopsy hooks', () => {
  beforeEach(() => {
    resetPostBidAutopsyStateStore();
  });

  it('preserves a stable loading and success shape for usePostBidAutopsyState with the exact query key', async () => {
    seedApi(
      createMockAutopsyRecordSnapshot({
        autopsy: {
          ...createMockAutopsyRecordSnapshot().autopsy,
          pursuitId: PURSUIT_ID,
          publicationGate: {
            publishable: false,
            blockers: [],
            minimumConfidenceTier: 'moderate',
            requiredEvidenceCount: 2,
          },
          confidence: {
            tier: 'moderate',
            score: 0.68,
            reasons: ['cross-functional-evidence', 'interview-confirmed'],
            evidenceCoverage: 1,
          },
        },
      })
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePostBidAutopsyState({ pursuitId: PURSUIT_ID }), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.state).toEqual(
      expect.objectContaining({
        autopsy: null,
        lifecycleStatus: null,
      })
    );
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.state.autopsy?.confidence.reasons).toEqual([
      'cross-functional-evidence',
      'interview-confirmed',
    ]);
    expect(result.current.completeness.evidenceComplete).toBe(false);
    expect(result.current.publicationBlockers.blockers).toEqual([]);

    const cachedQuery = queryClient.getQueryCache().find({
      queryKey: createPostBidAutopsyStateQueryKey(PURSUIT_ID),
    });
    expect(cachedQuery).toBeDefined();
  });

  it('preserves a stable error shape for usePostBidAutopsyState', async () => {
    class ThrowingApi extends PostBidAutopsyApi {
      override getRecordByPursuitId(): never {
        throw new Error('lookup failed');
      }
    }

    setPostBidAutopsyApi(PURSUIT_ID, new ThrowingApi());

    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePostBidAutopsyState({ pursuitId: PURSUIT_ID }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.state.autopsy).toBeNull();
    expect(result.current.error).toBe('lookup failed');
    expect(result.current.publicationBlockers.blockers).toEqual([]);
  });

  it('projects section ownership, validation, and invalidates pursuit-scoped queries on section updates', async () => {
    const api = seedApi(
      createMockAutopsyRecordSnapshot({
        autopsy: {
          ...createMockAutopsyRecordSnapshot().autopsy,
          pursuitId: PURSUIT_ID,
          evidence: [
            {
              evidenceId: 'ev-pricing',
              type: 'cost-artifact',
              sourceRef: 'pricing-sheet',
              capturedBy: 'user-1',
              capturedAt: '2026-03-13T00:00:00.000Z',
              sensitivity: 'internal',
            },
          ],
        },
        sectionDrafts: [
          {
            sectionKey: 'pricing',
            draftValue: 'Existing pricing draft',
            updatedAt: '2026-03-13T00:00:00.000Z',
            updatedBy: 'user-1',
          },
        ],
      })
    );
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => usePostBidAutopsySections({ pursuitId: PURSUIT_ID }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.state.sections[0]).toEqual(
      expect.objectContaining({
        sectionKey: 'pricing',
        evidenceComplete: true,
        draftValue: 'Existing pricing draft',
      })
    );

    await act(async () => {
      await result.current.updateSectionDraft(
        'pricing',
        'Updated pricing draft',
        createMockAutopsyOwner({ userId: 'editor-1', role: 'Estimator' }),
        '2026-03-15T00:00:00.000Z'
      );
    });

    await waitFor(() =>
      expect(api.getRecordByPursuitId(PURSUIT_ID)?.sectionDrafts?.[0]?.draftValue).toBe('Updated pricing draft')
    );

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...createPostBidAutopsyStateQueryKey(PURSUIT_ID)],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...createPostBidAutopsySectionsQueryKey(PURSUIT_ID)],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...createPostBidAutopsyReviewQueryKey(PURSUIT_ID)],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...createPostBidAutopsyQueueQueryKey(PURSUIT_ID)],
    });
  });

  it('projects disagreement and escalation triage in usePostBidAutopsyReview', async () => {
    seedApi(
      createMockAutopsyRecordSnapshot({
        autopsy: {
          ...createMockAutopsyRecordSnapshot().autopsy,
          pursuitId: PURSUIT_ID,
          disagreements: [
            {
              disagreementId: 'd-1',
              criterion: 'pricing-assumption',
              participants: ['Alex', 'Sam'],
              summary: 'Estimate confidence mismatch',
              escalationRequired: true,
              resolutionStatus: 'open',
            },
          ],
          reviewDecisions: [
            {
              stage: 'cross-functional-review',
              decision: 'changes-requested',
              reviewer: 'Alex',
              decidedAt: '2026-03-14T00:00:00.000Z',
            },
          ],
        },
        escalationEvents: [
          {
            escalationId: 'deadlock:autopsy-mock:2026-03-15T00:00:00.000Z',
            autopsyId: 'autopsy-mock',
            eventType: 'disagreement-deadlock',
            target: createMockAutopsyOwner({ userId: 'chief-1', displayName: 'Chief Estimator' }),
            createdAt: '2026-03-15T00:00:00.000Z',
            reason: 'Deadlock persisted',
            sectionKeys: ['pricing'],
          },
        ],
      })
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePostBidAutopsyReview({ pursuitId: PURSUIT_ID }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.state.reviewDecisions).toHaveLength(1);
    expect(result.current.triage).toEqual({
      hasOpenDisagreements: true,
      escalationRequired: true,
      escalationTargets: ['Chief Estimator'],
    });
    expect(
      queryClient.getQueryCache().find({
        queryKey: createPostBidAutopsyReviewQueryKey(PURSUIT_ID),
      })
    ).toBeDefined();
  });

  it('projects queue status, optimistic labels, immutable replay metadata, and the exact queue key', async () => {
    const api = seedApi();
    const queueQueryClient = createQueryClient();
    const baseVersion = api.getVersionEnvelopeByPursuitId(PURSUIT_ID)?.currentVersion;

    await api.enqueueMutation(
      createMockAutopsyStorageMutation({
        autopsyId: api.getRecordByPursuitId(PURSUIT_ID)!.autopsy.autopsyId,
        baseVersion: baseVersion?.version ?? 1,
        payload: {
          snapshot: api.getRecordByPursuitId(PURSUIT_ID)!,
          actor: createMockAutopsyOwner({ userId: 'sync-actor', role: 'Estimator' }),
        },
      })
    );

    const { result } = renderHook(() => usePostBidAutopsyQueue({ pursuitId: PURSUIT_ID }), {
      wrapper: createWrapper(queueQueryClient),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.state.optimisticStatusLabel).toBe('Queued to sync');
    expect(result.current.state.queuedMutations).toHaveLength(1);

    await act(async () => {
      await result.current.replay();
    });

    await waitFor(() => expect(result.current.state.replayCompletion.replayedMutationIds).toHaveLength(1));

    expect(baseVersion?.version).toBe(1);
    expect(result.current.state.replayCompletion.version?.version).toBeGreaterThan(1);
    expect(result.current.state.replayCompletion.resultingSyncStatus).toBe('synced');
    expect(
      queueQueryClient.getQueryCache().find({
        queryKey: createPostBidAutopsyQueueQueryKey(PURSUIT_ID),
      })
    ).toBeDefined();
  });
});
