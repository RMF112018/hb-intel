import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  PCC_NAVIGATION_MODULES,
  PCC_PRIMARY_TAB_IDS,
  getModulesForPrimaryTab,
  type PccModuleId,
  type PccPrimaryTabId,
} from '@hbc/models/pcc';
import { PccHorizontalTabs } from '../shell/PccHorizontalTabs';

afterEach(() => {
  cleanup();
});

const FORBIDDEN_DEVELOPER_TERMS: readonly string[] = [
  'todo',
  'tbd',
  'placeholder',
  'stub',
  'mock',
  'fixture',
  'debug',
  'dev-only',
  'not implemented',
  'lorem',
  'developer',
  'code agent',
  'prompt',
  'repo',
  'test selector',
  'internal only',
];

const escapeRegex = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const FORBIDDEN_TERM_PATTERNS = FORBIDDEN_DEVELOPER_TERMS.map((term) => ({
  term,
  pattern: new RegExp(`\\b${escapeRegex(term)}\\b`, 'i'),
}));

const EXPECTED_VISIBLE_LABELS: Record<PccPrimaryTabId, string> = {
  'project-home': 'Project Home',
  'core-tools': 'Core Tools',
  documents: 'Document Control',
  'estimating-preconstruction': 'Estimating & Preconstruction',
  'startup-closeout': 'Project Startup & Closeout',
  'project-controls': 'Project Controls',
  'cost-time': 'Cost & Time',
  'systems-administration': 'Systems Administration',
};

interface RenderOverrides {
  activePrimaryTabId?: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  panelId?: string;
  onSelectPrimarySurface?: (id: PccPrimaryTabId) => void;
  onSelectModule?: (id: PccModuleId) => void;
}

function renderTabs(overrides: RenderOverrides = {}) {
  const onSelectPrimarySurface = overrides.onSelectPrimarySurface ?? vi.fn();
  const onSelectModule = overrides.onSelectModule ?? vi.fn();
  const result = render(
    <PccHorizontalTabs
      mode="desktop"
      activePrimaryTabId={overrides.activePrimaryTabId ?? 'project-home'}
      activeModuleId={overrides.activeModuleId}
      onSelectPrimarySurface={onSelectPrimarySurface}
      onSelectModule={onSelectModule}
      panelId={overrides.panelId ?? 'pcc-active-panel'}
    />,
  );
  return { ...result, onSelectPrimarySurface, onSelectModule };
}

function getPrimaryTab(container: HTMLElement, id: PccPrimaryTabId): HTMLButtonElement {
  return container.querySelector(`[data-pcc-tab-id="${id}"]`) as HTMLButtonElement;
}

function getToggle(container: HTMLElement, id: PccPrimaryTabId): HTMLButtonElement {
  return container.querySelector(`[data-pcc-nav-toggle="${id}"]`) as HTMLButtonElement;
}

function getMenu(container: HTMLElement, id: PccPrimaryTabId): HTMLElement | null {
  return container.querySelector(`[data-pcc-module-menu="${id}"]`) as HTMLElement | null;
}

function getModuleItem(container: HTMLElement, id: PccModuleId): HTMLButtonElement | null {
  return container.querySelector(`[data-pcc-module-nav-item="${id}"]`) as HTMLButtonElement | null;
}

function flushFocus(): Promise<void> {
  return new Promise((resolve) => {
    queueMicrotask(() => resolve());
  });
}

