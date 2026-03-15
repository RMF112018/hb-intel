import { computeRankingScore, rankItems } from '../normalization/rankItems.js';
import type { IRankingContext } from '../normalization/rankItems.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';

const baseCtx: IRankingContext = {
  nowIso: '2026-01-20T10:00:00.000Z',
  sourceWeights: new Map([
    ['bic-next-move', 1.0],
    ['workflow-handoff', 0.8],
    ['notification-intelligence', 0.5],
    ['module', 0.3],
  ]),
};

describe('computeRankingScore', () => {
  it('overdue items score higher than non-overdue', () => {
    const overdue = createMockMyWorkItem({
      isOverdue: true,
      dueDateIso: '2026-01-18T00:00:00.000Z',
    });
    const notOverdue = createMockMyWorkItem({
      isOverdue: false,
      dueDateIso: '2026-01-25T00:00:00.000Z',
    });

    expect(computeRankingScore(overdue, baseCtx)).toBeGreaterThan(computeRankingScore(notOverdue, baseCtx));
  });

  it('blocked BIC items get +400 boost', () => {
    const blocked = createMockMyWorkItem({
      isBlocked: true,
      sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
    });
    const notBlocked = createMockMyWorkItem({
      isBlocked: false,
      sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
    });

    expect(computeRankingScore(blocked, baseCtx)).toBeGreaterThan(computeRankingScore(notBlocked, baseCtx));
    expect(computeRankingScore(blocked, baseCtx) - computeRankingScore(notBlocked, baseCtx)).toBeGreaterThanOrEqual(400);
  });

  it('unacknowledged handoffs get +300', () => {
    const handoff = createMockMyWorkItem({
      class: 'inbound-handoff',
      isUnread: true,
    });
    const acknowledged = createMockMyWorkItem({
      class: 'inbound-handoff',
      isUnread: false,
    });

    expect(computeRankingScore(handoff, baseCtx)).toBeGreaterThan(computeRankingScore(acknowledged, baseCtx));
  });

  it('items with blocked dependencies score higher', () => {
    const withDep = createMockMyWorkItem({
      lifecycle: {
        previousStepLabel: null,
        currentStepLabel: null,
        nextStepLabel: null,
        blockedDependencyLabel: 'Awaiting approval',
        impactedRecordLabel: null,
      },
    });
    const noDep = createMockMyWorkItem({
      lifecycle: {
        previousStepLabel: null,
        currentStepLabel: null,
        nextStepLabel: null,
        blockedDependencyLabel: null,
        impactedRecordLabel: null,
      },
    });

    expect(computeRankingScore(withDep, baseCtx)).toBeGreaterThan(computeRankingScore(noDep, baseCtx));
  });

  it('offline capable items get a small boost', () => {
    const offline = createMockMyWorkItem({ offlineCapable: true });
    const online = createMockMyWorkItem({ offlineCapable: false });

    expect(computeRankingScore(offline, baseCtx)).toBeGreaterThan(computeRankingScore(online, baseCtx));
  });
});

