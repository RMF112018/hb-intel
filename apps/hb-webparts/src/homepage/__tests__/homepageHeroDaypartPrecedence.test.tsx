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
import { describe, expect, it } from 'vitest';
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
    expect(surface!.getAttribute('data-hbc-hero-banner-source')).toBe('daypart-default');
    expect(surface!.getAttribute('data-hbc-hero-banner-daypart')).toBe('morning');
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
    expect(surface!.getAttribute('data-hbc-hero-banner-source')).toBe('override');
    expect(surface!.getAttribute('data-hbc-hero-banner-daypart')).toBe('evening');
    expect(surface!.getAttribute('data-hbc-hero-banner-override-active')).toBe('true');
  });
});
