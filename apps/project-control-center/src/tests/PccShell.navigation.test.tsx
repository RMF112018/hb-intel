import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { getSurfaceSelectionControl } from './shellSurfaceSelection';

// Wave 15A wave-b9 Prompt 04 + Prompt 4B-01 + Prompt 4B-05 + Prompt 4B-08
// — bifurcated surface sets after the runtime duplicate-header-card
// removal passes. Project Home moved out of the compatibility-card set
// after `PccProjectIntelligenceCard` was removed; Approvals moved out
// after `HomeCard` was removed (its metric pills absorbed into
// `QueueCard`); Site Health moved out after `PccSiteHealthOverviewCard`
// was removed (its overview metrics absorbed into
// `PccSiteHealthChecksCard`).
const SURFACES_WITH_COMPATIBILITY_CARD: readonly PccMvpSurfaceId[] = [
  'project-readiness',
  'documents',
];

function expectsCompatibilityCard(surfaceId: PccMvpSurfaceId): boolean {
  return SURFACES_WITH_COMPATIBILITY_CARD.includes(surfaceId);
}

describe('PccShell navigation + state (horizontal tabs)', () => {
  it('renders four top-level tabs and defaults to project-home', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    for (const id of ['project-home', 'documents', 'project-readiness', 'approvals'] as const) {
      const tab = container.querySelector(`[data-pcc-horizontal-tabs] [data-pcc-tab-id="${id}"]`);
      expect(tab, `tab for '${id}' should render`).not.toBeNull();
    }
    const initialPanel = container.querySelector(
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
    );
    expect(initialPanel, 'project-home is the default shell active-surface panel').not.toBeNull();
    const initialTab = container.querySelector('[data-pcc-tab-id="project-home"]');
    expect(initialTab?.getAttribute('aria-selected')).toBe('true');
    expect(initialTab?.getAttribute('data-pcc-tab-active')).toBe('true');
  });

  for (const id of PCC_MVP_SURFACE_IDS) {
    it(`clicking the '${id}' tab updates aria-selected and the active surface panel`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const target = getSurfaceSelectionControl(container, id);
      expect(target, `tab for '${id}' should exist`).toBeDefined();
      fireEvent.click(target!);

      // 1. one top-level tab remains selected; child surfaces label the panel
      // via aria-labelledby instead of staying visually selected peers.
      const selectedTabs = Array.from(
        container.querySelectorAll('[data-pcc-horizontal-tabs] [role="tab"][aria-selected="true"]'),
      );
      expect(selectedTabs.length).toBeGreaterThan(0);

      // 2. shell <main> owns the active-surface panel marker for the clicked
      //    surface. Wave 15A wave-b7 Prompt 01 — the broad
      //    `[data-pcc-active-surface-panel]` count may legitimately be > 1
      //    in shell-rendered trees because surface command cards still emit
      //    a card-level compatibility marker; the semantic owner is shell.
      const shellPanels = container.querySelectorAll(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${id}"]`,
      );
      expect(shellPanels).toHaveLength(1);
      const shellPanel = shellPanels[0]!;
      expect(shellPanel.getAttribute('id')).toBe('pcc-active-surface-panel');
      expect(shellPanel.getAttribute('aria-labelledby')).toBe(`pcc-tab-${id}`);

      // 3. shell panel contains [data-pcc-bento-grid]. Wave 15A wave-b9
      //    Prompt 04 bifurcates surfaces: SURFACES_WITH_COMPATIBILITY_CARD
      //    still emit a direct-child `[data-pcc-card][data-pcc-active-
      //    surface-panel]` marker, while SURFACES_WITH_SHELL_ONLY_PANEL no
      //    longer do across any branch (ready / loading / error).
      const bento = shellPanel.querySelector('[data-pcc-bento-grid]') as HTMLElement | null;
      expect(bento, `shell panel for '${id}' must contain [data-pcc-bento-grid]`).not.toBeNull();
      const compatibilityCards = Array.from(bento!.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${id}"]`),
      );
      const expectedCount = expectsCompatibilityCard(id) ? 1 : 0;
      expect(compatibilityCards).toHaveLength(expectedCount);
      const directCards = Array.from(bento!.children).filter((child) =>
        child.matches('[data-pcc-card]'),
      );
      expect(
        directCards.length,
        `surface '${id}' must still render at least one direct-child card`,
      ).toBeGreaterThan(0);

      // 4. The hero band (rendered as a sibling of the shell <main>, not inside
      //    it) carries the displayName as its secondary title for every surface.
      //    Wave 15A wave-b9 Prompt 04 — for SURFACES_WITH_COMPATIBILITY_CARD
      //    the panel's first card still emits an eyebrow=displayName, but for
      //    SURFACES_WITH_SHELL_ONLY_PANEL no card inside the panel carries it.
      //    Asserting against `container.textContent` (which includes the hero
      //    band) holds for both classes; the previous narrower
      //    `shellPanel.textContent` assertion silently coupled to the doomed
      //    duplicate header cards.
      const surface = PCC_MVP_SURFACES[id];
      expect(container.textContent).toContain(surface.displayName);

      // Hero owns surface description; assert the marker is present and non-empty.
      const heroDescription = container.querySelector('[data-pcc-hero-surface-description]');
      expect(heroDescription).not.toBeNull();
      expect(heroDescription?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });
  }

  it('tab buttons are not disabled', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tabs = Array.from(
      container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-tab-id]'),
    ) as HTMLButtonElement[];
    for (const tab of tabs) {
      expect(tab.disabled).toBe(false);
    }
  });

  it('ArrowLeft / ArrowRight / Home / End move focus and auto-select per tablist contract', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    const initialActive = container.querySelector('[data-pcc-tab-id][aria-selected="true"]');
    expect(initialActive?.getAttribute('data-pcc-tab-id')).toBe('project-home');

    // ArrowRight from first → second surface auto-selects.
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe('documents');
    expect(
      container
        .querySelector('main[role="tabpanel"][data-pcc-active-surface-panel]')
        ?.getAttribute('data-pcc-active-surface-panel'),
    ).toBe('documents');

    // End → last surface.
    fireEvent.keyDown(tablist, { key: 'End' });
    const lastId: PccMvpSurfaceId = 'approvals';
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe(lastId);
    expect(
      container
        .querySelector('main[role="tabpanel"][data-pcc-active-surface-panel]')
        ?.getAttribute('data-pcc-active-surface-panel'),
    ).toBe(lastId);

    // Home → first surface.
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe('project-home');

    // ArrowLeft from first → wraps to last.
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe(lastId);
  });

  it('Enter and Space activate tabs once and keep selected-tab/panel ids aligned', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const documentsTab = container.querySelector(
      '[data-pcc-tab-id="documents"]',
    ) as HTMLButtonElement;
    fireEvent.keyDown(documentsTab, { key: 'Enter' });
    fireEvent.keyUp(documentsTab, { key: 'Enter' });

    const selectedAfterEnter = container.querySelector('[data-pcc-tab-id][aria-selected="true"]');
    const panelAfterEnter = container.querySelector(
      'main[role="tabpanel"][data-pcc-active-surface-panel]',
    );
    expect(selectedAfterEnter?.getAttribute('data-pcc-tab-id')).toBe('documents');
    expect(panelAfterEnter?.getAttribute('data-pcc-active-surface-panel')).toBe('documents');

    const approvalsTab = container.querySelector(
      '[data-pcc-tab-id="approvals"]',
    ) as HTMLButtonElement;
    fireEvent.keyDown(approvalsTab, { key: ' ' });
    fireEvent.keyUp(approvalsTab, { key: ' ' });

    const selectedAfterSpace = container.querySelector('[data-pcc-tab-id][aria-selected="true"]');
    const panelAfterSpace = container.querySelector(
      'main[role="tabpanel"][data-pcc-active-surface-panel]',
    );
    expect(selectedAfterSpace?.getAttribute('data-pcc-tab-id')).toBe('approvals');
    expect(panelAfterSpace?.getAttribute('data-pcc-active-surface-panel')).toBe('approvals');
  });

  it('clicking a tab activates it and updates the panel + hero secondary title and description', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const documentsTab = container.querySelector(
      '[data-pcc-tab-id="documents"]',
    ) as HTMLButtonElement;
    fireEvent.click(documentsTab);
    expect(documentsTab.getAttribute('aria-selected')).toBe('true');
    expect(
      container.querySelector('main[role="tabpanel"][data-pcc-active-surface-panel="documents"]'),
    ).not.toBeNull();
    expect(
      container.querySelector(
        'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
      ),
    ).toBeNull();
    const secondary = container.querySelector('[data-pcc-hero-secondary-title]');
    expect(secondary?.textContent).toBe('Documents');
    const description = container.querySelector('[data-pcc-hero-surface-description]');
    expect(description?.textContent).toBe(
      'Project document access posture across SharePoint, OneDrive, and external platforms.',
    );
  });
});
