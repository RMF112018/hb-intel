import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApp } from '../PccApp';
import {
  PCC_RESPONSIVE_MODES,
  resolveResponsiveMode,
  type PccResponsiveMode,
} from '../layout/footprints';

const COMPACT_MODES = new Set<PccResponsiveMode>([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

describe('PccShell responsive behaviour (thin shell: hero + tabs + canvas)', () => {
  for (const mode of PCC_RESPONSIVE_MODES) {
    it(`renders the '${mode}' mode with the hero band, tablist, and bento mode markers`, () => {
      const { container } = render(<PccApp forceMode={mode} />);

      // Bento mode marker (preserved from prior contract).
      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid?.getAttribute('data-pcc-mode')).toBe(mode);

      // Hero band renders with the matching mode marker.
      const hero = container.querySelector('[data-pcc-project-hero-band]');
      expect(hero, `hero band should render at '${mode}'`).not.toBeNull();
      expect(hero?.getAttribute('data-pcc-mode')).toBe(mode);

      // Horizontal tabs render with the matching mode marker and density.
      const tablist = container.querySelector('[data-pcc-horizontal-tabs]');
      expect(tablist, `tablist should render at '${mode}'`).not.toBeNull();
      expect(tablist?.getAttribute('data-pcc-mode')).toBe(mode);
      expect(tablist?.getAttribute('data-pcc-tabs-density')).toBe(
        COMPACT_MODES.has(mode) ? 'compact' : 'comfortable',
      );
      const selectedTab = container.querySelector(
        '[data-pcc-horizontal-tabs] [data-pcc-tab-id][aria-selected="true"]',
      );
      expect(selectedTab, `active tab should be discoverable at '${mode}'`).not.toBeNull();

      // Thin-shell stamp.
      const shell = container.querySelector('[data-pcc-shell]');
      expect(shell?.getAttribute('data-pcc-shell')).toBe('thin');
      expect(shell?.getAttribute('data-pcc-shell-mode')).toBe(mode);
    });
  }

  it('keeps phone navigation visible and discoverable (no hidden-nav fallback)', () => {
    const { container } = render(<PccApp forceMode="phone" />);
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement | null;
    expect(tablist).not.toBeNull();
    expect(tablist?.getAttribute('aria-hidden')).not.toBe('true');
    expect(tablist?.hasAttribute('hidden')).toBe(false);

    const selectedTab = container.querySelector(
      '[data-pcc-horizontal-tabs] [data-pcc-tab-id][aria-selected="true"]',
    );
    expect(selectedTab).not.toBeNull();
  });
});

describe('resolveResponsiveMode 8-mode boundary contract', () => {
  // Mirrors `wave-b1/docs/04_BREAKPOINT_POLICY_SPECIFICATION.md` mandatory
  // boundary table. Every off-by-one boundary listed in the spec is asserted.
  const cases: Array<[number, PccResponsiveMode]> = [
    [479, 'phone'],
    [480, 'tabletPortrait'],
    [768, 'tabletPortrait'],
    [769, 'tabletLandscape'],
    [1024, 'tabletLandscape'],
    [1025, 'smallLaptop'],
    [1180, 'smallLaptop'],
    [1181, 'standardLaptop'],
    [1440, 'standardLaptop'],
    [1441, 'largeLaptop'],
    [1599, 'largeLaptop'],
    [1600, 'desktop'],
    [1919, 'desktop'],
    [1920, 'ultrawide'],
  ];

  it.each(cases)('width %d resolves to %s', (width, expected) => {
    expect(resolveResponsiveMode(width)).toBe(expected);
  });
});
