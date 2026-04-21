import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { HbSignatureHeroArticle } from '../../webparts/hbSignatureHero/HbSignatureHeroArticle.js';
import { HbSignatureHero } from '../../webparts/hbSignatureHero/HbSignatureHero.js';
import { HbSignatureHeroHomepage } from '../../webparts/hbSignatureHero/HbSignatureHeroHomepage.js';
import { resolveHomepageHeroBannerAssetUrl } from '../../webparts/hbSignatureHero/homepageHeroBannerAssetResolver.js';
import { resolveHomepageHeroBannerSelection } from '../../webparts/hbSignatureHero/homepageHeroBannerSourceSelector.js';

describe('HbSignatureHeroArticle — Phase-02 article-mode adapter', () => {
  it('renders title, subheading, byline, labels, and link', () => {
    render(
      <HbSignatureHeroArticle
        article={{
          title: 'A Major Milestone on Project Horizon',
          subheading: 'Field teams close out structural phase ahead of schedule.',
          author: 'Avery Stone',
          publishedDate: '2026-04-13',
          publishedTime: '09:15 AM',
          labels: ['Project', 'Field'],
          primaryImage: 'https://example.invalid/hero.jpg',
          destinationUrl: 'https://example.invalid/articles/horizon',
        }}
      />,
    );

    expect(screen.getByText('A Major Milestone on Project Horizon')).not.toBeNull();
    expect(
      screen.getByText('Field teams close out structural phase ahead of schedule.'),
    ).not.toBeNull();
    expect(screen.getByText('Avery Stone · 2026-04-13 · 09:15 AM')).not.toBeNull();
    expect(screen.getByText('Project · Field')).not.toBeNull();
    const titleLink = screen.getByRole('link', {
      name: 'A Major Milestone on Project Horizon',
    });
    expect(titleLink.getAttribute('href')).toBe(
      'https://example.invalid/articles/horizon',
    );
  });

  it('degrades gracefully when optional fields are missing', () => {
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Minimal Article',
          author: 'Jordan Miller',
          publishedDate: '2026-04-13',
        }}
      />,
    );

    const scope = within(container);
    expect(scope.getByText('Minimal Article')).not.toBeNull();
    expect(scope.getByText('Jordan Miller · 2026-04-13')).not.toBeNull();
    // No subheading, label eyebrow, or title link emitted.
    expect(container.querySelector('[data-hbc-article-subheading]')).toBeNull();
    expect(container.querySelector('[data-hbc-article-title-link]')).toBeNull();
    expect(scope.queryByRole('link')).toBeNull();
  });
});

describe('HbSignatureHeroArticle — author identity and photo seam (Phase-03)', () => {
  it('uses an explicit authorPhotoUrl without calling the Graph adapter', () => {
    const fetchPersonPhoto = vi.fn();
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Explicit Photo',
          author: 'Avery Stone',
          publishedDate: '2026-04-13',
          authorUpn: 'avery.stone@example.invalid',
          authorPhotoUrl: 'https://cdn.example.invalid/avery.jpg',
        }}
        fetchPersonPhoto={fetchPersonPhoto}
      />,
    );
    const img = container.querySelector('img[alt="Avery Stone"]') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.src).toBe('https://cdn.example.invalid/avery.jpg');
    expect(fetchPersonPhoto).not.toHaveBeenCalled();
  });

  it('resolves a Graph photo via authorUpn through the shared adapter', async () => {
    const fetchPersonPhoto = vi
      .fn<(upn: string) => Promise<string | undefined>>()
      .mockResolvedValue('blob:mock/graph-photo');
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Graph Photo',
          author: 'Pat Field',
          publishedDate: '2026-04-13',
          authorUpn: 'pat.field@example.invalid',
        }}
        fetchPersonPhoto={fetchPersonPhoto}
      />,
    );
    await waitFor(() => {
      const img = container.querySelector('img[alt="Pat Field"]') as HTMLImageElement | null;
      expect(img).not.toBeNull();
      expect(img!.src).toBe('blob:mock/graph-photo');
    });
    expect(fetchPersonPhoto).toHaveBeenCalledWith('pat.field@example.invalid');
  });

  it('falls back to initials when the adapter returns no photo', async () => {
    const fetchPersonPhoto = vi
      .fn<(upn: string) => Promise<string | undefined>>()
      .mockResolvedValue(undefined);
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'No Photo',
          author: 'Jordan Miller',
          publishedDate: '2026-04-13',
          authorUpn: 'jordan.miller@example.invalid',
        }}
        fetchPersonPhoto={fetchPersonPhoto}
      />,
    );
    await waitFor(() => expect(fetchPersonPhoto).toHaveBeenCalledTimes(1));
    // No image rendered — initials fallback span instead.
    expect(container.querySelector('img[alt="Jordan Miller"]')).toBeNull();
    expect(within(container).getByText('JM')).not.toBeNull();
  });

  it('falls back to initials when neither photo URL nor adapter is supplied', () => {
    const { container } = render(
      <HbSignatureHeroArticle
        article={{
          title: 'Initials Only',
          author: 'Sam River',
          publishedDate: '2026-04-13',
        }}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(within(container).getByText('SR')).not.toBeNull();
  });
});