describe('rankItems', () => {
  it('returns empty array for empty input', () => {
    expect(rankItems([], baseCtx)).toEqual([]);
  });

  it('sorts overdue before non-overdue', () => {
    const items = [
      createMockMyWorkItem({ workItemId: 'not-overdue', isOverdue: false, dueDateIso: '2026-02-01T00:00:00.000Z' }),
      createMockMyWorkItem({ workItemId: 'overdue', isOverdue: true, dueDateIso: '2026-01-18T00:00:00.000Z' }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked[0].workItemId).toBe('overdue');
  });

  it('produces deterministic order with 5-level tie-breaking', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-b',
        canonicalKey: 'b-key',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-15T10:00:00.000Z', updatedAtIso: '2026-01-15T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
      createMockMyWorkItem({
        workItemId: 'w-a',
        canonicalKey: 'a-key',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-15T10:00:00.000Z', updatedAtIso: '2026-01-15T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    // Same score → same overdue → same blocked → same source weight → same timestamp → lexical canonicalKey asc
    expect(ranked[0].workItemId).toBe('w-a');
    expect(ranked[1].workItemId).toBe('w-b');
  });

  it('blocked items rank before non-blocked at same score', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'not-blocked',
        isBlocked: false,
        isOverdue: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'blocked',
        isBlocked: true,
        isOverdue: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    // blocked gets +400 (BIC blocked boost doesn't apply since source is 'module')
    // but isBlocked tie-break should still push it first if scores are close
    expect(ranked[0].workItemId).toBe('blocked');
  });

  it('populates rankingReason with score and reasons', () => {
    const items = [
      createMockMyWorkItem({
        isOverdue: true,
        dueDateIso: '2026-01-18T00:00:00.000Z',
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked[0].rankingReason.score).toBeGreaterThan(0);
    expect(ranked[0].rankingReason.primaryReason).toBeTruthy();
    expect(Array.isArray(ranked[0].rankingReason.contributingReasons)).toBe(true);
  });

  it('ranks blocked BIC items with correct primaryReason', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'blocked-bic',
        isBlocked: true,
        isOverdue: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked[0].rankingReason.primaryReason).toBe('Blocked BIC item');
    expect(ranked[0].rankingReason.contributingReasons).toContain('Blocked BIC');
  });

  it('ranks unacknowledged pending-approval with correct reasons', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'unack',
        class: 'pending-approval',
        isUnread: true,
        isOverdue: false,
        isBlocked: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-19T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked[0].rankingReason.contributingReasons).toContain('Unacknowledged');
    expect(ranked[0].rankingReason.contributingReasons).toContain('Unread');
  });

  it('sorts both-overdue items by overdue severity in tie-break', () => {
    // Use same source weight/context so score difference comes only from overdue scaling
    // Both have same base factors to force tie-break path
    const items = [
      createMockMyWorkItem({
        workItemId: 'less-overdue',
        canonicalKey: 'a-key',
        isOverdue: true,
        dueDateIso: '2026-01-19T00:00:00.000Z',
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'more-overdue',
        canonicalKey: 'b-key',
        isOverdue: true,
        dueDateIso: '2026-01-15T00:00:00.000Z',
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked[0].workItemId).toBe('more-overdue');
  });

  it('uses tie-break when two overdue items have the same score', () => {
    // Create two items overdue by exact same amount — same score forces tie-break path
    const items = [
      createMockMyWorkItem({
        workItemId: 'overdue-b',
        canonicalKey: 'b-key',
        isOverdue: true,
        dueDateIso: '2026-01-18T00:00:00.000Z',
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-15T10:00:00.000Z', updatedAtIso: '2026-01-15T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
      createMockMyWorkItem({
        workItemId: 'overdue-a',
        canonicalKey: 'a-key',
        isOverdue: true,
        dueDateIso: '2026-01-18T00:00:00.000Z',
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-15T10:00:00.000Z', updatedAtIso: '2026-01-15T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    // Same overdue days, same blocked, same source weight, same timestamp → canonicalKey asc
    expect(ranked[0].workItemId).toBe('overdue-a');
    expect(ranked[1].workItemId).toBe('overdue-b');
  });

  it('unread fresh item scores higher than stale unread item', () => {
    const fresh = createMockMyWorkItem({
      workItemId: 'fresh-unread',
      isUnread: true,
      isOverdue: false,
      isBlocked: false,
      offlineCapable: false,
      sourceMeta: [{ source: 'module', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-19T10:00:00.000Z' }],
      context: { moduleKey: 'bic' },
      lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      timestamps: { createdAtIso: '2026-01-19T10:00:00.000Z', updatedAtIso: '2026-01-19T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
    });
    const stale = createMockMyWorkItem({
      workItemId: 'stale-unread',
      isUnread: true,
      isOverdue: false,
      isBlocked: false,
      offlineCapable: false,
      sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-05T10:00:00.000Z' }],
      context: { moduleKey: 'bic' },
      lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      timestamps: { createdAtIso: '2026-01-05T10:00:00.000Z', updatedAtIso: '2026-01-05T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
    });

    expect(computeRankingScore(fresh, baseCtx)).toBeGreaterThan(computeRankingScore(stale, baseCtx));
  });

  it('6-item deterministic ranking produces expected order', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'bare-minimum',
        canonicalKey: 'f-key',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        dueDateIso: null,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-6', sourceUpdatedAtIso: '2026-01-10T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'context-only',
        canonicalKey: 'e-key',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        dueDateIso: null,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-5', sourceUpdatedAtIso: '2026-01-10T10:00:00.000Z' }],
        context: { moduleKey: 'bic', projectId: 'proj-001' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'unread-handoff',
        canonicalKey: 'd-key',
        class: 'inbound-handoff',
        isOverdue: false,
        isBlocked: false,
        isUnread: true,
        offlineCapable: false,
        dueDateIso: null,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-4', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'blocked-bic',
        canonicalKey: 'c-key',
        isOverdue: false,
        isBlocked: true,
        isUnread: false,
        offlineCapable: false,
        dueDateIso: null,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-3', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'overdue-only',
        canonicalKey: 'b-key',
        isOverdue: true,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        dueDateIso: '2026-01-18T00:00:00.000Z',
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'overdue-blocked',
        canonicalKey: 'a-key',
        isOverdue: true,
        isBlocked: true,
        isUnread: false,
        offlineCapable: false,
        dueDateIso: '2026-01-18T00:00:00.000Z',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked.map((i) => i.workItemId)).toEqual([
      'overdue-blocked',
      'overdue-only',
      'unread-handoff',
      'blocked-bic',
      'context-only',
      'bare-minimum',
    ]);
  });

  it('identical primary scores fall through all 5 tie-break levels', () => {
    // Two items with forced equal everything except canonicalKey
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-z',
        canonicalKey: 'z-key',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        dueDateIso: null,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-15T10:00:00.000Z', updatedAtIso: '2026-01-15T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
      createMockMyWorkItem({
        workItemId: 'w-a',
        canonicalKey: 'a-key',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        dueDateIso: null,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-15T10:00:00.000Z', updatedAtIso: '2026-01-15T10:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    // Same score, same overdue, same blocked, same source weight, same timestamp → lexical canonicalKey asc
    expect(ranked[0].workItemId).toBe('w-a');
    expect(ranked[1].workItemId).toBe('w-z');
  });

  it('sorts by freshest updatedAtIso in tie-break', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'older',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-10T00:00:00.000Z', updatedAtIso: '2026-01-10T00:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
      createMockMyWorkItem({
        workItemId: 'newer',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
        timestamps: { createdAtIso: '2026-01-15T00:00:00.000Z', updatedAtIso: '2026-01-15T00:00:00.000Z', markedReadAtIso: null, markedDeferredAtIso: null, deferredUntilIso: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked[0].workItemId).toBe('newer');
  });

  it('items with due date but not overdue get due date score', () => {
    const withDue = createMockMyWorkItem({
      isOverdue: false,
      dueDateIso: '2026-01-22T00:00:00.000Z',
      isUnread: false,
      isBlocked: false,
      offlineCapable: false,
      context: { moduleKey: 'bic' },
      lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
    });
    const withoutDue = createMockMyWorkItem({
      isOverdue: false,
      dueDateIso: null,
      isUnread: false,
      isBlocked: false,
      offlineCapable: false,
      context: { moduleKey: 'bic' },
      lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
    });

    expect(computeRankingScore(withDue, baseCtx)).toBeGreaterThan(computeRankingScore(withoutDue, baseCtx));
  });

  it('due date far in the future gets zero dueScore', () => {
    const farDue = createMockMyWorkItem({
      isOverdue: false,
      dueDateIso: '2026-06-01T00:00:00.000Z',
      isUnread: false,
      isBlocked: false,
      offlineCapable: false,
      context: { moduleKey: 'bic' },
      lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
    });
    const noDue = createMockMyWorkItem({
      isOverdue: false,
      dueDateIso: null,
      isUnread: false,
      isBlocked: false,
      offlineCapable: false,
      context: { moduleKey: 'bic' },
      lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
    });

    // Far future due date shouldn't add dueScore, so scores should be equal
    expect(computeRankingScore(farDue, baseCtx)).toBe(computeRankingScore(noDue, baseCtx));
  });

  it('higher source weight items rank before lower', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'low-weight',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'module', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
      createMockMyWorkItem({
        workItemId: 'high-weight',
        isOverdue: false,
        isBlocked: false,
        isUnread: false,
        offlineCapable: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        context: { moduleKey: 'bic' },
        lifecycle: { previousStepLabel: null, currentStepLabel: null, nextStepLabel: null, blockedDependencyLabel: null, impactedRecordLabel: null },
      }),
    ];

    const ranked = rankItems(items, baseCtx);
    expect(ranked[0].workItemId).toBe('high-weight');
  });
});
