import { describe, expect, it, vi } from 'vitest';

vi.mock('@hbc/strategic-intelligence', async () => {
  const actual = await vi.importActual<typeof import('@hbc/strategic-intelligence')>(
    '@hbc/strategic-intelligence'
  );
  const state = actual.createStrategicIntelligenceState({ scorecardId: 'branch-state' });
  state.livingEntries = [];
  state.handoffReview = null;
  state.commitmentRegister = [
    {
      commitmentId: 'commitment-1',
      description: 'Branch commitment',
      source: 'handoff',
      responsibleRole: 'BD Lead',
      fulfillmentStatus: 'open',
    },
  ];

  return {
    ...actual,
    useStrategicIntelligenceState: () => ({
      cacheKey: ['strategic-intelligence', 'branch-state', 'bd'] as const,
      status: 'success' as const,
      isLoading: false,
      isError: false,
      errorMessage: null,
      state,
      trust: {
        totalEntries: 0,
        staleEntries: 0,
        aiTrustDowngradedEntries: 0,
        reviewRequiredEntries: 0,
      },
      sensitivity: {
        byClass: {
          'public-internal': 0,
          'restricted-role': 0,
          'restricted-project': 0,
          confidential: 0,
        },
        redactedEntries: 0,
      },
      conflicts: {
        totalConflicts: 0,
        openConflicts: 0,
        resolvedConflicts: 0,
        contradictionConflicts: 0,
        supersessionConflicts: 0,
      },
      telemetry: {
        snapshot: {},
        deltas: [],
      },
      sync: {
        status: 'synced' as const,
        badgeLabel: 'Synced' as const,
        queuedCount: 0,
        lastReplayedAt: null,
      },
      policy: {
        indexableEntryIds: [],
        excludedEntryIds: [],
        redactedProjections: [],
      },
      actions: {
        refresh: vi.fn(),
        queueLocalMutation: vi.fn(),
        replayQueuedMutations: vi.fn(),
        emitTelemetryDelta: vi.fn(),
      },
    }),
    useHandoffReviewWorkflow: () => ({
      review: null,
      snapshotAligned: false,
      completionGate: {
        unresolvedCommitments: [],
        unacknowledgedParticipants: [],
        canComplete: false,
      },
      actions: {
        acknowledgeParticipant: vi.fn(),
        completeWorkflow: vi.fn(),
      },
    }),
  };
});

import { useStrategicIntelligence } from './useStrategicIntelligence.js';

describe('BD strategic intelligence hook branch coverage', () => {
  it('handles empty living metadata and null handoff review branches', () => {
    const projected = useStrategicIntelligence({
      projectId: 'branch-state',
      visibilityContext: 'bd',
      actorUserId: 'actor-1',
    });

    expect(projected.formDefaults.metadata).toEqual({
      client: undefined,
      ownerOrganization: undefined,
      projectType: undefined,
      sector: undefined,
      deliveryMethod: undefined,
      geography: undefined,
      lifecyclePhase: undefined,
      riskCategory: undefined,
    });
    expect(projected.handoffSummary.unacknowledgedParticipantCount).toBe(0);
    expect(projected.bicOwnerAvatars[0]?.owner.role).toBe('BD Lead');
  });
});
