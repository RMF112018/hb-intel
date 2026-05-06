/**
 * Control Center Settings — composition, bento direct-child invariant,
 * sole active-panel ownership, hierarchy promotion, and additive scope
 * markers. First test coverage for this surface (test-gap fill).
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccControlCenterSettingsSurface } from '../surfaces/controlCenterSettings/PccControlCenterSettingsSurface';

afterEach(() => {
  cleanup();
});

function renderSurface() {
  return render(
    <PccBentoGrid forceMode="desktop">
      <PccControlCenterSettingsSurface />
    </PccBentoGrid>,
  );
}

describe('Control Center Settings — composition + bento invariants', () => {
  it('renders every card as a direct child of the bento grid', () => {
    const { container } = renderSurface();
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

  it('emits exactly one [data-pcc-active-surface-panel="control-center-settings"]', () => {
    const { container } = renderSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('control-center-settings');
  });

  it('header card emits data-pcc-card-hierarchy="primary"', () => {
    const { container } = renderSurface();
    const headerPanel = container.querySelector(
      '[data-pcc-active-surface-panel="control-center-settings"]',
    );
    expect(headerPanel, 'header card should render').not.toBeNull();
    expect(headerPanel?.getAttribute('data-pcc-card-hierarchy')).toBe('primary');
  });
});

// Wave 15A wave-b3 Prompt 05 — tier/region/footprint contract per
// 02_SURFACE_CARD_INVENTORY_MATRIX.md.
describe('Control Center Settings — wave-b3 tier/region contract', () => {
  it('overview card is Tier 1 command with an h2 heading and retains hierarchy="primary"', () => {
    const { container } = renderSurface();
    const overview = container.querySelector(
      '[data-pcc-active-surface-panel="control-center-settings"]',
    );
    expect(overview, 'overview card should render').not.toBeNull();
    expect(overview!.getAttribute('data-pcc-card-tier')).toBe('tier1');
    expect(overview!.getAttribute('data-pcc-card-region')).toBe('command');
    expect(overview!.getAttribute('data-pcc-card-hierarchy')).toBe('primary');
    expect(overview!.querySelector('h2')).not.toBeNull();
  });

  it('scope-lanes card is Tier 2 detail with footprint="detail"', () => {
    const { container } = renderSurface();
    const scopeGrid = container.querySelector('[data-pcc-settings-scope-grid]');
    expect(scopeGrid, 'scope grid should render').not.toBeNull();
    const card = scopeGrid!.closest('[data-pcc-card]');
    expect(card, 'scope grid should be wrapped in a card').not.toBeNull();
    expect(card!.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card!.getAttribute('data-pcc-card-region')).toBe('detail');
    expect(card!.getAttribute('data-pcc-footprint')).toBe('detail');
  });

  it('missing-setup card is tier="state" with footprint="wide"', () => {
    const { container } = renderSurface();
    // The missing-setup card hosts the third <PccDashboardCard> (with a
    // PccPreviewState `state="missing-config"` body); pick it by tier
    // marker so the assertion is robust against future order changes.
    const stateCards = Array.from(
      container.querySelectorAll<HTMLElement>('[data-pcc-card][data-pcc-card-tier="state"]'),
    );
    expect(stateCards.length).toBe(1);
    const card = stateCards[0]!;
    expect(card.getAttribute('data-pcc-card-region')).toBe('state');
    expect(card.getAttribute('data-pcc-footprint')).toBe('wide');
  });
});

describe('Control Center Settings — scope-cell structural markers', () => {
  it('renders each of the four scope cells with data-pcc-settings-scope-id and state="preview"', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-settings-scope-grid]');
    expect(grid, 'scope grid should render').not.toBeNull();

    for (const id of ['project', 'site', 'persona', 'integration']) {
      const cell = grid!.querySelector(`[data-pcc-settings-scope-id="${id}"]`);
      expect(cell, `scope cell '${id}' should render`).not.toBeNull();
      expect(cell?.getAttribute('data-pcc-settings-scope-state')).toBe('preview');
    }
  });
});

describe('Control Center Settings — read-only surface guard', () => {
  it('renders no enabled buttons across the surface', () => {
    const { container } = renderSurface();
    const buttons = container.querySelectorAll('button');
    for (const btn of Array.from(buttons)) {
      const ariaDisabled = btn.getAttribute('aria-disabled') === 'true';
      expect(
        (btn as HTMLButtonElement).disabled || ariaDisabled,
        `enabled button found in settings surface: ${btn.outerHTML.slice(0, 80)}`,
      ).toBe(true);
    }
  });

  it('renders no anchor with an http(s) href', () => {
    const { container } = renderSurface();
    const anchors = container.querySelectorAll('a[href]');
    for (const a of Array.from(anchors)) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });
});
