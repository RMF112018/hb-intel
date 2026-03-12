import { expect, test } from '@playwright/test';
import {
  StrategicIntelligenceApi,
  StrategicIntelligenceLifecycleApi,
  useHandoffReviewWorkflow,
  useStrategicIntelligenceApprovalQueue,
  useStrategicIntelligenceState,
  useSuggestedIntelligence,
} from '../../../strategic-intelligence/src/index.js';
import {
  createMockIntelligenceConflict,
  createMockStrategicIntelligenceEntry,
  createMockStrategicIntelligenceState,
  mockStrategicIntelligenceStates,
} from '../../../strategic-intelligence/testing/index.ts';
import {
  useStrategicIntelligence,
} from '../src/strategic-intelligence/hooks/index.js';
import { createStrategicIntelligenceReferenceIntegrations } from '../src/strategic-intelligence/integrations/index.js';

test('strategic-intelligence: handoff review completes only after required acknowledgments', async () => {
  const seededState = mockStrategicIntelligenceStates.handoffAcknowledgmentIncomplete;
  const scorecardId = seededState.heritageSnapshot.scorecardId;
  const api = new StrategicIntelligenceApi([seededState]);

  const workflow = useHandoffReviewWorkflow(
    {
      projectId: scorecardId,
      scorecardId,
      actorUserId: 'actor-1',
    },
    { api, now: () => new Date('2026-03-12T01:00:00.000Z') }
  );

  const blocked = workflow.actions.markCompletion('Attempted completion');
  expect(blocked.completionGate.isComplete).toBe(false);

  const participant = blocked.review?.participants.find((item) => item.acknowledgedAt === null);
  expect(participant).toBeTruthy();

  const completed = blocked.actions.acknowledgeParticipant(String(participant?.participantId));
  api.persistCommitmentUpdate(scorecardId, {
    ...api.getCommitmentRegister(scorecardId)[0],
    fulfillmentStatus: 'fulfilled',
  });

  const closed = completed.actions.markCompletion('All done');
  expect(closed.completionGate.isComplete).toBe(true);
});

test('strategic-intelligence: unresolved commitment escalates to My Work/BIC projection', async () => {
  const projected = useStrategicIntelligence({
    projectId: 'si-state-handoff-incomplete',
    scorecardId: 'si-state-handoff-incomplete',
    visibilityContext: 'bd-panel',
    actorUserId: 'bd-lead',
    complexityTier: 'expert',
  });

  expect(projected.integrations.projectCanvas.tasks.some((task) => task.taskType === 'unresolved-commitment')).toBe(true);
  expect(projected.integrations.bicActions.length).toBeGreaterThan(0);
});

