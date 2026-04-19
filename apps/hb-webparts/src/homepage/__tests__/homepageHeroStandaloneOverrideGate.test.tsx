/**
 * Standalone-vs-wrapper override gating contract for the flagship homepage.
 *
 * A standalone HbSignatureHero placed on HBCentral must NOT smuggle a
 * `backgroundImage` past the daypart default. Authored overrides are only
 * honored on the wrapper-embedded flagship render path (where
 * `entryStackState` is supplied by the wrapper). This guards the live
 * homepage from a stray standalone webpart silently controlling the
 * banner via a stale property bag.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { HbSignatureHero } from '../../webparts/hbSignatureHero/HbSignatureHero.js';
import { HBCENTRAL_SITE_URL } from '../../webparts/hbSignatureHero/heroModeResolver.js';
import type { HeroEntryStackState } from '../../webparts/hbHomepage/shell/useShellContainer.js';
import { SHELL_ENTRY_STATES } from '../../webparts/hbHomepage/shell/breakpointPolicy.js';

function localDateAt(hour: number, minute: number): Date {
  const dt = new Date(2026, 3, 19, 0, 0, 0, 0);
  dt.setHours(hour, minute, 0, 0);
  return dt;
}

const STANDARD_LAPTOP_ENTRY_STATE = SHELL_ENTRY_STATES.find(
  (state) => state.id === 'standard-laptop',
)!;

const FAKE_ENTRY_STACK_STATE: HeroEntryStackState = {
  entryState: STANDARD_LAPTOP_ENTRY_STATE,
  entryStateReason: 'width-match',
  width: 1280,
  authoritativeWidth: 1280,
  shellInlineInsetTotal: 0,
  height: 800,
  shortHeightConstrained: false,
};

describe('HbSignatureHero — standalone homepage override gating', () => {
  it('drops the standalone backgroundImage on HBCentral so the daypart default wins', () => {
    const { container } = render(
      <HbSignatureHero
        identity={{}}
        siteUrl={HBCENTRAL_SITE_URL}
        backgroundImage="https://example.com/stale-evening-from-property-bag.jpg"
        assetBaseUrl="https://cdn.example.invalid/assets/"
        now={localDateAt(8, 20)}
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(surface).not.toBeNull();
    expect(surface!.getAttribute('data-hbc-hero-flagship-render-path')).toBe('standalone-webpart');
    expect(surface!.getAttribute('data-hbc-hero-banner-source')).toBe('daypart-default');
    expect(surface!.getAttribute('data-hbc-hero-banner-file')).toBe('banner_home_7_morning.png');
    expect(surface!.getAttribute('data-hbc-hero-banner-override-active')).toBe('false');
  });

  it('honors a wrapper-embedded backgroundImage on HBCentral when entry-stack state is supplied', () => {
    const { container } = render(
      <HbSignatureHero
        identity={{}}
        siteUrl={HBCENTRAL_SITE_URL}
        backgroundImage="https://example.com/intentional-wrapper-override.jpg"
        assetBaseUrl="https://cdn.example.invalid/assets/"
        entryStackState={FAKE_ENTRY_STACK_STATE}
        now={localDateAt(8, 20)}
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(surface).not.toBeNull();
    expect(surface!.getAttribute('data-hbc-hero-flagship-render-path')).toBe('wrapper-embedded');
    expect(surface!.getAttribute('data-hbc-hero-banner-source')).toBe('override');
    expect(surface!.getAttribute('data-hbc-hero-banner-override-active')).toBe('true');
  });
});
