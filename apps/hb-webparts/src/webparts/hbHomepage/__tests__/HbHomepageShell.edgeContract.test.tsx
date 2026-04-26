import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import type { ShellContainerState } from '../shell/useShellContainer.js';

// ---------------------------------------------------------------------------
// HB Homepage shell — edge-to-window contract integration test
// ---------------------------------------------------------------------------
// Asserts the slot-level edge contract attributes resolve correctly for the
// default preset under the default homepage edge policy (standard / none),
// and that the entry-stack root emits the dormant edge-mode attributes.
//
// Opt-in behavior is verified at the CSS-contract level (this file's bottom
// `describe`) and at the helper level (edgeContract.test.ts). JSDOM cannot
// prove geometry; a Playwright follow-up is recorded in the report.
// ---------------------------------------------------------------------------

vi.mock('../zones/SafetyFieldExcellenceZone.js', () => ({
  SafetyFieldExcellenceZone: (): React.JSX.Element =>
    React.createElement('div', { 'data-test-mock': 'safety-zone' }),
}));
vi.mock('../zones/CompanyPulseZone.js', () => ({
  CompanyPulseZone: (): React.JSX.Element =>
    React.createElement('div', { 'data-test-mock': 'company-pulse' }),
}));
vi.mock('../zones/LeadershipMessageZone.js', () => ({
  LeadershipMessageZone: (): React.JSX.Element =>
    React.createElement('div', { 'data-test-mock': 'leadership-message' }),
}));
vi.mock('../zones/ProjectPortfolioSpotlightZone.js', () => ({
  ProjectPortfolioSpotlightZone: (): React.JSX.Element =>
    React.createElement('div', { 'data-test-mock': 'project-portfolio-spotlight' }),
}));
vi.mock('../zones/PeopleCulturePublicZone.js', () => ({
  PeopleCulturePublicZone: (): React.JSX.Element =>
    React.createElement('div', { 'data-test-mock': 'people-culture-public' }),
}));
vi.mock('../zones/HbKudosZone.js', () => ({
  HbKudosZone: (): React.JSX.Element =>
    React.createElement('div', { 'data-test-mock': 'hb-kudos' }),
}));

import { HbHomepageShell } from '../HbHomepageShell.js';
import { HbHomepageEntryStack } from '../HbHomepageEntryStack.js';
import { DEFAULT_HOMEPAGE_EDGE_POLICY } from '../shell/edgeContract.js';

function makeStubContainer(): ShellContainerState {
  return {
    width: 1300,
    authoritativeWidth: 1300,
    shellInlineInsetTotal: 0,
    height: 900,
    entryState: {
      id: 'standard-laptop',
      label: 'Compressed flagship desktop (primary baseline)',
      minWidth: 1180,
      maxWidth: 1599,
      firstLaneColumns: 2,
      firstLanePairingAllowed: true,
      dominanceRule: 'left-dominant',
    },
    entryStateReason: 'width-match',
    shortHeightConstrained: false,
  };
}

function renderShell(): HTMLElement {
  const shellRef = React.createRef<HTMLDivElement>();
  const container = makeStubContainer();
  let rendered: ReturnType<typeof render> | undefined;
  act(() => {
    rendered = render(
      <HbHomepageShell
        config={undefined}
        identity={{ displayName: 'Test', email: 'test@example.com' }}
        siteUrl="https://contoso.sharepoint.com/sites/HBCentral"
        getGraphToken={async () => 'graph-token'}
        container={container}
        shellRef={shellRef}
      />,
    );
  });
  return rendered!.container as unknown as HTMLElement;
}

function getSlotByOccupant(root: HTMLElement, occupantId: string): HTMLElement {
  const el = root.querySelector(`[data-shell-occupant="${occupantId}"]`);
  expect(el, `slot for occupant ${occupantId} should be present`).toBeTruthy();
  return el as HTMLElement;
}

describe('HbHomepageShell — edge contract slot attributes (standard mode default)', () => {
  it('Row 1 project-portfolio-spotlight is paired left-dominant major ⇒ left/left', () => {
    const root = renderShell();
    const slot = getSlotByOccupant(root, 'project-portfolio-spotlight');
    expect(slot.getAttribute('data-shell-band-layout')).toBe('paired');
    expect(slot.getAttribute('data-shell-slot-visual-side')).toBe('left');
    expect(slot.getAttribute('data-shell-slot-edge-bleed')).toBe('left');
  });

  it('Row 2 company-pulse is paired right-dominant major ⇒ right/right (not inferred from DOM order)', () => {
    const root = renderShell();
    const slot = getSlotByOccupant(root, 'company-pulse');
    expect(slot.getAttribute('data-shell-band-layout')).toBe('paired');
    expect(slot.getAttribute('data-shell-slot-visual-side')).toBe('right');
    expect(slot.getAttribute('data-shell-slot-edge-bleed')).toBe('right');
  });

  it('Row 3 leadership-message is paired left-dominant major ⇒ left/left', () => {
    const root = renderShell();
    const slot = getSlotByOccupant(root, 'leadership-message');
    expect(slot.getAttribute('data-shell-band-layout')).toBe('paired');
    expect(slot.getAttribute('data-shell-slot-visual-side')).toBe('left');
    expect(slot.getAttribute('data-shell-slot-edge-bleed')).toBe('left');
  });

  it('Row 1 hb-kudos minor (right visual column) ⇒ none', () => {
    const root = renderShell();
    const slot = getSlotByOccupant(root, 'hb-kudos');
    expect(slot.getAttribute('data-shell-slot-visual-side')).toBe('right');
    expect(slot.getAttribute('data-shell-slot-edge-bleed')).toBe('none');
  });

  it('Row 2 safety-field-excellence minor (left visual column under right-dominant) ⇒ none', () => {
    const root = renderShell();
    const slot = getSlotByOccupant(root, 'safety-field-excellence');
    expect(slot.getAttribute('data-shell-slot-visual-side')).toBe('left');
    expect(slot.getAttribute('data-shell-slot-edge-bleed')).toBe('none');
  });

  it('Row 3 people-culture-public minor (right visual column) ⇒ none', () => {
    const root = renderShell();
    const slot = getSlotByOccupant(root, 'people-culture-public');
    expect(slot.getAttribute('data-shell-slot-visual-side')).toBe('right');
    expect(slot.getAttribute('data-shell-slot-edge-bleed')).toBe('none');
  });

  it('shell root preserves existing post-hero attributes', () => {
    const root = renderShell();
    const shell = root.querySelector('[data-shell-post-hero="true"]');
    expect(shell).toBeTruthy();
    expect(shell?.getAttribute('data-shell-preset')).toBeTruthy();
    expect(shell?.getAttribute('data-hb-homepage-shell-inset-policy')).toBe('shell-body-inner-inset');
  });
});

