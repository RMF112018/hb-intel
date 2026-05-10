import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { getPrimaryTabSelectionControl } from './shellSurfaceSelection';

// Phase 05 wave-b10 Prompt 04 — every PCC primary tab is shell-only.
// The shell `<main role="tabpanel">` is the sole carrier of
// `data-pcc-active-surface-panel`; no bento-child card emits the marker
// on any primary tab.

describe('PccApp bento integration (regression)', () => {
  it('every dashboard card is a direct child of the bento grid', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid should render').not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(
        card.parentElement === grid,
        `card '${card.getAttribute('data-pcc-footprint')}' must be a direct child of the bento grid`,
      ).toBe(true);
    }
  });

  it('cards under the grid receive a non-zero column span and inline gridColumn style', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(grid).not.toBeNull();
    const cards = Array.from(grid.querySelectorAll('[data-pcc-card]')) as HTMLElement[];
    expect(cards.length, 'at least one card should render under the bento grid').toBeGreaterThan(0);
    for (const card of cards) {
      const declared = Number(card.getAttribute('data-pcc-column-span'));
      expect(
        declared,
        `card '${card.getAttribute('data-pcc-footprint')}' should have a positive column span`,
      ).toBeGreaterThan(0);
      expect(card.style.gridColumn).toMatch(/^span \d+/);
    }
  });

  it('renders without forceMode and still mounts the bento grid', () => {
    const { container } = render(<PccApp />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
  });
});

describe('PccApp bento integration — every Phase 05 primary tab keeps the direct-child invariant', () => {
  // PCC SPFx vitest runs with `globals: false`, so jsdom does not auto
  // tear down between tests. The per-primary-tab tests below all render
  // <PccApp> and click a tab; without explicit cleanup, prior-test DOM
  // would satisfy queries in the next test and mask regressions.
  afterEach(() => {
    cleanup();
  });

  function renderAppOnPrimaryTab(tabId: (typeof PCC_PRIMARY_TAB_IDS)[number]): HTMLElement {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tab = getPrimaryTabSelectionControl(container, tabId);
    expect(tab, `primary tab for '${tabId}' must exist`).not.toBeNull();
    fireEvent.click(tab!);
    return container;
  }

  function getShellPanel(
    container: HTMLElement,
    tabId: (typeof PCC_PRIMARY_TAB_IDS)[number],
  ): HTMLElement {
    const panels = container.querySelectorAll(
      `main[role="tabpanel"][data-pcc-active-surface-panel="${tabId}"]`,
    );
    expect(panels, `primary tab '${tabId}' must mount exactly one shell active panel`).toHaveLength(
      1,
    );
    const panel = panels[0]!;
    expect(panel.tagName).toBe('MAIN');
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(`pcc-tab-${tabId}`);
    return panel as HTMLElement;
  }

  function getBentoFromShellPanel(
    panel: HTMLElement,
    tabId: (typeof PCC_PRIMARY_TAB_IDS)[number],
  ): HTMLElement {
    const bento = panel.querySelector('[data-pcc-bento-grid]');
    expect(bento, `primary tab '${tabId}' shell panel must contain bento grid`).not.toBeNull();
    return bento as HTMLElement;
  }

  for (const tabId of PCC_PRIMARY_TAB_IDS) {
    it(`'${tabId}' renders cards as direct bento children with no nested card trees`, () => {
      const container = renderAppOnPrimaryTab(tabId);
      const panel = getShellPanel(container, tabId);
      const bento = getBentoFromShellPanel(panel, tabId);

      const cards = Array.from(bento.querySelectorAll('[data-pcc-card]'));
      expect(cards.length, `primary tab '${tabId}' must render at least one card`).toBeGreaterThan(
        0,
      );

      const nestedCards = bento.querySelectorAll('[data-pcc-card] [data-pcc-card]');
      expect(
        nestedCards.length,
        `primary tab '${tabId}' must not render nested [data-pcc-card] descendants`,
      ).toBe(0);

      for (const card of cards) {
        const title = card.querySelector('h2, h3, h4')?.textContent?.trim() ?? '(untitled)';
        expect(
          card.parentElement,
          `primary tab '${tabId}' card '${title}' must be a direct child of [data-pcc-bento-grid]`,
        ).toBe(bento);
        expect(
          card.getAttribute('data-pcc-card-tier'),
          `primary tab '${tabId}' card '${title}' tier`,
        ).toBeTruthy();
        expect(
          card.getAttribute('data-pcc-card-region'),
          `primary tab '${tabId}' card '${title}' region`,
        ).toBeTruthy();
        expect(
          card.getAttribute('data-pcc-footprint'),
          `primary tab '${tabId}' card '${title}' footprint`,
        ).toBeTruthy();
        expect(
          Number(card.getAttribute('data-pcc-column-span')),
          `primary tab '${tabId}' card '${title}' column-span must be positive`,
        ).toBeGreaterThan(0);
        expect(
          Number(card.getAttribute('data-pcc-row-span')),
          `primary tab '${tabId}' card '${title}' row-span must be positive`,
        ).toBeGreaterThan(0);
      }

      const compatibilityCards = Array.from(bento.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${tabId}"]`),
      );
      expect(
        compatibilityCards,
        `primary tab '${tabId}' must NOT render a direct bento-child card carrying [data-pcc-active-surface-panel] (every Phase 05 primary tab is shell-owned)`,
      ).toHaveLength(0);
    });
  }
});
