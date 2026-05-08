import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PRIORITY_ACTION_CATEGORY_LABELS, SAMPLE_PRIORITY_ACTIONS } from '@hbc/models/pcc';
import { buildPccPriorityActionsRailViewModel } from './priorityActionsRailAdapter.js';
import {
  PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS,
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

function getToggle(container: HTMLElement): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>('[data-pcc-priority-rail-toggle]');
  expect(btn, 'rail toggle button should render when hiddenCount > 0').not.toBeNull();
  return btn!;
}

afterEach(() => {
  cleanup();
});

describe('PccPriorityActionsRail', () => {
  // ── Region + ariaLabel ───────────────────────────────────────────────

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

  // ── Compact-default DOM truth ────────────────────────────────────────

  it('compact default renders exactly PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS visible rows', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const rows = container.querySelectorAll('[data-pcc-priority-rail-action-id]');
    expect(rows).toHaveLength(PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS);
  });

  it('compact default renders the visible items inside [data-pcc-priority-rail-compact-list] with no group sections', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const compactList = container.querySelector('[data-pcc-priority-rail-compact-list]');
    expect(compactList, 'compact list should render').not.toBeNull();
    expect(container.querySelectorAll('[data-pcc-priority-rail-group]')).toHaveLength(0);
    const rowsInCompactList = compactList!.querySelectorAll('[data-pcc-priority-rail-action-id]');
    expect(rowsInCompactList).toHaveLength(PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS);
  });

  it('compact default visible row ids match compactSummary.visibleItems in order', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const ids = Array.from(
      container.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-action-id]'),
    ).map((r) => r.getAttribute('data-pcc-priority-rail-action-id'));
    expect(ids).toEqual(SAMPLE_VIEW_MODEL.compactSummary.visibleItems.map((i) => i.id));
  });

  // ── Overflow summary ─────────────────────────────────────────────────

  it('compact default renders the overflow summary with the expected hidden count', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const heading = container.querySelector('[data-pcc-priority-rail-overflow-summary]');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe(
      `Remaining reference items: ${SAMPLE_VIEW_MODEL.compactSummary.hiddenCount}`,
    );
  });

  it('compact default lists per-group hidden counts that sum to the total hidden count', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const groupEntries = container.querySelectorAll<HTMLElement>(
      '[data-pcc-priority-rail-overflow-group-id]',
    );
    expect(groupEntries.length).toBeGreaterThan(0);
    let visibleHiddenSum = 0;
    for (const entry of Array.from(groupEntries)) {
      const groupId = entry.getAttribute('data-pcc-priority-rail-overflow-group-id')!;
      const reported = SAMPLE_VIEW_MODEL.compactSummary.hiddenByGroup.find(
        (g) => g.groupId === groupId,
      );
      expect(reported, `group '${groupId}' should map to a compactSummary entry`).toBeDefined();
      expect(entry.textContent).toBe(`${reported!.displayName}: ${reported!.hiddenCount} hidden`);
      visibleHiddenSum += reported!.hiddenCount;
    }
    expect(visibleHiddenSum).toBe(SAMPLE_VIEW_MODEL.compactSummary.hiddenCount);
  });

  // ── Toggle behavior ──────────────────────────────────────────────────

  it('toggle starts in collapsed state with the canonical collapsed label and aria-expanded=false', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const toggle = getToggle(container);
    expect(toggle.getAttribute('data-pcc-priority-rail-toggle-state')).toBe('collapsed');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent).toBe('Show additional reference items');
  });

  it('clicking the toggle expands to the four-group view with all visible rows', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    fireEvent.click(getToggle(container));
    const lanes = container.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-group]');
    const ids = Array.from(lanes).map((el) => el.getAttribute('data-pcc-priority-rail-group'));
    expect(ids).toEqual([...PCC_PRIORITY_RAIL_GROUP_IDS]);
    expect(container.querySelectorAll('[data-pcc-priority-rail-action-id]')).toHaveLength(
      SAMPLE_VIEW_MODEL.visibleCount,
    );
    const toggle = getToggle(container);
    expect(toggle.getAttribute('data-pcc-priority-rail-toggle-state')).toBe('expanded');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.textContent).toBe('Show fewer reference items');
    // Compact-mode artifacts disappear when expanded.
    expect(container.querySelector('[data-pcc-priority-rail-compact-list]')).toBeNull();
    expect(container.querySelector('[data-pcc-priority-rail-overflow-summary]')).toBeNull();
  });

  it('clicking the toggle a second time returns to compact 5-row mode', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    fireEvent.click(getToggle(container));
    fireEvent.click(getToggle(container));
    expect(container.querySelectorAll('[data-pcc-priority-rail-action-id]')).toHaveLength(
      PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS,
    );
    expect(container.querySelectorAll('[data-pcc-priority-rail-group]')).toHaveLength(0);
    expect(container.querySelector('[data-pcc-priority-rail-compact-list]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-priority-rail-overflow-summary]')).not.toBeNull();
    const toggle = getToggle(container);
    expect(toggle.textContent).toBe('Show additional reference items');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggle aria-controls points at a body element that exists in both modes', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const toggle = getToggle(container);
    const id = toggle.getAttribute('aria-controls');
    expect(id).toBeTruthy();
    expect(container.querySelector(`#${CSS.escape(id!)}`)).not.toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(`#${CSS.escape(id!)}`)).not.toBeNull();
  });

  // ── No-execution / source-boundary invariants ───────────────────────

  it('rail has zero anchor elements (compact and expanded)', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    fireEvent.click(getToggle(container));
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('rail has zero href attributes (compact and expanded)', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    expect(container.querySelectorAll('[href]')).toHaveLength(0);
    fireEvent.click(getToggle(container));
    expect(container.querySelectorAll('[href]')).toHaveLength(0);
  });

  it('rail contains exactly one button — the local display-only toggle — in both compact and expanded modes', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const compactButtons = container.querySelectorAll('button');
    expect(compactButtons).toHaveLength(1);
    expect(compactButtons[0]).toBe(getToggle(container));
    fireEvent.click(getToggle(container));
    const expandedButtons = container.querySelectorAll('button');
    expect(expandedButtons).toHaveLength(1);
    expect(expandedButtons[0]).toBe(getToggle(container));
  });

  it('per-row affordance text is "Source-owned" and rendered as a non-interactive <span>', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const affordances = container.querySelectorAll<HTMLElement>(
      '[data-pcc-priority-rail-disabled-action]',
    );
    expect(affordances).toHaveLength(PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS);
    for (const el of Array.from(affordances)) {
      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('Source-owned · act in owning module');
    }
  });

  it('expanded-mode per-row affordance count equals visibleCount and stays a non-interactive <span>', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    fireEvent.click(getToggle(container));
    const affordances = container.querySelectorAll<HTMLElement>(
      '[data-pcc-priority-rail-disabled-action]',
    );
    expect(affordances).toHaveLength(SAMPLE_VIEW_MODEL.visibleCount);
    for (const el of Array.from(affordances)) {
      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('Source-owned · act in owning module');
    }
  });

  // ── Tone label visibility ────────────────────────────────────────────

  it('renders a visible "Priority: <Tone>" label per visible compact row matching the item tone', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const expectedCopy: Record<string, string> = {
      high: 'Priority: High',
      medium: 'Priority: Medium',
      low: 'Priority: Low',
    };
    const rows = container.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-action-id]');
    expect(rows).toHaveLength(PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS);
    for (const row of Array.from(rows)) {
      const tone = row.getAttribute('data-pcc-priority-rail-action-tone')!;
      const toneLabel = row.querySelector<HTMLElement>('[data-pcc-priority-rail-tone-label]');
      expect(toneLabel).not.toBeNull();
      expect(toneLabel!.getAttribute('data-pcc-priority-rail-tone-label')).toBe(tone);
      expect(toneLabel!.textContent).toBe(expectedCopy[tone]);
    }
  });

  it('synthetic input renders Priority: High / Medium / Low across all three tones in compact mode', () => {
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
    // 3 < 5: no toggle, no overflow.
    expect(container.querySelector('[data-pcc-priority-rail-toggle]')).toBeNull();
    expect(container.querySelector('[data-pcc-priority-rail-overflow-summary]')).toBeNull();
  });

  // ── Empty-state branches ─────────────────────────────────────────────

  it('rail-level empty: visibleCount === 0 renders the rail-empty marker and no toggle', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={EMPTY_VIEW_MODEL} />);
    const rail = container.querySelector('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    expect(container.querySelector('[data-pcc-priority-rail-empty]')!.textContent).toBe(
      'No priority actions.',
    );
    expect(container.querySelectorAll('[data-pcc-priority-rail-group]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-pcc-priority-rail-action-id]')).toHaveLength(0);
    expect(container.querySelector('[data-pcc-priority-rail-toggle]')).toBeNull();
  });

  it('expanded-mode empty lane (access-requests) renders the lane-level empty marker', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    fireEvent.click(getToggle(container));
    const lane = laneEl(container, 'access-requests');
    expect(lane.querySelector('[data-pcc-priority-rail-group-empty]')).not.toBeNull();
    expect(lane.querySelectorAll('[data-pcc-priority-rail-action-id]')).toHaveLength(0);
  });

  // ── Expanded-mode contracts (existing behavior, preserved) ───────────

  it('expanded mode renders all four lanes in canonical order with correct row counts', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    fireEvent.click(getToggle(container));
    const lanes = container.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-group]');
    const ids = Array.from(lanes).map((el) => el.getAttribute('data-pcc-priority-rail-group'));
    expect(ids).toEqual([...PCC_PRIORITY_RAIL_GROUP_IDS]);
    for (const groupId of PCC_PRIORITY_RAIL_GROUP_IDS) {
      const lane = laneEl(container, groupId);
      const meta = PCC_PRIORITY_RAIL_GROUP_META[groupId];
      expect(lane.textContent).toContain(meta.displayName);
      const expectedCount = SAMPLE_VIEW_MODEL.groups.find((g) => g.id === groupId)!.count;
      const rows = lane.querySelectorAll('[data-pcc-priority-rail-action-id]');
      expect(rows).toHaveLength(expectedCount);
    }
  });

  it('expanded-mode lane aria-labelledby points at a heading element with that id', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    fireEvent.click(getToggle(container));
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

  // ── Suppressed-category protection (compact and expanded) ────────────

  it('compact mode does not render suppressed-category labels or fixture titles or ids', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    const railText = container.textContent ?? '';
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.health);
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.documents);
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.safety);
    const suppressed = SAMPLE_PRIORITY_ACTIONS.filter((a) =>
      ['documents', 'health', 'safety'].includes(a.category),
    );
    for (const a of suppressed) {
      expect(railText).not.toContain(a.title);
      expect(container.querySelector(`[data-pcc-priority-rail-action-id="${a.id}"]`)).toBeNull();
    }
  });

  it('expanded mode does not render suppressed-category labels or fixture titles or ids', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    fireEvent.click(getToggle(container));
    const railText = container.textContent ?? '';
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.health);
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.documents);
    expect(railText).not.toContain(PRIORITY_ACTION_CATEGORY_LABELS.safety);
    const suppressed = SAMPLE_PRIORITY_ACTIONS.filter((a) =>
      ['documents', 'health', 'safety'].includes(a.category),
    );
    for (const a of suppressed) {
      expect(railText).not.toContain(a.title);
      expect(container.querySelector(`[data-pcc-priority-rail-action-id="${a.id}"]`)).toBeNull();
    }
  });

  // ── Verbatim row content (compact mode) ──────────────────────────────

  it('preserves verbatim title/summary/category/dueDate/persona/work-center text on visible compact rows', () => {
    const { container } = render(<PccPriorityActionsRail viewModel={SAMPLE_VIEW_MODEL} />);
    for (const item of SAMPLE_VIEW_MODEL.compactSummary.visibleItems) {
      const row = container.querySelector<HTMLElement>(
        `[data-pcc-priority-rail-action-id="${item.id}"]`,
      );
      expect(row).not.toBeNull();
      expect(row!.textContent).toContain(item.title);
      if (item.summary) expect(row!.textContent).toContain(item.summary);
      expect(row!.textContent).toContain(PRIORITY_ACTION_CATEGORY_LABELS[item.category]);
      if (item.dueDate) expect(row!.textContent).toContain(`Due ${item.dueDate}`);
      if (item.assigneePersona) expect(row!.textContent).toContain(item.assigneePersona);
      if (item.relatedWorkCenter) expect(row!.textContent).toContain(item.relatedWorkCenter);
    }
  });
});
