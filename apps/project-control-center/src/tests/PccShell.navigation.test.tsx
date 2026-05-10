import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { getPrimaryNavToggle, getPrimaryTabSelectionControl } from './shellSurfaceSelection';

// Phase 05 wave-b10 Prompt 04 — registry-driven primary-tab navigation.
// The shell `<main role="tabpanel">` now owns the Phase 05 panel marker
// (`data-pcc-active-surface-panel={activePrimaryTabId}`) and labels via
// `aria-labelledby="pcc-tab-${activePrimaryTabId}"`. Primary tabs are
// the sole `role="tab"` elements.

describe('PccShell navigation — Phase 05 grouped primary tabs', () => {
  it('renders all eight primary tab controls with matching dropdown toggles', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    for (const id of PCC_PRIMARY_TAB_IDS) {
      expect(getPrimaryTabSelectionControl(container, id), `primary tab ${id}`).not.toBeNull();
      expect(getPrimaryNavToggle(container, id), `dropdown toggle ${id}`).not.toBeNull();
    }
  });

  it('renders exactly eight role="tab" elements (no compat markers remain)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tabs = container.querySelectorAll('[data-pcc-horizontal-tabs] [role="tab"]');
    expect(tabs).toHaveLength(PCC_PRIMARY_TAB_IDS.length);
    expect(container.querySelector('[data-pcc-legacy-compat]')).toBeNull();
  });

  it('default activePrimaryTabId is project-home with exactly one selected tab and matching panel + aria-labelledby', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const projectHomeTab = getPrimaryTabSelectionControl(container, 'project-home');
    expect(projectHomeTab?.getAttribute('aria-selected')).toBe('true');
    const selectedTabs = container.querySelectorAll(
      '[data-pcc-horizontal-tabs] [role="tab"][aria-selected="true"]',
    );
    expect(selectedTabs).toHaveLength(1);
    const main = container.querySelector('main[role="tabpanel"]') as HTMLElement;
    expect(main.getAttribute('data-pcc-active-surface-panel')).toBe('project-home');
    expect(main.getAttribute('aria-labelledby')).toBe('pcc-tab-project-home');
  });

  it('clicking each primary tab updates aria-selected, panel marker, and aria-labelledby in lockstep', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const main = container.querySelector('main[role="tabpanel"]') as HTMLElement;
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryTabSelectionControl(container, tabId);
      expect(tab, `tab ${tabId} should render`).not.toBeNull();
      fireEvent.click(tab!);
      expect(tab!.getAttribute('aria-selected')).toBe('true');
      expect(main.getAttribute('data-pcc-active-surface-panel')).toBe(tabId);
      expect(main.getAttribute('aria-labelledby')).toBe(`pcc-tab-${tabId}`);
    }
  });

  it('opening Document Control menu and selecting a selectable module marks it active and keeps the parent tab selected', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getPrimaryTabSelectionControl(container, 'documents')!);
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const moduleItem = container.querySelector(
      '[data-pcc-module-nav-item="document-control-center"]',
    ) as HTMLButtonElement;
    fireEvent.click(moduleItem);
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const reopened = container.querySelector(
      '[data-pcc-module-nav-item="document-control-center"]',
    );
    expect(reopened?.getAttribute('data-pcc-module-active')).toBe('true');
    const documentsTab = getPrimaryTabSelectionControl(container, 'documents');
    expect(documentsTab?.getAttribute('aria-selected')).toBe('true');
  });

  it('selecting a non-selectable (deferred) module does not mark it active', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const item = container.querySelector(
      '[data-pcc-module-nav-item="drawing-model-center"]',
    ) as HTMLButtonElement;
    fireEvent.click(item);
    const stillThere = container.querySelector('[data-pcc-module-nav-item="drawing-model-center"]');
    expect(stillThere?.getAttribute('data-pcc-module-active')).toBe('false');
    const anyActive = container.querySelector(
      '[data-pcc-module-menu="documents"] [data-pcc-module-active="true"]',
    );
    expect(anyActive).toBeNull();
  });

  it("renders visible 'Document Control' label and no 'Documents' visible primary tab label", () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const labels = Array.from(
      container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-tab-id]'),
    ).map((el) => el.textContent?.trim());
    expect(labels).not.toContain('Documents');
    const documentsTab = getPrimaryTabSelectionControl(container, 'documents');
    expect(documentsTab?.textContent).toContain('Document Control');
  });

  // Phase 05 wave-b10 Prompt 05 — runtime guard: PCC navigation must
  // not mutate the URL, push history entries, or write to web storage
  // when the user clicks primary tabs or selects modules.
  it('navigating across primary tabs and selecting a module does not mutate URL, history, or storage', () => {
    const initialPathname = window.location.pathname;
    const initialSearch = window.location.search;
    const initialHistoryLength = window.history.length;
    const localStorageSnapshot = window.localStorage.length;
    const sessionStorageSnapshot = window.sessionStorage.length;

    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getPrimaryTabSelectionControl(container, 'core-tools')!);
    fireEvent.click(getPrimaryTabSelectionControl(container, 'documents')!);
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const moduleItem = container.querySelector(
      '[data-pcc-module-nav-item="document-control-center"]',
    ) as HTMLButtonElement;
    fireEvent.click(moduleItem);
    fireEvent.click(getPrimaryTabSelectionControl(container, 'cost-time')!);

    expect(window.location.pathname).toBe(initialPathname);
    expect(window.location.search).toBe(initialSearch);
    expect(window.history.length).toBe(initialHistoryLength);
    expect(window.localStorage.length).toBe(localStorageSnapshot);
    expect(window.sessionStorage.length).toBe(sessionStorageSnapshot);
  });
});