describe('HbSignatureHero — article-mode dispatch', () => {
  it('renders the article adapter on non-HBCentral site URLs when article content is supplied', () => {
    render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/Other"
        article={{
          title: 'Dispatch Article',
          author: 'Pat Field',
          publishedDate: '2026-04-13',
        }}
      />,
    );
    expect(screen.getByText('Dispatch Article')).not.toBeNull();
  });

  it('renders nothing on non-HBCentral sites when no article payload is wired', () => {
    const { container } = render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/Other"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('ignores article content on HBCentral and renders the homepage adapter', () => {
    render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
        article={{
          title: 'Should Not Appear',
          author: 'X',
          publishedDate: '2026-04-13',
        }}
      />,
    );
    expect(screen.queryByText('Should Not Appear')).toBeNull();
    expect(screen.getByText('Build with GRIT.')).not.toBeNull();
  });

  it('suppresses standalone homepage hero when wrapper-owned hero region is present', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapperHero = document.createElement('section');
    wrapperHero.setAttribute('data-hb-homepage-entry-stack-region', 'hero');
    wrapperHero.setAttribute('data-hb-homepage-entry-stack-hero-authority', 'shared-entry-state');
    document.body.appendChild(wrapperHero);

    try {
      const { container } = render(
        <HbSignatureHero
          identity={{ preferredName: 'Jordan' }}
          siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
        />,
      );
      await waitFor(() => {
        const guard = container.querySelector(
          '[data-hb-signature-hero-duplicate-guard="suppressed-standalone-homepage"]',
        );
        expect(guard).not.toBeNull();
      });
      expect(warn).toHaveBeenCalledWith(
        '[hb-signature-hero] Duplicate flagship homepage hero detected. Suppressing standalone homepage hero because wrapper-owned hero region is present.',
      );
      expect(container.querySelector('[data-hbc-premium="signature-hero"]')).toBeNull();
    } finally {
      wrapperHero.remove();
      warn.mockRestore();
    }
  });
});

