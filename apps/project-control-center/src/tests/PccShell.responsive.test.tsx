import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import {
  PCC_RESPONSIVE_MODES,
  resolveResponsiveMode,
  type PccResponsiveMode,
} from '../layout/footprints';
import { PCC_SHELL_SURFACE_HEADER_METADATA } from '../shell/surfaceHeaderMetadata';

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

  // Wave 15A wave-b7 Prompt 02 — shell hero metadata zones (summary, cues,
  // read-only cue) render at every responsive mode covered by the shell.
  // Per-surface and inert-content coverage lives in
  // PccProjectHeroBand.test.tsx; this is shell-composition presence-only
  // coverage under <PccApp forceMode={mode}> at every breakpoint. Density
  // and command-search variant are unit-covered in PccProjectHeroBand.test.tsx
  // and intentionally not duplicated here. (wave-b8 Prompt 04 extended this
  // to the full eight-mode loop.)
  it.each(PCC_RESPONSIVE_MODES)(
    'renders the shell hero surface metadata zones at "%s" mode',
    (mode) => {
      const { container, unmount } = render(<PccApp forceMode={mode} />);
      expect(container.querySelectorAll('[data-pcc-hero-surface-summary]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-pcc-hero-surface-cues]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-pcc-hero-read-only-cue]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-pcc-hero-command-search]')).toHaveLength(1);
      unmount();
    },
  );
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

/**
 * Wave 15A wave-b7 Prompt 03 — compatibility-bridge contract.
 *
 * - Shell `main[role="tabpanel"]` is the SEMANTIC active-panel owner
 *   (Prompt 01). The shell hero metadata switches in lockstep with
 *   `shell.activeSurfaceId`; tab clicks re-derive `heroViewModel` via
 *   `deriveShellHeroViewModel(profile, activeSurfaceId)` inside `PccApp`
 *   and the `<PccProjectHeroBand>` re-renders with the new metadata.
 * - Card-level `data-pcc-active-surface-panel` markers on surface
 *   command/header cards remain a DEPRECATED COMPATIBILITY MARKER. They
 *   are still rendered as direct bento children to keep the broad
 *   marker count >= 1 in shell-rendered trees and to avoid breaking
 *   adjacent surface tests that scope to the compatibility card.
 * - Future duplicate-card removal must update tests, e2e selectors,
 *   and evidence capture before demoting either marker.
 */
describe('PccShell hero metadata switches with the active tab (wave-b7 Prompt 03)', () => {
  // PCC SPFx workspace runs vitest with `globals: false`, so jsdom does
  // not auto-tear-down between tests. The switching tests below all render
  // `<PccApp>` and inspect markers globally (e.g. `[data-pcc-hero-summary
  // -item="mode"]`); without explicit cleanup, a prior test's DOM would
  // satisfy the next test's selector and mask a regression.
  afterEach(() => {
    cleanup();
  });

  function expectShellHeroMetadata(
    container: HTMLElement,
    expected: {
      readonly surfaceId: string;
      readonly secondaryTitle: string;
      readonly modeValue: string;
      readonly authorityValue: string;
      readonly cueId: string;
      readonly readOnlyCueIncludes: string;
    },
  ): void {
    expect(
      container
        .querySelector('main[role="tabpanel"][data-pcc-active-surface-panel]')
        ?.getAttribute('data-pcc-active-surface-panel'),
    ).toBe(expected.surfaceId);
    expect(container.querySelector('[data-pcc-hero-secondary-title]')?.textContent).toBe(
      expected.secondaryTitle,
    );

    const mode = container.querySelector('[data-pcc-hero-summary-item="mode"]');
    expect(mode?.textContent).toContain('Mode');
    expect(mode?.textContent).toContain(expected.modeValue);

    const authority = container.querySelector('[data-pcc-hero-summary-item="authority"]');
    expect(authority?.textContent).toContain('Authority');
    expect(authority?.textContent).toContain(expected.authorityValue);

    expect(
      container.querySelector(`[data-pcc-hero-surface-cue="${expected.cueId}"]`),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-hero-read-only-cue]')?.textContent).toContain(
      expected.readOnlyCueIncludes,
    );
  }

  it('default render shows Project Home metadata', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    expectShellHeroMetadata(container, {
      surfaceId: 'project-home',
      secondaryTitle: 'Project Home',
      modeValue: 'Command preview',
      authorityValue: 'Advisory only',
      cueId: 'hbi-boundary',
      readOnlyCueIncludes: 'no decisions, approvals, or writeback authority',
    });
  });

  it('clicking Documents switches metadata to Document control preview', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const documentsTab = container.querySelector(
      '[data-pcc-tab-id="documents"]',
    ) as HTMLButtonElement | null;
    expect(documentsTab).not.toBeNull();
    fireEvent.click(documentsTab!);

    expectShellHeroMetadata(container, {
      surfaceId: 'documents',
      secondaryTitle: 'Documents',
      modeValue: 'Document control preview',
      authorityValue: 'Navigation context only',
      cueId: 'external-files',
      readOnlyCueIncludes: 'no uploads, moves, deletes, or external launches',
    });
  });

  it('clicking Site Health switches metadata to Site health preview', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const siteHealthTab = container.querySelector(
      '[data-pcc-tab-id="site-health"]',
    ) as HTMLButtonElement | null;
    expect(siteHealthTab).not.toBeNull();
    fireEvent.click(siteHealthTab!);

    expectShellHeroMetadata(container, {
      surfaceId: 'site-health',
      secondaryTitle: 'Site Health',
      modeValue: 'Site health preview',
      authorityValue: 'Repair context only',
      cueId: 'repair-boundary',
      readOnlyCueIncludes: 'repair acknowledgements require governed source workflows',
    });
  });
});

describe('PccShell — all-eight-surface metadata switching (wave-b8 Prompt 02)', () => {
  it('switches hero metadata zones for every PCC_MVP_SURFACE_IDS tab click', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);

    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(
        `[data-pcc-horizontal-tabs] [data-pcc-tab-id="${id}"]`,
      ) as HTMLButtonElement | null;
      expect(tab, `tab '${id}' should render`).not.toBeNull();
      fireEvent.click(tab!);

      const shellPanel = container.querySelector(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${id}"]`,
      );
      expect(shellPanel, `shell panel must own active surface '${id}'`).not.toBeNull();

      const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[id];
      const surface = PCC_MVP_SURFACES[id];

      const secondaryTitle = container.querySelector('[data-pcc-hero-secondary-title]');
      expect(secondaryTitle?.textContent).toBe(surface.displayName);

      const summaryItems = container.querySelectorAll('[data-pcc-hero-summary-item]');
      expect(summaryItems).toHaveLength(metadata.surfaceSummaryItems.length);

      const summaryItemIds = Array.from(summaryItems).map((n) =>
        n.getAttribute('data-pcc-hero-summary-item'),
      );
      expect(summaryItemIds).toEqual(metadata.surfaceSummaryItems.map((s) => s.id));

      const cues = container.querySelectorAll('[data-pcc-hero-surface-cue]');
      expect(cues).toHaveLength(metadata.surfaceCues.length);

      const cueIds = Array.from(cues).map((n) => n.getAttribute('data-pcc-hero-surface-cue'));
      expect(cueIds).toEqual(metadata.surfaceCues.map((c) => c.id));

      const readOnlyCue = container.querySelector('[data-pcc-hero-read-only-cue]');
      expect(readOnlyCue?.textContent).toBe(metadata.readOnlyCue);
    }
  });
});
