import { applySupersession } from '../normalization/supersession.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';

describe('applySupersession', () => {
  it('higher-truth source supersedes lower-truth for same record', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-bic',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-notif',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'notification-intelligence', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.active).toHaveLength(1);
    expect(result.active[0].workItemId).toBe('w-bic');
    expect(result.superseded).toHaveLength(1);
    expect(result.superseded[0].workItemId).toBe('w-notif');
  });

  it('sets superseded item state to superseded', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-bic',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-module',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.superseded[0].state).toBe('superseded');
  });

  it('populates supersession metadata with correct linkage', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-winner',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-loser',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'session-state', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        rankingReason: { primaryReason: 'Original reason', contributingReasons: ['A'], score: 50 },
      }),
    ];

    const result = applySupersession(items);
    const superseded = result.superseded[0];
    expect(superseded.supersession?.supersededByWorkItemId).toBe('w-winner');
    expect(superseded.supersession?.originalRankingReason.primaryReason).toBe('Original reason');
    expect(superseded.supersession?.originalRankingReason.score).toBe(50);
  });

  it('produces supersession events', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.supersessionEvents).toHaveLength(1);
    expect(result.supersessionEvents[0].supersededWorkItemId).toBe('w-2');
    expect(result.supersessionEvents[0].supersededByWorkItemId).toBe('w-1');
  });

  it('does not affect items with different records', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-002' },
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.active).toHaveLength(2);
    expect(result.superseded).toHaveLength(0);
  });

  it('items without recordId pass through ungrouped', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        context: { moduleKey: 'bic' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        context: { moduleKey: 'bic' },
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.active).toHaveLength(2);
    expect(result.superseded).toHaveLength(0);
  });

  it('same source does not self-supersede', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.active).toHaveLength(2);
    expect(result.superseded).toHaveLength(0);
  });

  it('handles items with empty sourceMeta', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [],
      }),
    ];

    const result = applySupersession(items);
    // Same "source" (undefined), so they should not self-supersede
    expect(result.active).toHaveLength(2);
    expect(result.superseded).toHaveLength(0);
  });

  it('items without recordType pass through ungrouped', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        context: { moduleKey: 'bic', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.active).toHaveLength(1);
  });

  it('transitive supersession: 3 sources, lowest 2 superseded', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-bic',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-notif',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'notification-intelligence', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-module',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'module', sourceItemId: 'src-3', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = applySupersession(items);
    expect(result.active).toHaveLength(1);
    expect(result.active[0].workItemId).toBe('w-bic');
    expect(result.superseded).toHaveLength(2);
    expect(result.supersessionEvents).toHaveLength(2);
  });

  it('superseded item preserves original ranking reason in metadata', () => {
    const originalReason = {
      primaryReason: 'Module-sourced item',
      contributingReasons: ['Low priority', 'Stale data'],
      score: 0.35,
    };
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-winner',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-loser',
        context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
        sourceMeta: [{ source: 'module', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        rankingReason: originalReason,
      }),
    ];

    const result = applySupersession(items);
    expect(result.superseded[0].supersession?.originalRankingReason).toEqual(originalReason);
  });

  it('handles empty input', () => {
    const result = applySupersession([]);
    expect(result.active).toHaveLength(0);
    expect(result.superseded).toHaveLength(0);
    expect(result.supersessionEvents).toHaveLength(0);
  });
});
