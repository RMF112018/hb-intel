/**
 * Daypart precedence regression guard for the flagship homepage hero.
 *
 * Locks the runtime contract that:
 *   - When no `backgroundImage` is provided, the rendered hero background
 *     resolves to the daypart-selected banner asset URL.
 *   - When a `backgroundImage` is explicitly provided, it wins precedence
 *     and the daypart selector is bypassed.
 *
 * Guards against the defect where a stale top-level `backgroundImageUrl`
 * silently shadowed the daypart default and pinned the hero to the
 * evening banner during the morning window.
 */
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HbSignatureHeroHomepage } from '../../webparts/hbSignatureHero/HbSignatureHeroHomepage.js';

function localDateAt(hour: number, minute: number): Date {
  const dt = new Date(2026, 3, 19, 0, 0, 0, 0);
  dt.setHours(hour, minute, 0, 0);
  return dt;
}

function findPhotoLayer(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[aria-hidden="true"][style*="background-image"]');
}

describe('HbSignatureHeroHomepage — daypart precedence contract', () => {
  it('renders the morning banner asset URL at 8:20 AM when no override is provided', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 20)}
      />,
    );
    const photo = findPhotoLayer(container);
    expect(photo).not.toBeNull();
    expect(photo!.getAttribute('style')).toContain(
      'https://cdn.example.invalid/assets/banner_home_7_morning.png',
    );
  });

  it('renders the evening banner asset URL at 6:00 PM when no override is provided', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(18, 0)}
      />,
    );
    const photo = findPhotoLayer(container);
    expect(photo).not.toBeNull();
    expect(photo!.getAttribute('style')).toContain(
      'https://cdn.example.invalid/assets/banner_home_7_evening.png',
    );
  });

  it('honors an explicit backgroundImage override and bypasses the daypart selector', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        backgroundImage="https://example.com/authored-hero.jpg"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 20)}
      />,
    );
    const photo = findPhotoLayer(container);
    expect(photo).not.toBeNull();
    expect(photo!.getAttribute('style')).toContain(
      'https://example.com/authored-hero.jpg',
    );
  });

  it('exposes inspectable banner-source diagnostics on the hero surface (daypart-default)', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 20)}
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(surface).not.toBeNull();
    expect(surface!.getAttribute('data-hbc-hero-background-source')).toBe('daypart-default');
    expect(surface!.getAttribute('data-hbc-hero-daypart')).toBe('morning');
    expect(surface!.getAttribute('data-hbc-hero-banner-file')).toBe('banner_home_7_morning.png');
    expect(surface!.getAttribute('data-hbc-hero-banner-override-active')).toBe('false');
    expect(surface!.getAttribute('data-hbc-hero-flagship-render-path')).toBe('wrapper-embedded');
  });

  it('exposes inspectable banner-source diagnostics when an override wins', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        backgroundImage="https://example.com/authored-hero.jpg"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(18, 0)}
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(surface).not.toBeNull();
    expect(surface!.getAttribute('data-hbc-hero-background-source')).toBe('wrapper-override');
    expect(surface!.getAttribute('data-hbc-hero-daypart')).toBe('evening');
    expect(surface!.getAttribute('data-hbc-hero-banner-override-active')).toBe('true');
  });
});

/**
 * Diagnostic emission contract — `[hb-signature-hero] background source`
 * must fire exactly once per banner selection change (mount, daypart
 * rollover, or override flip) and must carry the contract payload keys
 * that hosted operators rely on. Guards the dependency-array throttle
 * in HbSignatureHeroHomepage against regression to per-render spam or
 * to silence.
 */
describe('HbSignatureHeroHomepage — diagnostic emission contract', () => {
  const HERO_DEBUG_PREFIX = '[hb-signature-hero] background source';

  function heroDebugCalls(spy: ReturnType<typeof vi.spyOn>): unknown[][] {
    return spy.mock.calls.filter((call) => call[0] === HERO_DEBUG_PREFIX);
  }

  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it('emits exactly one banner-source debug with the contract payload on mount', () => {
    render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 20)}
      />,
    );
    const calls = heroDebugCalls(debugSpy);
    expect(calls).toHaveLength(1);
    const payload = calls[0][1] as Record<string, unknown>;
    expect(payload).toMatchObject({
      source: 'daypart-default',
      daypart: 'morning',
      fileName: 'banner_home_7_morning.png',
      overrideActive: false,
      flagshipRenderPath: 'wrapper-embedded',
    });
    expect(typeof payload.url).toBe('string');
  });

  it('does not re-emit when an unrelated prop changes but selection is stable', () => {
    const { rerender } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 20)}
      />,
    );
    expect(heroDebugCalls(debugSpy)).toHaveLength(1);

    // Re-render with a different `now` that still resolves to morning.
    // Selection identity (source/daypart/fileName/url/overrideActive) is
    // unchanged, so the throttled effect must not re-fire.
    rerender(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 45)}
      />,
    );
    expect(heroDebugCalls(debugSpy)).toHaveLength(1);
  });

  it('re-emits when the selection actually changes (override flips on)', () => {
    const { rerender } = render(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 20)}
      />,
    );
    expect(heroDebugCalls(debugSpy)).toHaveLength(1);

    rerender(
      <HbSignatureHeroHomepage
        identity={{}}
        assetBaseUrl="https://cdn.example.invalid/assets/"
        backgroundImage="https://example.com/authored-hero.jpg"
        flagshipRenderPath="wrapper-embedded"
        now={localDateAt(8, 20)}
      />,
    );
    const calls = heroDebugCalls(debugSpy);
    expect(calls).toHaveLength(2);
    expect((calls[1][1] as Record<string, unknown>).source).toBe('wrapper-override');
    expect((calls[1][1] as Record<string, unknown>).overrideActive).toBe(true);
  });
});
