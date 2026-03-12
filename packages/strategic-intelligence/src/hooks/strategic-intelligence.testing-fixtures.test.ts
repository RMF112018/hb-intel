import { describe, expect, it } from 'vitest';
import {
  StrategicIntelligenceApi,
  StrategicIntelligenceLifecycleApi,
  useHandoffReviewWorkflow,
  useStrategicIntelligenceApprovalQueue,
  useStrategicIntelligenceState,
} from '../index.js';
import {
  createMockCommitmentRegisterItem,
  createMockIntelligenceConflict,
  createMockStrategicIntelligenceEntry,
  createMockStrategicIntelligenceState,
  mockStrategicIntelligenceStates,
} from '@hbc/strategic-intelligence/testing';

describe('strategic intelligence testing fixtures', () => {
  it('provides canonical states for queue, trust tiers, provenance classes, and sync variants', () => {
    expect(mockStrategicIntelligenceStates.pendingRejectedRevisionQueue.approvalQueue).toHaveLength(3);
    expect(mockStrategicIntelligenceStates.trustTierMatrix.livingEntries.map((entry) => entry.trust.reliabilityTier)).toEqual([
      'high',
      'moderate',
      'low',
      'review-required',
    ]);
    expect(
      mockStrategicIntelligenceStates.provenanceClassMatrix.livingEntries.some(
        (entry) => entry.trust.provenanceClass === 'ai-assisted-draft'
      )
    ).toBe(true);
    expect(mockStrategicIntelligenceStates.syncSavedLocally.syncStatus).toBe('saved-locally');
    expect(mockStrategicIntelligenceStates.syncQueuedToSync.syncStatus).toBe('queued-to-sync');
    expect(mockStrategicIntelligenceStates.syncReplayReconciled.syncStatus).toBe('synced');
  });

  it('keeps redaction and indexing policy guarantees primitive-owned', () => {
    const state = mockStrategicIntelligenceStates.sensitivityRedactedVsFull;
    const api = new StrategicIntelligenceApi([state]);
    const result = useStrategicIntelligenceState(
      {
        projectId: state.heritageSnapshot.scorecardId,
        scorecardId: state.heritageSnapshot.scorecardId,
        visibilityContext: 'bd-panel',
      },
      {
        api,
        lifecycleApi: new StrategicIntelligenceLifecycleApi(api),
      }
    );

    expect(result.policy.indexableEntryIds).toHaveLength(2);
    const restricted = result.policy.redactedProjections.find((item) => item.entryId === 'entry-restricted');
    expect(restricted?.redactionReason).toContain('restricted-project');
  });

  it('supports approval downgrade and conflict resolution transitions from deterministic fixture state', () => {
    const scorecardId = 'fixture-approval-conflict';
    const state = createMockStrategicIntelligenceState(scorecardId);
    state.livingEntries = [
      createMockStrategicIntelligenceEntry(undefined, {
        entryId: 'entry-ai',
        lifecycleState: 'pending-approval',
        provenanceClass: 'ai-assisted-draft',
        withConflict: true,
      }),
    ];
    state.approvalQueue = [
      {
        queueItemId: 'queue-ai',
        entryId: 'entry-ai',
        submittedBy: 'author-1',
        submittedAt: '2026-03-12T00:00:00.000Z',
        approvalStatus: 'pending',
      },
    ];

    const api = new StrategicIntelligenceApi([state]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);
    const queue = useStrategicIntelligenceApprovalQueue(
      {
        projectId: scorecardId,
        scorecardId,
        actorUserId: 'approver-1',
      },
      {
        api,
        lifecycleApi,
        now: () => new Date('2026-03-12T01:00:00.000Z'),
      }
    );

    const approved = queue.actions.approve('queue-ai');
    expect(approved.queue[0]?.approvalStatus).toBe('approved');

    const afterApprove = api.getLivingEntries(scorecardId).at(-1);
    expect(afterApprove?.trust.aiTrustDowngraded).toBe(false);

    const conflictId = afterApprove?.conflicts[0]?.conflictId;
    expect(conflictId).toBeTruthy();
    queue.actions.resolveConflict(String(conflictId), 'Conflict resolved after approval.');

    const afterResolve = api.getLivingEntries(scorecardId).at(-1);
    expect(afterResolve?.conflicts[0]?.resolutionStatus).toBe('resolved');
  });

  it('enforces handoff completion gates on unresolved commitments and acknowledgments', () => {
    const scorecardId = 'fixture-handoff-gates';
    const state = createMockStrategicIntelligenceState(scorecardId);
    state.commitmentRegister = [
      createMockCommitmentRegisterItem({ commitmentId: 'commitment-open', fulfillmentStatus: 'open' }),
    ];
    state.handoffReview = mockStrategicIntelligenceStates.handoffAcknowledgmentIncomplete.handoffReview;

    const api = new StrategicIntelligenceApi([state]);

    const workflow = useHandoffReviewWorkflow(
      {
        projectId: scorecardId,
        scorecardId,
        actorUserId: 'bd-lead',
      },
      {
        api,
        now: () => new Date('2026-03-12T01:00:00.000Z'),
      }
    );

    const blocked = workflow.actions.markCompletion('Attempt closure');
    expect(blocked.completionGate.isComplete).toBe(false);

    const participant = blocked.review?.participants.find((item) => item.acknowledgedAt === null);
    expect(participant).toBeTruthy();
    const acknowledged = blocked.actions.acknowledgeParticipant(String(participant?.participantId));

    api.persistCommitmentUpdate(scorecardId, {
      ...state.commitmentRegister[0],
      commitmentId: 'commitment-open',
      fulfillmentStatus: 'fulfilled',
    });

    const completed = acknowledged.actions.markCompletion('Ready closure');
    expect(completed.completionGate.isComplete).toBe(true);
  });

  it('allows deterministic override factories for conflict/suggestion payloads', () => {
    const conflict = createMockIntelligenceConflict({
      conflictId: 'conflict-custom',
      resolutionStatus: 'resolved',
      resolutionNote: 'Custom resolution note.',
    });

    const entry = createMockStrategicIntelligenceEntry(
      {
        conflicts: [conflict],
      },
      {
        entryId: 'entry-custom',
        withSuggestion: true,
      }
    );

    expect(entry.conflicts[0]?.resolutionNote).toBe('Custom resolution note.');
    expect(entry.suggestedMatches.length).toBe(1);
  });
});