describe('HbSignatureHeroHomepage — shared entry-stack authority', () => {
  it('uses wrapper-provided entry-stack measurement and policy diagnostics', () => {
    const { container } = render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
        entryStackState={{
          width: 1320,
          authoritativeWidth: 1400,
          shellInlineInsetTotal: 80,
          height: 860,
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
        }}
      />,
    );

    const hero = container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(hero?.getAttribute('data-hbc-hero-entry-authority')).toBe('shared-entry-state');
    expect(hero?.getAttribute('data-hbc-hero-blackbox-contract')).toBe('prompt07-blackbox-v1');
    expect(hero?.getAttribute('data-hbc-hero-entry-state')).toBe('standard-laptop');
    expect(hero?.getAttribute('data-hbc-hero-entry-reason')).toBe('width-match');
    expect(hero?.getAttribute('data-hbc-hero-layout-mode')).toBe('compressed-laptop');
    expect(hero?.getAttribute('data-hbc-hero-layout-source')).toBe('shared-entry-state-policy');
    expect(hero?.getAttribute('data-hbc-hero-width')).toBe('1320');
    expect(hero?.getAttribute('data-hbc-hero-width-authoritative')).toBe('1400');
    expect(hero?.getAttribute('data-hbc-hero-height-budget-min')).toBe('300');
    expect(hero?.getAttribute('data-hbc-hero-height-budget-max')).toBe('340');
    expect(hero?.getAttribute('style')).toContain('min-height: 300px');
    expect(hero?.getAttribute('style')).toContain('max-height: 340px');
  });

  it('switches to compact-short-height mode when shared authority reports short-height posture', () => {
    const { container } = render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
        entryStackState={{
          width: 720,
          authoritativeWidth: 760,
          shellInlineInsetTotal: 40,
          height: 420,
          entryState: {
            id: 'phone-landscape',
            label: 'Compact banner + fast actions',
            minWidth: 480,
            maxWidth: 960,
            firstLaneColumns: 1,
            firstLanePairingAllowed: false,
            dominanceRule: 'single',
          },
          entryStateReason: 'short-height-override',
          shortHeightConstrained: true,
        }}
      />,
    );

    const hero = container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(hero?.getAttribute('data-hbc-hero-layout-mode')).toBe('compact-short-height');
    expect(hero?.getAttribute('data-hbc-hero-short-height')).toBe('true');
    expect(hero?.getAttribute('data-hbc-hero-short-height-posture')).toBe('compact-banner');
    expect(hero?.getAttribute('data-hbc-hero-height-budget-min')).toBe('120');
    expect(hero?.getAttribute('data-hbc-hero-height-budget-max')).toBe('160');
  });

  it('maps shared entry-state classes to governed layout modes for wide and phone postures', () => {
    const ultrawide = render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
        entryStackState={{
          width: 1920,
          authoritativeWidth: 2000,
          shellInlineInsetTotal: 80,
          height: 1080,
          entryState: {
            id: 'ultrawide-desktop',
            label: 'Premium desktop span',
            minWidth: 1600,
            maxWidth: Number.POSITIVE_INFINITY,
            firstLaneColumns: 2,
            firstLanePairingAllowed: true,
            dominanceRule: 'left-dominant',
          },
          entryStateReason: 'width-match',
          shortHeightConstrained: false,
        }}
      />,
    ).container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(ultrawide?.getAttribute('data-hbc-hero-layout-mode')).toBe('premium-wide');
    expect(ultrawide?.getAttribute('data-hbc-hero-entry-reason')).toBe('width-match');

    const phonePortrait = render(
      <HbSignatureHero
        identity={{ preferredName: 'Jordan' }}
        siteUrl="https://hedrickbrotherscom.sharepoint.com/sites/HBCentral"
        entryStackState={{
          width: 390,
          authoritativeWidth: 430,
          shellInlineInsetTotal: 40,
          height: 844,
          entryState: {
            id: 'phone-portrait',
            label: 'Phone portrait',
            minWidth: 320,
            maxWidth: 479,
            firstLaneColumns: 1,
            firstLanePairingAllowed: false,
            dominanceRule: 'single',
          },
          entryStateReason: 'width-match',
          shortHeightConstrained: false,
        }}
      />,
    ).container.querySelector('[data-hbc-premium="signature-hero"]');
    expect(phonePortrait?.getAttribute('data-hbc-hero-layout-mode')).toBe(
      'guided-single-column',
    );
    expect(phonePortrait?.getAttribute('data-hbc-hero-entry-reason')).toBe('width-match');
  });
});