describe('PccHorizontalTabs — Phase 05 grouped primary tab + module dropdowns', () => {
  it('renders all eight primary tabs from the registry', () => {
    const { container } = renderTabs();
    for (const id of PCC_PRIMARY_TAB_IDS) {
      expect(getPrimaryTab(container, id), `primary tab ${id}`).not.toBeNull();
    }
  });

  it('renders primary tabs in the locked registry order', () => {
    const { container } = renderTabs();
    const renderedOrder = Array.from(
      container.querySelectorAll('[data-pcc-horizontal-tabs] [role="tab"]'),
    ).map((el) => el.getAttribute('data-pcc-tab-id'));
    expect(renderedOrder).toEqual([...PCC_PRIMARY_TAB_IDS]);
  });

  it("renders the visible 'Document Control' primary tab label", () => {
    const { container } = renderTabs();
    const documentsTab = getPrimaryTab(container, 'documents');
    expect(documentsTab.textContent).toContain('Document Control');
  });

  it("does not render a visible primary tab label of 'Documents'", () => {
    const { container } = renderTabs();
    const labels = Array.from(
      container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-tab-id]'),
    ).map((el) => el.textContent?.trim());
    expect(labels).not.toContain('Documents');
  });

  it('every primary tab has a dropdown toggle', () => {
    const { container } = renderTabs();
    for (const id of PCC_PRIMARY_TAB_IDS) {
      expect(getToggle(container, id), `toggle for ${id}`).not.toBeNull();
    }
  });

  it('toggle click opens the matching module menu', () => {
    const { container } = renderTabs();
    const toggle = getToggle(container, 'documents');
    expect(getMenu(container, 'documents')).toBeNull();
    fireEvent.click(toggle);
    expect(getMenu(container, 'documents')).not.toBeNull();
  });

  it('opening one dropdown closes the previously open dropdown', () => {
    const { container } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    expect(getMenu(container, 'documents')).not.toBeNull();
    fireEvent.click(getToggle(container, 'core-tools'));
    expect(getMenu(container, 'core-tools')).not.toBeNull();
    expect(getMenu(container, 'documents')).toBeNull();
  });

  it('toggle click does not call onSelectPrimarySurface', () => {
    const { container, onSelectPrimarySurface } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    expect(onSelectPrimarySurface).not.toHaveBeenCalled();
  });

  it('toggle click does not call onSelectModule', () => {
    const { container, onSelectModule } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    expect(onSelectModule).not.toHaveBeenCalled();
  });

  it('toggle mouse click keeps focus on the toggle (no auto focus into the menu)', () => {
    const { container } = renderTabs();
    const toggle = getToggle(container, 'documents');
    toggle.focus();
    fireEvent.click(toggle);
    expect(document.activeElement).toBe(toggle);
    expect(getMenu(container, 'documents')).not.toBeNull();
  });

  it('Escape on a focused module item closes the menu and returns focus to the parent tab', () => {
    const { container } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'document-control-center')!;
    item.focus();
    fireEvent.keyDown(item, { key: 'Escape' });
    expect(getMenu(container, 'documents')).toBeNull();
    expect(document.activeElement).toBe(getPrimaryTab(container, 'documents'));
  });

  it('ArrowDown on a primary tab opens the menu and focuses the first module item', async () => {
    const { container } = renderTabs();
    const documentsTab = getPrimaryTab(container, 'documents');
    documentsTab.focus();
    fireEvent.keyDown(documentsTab, { key: 'ArrowDown' });
    expect(getMenu(container, 'documents')).not.toBeNull();
    await act(async () => {
      await flushFocus();
    });
    const firstModule = getModuleItem(container, 'primary-documents');
    expect(document.activeElement).toBe(firstModule);
  });

  const focusedModuleId = (): string | null =>
    document.activeElement?.getAttribute('data-pcc-module-nav-item') ?? null;

  it('ArrowDown / ArrowUp navigate module items and wrap', async () => {
    const { container } = renderTabs();
    const documentsTab = getPrimaryTab(container, 'documents');
    documentsTab.focus();
    fireEvent.keyDown(documentsTab, { key: 'ArrowDown' });
    await act(async () => {
      await flushFocus();
    });
    expect(focusedModuleId()).toBe('primary-documents');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(focusedModuleId()).toBe('document-control-center');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(focusedModuleId()).toBe('primary-documents');
    // Wrap upward to the last item
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(focusedModuleId()).toBe('adobe-sign');
  });

  it('Home / End jump to first / last module item', () => {
    const { container } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const items = Array.from(
      container.querySelectorAll('[data-pcc-module-menu="documents"] [data-pcc-module-nav-item]'),
    ) as HTMLButtonElement[];
    expect(items.length).toBe(8);

    // Sanity: direct focus works in this jsdom environment
    items[2]!.focus();
    expect(document.activeElement).toBe(items[2]);

    // Home from item[2] should land focus on item[0]
    fireEvent.keyDown(items[2]!, { key: 'Home' });
    expect(document.activeElement).toBe(items[0]);

    // End should land focus on items[items.length - 1]
    fireEvent.keyDown(items[0]!, { key: 'End' });
    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it('selectable module click calls onSelectModule with the module id and closes the menu', () => {
    const { container, onSelectModule } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'document-control-center')!;
    fireEvent.click(item);
    expect(onSelectModule).toHaveBeenCalledTimes(1);
    expect(onSelectModule).toHaveBeenCalledWith('document-control-center');
    expect(getMenu(container, 'documents')).toBeNull();
  });

  it('selectable module Enter calls onSelectModule once', () => {
    const { container, onSelectModule } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'document-control-center')!;
    item.focus();
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onSelectModule).toHaveBeenCalledTimes(1);
    expect(onSelectModule).toHaveBeenCalledWith('document-control-center');
  });

  it('selectable module Space calls onSelectModule once', () => {
    const { container, onSelectModule } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'document-control-center')!;
    item.focus();
    fireEvent.keyDown(item, { key: ' ' });
    expect(onSelectModule).toHaveBeenCalledTimes(1);
    expect(onSelectModule).toHaveBeenCalledWith('document-control-center');
  });

  it('non-selectable module click does not call onSelectModule', () => {
    const { container, onSelectModule } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'drawing-model-center')!;
    fireEvent.click(item);
    expect(onSelectModule).not.toHaveBeenCalled();
    // Menu stays open so reason copy remains reviewable
    expect(getMenu(container, 'documents')).not.toBeNull();
  });

  it('non-selectable module Enter / Space does not call onSelectModule', () => {
    const { container, onSelectModule } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'drawing-model-center')!;
    item.focus();
    fireEvent.keyDown(item, { key: 'Enter' });
    fireEvent.keyDown(item, { key: ' ' });
    expect(onSelectModule).not.toHaveBeenCalled();
  });

  it('deferred module exposes its disabled reason copy', () => {
    const { container } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'drawing-model-center')!;
    expect(item.textContent).toContain('Planned for a future release');
  });

  it('active module item carries data-pcc-module-active="true"', () => {
    const { container } = renderTabs({ activeModuleId: 'document-control-center' });
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'document-control-center')!;
    expect(item.getAttribute('data-pcc-module-active')).toBe('true');
  });

  it('non-selectable module item carries selectable=false and aria-disabled=true', () => {
    const { container } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    const item = getModuleItem(container, 'drawing-model-center')!;
    expect(item.getAttribute('data-pcc-module-selectable')).toBe('false');
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });

  it('primary tab click calls onSelectPrimarySurface and closes any open menu', () => {
    const { container, onSelectPrimarySurface } = renderTabs();
    fireEvent.click(getToggle(container, 'documents'));
    expect(getMenu(container, 'documents')).not.toBeNull();
    fireEvent.click(getPrimaryTab(container, 'core-tools'));
    expect(onSelectPrimarySurface).toHaveBeenCalledWith('core-tools');
    expect(getMenu(container, 'documents')).toBeNull();
  });

  it('primary tab Enter / Space calls onSelectPrimarySurface once', () => {
    const { container, onSelectPrimarySurface } = renderTabs();
    const tab = getPrimaryTab(container, 'core-tools');
    tab.focus();
    fireEvent.keyDown(tab, { key: 'Enter' });
    expect(onSelectPrimarySurface).toHaveBeenCalledTimes(1);
    expect(onSelectPrimarySurface).toHaveBeenLastCalledWith('core-tools');

    const otherTab = getPrimaryTab(container, 'cost-time');
    otherTab.focus();
    fireEvent.keyDown(otherTab, { key: ' ' });
    expect(onSelectPrimarySurface).toHaveBeenCalledTimes(2);
    expect(onSelectPrimarySurface).toHaveBeenLastCalledWith('cost-time');
  });

  it('ArrowLeft / ArrowRight / Home / End select primary tabs via onSelectPrimarySurface', () => {
    const { container, onSelectPrimarySurface } = renderTabs();
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelectPrimarySurface).toHaveBeenLastCalledWith('core-tools');
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(onSelectPrimarySurface).toHaveBeenLastCalledWith('systems-administration');
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(onSelectPrimarySurface).toHaveBeenLastCalledWith('project-home');
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(onSelectPrimarySurface).toHaveBeenLastCalledWith('systems-administration');
  });

  it('no forbidden developer copy renders in the tablist', () => {
    const { container } = renderTabs();
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    const offenders = new Set<string>();
    const scanCurrentText = () => {
      const text = tablist.textContent ?? '';
      for (const { term, pattern } of FORBIDDEN_TERM_PATTERNS) {
        if (pattern.test(text)) {
          offenders.add(term);
        }
      }
    };
    // Closed-menu render
    scanCurrentText();
    // Each menu's copy in turn — opening a menu closes the prior one,
    // so we must scan once per open menu.
    for (const id of PCC_PRIMARY_TAB_IDS) {
      fireEvent.click(getToggle(container, id));
      scanCurrentText();
    }
    expect(Array.from(offenders)).toEqual([]);
  });

  // Phase 05 ARIA-discipline guards (additional plan-level constraints)

  it('guard: primary tab id collisions are impossible (every pcc-tab-* id is unique across menu states)', () => {
    const { container } = renderTabs();
    const allIds = (): string[] =>
      Array.from(container.querySelectorAll('[id^="pcc-tab-"]'))
        .map((el) => el.getAttribute('id'))
        .filter((id): id is string => Boolean(id));
    const idsClosed = allIds();
    expect(new Set(idsClosed).size).toBe(idsClosed.length);

    // Open each dropdown one at a time (only one menu can be open at
    // once) and re-check the id set per state.
    for (const id of PCC_PRIMARY_TAB_IDS) {
      fireEvent.click(getToggle(container, id));
      const idsOpen = allIds();
      expect(new Set(idsOpen).size, `unique pcc-tab-* ids with ${id} menu open`).toBe(
        idsOpen.length,
      );
    }
  });

  it('guard: role boundaries — only primary tabs are role="tab"; module items are role="menuitem"; toggles are neither', () => {
    const { container } = renderTabs();
    // Phase 05 primary tabs are the sole role="tab" elements (the
    // Prompt 03 sr-only compat markers were removed in Prompt 04).
    const tabs = Array.from(container.querySelectorAll('[data-pcc-horizontal-tabs] [role="tab"]'));
    expect(tabs.length).toBe(PCC_PRIMARY_TAB_IDS.length);
    expect(container.querySelector('[data-pcc-legacy-compat]')).toBeNull();
    const tabTabIds = tabs
      .map((el) => el.getAttribute('data-pcc-tab-id'))
      .filter((id): id is string => Boolean(id));
    expect(new Set(tabTabIds)).toEqual(new Set(PCC_PRIMARY_TAB_IDS));

    // Toggles always render and are neither tabs nor menuitems
    const toggles = Array.from(
      container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-nav-toggle]'),
    );
    for (const toggle of toggles) {
      expect(toggle.getAttribute('role')).not.toBe('tab');
      expect(toggle.getAttribute('role')).not.toBe('menuitem');
      expect(toggle.getAttribute('aria-haspopup')).toBe('menu');
    }

    // Open each menu in turn; aggregate per-menu module-id counts to
    // prove every registry module renders as a role="menuitem" with no
    // duplicates and no role="tab" leakage into menu items.
    const seenModuleIds = new Set<string>();
    let totalModuleCount = 0;
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      fireEvent.click(getToggle(container, tabId));
      const items = Array.from(
        container.querySelectorAll(`[data-pcc-module-menu="${tabId}"] [data-pcc-module-nav-item]`),
      );
      for (const item of items) {
        expect(item.getAttribute('role')).toBe('menuitem');
        const id = item.getAttribute('data-pcc-module-nav-item');
        expect(id).not.toBeNull();
        expect(seenModuleIds.has(id!), `module ${id} should appear in exactly one menu`).toBe(
          false,
        );
        seenModuleIds.add(id!);
      }
      totalModuleCount += items.length;
    }
    expect(totalModuleCount).toBe(PCC_NAVIGATION_MODULES.length);
  });

  // Phase 05 wave-b10 Prompt 05 — authority / boundary copy hardening.
  // The Phase 05 registry (PccPrimaryNavigation.ts) already carries the
  // canonical authority cues; these tests lock that cue rendering as
  // visible end-user copy in the dropdown menus.

  it('HBI Assistant module item authority cue communicates advisory + no decisions + no approvals + no writeback', () => {
    const { container } = renderTabs();
    fireEvent.click(getToggle(container, 'core-tools'));
    const item = getModuleItem(container, 'hbi-assistant');
    expect(item).not.toBeNull();
    const text = (item!.textContent ?? '').toLowerCase();
    expect(text).toContain('advisory');
    expect(text).toContain('no decision');
    expect(text).toContain('no approval');
    expect(/no writeback|does not write back/.test(text)).toBe(true);
  });

  it('Launch-only module items carry source-system + no-writeback authority cues', () => {
    const { container } = renderTabs();
    const launchOnlyByParent: ReadonlyArray<{
      parent: 'core-tools' | 'documents';
      moduleId: string;
    }> = [
      { parent: 'core-tools', moduleId: 'external-platforms' },
      { parent: 'documents', moduleId: 'procore-documents' },
      { parent: 'documents', moduleId: 'document-crunch' },
      { parent: 'documents', moduleId: 'adobe-sign' },
    ];
    for (const { parent, moduleId } of launchOnlyByParent) {
      // Single-menu invariant: only one menu can be open at a time. If
      // the parent menu is already open from a prior iteration, do NOT
      // re-click the toggle (that would close it). Otherwise open it.
      const menuAlreadyOpen = container.querySelector(`[data-pcc-module-menu="${parent}"]`);
      if (!menuAlreadyOpen) {
        fireEvent.click(getToggle(container, parent));
      }
      const item = container.querySelector(
        `[data-pcc-module-nav-item="${moduleId}"]`,
      ) as HTMLButtonElement | null;
      expect(item, `launch-only item '${moduleId}' must render under '${parent}'`).not.toBeNull();
      const text = (item!.textContent ?? '').toLowerCase();
      expect(
        /does not write back|no writeback/.test(text),
        `launch-only '${moduleId}' must communicate no-writeback in its rendered authority cue`,
      ).toBe(true);
    }
  });

  it('Approvals & Checkpoints module item does not render approve / reject / waive / override action verbs in any rendered text', () => {
    const { container } = renderTabs();
    fireEvent.click(getToggle(container, 'core-tools'));
    const item = getModuleItem(container, 'approvals-checkpoints');
    expect(item).not.toBeNull();
    const text = item!.textContent ?? '';
    for (const verb of ['approve', 'reject', 'waive', 'override']) {
      const re = new RegExp(`\\b${verb}\\b`, 'i');
      expect(
        re.test(text),
        `'approvals-checkpoints' rendered text must not contain action verb '${verb}'`,
      ).toBe(false);
    }
  });

  // Phase 05 wave-b10 Prompt 07 — locks the dropdown toggle's ARIA
  // contract so assistive tech can find the menu before and after open.
  it('every dropdown toggle exposes aria-haspopup="menu" and a closed→open→closed aria-expanded + aria-controls target lifecycle', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const { container, unmount } = renderTabs();
      const toggle = getToggle(container, tabId);
      expect(toggle, `toggle for ${tabId}`).not.toBeNull();
      expect(toggle.getAttribute('aria-haspopup')).toBe('menu');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      const controlsId = toggle.getAttribute('aria-controls');
      expect(controlsId, `toggle ${tabId} must have a non-empty aria-controls`).toBeTruthy();
      expect(controlsId!.length).toBeGreaterThan(0);
      // Closed: target id is not mounted in the document yet.
      expect(document.getElementById(controlsId!)).toBeNull();

      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      const mounted = document.getElementById(controlsId!);
      expect(mounted, `aria-controls target for ${tabId} must mount when expanded`).not.toBeNull();
      expect(mounted!.getAttribute('role')).toBe('menu');
      expect(mounted!.getAttribute('data-pcc-module-menu')).toBe(tabId);

      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.getElementById(controlsId!)).toBeNull();

      unmount();
      cleanup();
    }
  });

  // Phase 05 wave-b10 Prompt 07 — locks the production blur handler at
  // PccHorizontalTabs.tsx. The handler reads `document.activeElement`
  // inside a queueMicrotask, so the test must move focus naturally so
  // `document.activeElement` reflects reality before the microtask
  // runs. fireEvent.blur with a synthetic relatedTarget does not move
  // focus in jsdom; element.focus() does.
  it('focus moving outside the nav root closes the open menu after a microtask', async () => {
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'outside';
    document.body.appendChild(outsideButton);
    try {
      const { container } = renderTabs();
      fireEvent.click(getToggle(container, 'core-tools'));
      expect(getMenu(container, 'core-tools')).not.toBeNull();
      const firstMenuItem = container.querySelector(
        '[data-pcc-module-menu="core-tools"] [role="menuitem"]',
      ) as HTMLButtonElement | null;
      expect(firstMenuItem).not.toBeNull();
      firstMenuItem!.focus();
      expect(document.activeElement).toBe(firstMenuItem);

      // Natural focus shift outside the nav root.
      outsideButton.focus();
      expect(document.activeElement).toBe(outsideButton);

      // Production handler defers the close via queueMicrotask.
      await new Promise<void>((resolve) => queueMicrotask(resolve));

      expect(getMenu(container, 'core-tools')).toBeNull();
    } finally {
      outsideButton.remove();
    }
  });

  it('focus moving within the nav root (toggle ↔ menu item) leaves the menu mounted (sanity countercheck)', async () => {
    const { container } = renderTabs();
    const toggle = getToggle(container, 'core-tools');
    fireEvent.click(toggle);
    expect(getMenu(container, 'core-tools')).not.toBeNull();
    const firstMenuItem = container.querySelector(
      '[data-pcc-module-menu="core-tools"] [role="menuitem"]',
    ) as HTMLButtonElement | null;
    expect(firstMenuItem).not.toBeNull();
    firstMenuItem!.focus();
    // Move focus to another node inside the root.
    toggle.focus();
    expect(document.activeElement).toBe(toggle);
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(getMenu(container, 'core-tools')).not.toBeNull();
  });

  // Phase 05 wave-b10 Prompt 07 — false-affordance sweep across every
  // primary tab. Per `feedback_split_sweep_for_all_one_side_iteration`,
  // selectable + non-selectable assertions are split into two tests so
  // primary tabs that contain only one side (e.g. `estimating-pre-
  // construction` is registry-deferred) cannot silently skip half the
  // contract. A sentinel counter fails fast if the registry is mutated
  // to all-one-side.
  it('every non-selectable module across every primary tab is button + aria-disabled + non-callable on click/Enter/Space; menu remains open', () => {
    let nonSelectableTested = 0;
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const { container, onSelectModule, unmount } = renderTabs({
        activePrimaryTabId: tabId,
      });
      fireEvent.click(getToggle(container, tabId));
      const menu = getMenu(container, tabId);
      expect(menu, `menu for ${tabId} must mount`).not.toBeNull();
      const nonSelectableItems = Array.from(
        menu!.querySelectorAll<HTMLElement>(
          '[data-pcc-module-nav-item][data-pcc-module-selectable="false"]',
        ),
      );
      const registryModules = getModulesForPrimaryTab(tabId);
      const expectedNonSelectableIds = registryModules
        .filter((m) => !m.selectable)
        .map((m) => m.id);
      expect(
        nonSelectableItems.map((n) => n.getAttribute('data-pcc-module-nav-item')).sort(),
        `rendered non-selectable items for ${tabId} must match the registry`,
      ).toEqual([...expectedNonSelectableIds].sort());

      for (const item of nonSelectableItems) {
        nonSelectableTested += 1;
        const moduleId = item.getAttribute('data-pcc-module-nav-item') as PccModuleId;
        const registryEntry = registryModules.find((m) => m.id === moduleId);
        expect(registryEntry, `module ${moduleId} must exist in registry`).toBeDefined();
        expect(item.tagName, `non-selectable ${moduleId} must be a <button>`).toBe('BUTTON');
        expect(item.getAttribute('aria-disabled')).toBe('true');
        if (registryEntry!.disabledReason) {
          expect(
            item.textContent ?? '',
            `non-selectable ${moduleId} must render its registry disabledReason copy`,
          ).toContain(registryEntry!.disabledReason);
        }

        fireEvent.click(item);
        expect(
          onSelectModule,
          `click on non-selectable ${moduleId} must not dispatch`,
        ).not.toHaveBeenCalled();
        expect(
          getMenu(container, tabId),
          `menu for ${tabId} must stay open after click on ${moduleId}`,
        ).not.toBeNull();

        fireEvent.keyDown(item, { key: 'Enter' });
        expect(
          onSelectModule,
          `Enter on non-selectable ${moduleId} must not dispatch`,
        ).not.toHaveBeenCalled();
        expect(getMenu(container, tabId)).not.toBeNull();

        fireEvent.keyDown(item, { key: ' ' });
        expect(
          onSelectModule,
          `Space on non-selectable ${moduleId} must not dispatch`,
        ).not.toHaveBeenCalled();
        expect(getMenu(container, tabId)).not.toBeNull();
      }

      unmount();
      cleanup();
      vi.clearAllMocks();
    }
    expect(
      nonSelectableTested,
      'at least one non-selectable module must exist across the Phase 05 registry; a registry mutation to all-selectable would silently void this guard',
    ).toBeGreaterThan(0);
  });

  it('every selectable module across every primary tab dispatches onSelectModule exactly once on click/Enter/Space and closes the menu', () => {
    let selectableTested = 0;
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const registrySelectable = getModulesForPrimaryTab(tabId).filter((m) => m.selectable);
      if (registrySelectable.length === 0) {
        // Registry-legitimate (e.g. estimating-preconstruction is all
        // deferred today). Skip selectable assertions for this tab.
        continue;
      }
      for (const moduleEntry of registrySelectable) {
        for (const activation of ['click', 'enter', 'space'] as const) {
          const { container, onSelectModule, unmount } = renderTabs({
            activePrimaryTabId: tabId,
          });
          fireEvent.click(getToggle(container, tabId));
          const item = getModuleItem(container, moduleEntry.id);
          expect(item, `selectable ${moduleEntry.id} must render in ${tabId} menu`).not.toBeNull();
          expect(item!.tagName).toBe('BUTTON');
          expect(item!.getAttribute('aria-disabled')).not.toBe('true');
          expect(item!.getAttribute('data-pcc-module-selectable')).toBe('true');

          if (activation === 'click') {
            fireEvent.click(item!);
          } else if (activation === 'enter') {
            fireEvent.keyDown(item!, { key: 'Enter' });
          } else {
            fireEvent.keyDown(item!, { key: ' ' });
          }
          expect(
            onSelectModule,
            `${activation} on selectable ${moduleEntry.id} (${tabId}) must dispatch exactly once`,
          ).toHaveBeenCalledTimes(1);
          expect(onSelectModule).toHaveBeenCalledWith(moduleEntry.id);
          expect(
            getMenu(container, tabId),
            `menu for ${tabId} must close after selectable ${moduleEntry.id} ${activation}`,
          ).toBeNull();

          selectableTested += 1;
          unmount();
          cleanup();
          vi.clearAllMocks();
        }
      }
    }
    expect(
      selectableTested,
      'at least one selectable module must exist across the Phase 05 registry; a registry mutation to all-deferred would silently void this guard',
    ).toBeGreaterThan(0);
  });
});
