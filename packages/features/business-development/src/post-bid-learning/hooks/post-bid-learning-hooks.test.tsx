import { renderHook } from '@testing-library/react';

import { businessDevelopmentPostBidLearningProfile } from '../profiles/index.js';
import { useBusinessDevelopmentPostBidLearning } from './index.js';

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
            score: 0.71,
            reasons: ['verified-evidence', 'field-corroborated'],
            evidenceCoverage: 1,
          },
          evidence: [],
          rootCauseTags: [],
          sensitivity: {
            visibility: 'role-scoped',
            redactionRequired: false,
          },
          reviewDecisions: [],
          disagreements: [],
          publicationGate: {
            publishable: false,
            blockers: ['review-approval-pending'],
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
          blockers: ['review-approval-pending'],
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
        status: 'queued-to-sync',
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
        evidenceCount: 0,
        requiredEvidenceCount: 2,
        evidenceComplete: false,
        confidenceTier: 'moderate',
        confidenceScore: 0.71,
        confidenceComplete: true,
      },
      publicationBlockers: {
        publishable: false,
        blockers: ['review-approval-pending'],
        minimumConfidenceTier: 'moderate',
      },
    }),
    usePostBidAutopsyReview: () => ({
      state: {
        autopsyId: 'autopsy-1',
        reviewDecisions: [
          {
            stage: 'cross-functional-review',
            decision: 'changes-requested',
            reviewer: 'Taylor',
            decidedAt: '2026-03-15T00:00:00.000Z',
          },
        ],
        disagreements: [
          {
            disagreementId: 'd-1',
            criterion: 'pricing',
            participants: ['Taylor', 'Jordan'],
            summary: 'Need pricing clarification',
            escalationRequired: true,
            resolutionStatus: 'open',
          },
        ],
        overrideGovernance: null,
        sensitivity: {
          visibility: 'role-scoped',
          redactionRequired: false,
        },
        publicationGate: null,
        escalationEvents: [],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
      queueStatus: {
        status: 'queued-to-sync',
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
        evidenceCount: 0,
        requiredEvidenceCount: 2,
        evidenceComplete: false,
        confidenceTier: 'moderate',
        confidenceScore: 0.71,
        confidenceComplete: true,
      },
      publicationBlockers: {
        publishable: false,
        blockers: ['review-approval-pending'],
        minimumConfidenceTier: 'moderate',
      },
      triage: {
        hasOpenDisagreements: true,
        escalationRequired: true,
        escalationTargets: ['Chief Estimator'],
      },
      transition: vi.fn(),
      escalateDeadlock: vi.fn(),
    }),
    usePostBidAutopsyQueue: () => ({
      state: {
        autopsyId: 'autopsy-1',
        queuedMutations: [],
        optimisticStatusLabel: 'Queued to sync',
        replayInFlight: false,
        replayCompletion: {
          completedAt: null,
          version: null,
          replayedMutationIds: [],
          resultingSyncStatus: 'queued-to-sync',
        },
        queueStatus: {
          status: 'queued-to-sync',
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
        status: 'queued-to-sync',
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
        evidenceCount: 0,
        requiredEvidenceCount: 2,
        evidenceComplete: false,
        confidenceTier: 'moderate',
        confidenceScore: 0.71,
        confidenceComplete: true,
      },
      publicationBlockers: {
        publishable: false,
        blockers: ['review-approval-pending'],
        minimumConfidenceTier: 'moderate',
      },
    }),
  };
});

describe('business-development post-bid-learning hooks', () => {
  it('projects trust indicators, triage actions, avatar ownership, and My Work metadata', () => {
    const { result } = renderHook(() =>
      useBusinessDevelopmentPostBidLearning({
        pursuitId: 'pursuit-1',
        profile: businessDevelopmentPostBidLearningProfile,
      })
    );

    expect(result.current.state.trustIndicator).toEqual({
      confidenceTier: 'moderate',
      reasonCount: 2,
      publicationReady: false,
    });
    expect(result.current.state.triageActions.map((action) => action.actionId)).toEqual([
      'resolve-disagreements',
      'monitor-sync',
      'clear-publication-blockers',
    ]);
    expect(result.current.state.avatarOwnership).toEqual({
      primaryOwner: 'Taylor',
      coOwners: ['Taylor', 'Jordan'],
    });
    expect(result.current.state.myWorkPlacement).toEqual({
      bucket: 'review-queue',
      route: '/business-development/post-bid-learning/pursuit-1',
    });
  });
});
