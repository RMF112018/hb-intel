import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PRIORITY_ACTION_CATEGORY_LABELS, SAMPLE_PRIORITY_ACTIONS } from '@hbc/models/pcc';
import { buildPccPriorityActionsRailViewModel } from './priorityActionsRailAdapter.js';
import {
  PCC_PRIORITY_RAIL_GROUP_IDS,
  PCC_PRIORITY_RAIL_GROUP_META,
  type IPccPriorityActionsRailViewModel,
  type PccPriorityRailGroupId,
} from './priorityActionsRailViewModel.js';
import { PccPriorityActionsRail } from './PccPriorityActionsRail';

const SAMPLE_VIEW_MODEL = buildPccPriorityActionsRailViewModel(SAMPLE_PRIORITY_ACTIONS);

const EMPTY_VIEW_MODEL: IPccPriorityActionsRailViewModel = buildPccPriorityActionsRailViewModel([]);

function laneEl(container: HTMLElement, groupId: PccPriorityRailGroupId): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[data-pcc-priority-rail-group="${groupId}"]`);
  expect(el).not.toBeNull();
  return el!;
}

describe('PccPriorityActionsRail', () => {
  it('renders a single rail root with default aria-label', () => {
    const { container, getByRole } = render(
      <PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />,
    );
    const rails = container.querySelectorAll('[data-pcc-priority-rail]');
    expect(rails).toHaveLength(1);
    expect(getByRole('region', { name: 'Priority Actions' })).toBe(rails[0]);
  });

  it('honors the ariaLabel prop override', () => {
    const { getByRole } = render(
      <PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} ariaLabel="Custom rail label" />,
    );
    expect(getByRole('region', { name: 'Custom rail label' })).toBeTruthy();
  });

  it('renders all four lanes in canonical order when there are visible items', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const lanes = container.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-group]');
    const ids = Array.from(lanes).map((el) => el.getAttribute('data-pcc-priority-rail-group'));
    expect(ids).toEqual([...PCC_PRIORITY_RAIL_GROUP_IDS]);
  });

  it('renders each lane displayName and numeric count', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    for (const groupId of PCC_PRIORITY_RAIL_GROUP_IDS) {
      const lane = laneEl(container, groupId);
      const meta = PCC_PRIORITY_RAIL_GROUP_META[groupId];
      expect(lane.textContent).toContain(meta.displayName);
      const expectedCount = SAMPLE_VIEW_MODEL.groups.find((g) => g.id === groupId)!.count;
      // count appears in the header span; assert presence as text within the lane
      expect(lane.textContent).toContain(String(expectedCount));
    }
  });

  it('lane aria-labelledby points at a heading element with that id', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    for (const groupId of PCC_PRIORITY_RAIL_GROUP_IDS) {
      const lane = laneEl(container, groupId);
      const labelledBy = lane.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      const heading = container.querySelector(`#${CSS.escape(labelledBy!)}`);
      expect(heading).not.toBeNull();
      expect(heading!.tagName).toBe('H4');
      expect(heading!.textContent).toBe(PCC_PRIORITY_RAIL_GROUP_META[groupId].displayName);
    }
  });

  it('populated lane renders one row per visible item, scoped per lane', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    for (const group of SAMPLE_VIEW_MODEL.groups) {
      const lane = laneEl(container, group.id);
      const rows = lane.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-action-id]');
      expect(rows).toHaveLength(group.count);
      const ids = Array.from(rows).map((r) => r.getAttribute('data-pcc-priority-rail-action-id'));
      expect(ids).toEqual(group.items.map((i) => i.id));
    }
  });

  it('row exposes data-pcc-priority-rail-action-tone matching the item tone', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    for (const group of SAMPLE_VIEW_MODEL.groups) {
      const lane = laneEl(container, group.id);
      for (const item of group.items) {
        const row = lane.querySelector<HTMLElement>(
          `[data-pcc-priority-rail-action-id="${item.id}"]`,
        );
        expect(row).not.toBeNull();
        expect(row!.getAttribute('data-pcc-priority-rail-action-tone')).toBe(item.tone);
      }
    }
  });

  it('renders a visible "Priority: <Tone>" label per row matching the item tone', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const expectedCopy: Record<string, string> = {
      high: 'Priority: High',
      medium: 'Priority: Medium',
      low: 'Priority: Low',
    };
    for (const group of SAMPLE_VIEW_MODEL.groups) {
      const lane = laneEl(container, group.id);
      for (const item of group.items) {
        const row = lane.querySelector<HTMLElement>(
          `[data-pcc-priority-rail-action-id="${item.id}"]`,
        );
        expect(row).not.toBeNull();
        const toneLabel = row!.querySelector<HTMLElement>('[data-pcc-priority-rail-tone-label]');
        expect(toneLabel).not.toBeNull();
        expect(toneLabel!.getAttribute('data-pcc-priority-rail-tone-label')).toBe(item.tone);
        expect(toneLabel!.textContent).toBe(expectedCopy[item.tone]);
      }
    }
  });

  it('tone-label data attribute equals row data-pcc-priority-rail-action-tone', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const rows = container.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-action-id]');
    expect(rows.length).toBe(SAMPLE_VIEW_MODEL.visibleCount);
    for (const row of Array.from(rows)) {
      const rowTone = row.getAttribute('data-pcc-priority-rail-action-tone');
      const toneLabel = row.querySelector<HTMLElement>('[data-pcc-priority-rail-tone-label]');
      expect(toneLabel).not.toBeNull();
      expect(toneLabel!.getAttribute('data-pcc-priority-rail-tone-label')).toBe(rowTone);
    }
  });

  it('renders Priority: High / Medium / Low text via synthetic input across all three tones', () => {
    const synthetic = buildPccPriorityActionsRailViewModel([
      { id: 'syn-h', category: 'workflow', title: 'h', severity: 'Blocking' },
      { id: 'syn-m', category: 'workflow', title: 'm' },
      { id: 'syn-l', category: 'workflow', title: 'l', severity: 'Info' },
    ]);
    const { container } = render(<PccPriorityActionsRail viewModel={synthetic} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Priority: High');
    expect(text).toContain('Priority: Medium');
    expect(text).toContain('Priority: Low');
    const labels = container.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-tone-label]');
    const tones = Array.from(labels).map((el) =>
      el.getAttribute('data-pcc-priority-rail-tone-label'),
    );
    expect(tones.sort()).toEqual(['high', 'low', 'medium']);
  });

  it('empty lane renders the lane-level empty marker with no rows', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    // access-requests has 0 items in the SAMPLE_PRIORITY_ACTIONS view-model
    const lane = laneEl(container, 'access-requests');
    expect(lane.querySelector('[data-pcc-priority-rail-group-empty]')).not.toBeNull();
    expect(lane.querySelectorAll('[data-pcc-priority-rail-action-id]')).toHaveLength(0);
  });

  it('rail-level empty: visibleCount === 0 renders rail-level empty and skips lanes', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={EMPTY_VIEW_MODEL} />);
    const rail = container.querySelector('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    expect(container.querySelector('[data-pcc-priority-rail-empty]')!.textContent).toBe(
      'No priority actions.',
    );
    expect(container.querySelectorAll('[data-pcc-priority-rail-group]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-pcc-priority-rail-action-id]')).toHaveLength(0);
  });

  it('inert affordance: every disabled-action marker is a span (no button, no anchor)', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const affordances = container.querySelectorAll<HTMLElement>(
      '[data-pcc-priority-rail-disabled-action]',
    );
    expect(affordances.length).toBe(SAMPLE_VIEW_MODEL.visibleCount);
    for (const el of Array.from(affordances)) {
      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('Preview only');
    }
  });

  it('has zero anchor elements anywhere in the rail', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('has zero href attributes anywhere in the rail', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    expect(container.querySelectorAll('[href]')).toHaveLength(0);
  });

  it('has zero button elements anywhere in the rail (no disabled buttons either)', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('preserves verbatim title and summary text from the view-model', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    for (const group of SAMPLE_VIEW_MODEL.groups) {
      const lane = laneEl(container, group.id);
      for (const item of group.items) {
        const row = lane.querySelector<HTMLElement>(
          `[data-pcc-priority-rail-action-id="${item.id}"]`,
        );
        expect(row).not.toBeNull();
        expect(row!.textContent).toContain(item.title);
        if (item.summary) {
          expect(row!.textContent).toContain(item.summary);
        }
      }
    }
  });

  it('renders conditional meta chips independently (per feedback_independent_conditional_chips)', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    for (const group of SAMPLE_VIEW_MODEL.groups) {
      const lane = laneEl(container, group.id);
      for (const item of group.items) {
        const row = lane.querySelector<HTMLElement>(
          `[data-pcc-priority-rail-action-id="${item.id}"]`,
        );
        expect(row).not.toBeNull();
        expect(row!.textContent).toContain(PRIORITY_ACTION_CATEGORY_LABELS[item.category]);
        if (item.dueDate) expect(row!.textContent).toContain(`Due ${item.dueDate}`);
        if (item.assigneePersona) expect(row!.textContent).toContain(item.assigneePersona);
        if (item.relatedWorkCenter) expect(row!.textContent).toContain(item.relatedWorkCenter);
      }
    }
  });

  it('does not render suppressed-category labels (Site Health / Documents / Safety)', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const railText = container.textContent ?? '';
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.health);
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.documents);
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.safety);
  });

  it('does not render suppressed fixture titles', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const suppressedTitles = SAMPLE_PRIORITY_ACTIONS.filter((a) =>
      ['documents', 'health', 'safety'].includes(a.category),
    ).map((a) => a.title);
    expect(suppressedTitles.length).toBeGreaterThan(0);
    for (const title of suppressedTitles) {
      expect(container.textContent ?? '').not.toContain(title);
    }
  });

  it('does not render suppressed fixture action ids in any lane', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const suppressedIds = SAMPLE_PRIORITY_ACTIONS.filter((a) =>
      ['documents', 'health', 'safety'].includes(a.category),
    ).map((a) => a.id);
    expect(suppressedIds.length).toBeGreaterThan(0);
    for (const groupId of PCC_PRIORITY_RAIL_GROUP_IDS) {
      const lane = laneEl(container, groupId);
      for (const id of suppressedIds) {
        expect(lane.querySelector(`[data-pcc-priority-rail-action-id="${id}"]`)).toBeNull();
      }
    }
  });

  it('end-to-end: SAMPLE_PRIORITY_ACTIONS renders 15 visible rows total', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    expect(container.querySelectorAll('[data-pcc-priority-rail-action-id]')).toHaveLength(15);
  });
});