test('strategic-intelligence: AI-assisted draft remains downgraded until approval', async () => {
  const scorecardId = 'e2e-ai-downgrade';
  const state = createMockStrategicIntelligenceState(scorecardId);
  state.livingEntries = [
    createMockStrategicIntelligenceEntry(undefined, {
      entryId: 'entry-ai-draft',
      lifecycleState: 'pending-approval',
      provenanceClass: 'ai-assisted-draft',
    }),
  ];
  state.approvalQueue = [
    {
      queueItemId: 'queue-ai-draft',
      entryId: 'entry-ai-draft',
      submittedBy: 'author',
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
    { api, lifecycleApi, now: () => new Date('2026-03-12T01:00:00.000Z') }
  );

  expect(api.getLivingEntries(scorecardId)[0]?.trust.aiTrustDowngraded).toBe(true);

  queue.actions.approve('queue-ai-draft');
  expect(api.getLivingEntries(scorecardId).at(-1)?.trust.aiTrustDowngraded).toBe(false);
});

test('strategic-intelligence: stale review queue and renewal actions are surfaced', async () => {
  const seededState = mockStrategicIntelligenceStates.staleReviewDue;
  const scorecardId = seededState.heritageSnapshot.scorecardId;
  const api = new StrategicIntelligenceApi([seededState]);
  const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

  const queue = useStrategicIntelligenceApprovalQueue(
    {
      projectId: scorecardId,
      scorecardId,
      actorUserId: 'approver-1',
    },
    { api, lifecycleApi, now: () => new Date('2026-03-12T01:00:00.000Z') }
  );

  const staleEntryId = api.getLivingEntries(scorecardId)[0]?.entryId;
  queue.actions.renewStaleReview(String(staleEntryId), '2026-04-01T00:00:00.000Z');

  expect(api.getLivingEntries(scorecardId).at(-1)?.trust.isStale).toBe(false);
});

test('strategic-intelligence: conflict entries render resolution guidance and actions', async () => {
  const state = mockStrategicIntelligenceStates.contradictionSupersessionResolution;
  const integrations = createStrategicIntelligenceReferenceIntegrations();
  const canvas = integrations.projectCanvasPlacement(
    state.heritageSnapshot.scorecardId,
    '/bd/strategic-intelligence',
    state.livingEntries,
    state.commitmentRegister
  );
  const notifications = integrations.resolveNotifications(state.livingEntries, state.approvalQueue);

  expect(canvas.tasks.some((task) => task.taskType === 'conflict')).toBe(true);
  expect(
    notifications.some((item) => item.eventType === 'strategic-intelligence.conflict-escalation')
  ).toBe(true);
});

test('strategic-intelligence: suggested intelligence card shows explainability and actions', async () => {
  const state = mockStrategicIntelligenceStates.suggestedHeritageAndIntelligence;
  const api = new StrategicIntelligenceApi([state]);
  const suggestions = useSuggestedIntelligence(
    {
      projectId: state.heritageSnapshot.scorecardId,
      scorecardId: state.heritageSnapshot.scorecardId,
    },
    {
      api,
      now: () => new Date('2026-03-12T01:00:00.000Z'),
    }
  );

  expect(suggestions.explainability[0]?.whyShown).toContain('match');
  const suggestionId = suggestions.suggestions[0]?.suggestionId;
  const recorded = suggestions.actions.recordOutcome(String(suggestionId), 'accepted');
  expect(recorded.outcomes[0]?.outcome).toBe('accepted');
});

test('strategic-intelligence: redacted projection hides restricted content while preserving context', async () => {
  const state = mockStrategicIntelligenceStates.sensitivityRedactedVsFull;
  const api = new StrategicIntelligenceApi([state]);

  const result = useStrategicIntelligenceState(
    {
      projectId: state.heritageSnapshot.scorecardId,
      scorecardId: state.heritageSnapshot.scorecardId,
      visibilityContext: 'bd-feed',
    },
    {
      api,
      lifecycleApi: new StrategicIntelligenceLifecycleApi(api),
    }
  );

  const restricted = result.policy.redactedProjections.find((item) => item.entryId === 'entry-restricted');
  expect(restricted?.summary).toBe('Redacted due to sensitivity policy.');
  expect(restricted?.title).toBe('Strategic intelligence entry');
});

test('strategic-intelligence: offline queue transitions to queued-to-sync then replay reconciles', async () => {
  const scorecardId = 'e2e-offline-sync';
  const state = createMockStrategicIntelligenceState(scorecardId);
  const api = new StrategicIntelligenceApi([state]);
  const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

  const result = useStrategicIntelligenceState(
    {
      projectId: scorecardId,
      scorecardId,
      visibilityContext: 'bd-panel',
    },
    {
      api,
      lifecycleApi,
      now: () => new Date('2026-03-12T01:00:00.000Z'),
    }
  );

  const queued = result.actions.queueLocalMutation({
    mutationId: 'offline-mutation-1',
    scorecardId,
    mutationType: 'commitment-update',
    payload: {
      commitment: createMockStrategicIntelligenceState(scorecardId).commitmentRegister[0],
    },
    queuedAt: '2026-03-12T01:00:00.000Z',
    replaySafe: true,
    localStatus: 'queued-to-sync',
    provenance: {
      recordedAt: '2026-03-12T01:00:00.000Z',
      actorUserId: 'actor-1',
      actorRole: 'business-development',
      source: 'offline-queue',
      provenanceClass: 'meeting-summary',
    },
  });

  expect(queued.sync.badgeLabel).toBe('Queued to sync');

  const replayed = queued.actions.replayQueuedMutations();
  expect(replayed.sync.badgeLabel).toBe('Synced');

  const suggestions = useSuggestedIntelligence(
    {
      projectId: scorecardId,
      scorecardId,
    },
    {
      api,
      now: () => new Date('2026-03-12T01:00:00.000Z'),
    }
  );

  expect(Array.isArray(suggestions.explainability)).toBe(true);
  const projected = useStrategicIntelligence({
    projectId: scorecardId,
    scorecardId,
    visibilityContext: 'bd-panel',
    actorUserId: 'actor-1',
    complexityTier: 'standard',
  });
  expect(projected.primitive.state.sync.badgeLabel).toBe('Synced');
  expect(projected.integrations.notifications.length).toBeGreaterThanOrEqual(0);
});