describe('HbSignatureHeroHomepage — default banner asset resolver contract', () => {
  it('normalizes trailing slash behavior for homepage banner URLs', () => {
    expect(
      resolveHomepageHeroBannerAssetUrl(
        'https://cdn.example.invalid/homepage-assets/',
        'banner_home_7_morning.png',
      ),
    ).toBe('https://cdn.example.invalid/homepage-assets/banner_home_7_morning.png');
    expect(
      resolveHomepageHeroBannerAssetUrl(
        'https://cdn.example.invalid/homepage-assets',
        'banner_home_7_morning.png',
      ),
    ).toBe('https://cdn.example.invalid/homepage-assets/banner_home_7_morning.png');
  });

  it('does not produce brittle base+filename concatenation for missing trailing slash', () => {
    const resolved = resolveHomepageHeroBannerAssetUrl(
      'https://cdn.example.invalid/assets',
      'banner_home_7_morning.png',
    );
    expect(resolved).toBe('https://cdn.example.invalid/assets/banner_home_7_morning.png');
    expect(resolved).not.toContain('assetsbanner_home_7_morning.png');
  });

  it('resolves the canonical default banner filename when authored override is absent', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{ preferredName: 'Jordan' }}
        assetBaseUrl="https://cdn.example.invalid/homepage-assets"
        now={new Date(2026, 3, 19, 6, 0, 0, 0)}
      />,
    );
    const photo = container.querySelector('[aria-hidden="true"][style*="background-image"]');
    const style = photo?.getAttribute('style') ?? '';
    expect(style).toContain(
      'background-image: url("https://cdn.example.invalid/homepage-assets/banner_home_7_morning.png")',
    );
  });

  it('preserves authored background override precedence over default banner resolution', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{ preferredName: 'Jordan' }}
        backgroundImage="https://images.example.invalid/custom-hero.png"
        assetBaseUrl="https://cdn.example.invalid/homepage-assets"
        now={new Date(2026, 3, 19, 20, 30, 0, 0)}
      />,
    );
    const photo = container.querySelector('[aria-hidden="true"][style*="background-image"]');
    const style = photo?.getAttribute('style') ?? '';
    expect(style).toContain(
      'background-image: url("https://images.example.invalid/custom-hero.png")',
    );
    expect(style).not.toContain('banner_home_7_morning.png');
  });

  it('applies per-image focal + safe-zone CSS variables on the hero surface', () => {
    const { container } = render(
      <HbSignatureHeroHomepage
        identity={{ preferredName: 'Jordan' }}
        assetBaseUrl="https://cdn.example.invalid/homepage-assets/"
        now={new Date(2026, 3, 19, 22, 0, 0, 0)}
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="signature-hero"]');
    const style = surface?.getAttribute('style') ?? '';
    expect(style).toContain('--hbc-hero-focal-x: 48%');
    expect(style).toContain('--hbc-hero-focal-y: 50%');
    expect(style).toContain('--hbc-hero-focal-x-tablet: 50%');
    expect(style).toContain('--hbc-hero-focal-x-phone: 52%');
    expect(style).toContain('--hbc-hero-text-safe-intensity: 0.55');
    expect(style).toContain('--hbc-hero-logo-safe-intensity: 1.3');
  });

  it('exposes per-image governance for daypart-default and override selections', () => {
    const daypartDefault = resolveHomepageHeroBannerSelection({
      now: new Date(2026, 3, 19, 12, 30, 0, 0),
      assetBaseUrl: 'https://cdn.example.invalid/homepage-assets/',
      authoredOverrideUrl: undefined,
    });
    expect(daypartDefault.source).toBe('daypart-default');
    expect(daypartDefault.governance.textSafeIntensity).toBeGreaterThan(1);
    expect(daypartDefault.governance.tabletFocal).toBeDefined();

    const knownOverride = resolveHomepageHeroBannerSelection({
      now: new Date(2026, 3, 19, 12, 30, 0, 0),
      assetBaseUrl: 'https://cdn.example.invalid/homepage-assets/',
      authoredOverrideUrl:
        'https://cdn.example.invalid/homepage-assets/banner_home_7_night.png',
    });
    expect(knownOverride.source).toBe('wrapper-override');
    expect(knownOverride.governance.textSafeIntensity).toBeLessThan(1);

    const unknownOverride = resolveHomepageHeroBannerSelection({
      now: new Date(2026, 3, 19, 12, 30, 0, 0),
      assetBaseUrl: 'https://cdn.example.invalid/homepage-assets/',
      authoredOverrideUrl: 'https://images.example.invalid/custom-hero.png',
    });
    expect(unknownOverride.governance.focal).toEqual({ x: 50, y: 50 });
    expect(unknownOverride.governance.textSafeIntensity).toBe(1);
  });

  it('uses time-of-day default banner selection for representative dayparts', () => {
    const daytime = render(
      <HbSignatureHeroHomepage
        identity={{ preferredName: 'Jordan' }}
        assetBaseUrl="https://cdn.example.invalid/homepage-assets/"
        now={new Date(2026, 3, 19, 12, 30, 0, 0)}
      />,
    );
    const daytimeStyle =
      daytime.container
        .querySelector('[aria-hidden="true"][style*="background-image"]')
        ?.getAttribute('style') ?? '';
    expect(daytimeStyle).toContain('banner_home_7_mid-day.png');

    const evening = render(
      <HbSignatureHeroHomepage
        identity={{ preferredName: 'Jordan' }}
        assetBaseUrl="https://cdn.example.invalid/homepage-assets/"
        now={new Date(2026, 3, 19, 17, 30, 0, 0)}
      />,
    );
    const eveningStyle =
      evening.container
        .querySelector('[aria-hidden="true"][style*="background-image"]')
        ?.getAttribute('style') ?? '';
    expect(eveningStyle).toContain('banner_home_7_evening.png');

    const night = render(
      <HbSignatureHeroHomepage
        identity={{ preferredName: 'Jordan' }}
        assetBaseUrl="https://cdn.example.invalid/homepage-assets/"
        now={new Date(2026, 3, 19, 22, 0, 0, 0)}
      />,
    );
    const nightStyle =
      night.container
        .querySelector('[aria-hidden="true"][style*="background-image"]')
        ?.getAttribute('style') ?? '';
    expect(nightStyle).toContain('banner_home_7_night.png');
  });
});
