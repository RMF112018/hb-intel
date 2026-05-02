import { describe, expect, it } from 'vitest';
import {
  SAMPLE_PRIORITY_ACTIONS,
  type IPriorityAction,
  type PriorityActionCategory,
} from '@hbc/models/pcc';
import { buildPccPriorityActionsRailViewModel } from './priorityActionsRailAdapter.js';
import {
  PCC_PRIORITY_RAIL_GROUP_IDS,
  type PccPriorityRailGroupId,
} from './priorityActionsRailViewModel.js';

const SUPPRESSED: readonly PriorityActionCategory[] = ['documents', 'health', 'safety'];

function action(
  overrides: Partial<IPriorityAction> & Pick<IPriorityAction, 'id' | 'category' | 'title'>,
): IPriorityAction {
  return { ...overrides };
}

describe('buildPccPriorityActionsRailViewModel', () => {
  it('returns all four Wave 5 groups in canonical order even when empty', () => {
    const vm = buildPccPriorityActionsRailViewModel([]);
    expect(vm.groups.map((g) => g.id)).toEqual([...PCC_PRIORITY_RAIL_GROUP_IDS]);
    expect(vm.visibleCount).toBe(0);
    expect(vm.suppressedCount).toBe(0);
    for (const group of vm.groups) {
      expect(group.items).toEqual([]);
      expect(group.count).toBe(0);
    }
  });

  it('routes approval category to approval-checkpoints (category rule wins over team-and-access work center)', () => {
    const input: readonly IPriorityAction[] = [
      action({
        id: 'a1',
        category: 'approval',
        title: 'PE sign-off pending',
        relatedWorkCenter: 'team-and-access',
      }),
    ];
    const vm = buildPccPriorityActionsRailViewModel(input);
    const groupOf = (gid: PccPriorityRailGroupId) => vm.groups.find((g) => g.id === gid)!;
    expect(groupOf('approval-checkpoints').items.map((i) => i.id)).toEqual(['a1']);
    expect(groupOf('access-requests').items).toEqual([]);
    expect(groupOf('readiness-blockers').items).toEqual([]);
    expect(groupOf('external-system-mapping').items).toEqual([]);
  });

  it('routes procore-sync category to external-system-mapping', () => {
    const vm = buildPccPriorityActionsRailViewModel([
      action({ id: 'p1', category: 'procore-sync', title: 'Procore mapping required' }),
    ]);
    const group = vm.groups.find((g) => g.id === 'external-system-mapping')!;
    expect(group.items.map((i) => i.id)).toEqual(['p1']);
  });

  it('routes workflow/compliance/inspection/permit/closeout to readiness-blockers', () => {
    const cats: readonly PriorityActionCategory[] = [
      'workflow',
      'compliance',
      'inspection',
      'permit',
      'closeout',
    ];
    const vm = buildPccPriorityActionsRailViewModel(
      cats.map((c, i) => action({ id: `r${i}`, category: c, title: `Item ${i}` })),
    );
    const group = vm.groups.find((g) => g.id === 'readiness-blockers')!;
    expect(group.items.map((i) => i.category).sort()).toEqual([...cats].sort());
    expect(group.count).toBe(cats.length);
  });

  it('routes non-approval team-and-access actions to access-requests', () => {
    const vm = buildPccPriorityActionsRailViewModel([
      action({
        id: 'ta1',
        category: 'workflow',
        title: 'New team member access request',
        relatedWorkCenter: 'team-and-access',
      }),
    ]);
    const group = vm.groups.find((g) => g.id === 'access-requests')!;
    expect(group.items.map((i) => i.id)).toEqual(['ta1']);
    expect(vm.groups.find((g) => g.id === 'readiness-blockers')!.items).toEqual([]);
  });

  it('suppresses documents, health, and safety from every visible group', () => {
    const vm = buildPccPriorityActionsRailViewModel(SAMPLE_PRIORITY_ACTIONS);
    for (const group of vm.groups) {
      for (const item of group.items) {
        expect(SUPPRESSED).not.toContain(item.category);
      }
    }
  });

  it('reports suppressedCount without exposing suppressed items via groups', () => {
    const synthetic: readonly IPriorityAction[] = [
      action({ id: 's-doc', category: 'documents', title: 'd' }),
      action({ id: 's-hlth', category: 'health', title: 'h' }),
      action({ id: 's-saf', category: 'safety', title: 's' }),
      action({ id: 'v-app', category: 'approval', title: 'a' }),
    ];
    const vm = buildPccPriorityActionsRailViewModel(synthetic);
    expect(vm.suppressedCount).toBe(3);
    expect(vm.visibleCount).toBe(1);
    const allVisibleIds = vm.groups.flatMap((g) => g.items.map((i) => i.id));
    expect(allVisibleIds).toEqual(['v-app']);
  });

  it('does not mutate the input array or its action objects', () => {
    const original = SAMPLE_PRIORITY_ACTIONS;
    const snapshot = JSON.parse(JSON.stringify(original));
    const lengthBefore = original.length;
    const vm = buildPccPriorityActionsRailViewModel(original);
    expect(original.length).toBe(lengthBefore);
    expect(JSON.parse(JSON.stringify(original))).toEqual(snapshot);
    expect(vm.visibleCount).toBe(15);
    expect(vm.suppressedCount).toBe(3);
  });

  it('sorts within readiness-blockers by tone, then dueDate, then id', () => {
    const input: readonly IPriorityAction[] = [
      action({ id: 'rb-c-late', category: 'compliance', title: 'late', dueDate: '2026-12-01' }),
      action({ id: 'rb-c-early', category: 'compliance', title: 'early', dueDate: '2026-05-05' }),
      action({ id: 'rb-c-undated', category: 'compliance', title: 'undated' }),
      action({
        id: 'rb-c-high',
        category: 'compliance',
        title: 'high tone',
        severity: 'Repair Required',
      }),
    ];
    const vm = buildPccPriorityActionsRailViewModel(input);
    const items = vm.groups.find((g) => g.id === 'readiness-blockers')!.items;
    expect(items.map((i) => i.id)).toEqual([
      'rb-c-high',
      'rb-c-early',
      'rb-c-late',
      'rb-c-undated',
    ]);
  });

  it('treats invalid dueDate strings as undated and never produces NaN ordering', () => {
    const input: readonly IPriorityAction[] = [
      action({ id: 'inv-1', category: 'workflow', title: 'invalid', dueDate: 'not-a-date' }),
      action({ id: 'inv-2', category: 'workflow', title: 'empty', dueDate: '' }),
      action({ id: 'val-1', category: 'workflow', title: 'valid', dueDate: '2026-05-05' }),
    ];
    const vm = buildPccPriorityActionsRailViewModel(input);
    const items = vm.groups.find((g) => g.id === 'readiness-blockers')!.items;
    expect(items[0].id).toBe('val-1');
    expect(
      items
        .slice(1)
        .map((i) => i.id)
        .sort(),
    ).toEqual(['inv-1', 'inv-2']);
  });

  it('places high-tone items ahead of medium and low across the same group', () => {
    const input: readonly IPriorityAction[] = [
      action({ id: 'med', category: 'workflow', title: 'med' }),
      action({ id: 'low', category: 'workflow', title: 'low', severity: 'Info' }),
      action({ id: 'high', category: 'workflow', title: 'high', severity: 'Blocking' }),
    ];
    const vm = buildPccPriorityActionsRailViewModel(input);
    const items = vm.groups.find((g) => g.id === 'readiness-blockers')!.items;
    expect(items.map((i) => i.id)).toEqual(['high', 'med', 'low']);
  });

  it('group.count always matches items.length, and visibleCount is their sum', () => {
    const vm = buildPccPriorityActionsRailViewModel(SAMPLE_PRIORITY_ACTIONS);
    let runningSum = 0;
    for (const group of vm.groups) {
      expect(group.count).toBe(group.items.length);
      runningSum += group.count;
    }
    expect(vm.visibleCount).toBe(runningSum);
  });

  it('every visible item carries the groupId of its containing group', () => {
    const vm = buildPccPriorityActionsRailViewModel(SAMPLE_PRIORITY_ACTIONS);
    for (const group of vm.groups) {
      for (const item of group.items) {
        expect(item.groupId).toBe(group.id);
      }
    }
  });

  it('preserves verbatim record fields on every visible item (no fabricated copy)', () => {
    const vm = buildPccPriorityActionsRailViewModel(SAMPLE_PRIORITY_ACTIONS);
    for (const group of vm.groups) {
      for (const item of group.items) {
        const source = SAMPLE_PRIORITY_ACTIONS.find((a) => a.id === item.id);
        expect(source).toBeDefined();
        expect(item.title).toBe(source!.title);
        expect(item.summary).toBe(source!.summary);
        expect(item.dueDate).toBe(source!.dueDate);
        expect(item.assigneePersona).toBe(source!.assigneePersona);
        expect(item.relatedWorkCenter).toBe(source!.relatedWorkCenter);
        expect(item.relatedWorkflowItemId).toBe(source!.relatedWorkflowItemId);
        expect(item.severity).toBe(source!.severity);
        expect(item.category).toBe(source!.category);
      }
    }
  });

  it('produces 15 visible / 3 suppressed for the canonical SAMPLE_PRIORITY_ACTIONS fixture', () => {
    const vm = buildPccPriorityActionsRailViewModel(SAMPLE_PRIORITY_ACTIONS);
    expect(vm.visibleCount).toBe(15);
    expect(vm.suppressedCount).toBe(3);
    const counts = Object.fromEntries(vm.groups.map((g) => [g.id, g.count]));
    expect(counts).toEqual({
      'access-requests': 0,
      'readiness-blockers': 13,
      'approval-checkpoints': 1,
      'external-system-mapping': 1,
    });
  });
});
