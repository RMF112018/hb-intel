import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { getPrimaryNavToggle, getPrimaryTabSelectionControl } from './shellSurfaceSelection';

// Phase 05 wave-b10 Prompt 03 — registry-driven primary-tab + module
// dropdown navigation. The shell `<main role="tabpanel">` continues to
// own the legacy `data-pcc-active-surface-panel` marker for now;
// `aria-labelledby` is now keyed to the Phase 05 active primary tab id.
// Legacy `setActiveSurface` is no longer wired into the tab UI in this
// prompt — Prompt 04 migrates the router and dashboard surfaces.

describe('PccShell navigation — Phase 05 grouped primary tabs', () => {
  it('renders all eight primary tab controls with matching dropdown toggles', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    for (const id of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryTabSelectionControl(container, id);
      expect(tab, `primary tab ${id}`).not.toBeNull();
      const toggle = getPrimaryNavToggle(container, id);
      expect(toggle, `dropdown toggle ${id}`).not.toBeNull();
    }
  });

  it('default activePrimaryTabId is project-home with exactly one selected primary tab', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const projectHomeTab = getPrimaryTabSelectionControl(container, 'project-home');
    expect(projectHomeTab?.getAttribute('aria-selected')).toBe('true');
    const selectedTabs = container.querySelectorAll(
      '[data-pcc-horizontal-tabs] [role="tab"][aria-selected="true"]',
    );
    expect(selectedTabs.length).toBe(1);
  });

  it("clicking 'Core Tools' makes its primary tab active", () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const coreToolsTab = getPrimaryTabSelectionControl(container, 'core-tools')!;
    fireEvent.click(coreToolsTab);
    expect(coreToolsTab.getAttribute('aria-selected')).toBe('true');
  });

  it("clicking 'Document Control' makes its primary tab active", () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const documentsTab = getPrimaryTabSelectionControl(container, 'documents')!;
    fireEvent.click(documentsTab);
    expect(documentsTab.getAttribute('aria-selected')).toBe('true');
  });

  it('legacy shell panel marker remains present (Prompt 04 will migrate it)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const panel = container.querySelector('main[role="tabpanel"][data-pcc-active-surface-panel]');
    expect(panel).not.toBeNull();
    // Intentionally do NOT assert the marker value matches the active
    // primary tab — the legacy router/marker stays bound to
    // PccMvpSurfaceId until Prompt 04.
  });

  it('shell <main> aria-labelledby tracks the legacy active surface id during Prompt 03', () => {
    // Prompt 03 — `aria-labelledby` stays on the legacy `activeSurfaceId`
    // because PccSurfaceRouter and hero metadata still own the panel
    // content. Phase 05 primary-tab activations that map to a legacy
    // surface (project-home, documents) update `activeSurfaceId` via
    // the compatibility bridge; non-mapped primary tabs (core-tools,
    // cost-time, etc.) leave `activeSurfaceId` at its prior value.
    // Prompt 04 will migrate the labelledby reference to the Phase 05
    // primary tab id.
    const { container } = render(<PccApp forceMode="desktop" />);
    const main = container.querySelector('main[role="tabpanel"]') as HTMLElement;
    expect(main.getAttribute('aria-labelledby')).toBe('pcc-tab-project-home');
    fireEvent.click(getPrimaryTabSelectionControl(container, 'documents')!);
    expect(main.getAttribute('aria-labelledby')).toBe('pcc-tab-documents');
  });

  it('opening a primary tab module menu renders module items', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const menu = container.querySelector('[data-pcc-module-menu="documents"]');
    expect(menu).not.toBeNull();
    const items = container.querySelectorAll(
      '[data-pcc-module-menu="documents"] [data-pcc-module-nav-item]',
    );
    expect(items.length).toBeGreaterThan(0);
  });

  it('selecting a selectable module marks it active', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const item = container.querySelector(
      '[data-pcc-module-nav-item="document-control-center"]',
    ) as HTMLButtonElement;
    fireEvent.click(item);
    // Re-open the menu (selection closed it) and verify the active marker
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const reopened = container.querySelector(
      '[data-pcc-module-nav-item="document-control-center"]',
    );
    expect(reopened?.getAttribute('data-pcc-module-active')).toBe('true');
  });

  it('selecting a non-selectable (deferred) module does not mark it active', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    fireEvent.click(getPrimaryNavToggle(container, 'documents')!);
    const item = container.querySelector(
      '[data-pcc-module-nav-item="drawing-model-center"]',
    ) as HTMLButtonElement;
    fireEvent.click(item);
    // Menu stays open for non-selectable; verify still inactive
    const stillThere = container.querySelector('[data-pcc-module-nav-item="drawing-model-center"]');
    expect(stillThere?.getAttribute('data-pcc-module-active')).toBe('false');
    const anyActive = container.querySelector(
      '[data-pcc-module-menu="documents"] [data-pcc-module-active="true"]',
    );
    expect(anyActive).toBeNull();
  });

  it("no primary tab visible label is 'Documents'", () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const labels = Array.from(
      container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-tab-id]'),
    ).map((el) => el.textContent?.trim());
    expect(labels).not.toContain('Documents');
    const documentsTab = getPrimaryTabSelectionControl(container, 'documents');
    expect(documentsTab?.textContent).toContain('Document Control');
  });
});