describe('HbHomepageEntryStack — hero edge-mode attributes (default policy)', () => {
  it('emits standard / none by default and preserves hero as sibling of shell region', () => {
    expect(DEFAULT_HOMEPAGE_EDGE_POLICY).toEqual({ edgeMode: 'standard', heroEdge: 'none' });

    const { container } = render(<HbHomepageEntryStack />);
    const root = container.querySelector('[data-hb-homepage-entry-stack="root"]');
    expect(root).toBeTruthy();
    expect(root?.getAttribute('data-hb-homepage-edge-mode')).toBe('standard');
    expect(root?.getAttribute('data-hb-homepage-hero-edge')).toBe('none');

    // Baseline-audit invariant: hero is a sibling region, not inside the shell.
    const heroRegion = container.querySelector('[data-hb-homepage-entry-stack-region="hero"]');
    const shellRegion = container.querySelector('[data-hb-homepage-entry-stack-region="shell"]');
    if (heroRegion && shellRegion) {
      expect(shellRegion.contains(heroRegion)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// CSS contract proof — JSDOM cannot measure geometry, so the gated rules
// are verified by reading the CSS module sources and asserting that:
//   1. attribute-gating is present (rules cannot fire without opt-in);
//   2. no-overflow safeguards exist (max(0px, ...) clamp);
//   3. no global overflow-x: hidden was added.
// Geometric / hosted proof is recorded in 01_EDGE_CONTRACT_REPORT.md.
// ---------------------------------------------------------------------------

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const SHELL_CSS_PATH = path.resolve(HERE, '..', 'HbHomepageShell.module.css');
const ENTRY_STACK_CSS_PATH = path.resolve(HERE, '..', 'HbHomepageEntryStack.module.css');

function readCss(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

describe('HbHomepageShell.module.css — edge-to-window CSS contract', () => {
  const css = readCss(SHELL_CSS_PATH);

  it('declares edge-safe and edge-bleed CSS variables on .shell', () => {
    expect(css).toMatch(/--hb-homepage-edge-safe-inline:/);
    expect(css).toMatch(/--hb-homepage-edge-bleed-inline-start:\s*0px/);
    expect(css).toMatch(/--hb-homepage-edge-bleed-inline-end:\s*0px/);
  });

  it('gates bleed activation on data-hb-homepage-edge-mode="edge-to-window"', () => {
    expect(css).toMatch(/\[data-hb-homepage-edge-mode="edge-to-window"\][^{]*\.shell/);
    expect(css).toMatch(/\[data-hb-homepage-edge-mode="edge-to-window"\][^{]*\.slot\[data-shell-slot-edge-bleed="left"\]/);
    expect(css).toMatch(/\[data-hb-homepage-edge-mode="edge-to-window"\][^{]*\.slot\[data-shell-slot-edge-bleed="right"\]/);
    expect(css).toMatch(/\[data-hb-homepage-edge-mode="edge-to-window"\][^{]*\.slot\[data-shell-slot-edge-bleed="both"\]/);
  });

  it('clamps bleed amount with max(0px, ...) so it cannot go negative', () => {
    expect(css).toMatch(/max\(\s*0px\s*,\s*var\(--hb-homepage-edge-safe-inline\)\s*\)/);
  });

  it('does not introduce global overflow-x: hidden', () => {
    // Match only an actual CSS declaration, not the literal phrase inside a comment.
    expect(css).not.toMatch(/overflow-x\s*:\s*hidden\s*;/);
  });
});

describe('HbHomepageEntryStack.module.css — hero edge contract', () => {
  const css = readCss(ENTRY_STACK_CSS_PATH);

  it('declares edge-safe and hero-edge CSS variables on .entryStack', () => {
    expect(css).toMatch(/--hb-homepage-edge-safe-inline:/);
    expect(css).toMatch(/--hb-homepage-hero-edge-inline-start:\s*0px/);
    expect(css).toMatch(/--hb-homepage-hero-edge-inline-end:\s*0px/);
  });

  it('gates hero bleed on combined edge-mode + hero-edge attributes', () => {
    expect(css).toMatch(
      /\[data-hb-homepage-edge-mode="edge-to-window"\]\[data-hb-homepage-hero-edge="both"\][^{]*\.heroRegion/,
    );
  });

  it('hero opt-in releases inline padding rather than applying negative margin', () => {
    // Negative margin on hero would risk overflow past the outer envelope max-width.
    expect(css).toMatch(/padding-inline:\s*0/);
  });

  it('does not introduce global overflow-x: hidden', () => {
    // Match only an actual CSS declaration, not the literal phrase inside a comment.
    expect(css).not.toMatch(/overflow-x\s*:\s*hidden\s*;/);
  });
});
