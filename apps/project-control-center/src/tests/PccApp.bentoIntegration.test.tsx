import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';

// Wave 15A wave-b9 Prompt 04 + Prompt 4B-01 — bifurcated surface sets
// after the runtime duplicate-header-card removal passes. Compatibility-
// card surfaces still emit a card-level
// `[data-pcc-card][data-pcc-active-surface-panel]` marker; shell-only
// surfaces no longer do. Project Home moved to the shell-only set after
// `PccProjectIntelligenceCard` was removed.
const SURFACES_WITH_COMPATIBILITY_CARD: readonly PccMvpSurfaceId[] = [
  'project-readiness',
  'approvals',
  'site-health',
  'documents',
];

const SURFACES_WITH_SHELL_ONLY_PANEL: readonly PccMvpSurfaceId[] = [
  'project-home',
  'team-and-access',
  'external-systems',
  'control-center-settings',
];

function expectsCompatibilityCard(surfaceId: PccMvpSurfaceId): boolean {
  return SURFACES_WITH_COMPATIBILITY_CARD.includes(surfaceId);
}

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

describe('PccApp bento integration — all active surfaces direct-child guardrail (wave-b7 Prompt 04)', () => {
  // PCC SPFx vitest runs with `globals: false`, so jsdom does not auto
  // tear down between tests. The per-surface tests below all render
  // <PccApp> and click a tab; without explicit cleanup, prior-test DOM
  // would satisfy queries in the next test and mask regressions. Scope
  // the cleanup to this describe block so the legacy default-render
  // tests above keep their existing per-test container scoping.
  afterEach(() => {
    cleanup();
  });

  function renderAppOnSurface(surfaceId: PccMvpSurfaceId): HTMLElement {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tab = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
    expect(tab, `tab for '${surfaceId}' must exist`).not.toBeNull();
    fireEvent.click(tab!);
    return container;
  }

  function getShellPanel(container: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
    // Use querySelectorAll + toHaveLength(1) so the helper proves
    // EXACTLY one shell active panel exists for the active surface.
    // querySelector would silently accept a duplicate render and only
    // surface the marker on the first match.
    const panels = container.querySelectorAll(
      `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
    );
    expect(panels, `surface '${surfaceId}' must mount exactly one shell active panel`).toHaveLength(
      1,
    );
    const panel = panels[0]!;
    expect(panel.tagName).toBe('MAIN');
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(`pcc-tab-${surfaceId}`);
    return panel as HTMLElement;
  }

  function getBentoFromShellPanel(panel: HTMLElement, surfaceId: PccMvpSurfaceId): HTMLElement {
    const bento = panel.querySelector('[data-pcc-bento-grid]');
    expect(bento, `surface '${surfaceId}' shell panel must contain bento grid`).not.toBeNull();
    return bento as HTMLElement;
  }

  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`'${surfaceId}' renders cards as direct bento children with no nested card trees`, () => {
      const container = renderAppOnSurface(surfaceId);
      const panel = getShellPanel(container, surfaceId);
      const bento = getBentoFromShellPanel(panel, surfaceId);

      const cards = Array.from(bento.querySelectorAll('[data-pcc-card]'));
      expect(cards.length, `surface '${surfaceId}' must render at least one card`).toBeGreaterThan(
        0,
      );

      const nestedCards = bento.querySelectorAll('[data-pcc-card] [data-pcc-card]');
      expect(
        nestedCards.length,
        `surface '${surfaceId}' must not render nested [data-pcc-card] descendants`,
      ).toBe(0);

      for (const card of cards) {
        const title = card.querySelector('h2, h3, h4')?.textContent?.trim() ?? '(untitled)';
        expect(
          card.parentElement,
          `surface '${surfaceId}' card '${title}' must be a direct child of [data-pcc-bento-grid]`,
        ).toBe(bento);
        expect(
          card.getAttribute('data-pcc-card-tier'),
          `surface '${surfaceId}' card '${title}' tier`,
        ).toBeTruthy();
        expect(
          card.getAttribute('data-pcc-card-region'),
          `surface '${surfaceId}' card '${title}' region`,
        ).toBeTruthy();
        expect(
          card.getAttribute('data-pcc-footprint'),
          `surface '${surfaceId}' card '${title}' footprint`,
        ).toBeTruthy();
        expect(
          Number(card.getAttribute('data-pcc-column-span')),
          `surface '${surfaceId}' card '${title}' column-span must be positive`,
        ).toBeGreaterThan(0);
        expect(
          Number(card.getAttribute('data-pcc-row-span')),
          `surface '${surfaceId}' card '${title}' row-span must be positive`,
        ).toBeGreaterThan(0);
      }

      const compatibilityCards = Array.from(bento.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${surfaceId}"]`),
      );
      const expectedCount = expectsCompatibilityCard(surfaceId) ? 1 : 0;
      expect(
        compatibilityCards,
        expectedCount === 1
          ? `surface '${surfaceId}' must keep one direct bento-child compatibility active-panel card`
          : `surface '${surfaceId}' must NOT keep a direct bento-child compatibility active-panel card after Phase 04`,
      ).toHaveLength(expectedCount);
    });
  }
});
