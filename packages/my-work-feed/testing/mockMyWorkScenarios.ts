import type { IMyWorkItem, IMyWorkFeedResult } from '../src/types/index.js';
import { createMockMyWorkItem } from './createMockMyWorkItem.js';
import { createMockMyWorkFeedResult } from './createMockMyWorkFeedResult.js';

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

/**
 * Canonical scenario fixtures for testing and Storybook.
 * Each entry represents a distinct edge-case or archetype.
 */
export const mockMyWorkScenarios = {
  overdueOwnedAction: createMockMyWorkItem({
    workItemId: 'scenario-overdue-owned',
    class: 'owned-action',
    isOverdue: true,
    priority: 'now',
    dueDateIso: '2026-01-10T00:00:00.000Z',
    title: 'Overdue owned action',
  }),

  blockedWithDependency: createMockMyWorkItem({
    workItemId: 'scenario-blocked-dep',
    isBlocked: true,
    blockedReason: 'Waiting on appraisal',
    lifecycle: {
      previousStepLabel: null,
      currentStepLabel: 'Blocked',
      nextStepLabel: null,
      blockedDependencyLabel: 'Pending appraisal',
      impactedRecordLabel: 'TR-001',
    },
    title: 'Blocked with dependency',
  }),

  unacknowledgedHandoff: createMockMyWorkItem({
    workItemId: 'scenario-unack-handoff',
    class: 'inbound-handoff',
    isUnread: true,
    state: 'new',
    title: 'Unacknowledged handoff',
  }),

  dedupedBicNotification: createMockMyWorkItem({
    workItemId: 'scenario-deduped-bic',
    title: 'Deduped BIC + notification',
    sourceMeta: [
      {
        source: 'bic-next-move',
        sourceItemId: 'src-bic-001',
        sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z',
        explanation: 'From BIC engine',
      },
      {
        source: 'notification-intelligence',
        sourceItemId: 'src-notif-001',
        sourceUpdatedAtIso: '2026-01-15T09:00:00.000Z',
        explanation: 'From notification system',
      },
    ],
    dedupe: {
      dedupeKey: 'bic-next-move::rec-001::v1',
      mergedSourceMeta: [
        {
          source: 'notification-intelligence',
          sourceItemId: 'src-notif-001',
          sourceUpdatedAtIso: '2026-01-15T09:00:00.000Z',
          explanation: 'From notification system',
        },
      ],
      mergeReason: 'Same record from multiple sources',
    },
  }),

  supersededWatchItem: createMockMyWorkItem({
    workItemId: 'scenario-superseded',
    state: 'superseded',
    title: 'Superseded watch item',
    supersession: {
      supersededByWorkItemId: 'scenario-overdue-owned',
      supersessionReason: 'Higher-truth source available',
      originalRankingReason: {
        primaryReason: 'Module-sourced item',
        contributingReasons: ['Low priority'],
        score: 0.3,
      },
    },
  }),

  cachedFeedWithSync: createMockMyWorkFeedResult({
    isStale: true,
    healthState: {
      freshness: 'cached',
    },
  }) as IMyWorkFeedResult,

  replayQueuedAction: createMockMyWorkItem({
    workItemId: 'scenario-replay-queued',
    offlineCapable: true,
    class: 'queued-follow-up',
    state: 'waiting',
    title: 'Replay queued action',
  }),

  delegatedByMeAging: createMockMyWorkItem({
    workItemId: 'scenario-delegated-aging',
    delegatedTo: { type: 'user', id: 'user-002', label: 'Bob' },
    isOverdue: true,
    title: 'Delegated-by-me aging item',
    timestamps: {
      createdAtIso: thirtyDaysAgo,
      updatedAtIso: thirtyDaysAgo,
      markedReadAtIso: null,
      markedDeferredAtIso: null,
      deferredUntilIso: null,
    },
  }),

  teamEscalationCandidate: createMockMyWorkItem({
    workItemId: 'scenario-team-escalation',
    isBlocked: true,
    isOverdue: true,
    delegatedBy: { type: 'user', id: 'user-003', label: 'Carol' },
    title: 'Team escalation candidate',
  }),

  /** Push-to-Project-Team item with executive review provenance (Phase 3 P3-D3 §13) */
  pushToTeam: createMockMyWorkItem({
    workItemId: 'scenario-push-to-team',
    class: 'queued-follow-up',
    priority: 'soon',
    state: 'new',
    isUnread: true,
    title: 'Executive Review: Financial forecast variance requires explanation',
    summary: 'Portfolio Executive Reviewer flagged a $600K variance in Q3 cash-flow forecast for Harbor View Medical Center.',
    expectedAction: 'Review and address the flagged variance, then mark as resolved.',
    context: {
      moduleKey: 'executive-review',
      projectId: 'proj-001',
      projectCode: 'HVMC',
      projectName: 'Harbor View Medical Center',
      recordId: 'review-artifact-001',
      recordType: 'review-push',
    },
    sourceMeta: [
      {
        source: 'module',
        sourceEventType: 'push-to-project-team',
        sourceItemId: 'review-artifact-001',
        sourceUpdatedAtIso: '2026-03-22T14:30:00.000Z',
        explanation: 'Pushed to project team by Portfolio Executive Reviewer.',
        originRole: 'portfolio-executive-reviewer',
        originAnnotationId: 'annotation-456',
        originReviewRunId: 'run-789',
        pushTimestamp: '2026-03-22T14:30:00.000Z',
      },
    ],
  }),

  partialSourceWithDiagnostics: createMockMyWorkFeedResult({
    healthState: {
      freshness: 'partial',
      degradedSourceCount: 1,
      warningMessage: 'BIC source returned partial data',
    },
  }) as IMyWorkFeedResult,
} as const;
