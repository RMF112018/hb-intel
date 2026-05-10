import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import {
  PCC_RESPONSIVE_MODES,
  resolveResponsiveMode,
  type PccResponsiveMode,
} from '../layout/footprints';
import { PCC_SHELL_SURFACE_HEADER_METADATA } from '../shell/surfaceHeaderMetadata';
import { getPrimaryTabSelectionControl } from './shellSurfaceSelection';

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

      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid?.getAttribute('data-pcc-mode')).toBe(mode);

      const hero = container.querySelector('[data-pcc-project-hero-band]');
      expect(hero, `hero band should render at '${mode}'`).not.toBeNull();
      expect(hero?.getAttribute('data-pcc-mode')).toBe(mode);

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

  // Phase 05 wave-b10 Prompt 04 — shell `<main>` is the semantic active-
  // panel owner. Default render labels the panel via the Phase 05
  // primary tab id (`pcc-tab-project-home`) and the panel marker tracks
  // `activePrimaryTabId` (also `project-home` by default).
  it('wires the tablist/tab/tabpanel relationship via id, role, aria-labelledby, and aria-controls', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const main = container.querySelector('[data-pcc-canvas]') as HTMLElement | null;
    expect(main).not.toBeNull();
    expect(main!.getAttribute('id')).toBe('pcc-active-surface-panel');
    expect(main!.getAttribute('role')).toBe('tabpanel');
    expect(main!.getAttribute('aria-labelledby')).toBe('pcc-tab-project-home');

    const tabs = container.querySelectorAll('[data-pcc-horizontal-tabs] [role="tab"]');
    expect(tabs.length).toBe(PCC_PRIMARY_TAB_IDS.length);
    for (const tab of tabs) {
      expect(tab.getAttribute('aria-controls')).toBe('pcc-active-surface-panel');
    }

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
    const documentsTab = getPrimaryTabSelectionControl(container, 'documents');
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

  it('updates <main> aria-labelledby and shell active-panel marker after a Cost & Time tab click', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const costTimeTab = getPrimaryTabSelectionControl(container, 'cost-time');
    expect(costTimeTab).not.toBeNull();
    fireEvent.click(costTimeTab!);

    const main = container.querySelector('[data-pcc-canvas]') as HTMLElement | null;
    expect(main!.getAttribute('aria-labelledby')).toBe('pcc-tab-cost-time');
    expect(main!.getAttribute('data-pcc-active-surface-panel')).toBe('cost-time');
    const costTimePanels = container.querySelectorAll(
      'main[role="tabpanel"][data-pcc-active-surface-panel="cost-time"]',
    );
    expect(costTimePanels.length).toBe(1);
  });

  it('aria-labelledby always references a real primary-tab id node (no dangling refs across the eight primaries)', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryTabSelectionControl(container, tabId);
      expect(tab, `primary tab '${tabId}' should render`).not.toBeNull();
      fireEvent.click(tab!);

      const main = container.querySelector('[data-pcc-canvas]') as HTMLElement | null;
      const referencedId = main?.getAttribute('aria-labelledby');
      expect(referencedId).toBe(`pcc-tab-${tabId}`);
      const labelNode = container.querySelector(`#${CSS.escape(referencedId!)}`);
      expect(
        labelNode,
        `aria-labelledby for primary tab '${tabId}' must resolve to a real id node`,
      ).not.toBeNull();
    }
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

  it.each(PCC_RESPONSIVE_MODES)('renders the shell hero production zones at "%s" mode', (mode) => {
    const { container, unmount } = render(<PccApp forceMode={mode} />);
    expect(container.querySelectorAll('[data-pcc-hero-highlights]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-hero-governance-microcopy]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-hero-command-search]')).toHaveLength(1);
    unmount();
  });

  it('renders shell components in tabs → hero → main DOM order (Wave 15A wave-b9 Prompt 4B-03)', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const tabs = container.querySelector('[data-pcc-horizontal-tabs]');
    const hero = container.querySelector('[data-pcc-project-hero-band]');
    const main = container.querySelector('main[role="tabpanel"]#pcc-active-surface-panel');
    expect(tabs, '[data-pcc-horizontal-tabs] tablist must render').not.toBeNull();
    expect(hero, '[data-pcc-project-hero-band] hero must render').not.toBeNull();
    expect(main, 'main[role="tabpanel"] active-surface panel must render').not.toBeNull();
    expect(
      tabs!.compareDocumentPosition(hero!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'tablist must precede the hero band in DOM order',
    ).toBeTruthy();
    expect(
      hero!.compareDocumentPosition(main!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'hero band must precede the active-surface tabpanel main in DOM order',
    ).toBeTruthy();
  });
});

describe('resolveResponsiveMode 8-mode boundary contract', () => {
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
 * Phase 05 wave-b10 Prompt 04 intentionally keeps the hero stable on the
 * legacy Project Home view-model until Prompt 06 migrates hero/header
 * metadata to the Phase 05 primary-tab axis. The shell-rendered hero
 * production-band markers (heroHighlights + governanceMicrocopy) remain
 * sourced from `PCC_SHELL_SURFACE_HEADER_METADATA['project-home']` for
 * every primary tab in this prompt; per-primary-tab hero parity becomes
 * the Prompt 06 contract.
 */
describe('PccShell hero stable at Project Home until Prompt 06 (Phase 05 wave-b10 Prompt 04)', () => {
  afterEach(() => {
    cleanup();
  });

  function expectHeroBandShowsProjectHomeMetadata(container: HTMLElement): void {
    const metadata = PCC_SHELL_SURFACE_HEADER_METADATA['project-home'];

    expect(container.querySelector('[data-pcc-hero-secondary-title]')?.textContent).toBe(
      'Project Home',
    );

    const highlightZone = container.querySelector('[data-pcc-hero-highlights]');
    expect(highlightZone).not.toBeNull();
    const highlights = highlightZone!.querySelectorAll('[data-pcc-hero-highlight]');
    expect(highlights).toHaveLength(metadata.heroHighlights.length);
    metadata.heroHighlights.forEach((expectedHighlight, index) => {
      const node = highlights[index]!;
      expect(node.getAttribute('data-pcc-hero-highlight')).toBe(expectedHighlight.id);
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
    });
  }

  it('default render shows the Project Home production hero band and the global Client fact', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    expectHeroBandShowsProjectHomeMetadata(container);
    const clientCell = container.querySelector('[data-pcc-hero-fact-client]');
    expect(clientCell, 'Project Home hero must render the Client fact').not.toBeNull();
    expect(clientCell!.querySelector('dt')?.textContent).toBe('Client');
    expect(clientCell!.querySelector('dd')?.textContent).toBe('Sample Owner LLC');
  });

  it('hero stays on the Project Home view-model after every Phase 05 primary tab click (Prompt 06 will migrate hero band to track activePrimaryTabId)', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryTabSelectionControl(container, tabId);
      expect(tab, `primary tab '${tabId}' should render`).not.toBeNull();
      fireEvent.click(tab!);

      // Active panel marker tracks the Phase 05 primary tab id…
      const shellPanel = container.querySelector(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${tabId}"]`,
      );
      expect(shellPanel, `shell panel must own active primary tab '${tabId}'`).not.toBeNull();

      // …but the hero band stays on the legacy Project Home view-model
      // for the duration of Prompt 04. Prompt 06 will replace this with
      // per-primary-tab hero parity.
      expectHeroBandShowsProjectHomeMetadata(container);
    }
  });
});
