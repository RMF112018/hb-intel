import { describe, expect, it } from 'vitest';
import {
  createSuggestedIntelligenceMatch,
  createStrategicIntelligenceState,
  StrategicIntelligenceApi,
  StrategicIntelligenceLifecycleApi,
} from '../index.js';
import type {
  IStrategicIntelligenceMutation,
  IStrategicIntelligenceState,
} from '../types/index.js';
import {
  useHandoffReviewWorkflow,
  useStrategicIntelligenceApprovalQueue,
  useStrategicIntelligenceState,
  useSuggestedIntelligence,
} from './index.js';

const NOW = '2026-03-12T12:00:00.000Z';

const createMutation = (scorecardId: string): IStrategicIntelligenceMutation => ({
  mutationId: `${scorecardId}-mutation-1`,
  scorecardId,
  mutationType: 'acknowledgment-update',
  payload: {
    participantId: 'participant-1',
    acknowledgedAt: NOW,
  },
  queuedAt: NOW,
  replaySafe: true,
  localStatus: 'queued-to-sync',
  provenance: {
    recordedAt: NOW,
    actorUserId: 'user-1',
    actorRole: 'business-development',
    source: 'offline-queue',
    provenanceClass: 'meeting-summary',
  },
});

const createApprovalState = (scorecardId: string): IStrategicIntelligenceState => {
  const state = createStrategicIntelligenceState({ scorecardId });
  const baseEntry = state.livingEntries[0];

  state.livingEntries = [
    {
      ...baseEntry,
      entryId: `${scorecardId}-entry-1`,
      trust: {
        ...baseEntry.trust,
        provenanceClass: 'ai-assisted-draft',
        aiTrustDowngraded: true,
      },
    },
  ];

  state.approvalQueue = [
    {
      queueItemId: `${scorecardId}-queue-1`,
      entryId: `${scorecardId}-entry-1`,
      submittedBy: 'author-1',
      submittedAt: NOW,
      approvalStatus: 'pending',
    },
  ];

  return state;
};

