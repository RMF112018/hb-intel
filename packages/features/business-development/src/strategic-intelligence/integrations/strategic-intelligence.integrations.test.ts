import { describe, expect, it } from 'vitest';
import {
  createLivingStrategicIntelligenceEntry,
  createStrategicIntelligenceState,
  StrategicIntelligenceApi,
  StrategicIntelligenceLifecycleApi,
  useStrategicIntelligenceState,
  type IStrategicIntelligenceState,
} from '@hbc/strategic-intelligence';
import { createStrategicIntelligenceReferenceIntegrations } from './index.js';

const createState = (scorecardId: string): IStrategicIntelligenceState => {
  const state = createStrategicIntelligenceState({ scorecardId });

  const approvedPublic = createLivingStrategicIntelligenceEntry({
    entryId: `${scorecardId}-approved-public`,
    lifecycleState: 'approved',
    title: 'Approved public entry',
    commitmentIds: ['commitment-1'],
    metadata: {
      client: 'Metro Transit',
      projectType: 'design-build',
      sector: 'transportation',
      geography: 'west',
      deliveryMethod: 'cm-gc',
    },
    trust: {
      ...state.livingEntries[0].trust,
      reliabilityTier: 'high',
      isStale: false,
      aiTrustDowngraded: false,
      reviewBy: '2026-03-30T00:00:00.000Z',
    },
    conflicts: [],
  });

  const pendingConflicted = createLivingStrategicIntelligenceEntry({
    entryId: `${scorecardId}-pending-conflicted`,
    lifecycleState: 'pending-approval',
    title: 'Pending conflicted entry',
    trust: {
      ...state.livingEntries[0].trust,
      reliabilityTier: 'review-required',
      isStale: true,
      aiTrustDowngraded: true,
    },
    conflicts: [
      {
        conflictId: 'conflict-1',
        type: 'contradiction',
        relatedEntryIds: [`${scorecardId}-pending-conflicted`],
        resolutionStatus: 'open',
      },
    ],
  });

  const approvedRestricted = createLivingStrategicIntelligenceEntry({
    entryId: `${scorecardId}-approved-restricted`,
    lifecycleState: 'approved',
    title: 'Approved restricted entry',
    sensitivity: 'restricted-project',
    trust: {
      ...state.livingEntries[0].trust,
      reliabilityTier: 'moderate',
      isStale: false,
    },
  });

  state.livingEntries = [approvedPublic, pendingConflicted, approvedRestricted];
  state.commitmentRegister = [
    {
      ...state.commitmentRegister[0],
      commitmentId: 'commitment-1',
      description: 'Confirm pursuit strategy assumptions',
      fulfillmentStatus: 'open',
      responsibleRole: 'BD Lead',
      bicRecordId: 'bic-11',
    },
  ];
  state.approvalQueue = [
    {
      queueItemId: 'queue-1',
      entryId: pendingConflicted.entryId,
      submittedBy: 'author-1',
      submittedAt: '2026-03-12T00:00:00.000Z',
      approvalStatus: 'pending',
    },
  ];

  if (state.handoffReview) {
    state.handoffReview.participants = [
      {
        participantId: 'pm-1',
        displayName: 'Pat PM',
        role: 'PM',
        acknowledgedAt: '2026-03-12T01:00:00.000Z',
      },
      {
        participantId: 'px-1',
        displayName: 'Alex PX',
        role: 'PX',
        acknowledgedAt: null,
      },
    ];
  }

  return state;
};

describe('strategic intelligence T07 integrations', () => {
  it('projects public-contract integrations with governed index exclusions', () => {
    const scorecardId = 'si-integrations-1';
    const state = createState(scorecardId);
    const api = new StrategicIntelligenceApi([state]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);
    const integrations = createStrategicIntelligenceReferenceIntegrations();

    const hookState = useStrategicIntelligenceState(
      {
        projectId: scorecardId,
        scorecardId,
        visibilityContext: 'bd-panel',
      },
      { api, lifecycleApi }
    );

    if (!hookState.state) {
      throw new Error('Expected seeded strategic intelligence state.');
    }

    const bic = integrations.projectToBicActions(hookState.state.livingEntries, [
      {
        commitmentId: 'commitment-1',
        owner: {
          userId: 'owner-1',
          displayName: 'Dana Owner',
          role: 'BD Lead',
        },
      },
    ]);
    const complexity = integrations.applyComplexityGating('expert');
    const versioned = integrations.createVersionedProjection(hookState.state);
    const related = integrations.projectRelatedItems(
      hookState.state.livingEntries,
      hookState.policy.redactedProjections,
      '/bd/strategic-intelligence'
    );
    const canvas = integrations.projectCanvasPlacement(
      scorecardId,
      '/bd/strategic-intelligence',
      hookState.state.livingEntries,
      hookState.state.commitmentRegister
    );
    const notifications = integrations.resolveNotifications(
      hookState.state.livingEntries,
      hookState.state.approvalQueue
    );
    const acknowledgment = integrations.projectAcknowledgment(hookState.state.handoffReview);
    const health = integrations.mapToHealthIndicator(hookState.state);
    const benchmark = integrations.projectScoreBenchmarkInterop(hookState.state);
    const learning = integrations.consumeLearningSignals(hookState.state);

    expect(hookState.policy.indexableEntryIds).toEqual([
      `${scorecardId}-approved-public`,
      `${scorecardId}-approved-restricted`,
    ]);
    expect(hookState.policy.excludedEntryIds).toContain(`${scorecardId}-pending-conflicted`);

    expect(bic.some((item) => item.actionLabel.includes('Coordinate next move'))).toBe(true);
    expect(complexity.mode).toBe('Expert');
    expect(versioned.replaySafe).toBe(true);
    expect(related.entryLinks.some((item) => item.label.includes('(Redacted)'))).toBe(true);
    expect(canvas.tasks.some((item) => item.taskType === 'unresolved-commitment')).toBe(true);
    expect(canvas.tasks.some((item) => item.taskType === 'stale-review')).toBe(true);
    expect(canvas.tasks.some((item) => item.taskType === 'conflict')).toBe(true);
    expect(notifications.map((item) => item.eventType)).toEqual(
      expect.arrayContaining([
        'strategic-intelligence.pending-approval',
        'strategic-intelligence.review-due',
        'strategic-intelligence.conflict-escalation',
      ])
    );
    expect(acknowledgment?.auditTrail.length).toBe(2);
    expect(['ready', 'nearly-ready', 'attention-needed', 'not-ready']).toContain(health.status);
    expect(benchmark.approvedEntryCount).toBe(2);
    expect(learning.consumedCount).toBe(2);
  });
});
