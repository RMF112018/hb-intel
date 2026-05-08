import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
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

  it('renders the hero visual surface and the hero/tab seam', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    expect(container.querySelector('[data-pcc-hero-surface]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-hero-tab-seam]')).not.toBeNull();
  });

  it('renders the canvas marker on a <main> element', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const canvases = container.querySelectorAll('[data-pcc-canvas]');
    expect(canvases.length).toBe(1);
    expect(canvases[0]?.tagName).toBe('MAIN');
  });

  // Wave-b2 Prompt 04: tablist / tab / tabpanel ARIA contract.
  // Wave 15A wave-b7 Prompt 01: shell <main> is the semantic active-panel
  // owner — the active-surface marker is rendered on the tabpanel itself,
  // not derived from card-level compatibility markers.
  it('wires the tablist/tab/tabpanel relationship via id, role, aria-labelledby, and aria-controls', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const main = container.querySelector('[data-pcc-canvas]') as HTMLElement | null;
    expect(main).not.toBeNull();
    expect(main!.getAttribute('id')).toBe('pcc-active-surface-panel');
    expect(main!.getAttribute('role')).toBe('tabpanel');
    expect(main!.getAttribute('aria-labelledby')).toBe('pcc-tab-project-home');

    // Every tab carries aria-controls pointing at the tabpanel id.
    const tabs = container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-tab-id]');
    expect(tabs.length).toBeGreaterThan(0);
    for (const tab of tabs) {
      expect(tab.getAttribute('aria-controls')).toBe('pcc-active-surface-panel');
    }

    // Shell <main> owns the active-surface panel marker for project-home by default.
    const shellPanels = container.querySelectorAll(
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
    );
    expect(shellPanels.length).toBe(1);
    expect(shellPanels[0]?.getAttribute('id')).toBe('pcc-active-surface-panel');
    expect(shellPanels[0]?.getAttribute('aria-labelledby')).toBe('pcc-tab-project-home');
    expect(shellPanels[0]?.hasAttribute('data-pcc-canvas')).toBe(true);
  });

  it('updates <main> aria-labelledby and shell active-panel marker after a Documents tab click', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const documentsTab = container.querySelector(
      '[data-pcc-tab-id="documents"]',
    ) as HTMLButtonElement | null;
    expect(documentsTab).not.toBeNull();
    fireEvent.click(documentsTab!);

    const main = container.querySelector('[data-pcc-canvas]') as HTMLElement | null;
    expect(main!.getAttribute('aria-labelledby')).toBe('pcc-tab-documents');
    expect(main!.getAttribute('data-pcc-active-surface-panel')).toBe('documents');
    const documentsShellPanels = container.querySelectorAll(
      'main[role="tabpanel"][data-pcc-active-surface-panel="documents"]',
    );
    expect(documentsShellPanels.length).toBe(1);
  });

  it('updates <main> aria-labelledby and shell active-panel marker after a Site Health tab click', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const siteHealthTab = container.querySelector(
      '[data-pcc-tab-id="site-health"]',
    ) as HTMLButtonElement | null;
    expect(siteHealthTab).not.toBeNull();
    fireEvent.click(siteHealthTab!);

    const main = container.querySelector('[data-pcc-canvas]') as HTMLElement | null;
    expect(main!.getAttribute('aria-labelledby')).toBe('pcc-tab-site-health');
    expect(main!.getAttribute('data-pcc-active-surface-panel')).toBe('site-health');
    const siteHealthShellPanels = container.querySelectorAll(
      'main[role="tabpanel"][data-pcc-active-surface-panel="site-health"]',
    );
    expect(siteHealthShellPanels.length).toBe(1);
  });

  // Wave-b2 Prompt 04: command-search affordance is purely informational.
  it('renders no <input type="search"> anywhere in the shell', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    expect(container.querySelectorAll('input[type="search"]').length).toBe(0);
  });

  it('command-search slot contains no focusable descendant in either variant', () => {
    for (const mode of ['standardLaptop', 'phone'] as const) {
      const { container, unmount } = render(<PccApp forceMode={mode} />);
      const slot = container.querySelector('[data-pcc-hero-command-search]');
      expect(slot, `slot should render at '${mode}'`).not.toBeNull();
      expect(slot!.querySelectorAll('input,button,a,select,textarea').length).toBe(0);
      expect(slot!.querySelectorAll('[tabindex="0"]').length).toBe(0);
      unmount();
    }
  });

  it('does not render the legacy phone-mode project-intel toggle', () => {
    const { container } = render(<PccApp forceMode="phone" />);
    expect(container.querySelector('[data-pcc-project-intel-toggle]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-intel-region]')).toBeNull();
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
