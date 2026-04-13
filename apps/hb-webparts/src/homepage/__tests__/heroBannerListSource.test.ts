import { describe, expect, it } from 'vitest';
import {
  mapHeroBannerListRow,
  selectEffectiveHeroBannerRow,
} from '../data/heroBannerListSource.js';
import { normalizeHeroBannerConfig } from '../helpers/topBandConfig.js';

/**
 * Phase-02 Prompt-04 — Hero Banner Config list read-seam contract.
 */
describe('mapHeroBannerListRow', () => {
  it('returns undefined when the row is disabled', () => {
    expect(
      mapHeroBannerListRow({ Title: 'Hello', Enabled: false }),
    ).toBeUndefined();
  });

  it('returns undefined when Title is empty even if Enabled is true', () => {
    expect(
      mapHeroBannerListRow({ Title: '   ', Enabled: true }),
    ).toBeUndefined();
  });

  it('maps an enabled row with all fields populated', () => {
    const mapped = mapHeroBannerListRow({
      Title: 'Build with GRIT',
      Message: 'Q2 priorities are live.',
      Eyebrow: 'HB Central',
      MetadataLine: 'Updated Apr 13',
      BackgroundImageUrl: 'https://cdn.example.invalid/hero.jpg',
      PrimaryCtaLabel: 'View priorities',
      PrimaryCtaUrl: '/SitePages/Priorities.aspx',
      PrimaryCtaOpenInNewTab: true,
      SecondaryCtaLabel: 'Read update',
      SecondaryCtaUrl: '/SitePages/Update.aspx',
      SecondaryCtaOpenInNewTab: false,
      Enabled: true,
      Modified: '2026-04-13T09:00:00Z',
    });
    expect(mapped).toEqual({
      headline: 'Build with GRIT',
      message: 'Q2 priorities are live.',
      eyebrow: 'HB Central',
      metadata: 'Updated Apr 13',
      background: { src: 'https://cdn.example.invalid/hero.jpg', alt: 'Build with GRIT' },
      cta: { label: 'View priorities', href: '/SitePages/Priorities.aspx', openInNewTab: true },
      secondaryCta: { label: 'Read update', href: '/SitePages/Update.aspx', openInNewTab: undefined },
      enabled: true,
    });
  });

  it('drops CTAs when the label or URL is missing', () => {
    const mapped = mapHeroBannerListRow({
      Title: 'Minimal',
      Enabled: true,
      PrimaryCtaLabel: 'Click',
      // PrimaryCtaUrl missing
      SecondaryCtaUrl: '/x',
      // SecondaryCtaLabel missing
    });
    expect(mapped?.cta).toBeUndefined();
    expect(mapped?.secondaryCta).toBeUndefined();
  });

  it('tolerates string forms of the Enabled boolean', () => {
    expect(mapHeroBannerListRow({ Title: 'x', Enabled: 'true' })?.headline).toBe('x');
    expect(mapHeroBannerListRow({ Title: 'x', Enabled: '1' })?.headline).toBe('x');
    expect(mapHeroBannerListRow({ Title: 'x', Enabled: 'false' })).toBeUndefined();
    expect(mapHeroBannerListRow({ Title: 'x', Enabled: '0' })).toBeUndefined();
  });
});

describe('selectEffectiveHeroBannerRow', () => {
  it('picks the newest enabled row by Modified', () => {
    const picked = selectEffectiveHeroBannerRow([
      { Title: 'Old', Enabled: true, Modified: '2026-01-01T00:00:00Z' },
      { Title: 'New', Enabled: true, Modified: '2026-04-13T09:00:00Z' },
      { Title: 'Newer-disabled', Enabled: false, Modified: '2026-05-01T00:00:00Z' },
    ]);
    expect(picked?.headline).toBe('New');
  });

  it('returns undefined when no row is enabled', () => {
    expect(
      selectEffectiveHeroBannerRow([
        { Title: 'A', Enabled: false },
        { Title: 'B', Enabled: false },
      ]),
    ).toBeUndefined();
  });

  it('returns undefined for an empty list', () => {
    expect(selectEffectiveHeroBannerRow([])).toBeUndefined();
  });
});

describe('end-to-end: list row → normalizeHeroBannerConfig', () => {
  it('feeds cleanly into the existing normalizer without raw-field leakage', () => {
    const mapped = mapHeroBannerListRow({
      Title: 'From list',
      Message: 'Msg',
      Enabled: true,
      BackgroundImageUrl: 'https://cdn.example.invalid/a.jpg',
    });
    const normalized = normalizeHeroBannerConfig(mapped);
    expect(normalized.headline).toBe('From list');
    expect(normalized.message).toBe('Msg');
    expect(normalized.background?.src).toBe('https://cdn.example.invalid/a.jpg');
  });
});
