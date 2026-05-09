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
import { getSurfaceSelectionControl } from './shellSurfaceSelection';

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
    const siteHealthTab = getSurfaceSelectionControl(container, 'site-health');
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

  it('keeps child-surface aria-labelledby resolvable when dropdown is closed', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const siteHealthTab = getSurfaceSelectionControl(container, 'site-health');
    expect(siteHealthTab).not.toBeNull();
    fireEvent.click(siteHealthTab!);

    const main = container.querySelector('[data-pcc-canvas]') as HTMLElement | null;
    expect(main?.getAttribute('aria-labelledby')).toBe('pcc-tab-site-health');
    const labelNode = container.querySelector('#pcc-tab-site-health');
    expect(labelNode, 'active child label id should exist while menu is closed').not.toBeNull();
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

  // Wave 15A wave-b9 Prompt 4B-02 — production shell hero zones
  // (heroHighlights row + governanceMicrocopy row) render at every
  // responsive mode covered by the shell. Per-surface and inert-content
  // coverage lives in PccProjectHeroBand.test.tsx; this is
  // shell-composition presence-only coverage under
  // <PccApp forceMode={mode}> at every breakpoint. Density and
  // command-search variant are unit-covered in PccProjectHeroBand.test.tsx
  // and intentionally not duplicated here.
  it.each(PCC_RESPONSIVE_MODES)('renders the shell hero production zones at "%s" mode', (mode) => {
    const { container, unmount } = render(<PccApp forceMode={mode} />);
    expect(container.querySelectorAll('[data-pcc-hero-highlights]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-hero-governance-microcopy]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-hero-command-search]')).toHaveLength(1);
    unmount();
  });

  // Wave 15A wave-b9 Prompt 4B-03 — explicit shell composition order:
  // tabs precede the hero band; the hero band precedes the active-surface
  // tabpanel main. Asserted once at standardLaptop because per-mode
  // presence is already covered by the it.each loops above; per the
  // prompt's "If full eight-mode DOM-order testing is too noisy" guidance.
  // Visual order on Grid containers depends on grid-template-areas, which
  // jsdom does not reliably evaluate; the visual order is enforced by the
  // CSS template-area edits in PccProjectHeroBand.module.css (default and
  // phone modes). This test locks DOM/source order only, which is the
  // accessibility-relevant order (focus / reading order).
  it('renders shell components in tabs → hero → main DOM order (Wave 15A wave-b9 Prompt 4B-03)', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const tabs = container.querySelector('[data-pcc-horizontal-tabs]');
    const hero = container.querySelector('[data-pcc-project-hero-band]');
    const main = container.querySelector('main[role="tabpanel"]#pcc-active-surface-panel');
    expect(tabs, '[data-pcc-horizontal-tabs] tablist must render').not.toBeNull();
    expect(hero, '[data-pcc-project-hero-band] hero must render').not.toBeNull();
    expect(main, 'main[role="tabpanel"] active-surface panel must render').not.toBeNull();
    // tabs precedes hero
    expect(
      tabs!.compareDocumentPosition(hero!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'tablist must precede the hero band in DOM order',
    ).toBeTruthy();
    // hero precedes main
    expect(
      hero!.compareDocumentPosition(main!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'hero band must precede the active-surface tabpanel main in DOM order',
    ).toBeTruthy();
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

  // Wave 15A wave-b9 Prompt 4B-02 — the production-visible hero band is
  // `heroHighlights` + `governanceMicrocopy`. Helper resolves expected
  // ids from canonical metadata so per-surface tests only declare the
  // surface id and any extra assertions (e.g. project-facts row).
  function expectShellHeroProductionBand(
    container: HTMLElement,
    expected: {
      readonly surfaceId: keyof typeof PCC_SHELL_SURFACE_HEADER_METADATA;
      readonly secondaryTitle: string;
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

    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA[expected.surfaceId];

    const highlightZone = container.querySelector('[data-pcc-hero-highlights]');
    expect(highlightZone).not.toBeNull();
    const highlights = highlightZone!.querySelectorAll('[data-pcc-hero-highlight]');
    expect(highlights).toHaveLength(metadata.heroHighlights.length);
    metadata.heroHighlights.forEach((expectedHighlight, index) => {
      const node = highlights[index]!;
      expect(node.getAttribute('data-pcc-hero-highlight')).toBe(expectedHighlight.id);
      expect(node.textContent).toContain(expectedHighlight.label);
      expect(node.textContent).toContain(expectedHighlight.value);
    });

    const microcopyZone = container.querySelector('[data-pcc-hero-governance-microcopy]');
    expect(microcopyZone).not.toBeNull();
    const microcopyItems = microcopyZone!.querySelectorAll(
      '[data-pcc-hero-governance-microcopy-item]',
    );
    expect(microcopyItems).toHaveLength(metadata.governanceMicrocopy.length);
    metadata.governanceMicrocopy.forEach((expectedMicrocopy, index) => {
      const node = microcopyItems[index]!;
      expect(node.getAttribute('data-pcc-hero-governance-microcopy-item')).toBe(
        expectedMicrocopy.id,
      );
      expect(node.textContent).toBe(expectedMicrocopy.text);
    });
  }

  it('default render shows Project Home production hero band and surfaces the global Client fact', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    expectShellHeroProductionBand(container, {
      surfaceId: 'project-home',
      secondaryTitle: 'Project Home',
    });
    // Wave 15A wave-b9 Prompt 4B-01 — Client absorbed into the existing
    // global project-facts row after `PccProjectIntelligenceCard` was
    // removed. The Project Home hero must surface a `<dt>Client</dt>`
    // pulled from `viewModel.clientDisplay` (SAMPLE_PROJECT_PROFILE).
    const clientCell = container.querySelector('[data-pcc-hero-fact-client]');
    expect(clientCell, 'Project Home hero must render the Client fact').not.toBeNull();
    expect(clientCell!.querySelector('dt')?.textContent).toBe('Client');
    expect(clientCell!.querySelector('dd')?.textContent).toBe('Sample Owner LLC');
  });

  it('clicking Documents switches the production hero band to Documents and the global Client fact persists (proves Client is global, not project-home-scoped)', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const documentsTab = container.querySelector(
      '[data-pcc-tab-id="documents"]',
    ) as HTMLButtonElement | null;
    expect(documentsTab).not.toBeNull();
    fireEvent.click(documentsTab!);

    expectShellHeroProductionBand(container, {
      surfaceId: 'documents',
      secondaryTitle: 'Documents',
    });
    // Wave 15A wave-b9 Prompt 4B-01 — Client follows the same global
    // pattern as Location / Estimated value / Scheduled completion /
    // Project stage. After switching tabs the Client fact must still
    // render in the hero with the same value.
    const clientCell = container.querySelector('[data-pcc-hero-fact-client]');
    expect(
      clientCell,
      'Client fact must persist on non-project-home surfaces (global by design)',
    ).not.toBeNull();
    expect(clientCell!.querySelector('dd')?.textContent).toBe('Sample Owner LLC');
  });

  it('clicking Site Health switches the production hero band to Site Health', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const siteHealthTab = getSurfaceSelectionControl(container, 'site-health');
    expect(siteHealthTab).not.toBeNull();
    fireEvent.click(siteHealthTab!);

    expectShellHeroProductionBand(container, {
      surfaceId: 'site-health',
      secondaryTitle: 'Site Health',
    });
  });

  it('clicking Team & Access switches the production hero band to Team & Access', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const teamTab = getSurfaceSelectionControl(container, 'team-and-access');
    expect(teamTab).not.toBeNull();
    fireEvent.click(teamTab!);

    expectShellHeroProductionBand(container, {
      surfaceId: 'team-and-access',
      secondaryTitle: 'Team & Access',
    });
  });
});

