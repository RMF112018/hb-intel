import { renderHook } from '@testing-library/react';

import { estimatingPostBidLearningProfile } from '../profiles/index.js';
import { useEstimatingPostBidLearning } from './index.js';

vi.mock('@hbc/post-bid-autopsy', async () => {
  const actual = await vi.importActual<object>('@hbc/post-bid-autopsy');

  return {
    ...actual,
    createPostBidAutopsyStateQueryKey: (pursuitId: string) => ['post-bid-autopsy', pursuitId] as const,
    usePostBidAutopsyState: () => ({
      state: {
        autopsy: {
          autopsyId: 'autopsy-1',
          pursuitId: 'pursuit-1',
          scorecardId: 'scorecard-1',
          outcome: 'lost',
          status: 'review',
          confidence: {
            tier: 'moderate',
            score: 0.74,
            reasons: ['cost-corroborated'],
            evidenceCoverage: 1,
          },
          evidence: [],
          rootCauseTags: [],
          sensitivity: {
            visibility: 'project-scoped',
            redactionRequired: false,
          },
          reviewDecisions: [],
          disagreements: [],
          publicationGate: {
            publishable: false,
            blockers: ['missing-pricing-evidence'],
            minimumConfidenceTier: 'moderate',
            requiredEvidenceCount: 2,
          },
          supersession: {},
          overrideGovernance: null,
          telemetry: {
            autopsyCompletionLatency: null,
            repeatErrorReductionRate: null,
            intelligenceSeedingConversionRate: null,
            benchmarkAccuracyLift: null,
            corroborationRate: null,
            staleIntelligenceRate: null,
            revalidationLatency: null,
            reinsertionAdoptionRate: null,
            autopsyCes: null,
          },
        },
        lifecycleStatus: 'review',
        publicationGate: {
          publishable: false,
          blockers: ['missing-pricing-evidence'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
        telemetrySummary: {
          autopsyCompletionLatency: null,
          intelligenceSeedingConversionRate: null,
          staleIntelligenceRate: null,
          revalidationLatency: null,
          benchmarkAccuracyLift: null,
        },
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
      queueStatus: {
        status: 'saved-locally',
        pendingMutationCount: 1,
        lastSyncedAt: null,
        syncQueueKey: 'post-bid-autopsy-sync-queue',
      },
      commitMetadata: {
        committedAt: null,
        committedBy: null,
        source: 'unknown',
      },
      completeness: {
        evidenceCount: 1,
        requiredEvidenceCount: 2,
        evidenceComplete: false,
        confidenceTier: 'moderate',
        confidenceScore: 0.74,
        confidenceComplete: true,
      },
      publicationBlockers: {
        publishable: false,
        blockers: ['missing-pricing-evidence'],
        minimumConfidenceTier: 'moderate',
      },
    }),
    usePostBidAutopsyReview: () => ({
      state: {
        autopsyId: 'autopsy-1',
        reviewDecisions: [
          {
            stage: 'author-review',
            decision: 'changes-requested',
            reviewer: 'Morgan',
            decidedAt: '2026-03-15T00:00:00.000Z',
          },
        ],
        disagreements: [
          {
            disagreementId: 'd-1',
            criterion: 'pricing',
            participants: ['Morgan'],
            summary: 'Need more cost evidence',
            escalationRequired: false,
            resolutionStatus: 'open',
          },
        ],
        overrideGovernance: null,
        sensitivity: {
          visibility: 'project-scoped',
          redactionRequired: false,
        },
        publicationGate: null,
        escalationEvents: [
          {
            escalationId: 'overdue-1',
            autopsyId: 'autopsy-1',
            eventType: 'overdue',
            target: {
              userId: 'chief-1',
              displayName: 'Chief Estimator',
              role: 'Chief Estimator',
            },
            createdAt: '2026-03-16T00:00:00.000Z',
            reason: 'Overdue',
            sectionKeys: ['pricing'],
          },
        ],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
      queueStatus: {
        status: 'saved-locally',
        pendingMutationCount: 1,
        lastSyncedAt: null,
        syncQueueKey: 'post-bid-autopsy-sync-queue',
      },
      commitMetadata: {
        committedAt: null,
        committedBy: null,
        source: 'unknown',
      },
      completeness: {
        evidenceCount: 1,
        requiredEvidenceCount: 2,
        evidenceComplete: false,
        confidenceTier: 'moderate',
        confidenceScore: 0.74,
        confidenceComplete: true,
      },
      publicationBlockers: {
        publishable: false,
        blockers: ['missing-pricing-evidence'],
        minimumConfidenceTier: 'moderate',
      },
      triage: {
        hasOpenDisagreements: true,
        escalationRequired: false,
        escalationTargets: ['Chief Estimator'],
      },
      transition: vi.fn(),
      escalateDeadlock: vi.fn(),
    }),
    usePostBidAutopsyQueue: () => ({
      state: {
        autopsyId: 'autopsy-1',
        queuedMutations: [],
        optimisticStatusLabel: 'Saved locally',
        replayInFlight: false,
        replayCompletion: {
          completedAt: null,
          version: null,
          replayedMutationIds: [],
          resultingSyncStatus: 'saved-locally',
        },
        queueStatus: {
          status: 'saved-locally',
          pendingMutationCount: 1,
          lastSyncedAt: null,
          syncQueueKey: 'post-bid-autopsy-sync-queue',
        },
        commitMetadata: {
          committedAt: null,
          committedBy: null,
          source: 'unknown',
        },
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
      replay: vi.fn(),
      queueStatus: {
        status: 'saved-locally',
        pendingMutationCount: 1,
        lastSyncedAt: null,
        syncQueueKey: 'post-bid-autopsy-sync-queue',
      },
      commitMetadata: {
        committedAt: null,
        committedBy: null,
        source: 'unknown',
      },
      completeness: {
        evidenceCount: 1,
        requiredEvidenceCount: 2,
        evidenceComplete: false,
        confidenceTier: 'moderate',
        confidenceScore: 0.74,
        confidenceComplete: true,
      },
      publicationBlockers: {
        publishable: false,
        blockers: ['missing-pricing-evidence'],
        minimumConfidenceTier: 'moderate',
      },
    }),
  };
});

describe('estimating post-bid-learning hooks', () => {
  it('projects trust indicators, triage actions, avatar ownership, and My Work metadata', () => {
    const { result } = renderHook(() =>
      useEstimatingPostBidLearning({
        pursuitId: 'pursuit-1',
        profile: estimatingPostBidLearningProfile,
      })
    );

    expect(result.current.state.trustIndicator).toEqual({
      confidenceTier: 'moderate',
      blockerCount: 1,
      evidenceComplete: false,
    });
    expect(result.current.state.triageActions.map((action) => action.actionId)).toEqual([
      'add-evidence',
      'review-disagreements',
      'check-sync',
    ]);
    expect(result.current.state.avatarOwnership).toEqual({
      primaryOwner: 'Morgan',
      escalationOwner: 'Chief Estimator',
    });
    expect(result.current.state.myWorkPlacement).toEqual({
      bucket: 'review-queue',
      route: '/estimating/post-bid-learning/pursuit-1',
    });
  });
});
