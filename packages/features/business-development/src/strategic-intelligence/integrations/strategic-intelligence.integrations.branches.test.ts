import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  gateStrategicIntelligenceByComplexity,
  mapStrategicIntelligenceToHealthIndicator,
  projectStrategicIntelligenceToCanvasPlacement,
  projectStrategicIntelligenceAcknowledgment,
  resolveStrategicIntelligenceNotifications,
} from './index.js';
import {
  createLivingStrategicIntelligenceEntry,
  createStrategicIntelligenceState,
} from '@hbc/strategic-intelligence';

describe('strategic intelligence integration branch coverage', () => {
  it('keeps strategic-intelligence integration runtime free of app-route imports', () => {
    const directory = dirname(fileURLToPath(import.meta.url));
    const appImportSingleQuote = "from '" + 'apps/';
    const appImportDoubleQuote = 'from "' + 'apps/';
    const files = [
      'bicNextMoveAdapter.ts',
      'complexityAdapter.ts',
      'versionedRecordAdapter.ts',
      'relatedItemsAdapter.ts',
      'projectCanvasAdapter.ts',
      'notificationAdapter.ts',
      'acknowledgmentAdapter.ts',
      'healthIndicatorAdapter.ts',
      'scoreBenchmarkAdapter.ts',
      'postBidLearningAdapter.ts',
      'index.ts',
    ];

    for (const file of files) {
      const source = readFileSync(join(directory, file), 'utf8');
      expect(source.includes(appImportSingleQuote)).toBe(false);
      expect(source.includes(appImportDoubleQuote)).toBe(false);
    }
  });

  it('maps complexity tiers to deterministic projection gates', () => {
    expect(gateStrategicIntelligenceByComplexity('essential')).toMatchObject({
      mode: 'Essential',
      showEntryForm: false,
      showApprovalQueue: false,
    });

    expect(gateStrategicIntelligenceByComplexity('standard')).toMatchObject({
      mode: 'Standard',
      showEntryForm: true,
      showApprovalQueue: false,
    });

    expect(gateStrategicIntelligenceByComplexity('expert')).toMatchObject({
      mode: 'Expert',
      showEntryForm: true,
      showApprovalQueue: true,
    });
  });

  it('projects notifications and health statuses across stale/conflict/no-entry branches', () => {
    const noEntriesState = createStrategicIntelligenceState({ scorecardId: 'si-branch-0' });
    noEntriesState.livingEntries = [];
    expect(mapStrategicIntelligenceToHealthIndicator(noEntriesState)).toEqual({
      status: 'not-ready',
      score: 0,
    });

    const staleState = createStrategicIntelligenceState({ scorecardId: 'si-branch-1' });
    staleState.livingEntries = [
      createLivingStrategicIntelligenceEntry({
        entryId: 'stale-entry',
        lifecycleState: 'approved',
        trust: {
          ...staleState.livingEntries[0].trust,
          isStale: true,
        },
      }),
    ];

    const staleNotifications = resolveStrategicIntelligenceNotifications(staleState.livingEntries, []);
    expect(staleNotifications.map((item) => item.eventType)).toContain('strategic-intelligence.review-due');
    expect(mapStrategicIntelligenceToHealthIndicator(staleState).status).toBe('nearly-ready');

    const conflictState = createStrategicIntelligenceState({ scorecardId: 'si-branch-2' });
    conflictState.livingEntries = [
      createLivingStrategicIntelligenceEntry({
        entryId: 'conflict-entry',
        lifecycleState: 'approved',
        conflicts: [
          {
            conflictId: 'conflict-2',
            type: 'supersession',
            relatedEntryIds: ['conflict-entry'],
            resolutionStatus: 'open',
          },
        ],
      }),
    ];

    const conflictNotifications = resolveStrategicIntelligenceNotifications(conflictState.livingEntries, []);
    expect(conflictNotifications.map((item) => item.eventType)).toContain(
      'strategic-intelligence.conflict-escalation'
    );
    expect(mapStrategicIntelligenceToHealthIndicator(conflictState).status).toBe('attention-needed');
  });

  it('maps acknowledgment audit state from handoff participants', () => {
    const state = createStrategicIntelligenceState({ scorecardId: 'si-branch-3' });
    if (!state.handoffReview) {
      throw new Error('Expected default handoff review');
    }

    state.handoffReview.participants = [
      {
        participantId: 'p-1',
        displayName: 'Participant 1',
        role: 'PM',
        acknowledgedAt: null,
      },
      {
        participantId: 'p-2',
        displayName: 'Participant 2',
        role: 'PX',
        acknowledgedAt: '2026-03-12T00:00:00.000Z',
      },
    ];

    const projected = projectStrategicIntelligenceAcknowledgment(state.handoffReview);
    expect(projected?.overallStatus).toBe('partial');
    expect(projected?.isComplete).toBe(false);

    const completeProjected = projectStrategicIntelligenceAcknowledgment({
      ...state.handoffReview,
      participants: state.handoffReview.participants.map((item) => ({
        ...item,
        acknowledgedAt: '2026-03-12T00:00:00.000Z',
      })),
    });

    expect(completeProjected?.overallStatus).toBe('acknowledged');
    expect(completeProjected?.isComplete).toBe(true);
  });

  it('covers non-pending notifications, null acknowledgment, and canvas continuation branches', () => {
    const entry = createLivingStrategicIntelligenceEntry({
      entryId: 'entry-branch-4',
      lifecycleState: 'approved',
      trust: {
        ...createLivingStrategicIntelligenceEntry({ entryId: 'seed' }).trust,
        isStale: false,
      },
      conflicts: [
        {
          conflictId: 'closed-conflict',
          type: 'supersession',
          relatedEntryIds: ['entry-branch-4'],
          resolutionStatus: 'resolved',
        },
      ],
    });

    const notifications = resolveStrategicIntelligenceNotifications(
      [entry],
      [
        {
          queueItemId: 'queue-reviewed',
          entryId: entry.entryId,
          submittedBy: 'author-1',
          submittedAt: '2026-03-01T00:00:00.000Z',
          approvalStatus: 'approved',
        },
      ]
    );

    expect(notifications).toEqual([]);
    expect(projectStrategicIntelligenceAcknowledgment(null)).toBeNull();

    const canvas = projectStrategicIntelligenceToCanvasPlacement(
      'project-4',
      '/strategic-intelligence',
      [entry],
      [
        {
          commitmentId: 'commitment-closed',
          description: 'Closed commitment',
          source: 'handoff',
          responsibleRole: 'BD Lead',
          fulfillmentStatus: 'fulfilled',
        },
      ]
    );

    expect(canvas.tasks.some((task) => task.taskType === 'conflict')).toBe(false);
    expect(canvas.tasks.some((task) => task.taskType === 'unresolved-commitment')).toBe(false);
  });
});