describe('PccShell — all-eight-surface metadata switching (wave-b8 Prompt 02)', () => {
  it('switches hero metadata zones for every PCC_MVP_SURFACE_IDS tab click', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);

    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = getSurfaceSelectionControl(container, id);
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

      // Wave 15A wave-b9 Prompt 4B-02 — production hero band assertions.
      // The legacy `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue`
      // metadata fields remain populated and are asserted at the
      // metadata-object level in projectShellViewModel.test.ts; the
      // shell-rendered switching contract now lives on the heroHighlights
      // and governanceMicrocopy zones.
      const highlights = container.querySelectorAll('[data-pcc-hero-highlight]');
      expect(highlights).toHaveLength(metadata.heroHighlights.length);

      const highlightIds = Array.from(highlights).map((n) =>
        n.getAttribute('data-pcc-hero-highlight'),
      );
      expect(highlightIds).toEqual(metadata.heroHighlights.map((h) => h.id));

      const microcopyItems = container.querySelectorAll(
        '[data-pcc-hero-governance-microcopy-item]',
      );
      expect(microcopyItems).toHaveLength(metadata.governanceMicrocopy.length);

      const microcopyIds = Array.from(microcopyItems).map((n) =>
        n.getAttribute('data-pcc-hero-governance-microcopy-item'),
      );
      expect(microcopyIds).toEqual(metadata.governanceMicrocopy.map((m) => m.id));
    }
  });
});
