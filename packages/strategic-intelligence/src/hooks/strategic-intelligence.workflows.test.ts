import { describe, expect, it } from 'vitest';
import {
  createStrategicIntelligenceState,
  StrategicIntelligenceApi,
  StrategicIntelligenceLifecycleApi,
} from '../index.js';
import { useHandoffReviewWorkflow } from './useHandoffReviewWorkflow.js';
import { useStrategicIntelligenceApprovalQueue } from './useStrategicIntelligenceApprovalQueue.js';

describe('strategic intelligence workflow hooks', () => {
  it('acknowledges participants and honors completion gate semantics', () => {
    const scorecardId = 'workflow-test';
    const state = createStrategicIntelligenceState({ scorecardId });
    state.commitmentRegister = [
      {
        ...state.commitmentRegister[0],
        commitmentId: 'commitment-open',
        fulfillmentStatus: 'open',
      },
    ];

    const api = new StrategicIntelligenceApi([state]);

    const workflow = useHandoffReviewWorkflow(
      {
        projectId: scorecardId,
        actorUserId: 'actor-1',
      },
      {
        api,
        now: () => new Date('2026-03-12T00:00:00.000Z'),
      }
    );

    const participantId = workflow.review?.participants[0]?.participantId;
    expect(participantId).toBeTruthy();

    const acknowledged = workflow.actions.acknowledgeParticipant(String(participantId));
    expect(acknowledged.review?.participants[0]?.acknowledgedAt).toBe('2026-03-12T00:00:00.000Z');

    const blocked = acknowledged.actions.markCompletion('Attempt closure');
    expect(blocked.review?.completionStatus).toBe('in-progress');

    api.persistCommitmentUpdate(scorecardId, {
      ...state.commitmentRegister[0],
      commitmentId: 'commitment-open',
      fulfillmentStatus: 'fulfilled',
    });

    const complete = blocked.actions.markCompletion('Ready closure');
    expect(complete.review?.completionStatus).toBe('completed');
  });

  it('renews stale review and resolves conflicts via approval workflow actions', () => {
    const scorecardId = 'workflow-approval-test';
    const state = createStrategicIntelligenceState({ scorecardId });
    state.livingEntries = [
      {
        ...state.livingEntries[0],
        entryId: 'entry-workflow',
        trust: {
          ...state.livingEntries[0].trust,
          isStale: true,
        },
        conflicts: [
          {
            conflictId: 'conflict-workflow-1',
            type: 'contradiction',
            relatedEntryIds: ['entry-workflow'],
            resolutionStatus: 'open',
          },
        ],
      },
    ];

    const api = new StrategicIntelligenceApi([state]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

    const queue = useStrategicIntelligenceApprovalQueue(
      {
        projectId: scorecardId,
        actorUserId: 'approver-2',
      },
      {
        api,
        lifecycleApi,
        now: () => new Date('2026-03-12T00:00:00.000Z'),
      }
    );

    const renewed = queue.actions.renewStaleReview('entry-workflow', '2026-04-01T00:00:00.000Z');
    expect(renewed.queue).toBeDefined();

    const entryAfterRenew = api.getLivingEntries(scorecardId).filter((entry) => entry.entryId === 'entry-workflow').at(-1);
    expect(entryAfterRenew?.trust.isStale).toBe(false);

    queue.actions.resolveConflict('conflict-workflow-1', 'Conflict resolved from workflow test');
    const entryAfterResolve = api.getLivingEntries(scorecardId).filter((entry) => entry.entryId === 'entry-workflow').at(-1);
    expect(
      entryAfterResolve?.conflicts.find((item) => item.conflictId === 'conflict-workflow-1')?.resolutionStatus
    ).toBe('resolved');
  });
});