describe('strategic intelligence hooks', () => {
  it('returns a stable state shape and explicit optimistic sync labels', () => {
    const scorecardId = 'scorecard-hooks-1';
    const api = new StrategicIntelligenceApi([createStrategicIntelligenceState({ scorecardId })]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

    const initial = useStrategicIntelligenceState(
      {
        projectId: scorecardId,
        visibilityContext: 'bd-panel',
      },
      {
        api,
        lifecycleApi,
        now: () => new Date(NOW),
      }
    );

    expect(initial.status).toBe('success');
    expect(initial.cacheKey).toEqual(['strategic-intelligence', scorecardId, 'bd-panel']);
    expect(initial.sync.badgeLabel).toBe('Synced');

    const queued = initial.actions.queueLocalMutation(createMutation(scorecardId));
    expect(queued.sync.badgeLabel).toBe('Queued to sync');

    const replayed = queued.actions.replayQueuedMutations();
    expect(replayed.sync.badgeLabel).toBe('Synced');
    expect(replayed.sync.lastReplayedAt).toBe(NOW);
  });

  it('keeps heritage snapshot immutable for hook consumers', () => {
    const scorecardId = 'scorecard-hooks-2';
    const api = new StrategicIntelligenceApi([createStrategicIntelligenceState({ scorecardId })]);

    const state = useStrategicIntelligenceState(
      {
        projectId: scorecardId,
        visibilityContext: 'bd-panel',
      },
      {
        api,
      }
    );

    expect(() => {
      if (!state.state) {
        throw new Error('state not loaded');
      }

      state.state.heritageSnapshot.decision = 'NO-GO';
    }).toThrow();
  });

  it('enforces approval transition constraints and monotonic behavior', () => {
    const scorecardId = 'scorecard-hooks-3';
    const api = new StrategicIntelligenceApi([createApprovalState(scorecardId)]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

    const queue = useStrategicIntelligenceApprovalQueue(
      {
        projectId: scorecardId,
        actorUserId: 'approver-1',
      },
      {
        api,
        lifecycleApi,
        now: () => new Date(NOW),
      }
    );

    expect(() => queue.actions.reject(`${scorecardId}-queue-1`, '')).toThrow(
      /Review reason is required/
    );

    const approved = queue.actions.approve(`${scorecardId}-queue-1`);
    expect(approved.queue[0]?.approvalStatus).toBe('approved');

    const approvedAgain = approved.actions.approve(`${scorecardId}-queue-1`);
    expect(approvedAgain.queue[0]?.approvalStatus).toBe('approved');

    const livingEntries = api.getLivingEntries(scorecardId);
    const latestVersion = livingEntries[livingEntries.length - 1];
    expect(latestVersion?.lifecycleState).toBe('approved');
    expect(latestVersion?.trust.aiTrustDowngraded).toBe(false);
  });

  it('computes handoff completion gate and escalation metadata with monotonic acknowledgments', () => {
    const scorecardId = 'scorecard-hooks-4';
    const state = createStrategicIntelligenceState({ scorecardId });
    state.commitmentRegister = [
      {
        ...state.commitmentRegister[0],
        commitmentId: 'commitment-1',
        fulfillmentStatus: 'open',
        bicRecordId: 'bic-1',
      },
    ];

    const api = new StrategicIntelligenceApi([state]);

    const workflow = useHandoffReviewWorkflow(
      {
        projectId: scorecardId,
        actorUserId: 'handoff-owner',
      },
      {
        api,
        now: () => new Date(NOW),
      }
    );

    expect(workflow.snapshotAligned).toBe(true);
    expect(workflow.completionGate.isComplete).toBe(false);
    expect(workflow.escalation.unresolvedCommitments.length).toBe(1);

    const participantId = workflow.review?.participants[0]?.participantId;
    expect(participantId).toBeTruthy();

    const acknowledged = workflow.actions.acknowledgeParticipant(String(participantId), 'Reviewed.');
    const acknowledgedAt = acknowledged.review?.participants[0]?.acknowledgedAt;
    expect(acknowledgedAt).toBe(NOW);

    const stillAcknowledged = acknowledged.actions.acknowledgeParticipant(String(participantId), 'Again');
    expect(stillAcknowledged.review?.participants[0]?.acknowledgedAt).toBe(NOW);

    api.persistCommitmentUpdate(scorecardId, {
      ...state.commitmentRegister[0],
      commitmentId: 'commitment-1',
      fulfillmentStatus: 'fulfilled',
    });

    const complete = stillAcknowledged.actions.markCompletion('Closed.');
    expect(complete.completionGate.isComplete).toBe(true);
    expect(complete.review?.completionStatus).toBe('completed');
  });

  it('records suggestion outcomes and emits telemetry-safe deltas', () => {
    const scorecardId = 'scorecard-hooks-5';
    const suggestionState = createStrategicIntelligenceState({ scorecardId });
    suggestionState.livingEntries = suggestionState.livingEntries.map((entry) => ({
      ...entry,
      suggestedMatches: [createSuggestedIntelligenceMatch({ entryId: entry.entryId })],
    }));
    const api = new StrategicIntelligenceApi([suggestionState]);

    const suggestions = useSuggestedIntelligence(
      { projectId: scorecardId },
      {
        api,
        now: () => new Date(NOW),
      }
    );

    const suggestionId = suggestions.suggestions[0]?.suggestionId;
    expect(suggestionId).toBeTruthy();

    const withOutcome = suggestions.actions.recordOutcome(String(suggestionId), 'accepted');
    expect(withOutcome.outcomes).toHaveLength(1);
    expect(withOutcome.outcomes[0]?.outcome).toBe('accepted');

    const withTelemetry = useStrategicIntelligenceState(
      {
        projectId: scorecardId,
        visibilityContext: 'bd-panel',
      },
      {
        api,
      }
    );

    expect(withTelemetry.telemetry.deltas.some((delta) => delta.channel === 'suggestionAcceptanceRate')).toBe(true);
    expect(withTelemetry.telemetry.deltas.some((delta) => delta.channel === 'suggestionExplainabilityEngagementRate')).toBe(true);
  });
});
