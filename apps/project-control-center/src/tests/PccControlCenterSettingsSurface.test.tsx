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
    <PccBentoGrid forceMode="wideDesktop">
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
