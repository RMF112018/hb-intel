/**
 * Layout-mode + hosted-marker regression guard for the flagship homepage hero.
 *
 * Locks two contracts that hosted audits rely on:
 *   1. `data-hbc-hero-layout-mode` resolves correctly from the shared
 *      entry-stack authority across representative entry states and the
 *      short-height-constrained branch. Future drift in
 *      `resolveHomepageHeroLayoutMode` fails here at unit level before
 *      it has to be caught in a seven-breakpoint hosted capture.
 *   2. The exact audit-relevant `data-hbc-hero-*` attribute set is
 *      present on the hero surface. A silent rename or removal would
 *      break hosted evidence without surfacing in any other test.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { HbSignatureHeroHomepage } from '../../webparts/hbSignatureHero/HbSignatureHeroHomepage.js';
import type { HeroEntryStackState } from '../../webparts/hbHomepage/shell/useShellContainer.js';
import type { ShellEntryStateId } from '../../webparts/hbHomepage/shell/shellTypes.js';

function makeEntryStackState(
  id: ShellEntryStateId,
  overrides: Partial<HeroEntryStackState> = {},
): HeroEntryStackState {
  return {
    width: 1200,
    authoritativeWidth: 1280,
    shellInlineInsetTotal: 80,
    height: 900,
    entryState: {
      id,
      label: id,
      minWidth: 0,
      maxWidth: 9999,
      firstLaneColumns: 1,
      firstLanePairingAllowed: false,
      dominanceRule: 'single',
    },
    entryStateReason: 'width-match',
    shortHeightConstrained: false,
    ...overrides,
  };
}

function renderHero(entryStackState: HeroEntryStackState): HTMLElement {
  const { container } = render(
    <HbSignatureHeroHomepage
      identity={{}}
      assetBaseUrl="https://cdn.example.invalid/assets/"
      flagshipRenderPath="wrapper-embedded"
      entryStackState={entryStackState}
      now={new Date(2026, 3, 19, 8, 20, 0, 0)}
    />,
  );
  const surface = container.querySelector('[data-hbc-premium="signature-hero"]');
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

describe('HbSignatureHeroHomepage — layout-mode resolution contract', () => {
  it('resolves premium-wide for ultrawide-desktop', () => {
    const surface = renderHero(makeEntryStackState('ultrawide-desktop'));
    expect(surface.getAttribute('data-hbc-hero-layout-mode')).toBe('premium-wide');
    expect(surface.getAttribute('data-hbc-hero-entry-authority')).toBe('shared-entry-state');
  });

  it('resolves compressed-laptop for standard-laptop', () => {
    const surface = renderHero(makeEntryStackState('standard-laptop'));
    expect(surface.getAttribute('data-hbc-hero-layout-mode')).toBe('compressed-laptop');
  });

  it('resolves tablet-portrait-guided for tablet-portrait', () => {
    const surface = renderHero(makeEntryStackState('tablet-portrait'));
    expect(surface.getAttribute('data-hbc-hero-layout-mode')).toBe('tablet-portrait-guided');
  });

  it('resolves handheld-compact for phone-portrait', () => {
    const surface = renderHero(makeEntryStackState('phone-portrait'));
    expect(surface.getAttribute('data-hbc-hero-layout-mode')).toBe('handheld-compact');
  });

  it('resolves compact-short-height when shortHeightConstrained is true, regardless of entry state', () => {
    const surface = renderHero(
      makeEntryStackState('ultrawide-desktop', { shortHeightConstrained: true }),
    );
    expect(surface.getAttribute('data-hbc-hero-layout-mode')).toBe('compact-short-height');
    expect(surface.getAttribute('data-hbc-hero-short-height')).toBe('true');
  });

  it('resolves compact-short-height for phone-landscape via policy posture', () => {
    const surface = renderHero(makeEntryStackState('phone-landscape'));
    expect(surface.getAttribute('data-hbc-hero-layout-mode')).toBe('compact-short-height');
  });

  it('falls back to standalone-fallback when no entryStackState is provided', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="standalone-webpart"
        now={new Date(2026, 3, 19, 8, 20, 0, 0)}
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(surface!.getAttribute('data-hbc-hero-layout-mode')).toBe('standalone-fallback');
    expect(surface!.getAttribute('data-hbc-hero-entry-authority')).toBe('standalone-hero');
    expect(surface!.getAttribute('data-hbc-hero-layout-source')).toBe('standalone-fallback');
  });
});

describe('HbSignatureHeroHomepage — hosted marker contract', () => {
  it('emits the full audit-relevant data-attribute set on the hero surface', () => {
    const surface = renderHero(makeEntryStackState('ultrawide-desktop'));

    // Source/daypart identity markers — read by the readability and
    // hosted-breakpoint audit appendices.
    for (const attr of [
      'data-hbc-hero-background-source',
      'data-hbc-hero-daypart',
      'data-hbc-hero-banner-file',
      'data-hbc-hero-banner-override-active',
      'data-hbc-hero-flagship-render-path',
    ]) {
      expect(surface.getAttribute(attr), `missing ${attr}`).not.toBeNull();
    }

    // Layout + entry-authority markers — read by hosted-breakpoint audit.
    for (const attr of [
      'data-hbc-hero-entry-authority',
      'data-hbc-hero-entry-state',
      'data-hbc-hero-layout-mode',
      'data-hbc-hero-layout-source',
      'data-hbc-hero-short-height',
    ]) {
      expect(surface.getAttribute(attr), `missing ${attr}`).not.toBeNull();
    }

    // Width truth markers — distinguish authoritative width from
    // fallback at hosted inspection time.
    expect(surface.getAttribute('data-hbc-hero-width')).toBe('1200');
    expect(surface.getAttribute('data-hbc-hero-width-authoritative')).toBe('1280');
    expect(surface.getAttribute('data-hbc-hero-width-inline-inset-total')).toBe('80');
    expect(surface.getAttribute('data-hbc-hero-width-source')).toBe('entry-stack-outer-envelope');
    expect(surface.getAttribute('data-hbc-hero-width-accounting')).toBe(
      'authoritative-minus-shell-inline-inset',
    );

    // Height-budget markers — closure evidence for the entry-stack
    // policy contract per shell authority.
    expect(surface.getAttribute('data-hbc-hero-height-budget-min')).not.toBeNull();
    expect(surface.getAttribute('data-hbc-hero-height-budget-max')).not.toBeNull();
    expect(surface.getAttribute('data-hbc-hero-short-height-posture')).not.toBeNull();

    // Blackbox contract version marker — a non-breaking way for hosted
    // audits to detect which marker generation is deployed.
    expect(surface.getAttribute('data-hbc-hero-blackbox-contract')).toBe('prompt07-blackbox-v1');
  });
});
