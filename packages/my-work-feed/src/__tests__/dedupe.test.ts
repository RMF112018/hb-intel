import { dedupeItems } from '../normalization/dedupeItems.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';

describe('dedupeItems', () => {
  it('passes through items with different dedupeKeys unchanged', () => {
    const items = [
      createMockMyWorkItem({ workItemId: 'w-1', dedupeKey: 'key-a' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'key-b' }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical).toHaveLength(2);
    expect(result.mergeEvents).toHaveLength(0);
  });

  it('merges items with same dedupeKey', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared-key',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared-key',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical).toHaveLength(1);
    expect(result.mergeEvents).toHaveLength(1);
  });

  it('selects survivor with highest source priority', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-handoff',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T12:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-bic',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].workItemId).toBe('w-bic');
  });

  it('breaks source-priority tie with newest sourceUpdatedAtIso', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-old',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-10T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-new',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].workItemId).toBe('w-new');
  });

  it('merges all sourceMeta into survivor', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].sourceMeta).toHaveLength(2);
  });

  it('preserves canAct: true from any merged item', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        permissionState: { canOpen: true, canAct: false, cannotActReason: 'No permission' },
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
        permissionState: { canOpen: true, canAct: true, cannotActReason: null },
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].permissionState.canAct).toBe(true);
    expect(result.canonical[0].permissionState.cannotActReason).toBeNull();
  });

  it('preserves isBlocked: true from any merged item', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        isBlocked: false,
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
        isBlocked: true,
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].isBlocked).toBe(true);
  });

  it('populates dedupe metadata on survivor', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].dedupe).toBeDefined();
    expect(result.canonical[0].dedupe?.dedupeKey).toBe('shared');
    expect(result.canonical[0].dedupe?.mergedSourceMeta).toHaveLength(2);
  });

  it('produces merge events with correct workItemIds', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-survivor',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-merged',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.mergeEvents[0].survivorWorkItemId).toBe('w-survivor');
    expect(result.mergeEvents[0].mergedWorkItemId).toBe('w-merged');
    expect(result.mergeEvents[0].dedupeKey).toBe('shared');
  });

  it('handles empty input', () => {
    const result = dedupeItems([]);
    expect(result.canonical).toHaveLength(0);
    expect(result.mergeEvents).toHaveLength(0);
  });

  it('handles items with empty sourceMeta array', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical).toHaveLength(1);
    expect(result.mergeEvents).toHaveLength(1);
  });

  it('does not duplicate sourceMeta with same sourceItemId', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'shared-src', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'shared-src', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].sourceMeta).toHaveLength(1);
  });

  it('keeps cannotActReason when no merged item has canAct', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        permissionState: { canOpen: true, canAct: false, cannotActReason: 'Role mismatch' },
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
        permissionState: { canOpen: true, canAct: false, cannotActReason: 'Expired' },
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].permissionState.canAct).toBe(false);
    expect(result.canonical[0].permissionState.cannotActReason).toBe('Role mismatch');
  });

  it('3-way dedupe merges all sourceMeta into single survivor', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-bic',
        dedupeKey: 'triple',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-handoff',
        dedupeKey: 'triple',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-module',
        dedupeKey: 'triple',
        sourceMeta: [{ source: 'module', sourceItemId: 'src-3', sourceUpdatedAtIso: '2026-01-15T09:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical).toHaveLength(1);
    expect(result.canonical[0].sourceMeta).toHaveLength(3);
    expect(result.mergeEvents).toHaveLength(2);
  });

  it('isOverdue from merged item does not propagate to survivor', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-survivor',
        dedupeKey: 'shared',
        isOverdue: false,
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
      }),
      createMockMyWorkItem({
        workItemId: 'w-merged',
        dedupeKey: 'shared',
        isOverdue: true,
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
      }),
    ];

    const result = dedupeItems(items);
    // Documents current behavior: dedupe merges isBlocked and canAct, but not isOverdue
    expect(result.canonical[0].isOverdue).toBe(false);
  });

  it('survivor lifecycle fields are preserved over merged item lifecycle', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-survivor',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        lifecycle: {
          previousStepLabel: null,
          currentStepLabel: 'Survivor Step',
          nextStepLabel: null,
          blockedDependencyLabel: null,
          impactedRecordLabel: null,
        },
      }),
      createMockMyWorkItem({
        workItemId: 'w-merged',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
        lifecycle: {
          previousStepLabel: null,
          currentStepLabel: 'Merged Step',
          nextStepLabel: null,
          blockedDependencyLabel: null,
          impactedRecordLabel: null,
        },
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].lifecycle.currentStepLabel).toBe('Survivor Step');
  });

  it('returns null cannotActReason when no items have a reason and none can act', () => {
    const items = [
      createMockMyWorkItem({
        workItemId: 'w-1',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
        permissionState: { canOpen: true, canAct: false, cannotActReason: null },
      }),
      createMockMyWorkItem({
        workItemId: 'w-2',
        dedupeKey: 'shared',
        sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
        permissionState: { canOpen: true, canAct: false, cannotActReason: null },
      }),
    ];

    const result = dedupeItems(items);
    expect(result.canonical[0].permissionState.canAct).toBe(false);
    expect(result.canonical[0].permissionState.cannotActReason).toBeNull();
  });
});
