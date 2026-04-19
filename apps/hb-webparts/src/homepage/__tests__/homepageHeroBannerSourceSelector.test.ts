import { describe, expect, it } from 'vitest';
import { resolveHomepageHeroBannerSelection } from '../../webparts/hbSignatureHero/homepageHeroBannerSourceSelector.js';

function localDateAt(hour: number, minute: number): Date {
  const dt = new Date(2026, 3, 19, 0, 0, 0, 0);
  dt.setHours(hour, minute, 0, 0);
  return dt;
}

describe('homepageHeroBannerSourceSelector — winning-source contract', () => {
  it('selects the daypart default when no override is supplied (8:20 AM → morning)', () => {
    const result = resolveHomepageHeroBannerSelection({
      now: localDateAt(8, 20),
      assetBaseUrl: 'https://cdn.example.invalid/assets/',
      authoredOverrideUrl: undefined,
    });
    expect(result.source).toBe('daypart-default');
    expect(result.daypart).toBe('morning');
    expect(result.fileName).toBe('banner_home_7_morning.png');
    expect(result.url).toBe('https://cdn.example.invalid/assets/banner_home_7_morning.png');
    expect(result.overrideActive).toBe(false);
  });

  it('selects the daypart default for an evening time when no override is supplied', () => {
    const result = resolveHomepageHeroBannerSelection({
      now: localDateAt(18, 0),
      assetBaseUrl: 'https://cdn.example.invalid/assets/',
      authoredOverrideUrl: undefined,
    });
    expect(result.source).toBe('daypart-default');
    expect(result.daypart).toBe('evening');
    expect(result.fileName).toBe('banner_home_7_evening.png');
    expect(result.url).toBe('https://cdn.example.invalid/assets/banner_home_7_evening.png');
  });

  it('honors an explicit authored override and reports source=override', () => {
    const result = resolveHomepageHeroBannerSelection({
      now: localDateAt(8, 20),
      assetBaseUrl: 'https://cdn.example.invalid/assets/',
      authoredOverrideUrl: 'https://example.com/authored.jpg',
    });
    expect(result.source).toBe('override');
    expect(result.daypart).toBe('morning');
    expect(result.fileName).toBe('banner_home_7_morning.png');
    expect(result.url).toBe('https://example.com/authored.jpg');
    expect(result.overrideActive).toBe(true);
  });

  it('treats empty-string override as not active', () => {
    const result = resolveHomepageHeroBannerSelection({
      now: localDateAt(8, 20),
      assetBaseUrl: 'https://cdn.example.invalid/assets/',
      authoredOverrideUrl: '',
    });
    expect(result.source).toBe('daypart-default');
    expect(result.overrideActive).toBe(false);
  });

  it('reports no-image when neither override nor assetBaseUrl can produce a URL', () => {
    const result = resolveHomepageHeroBannerSelection({
      now: localDateAt(8, 20),
      assetBaseUrl: undefined,
      authoredOverrideUrl: undefined,
    });
    expect(result.source).toBe('no-image');
    expect(result.url).toBeUndefined();
    expect(result.overrideActive).toBe(false);
    expect(result.daypart).toBe('morning');
    expect(result.fileName).toBe('banner_home_7_morning.png');
  });
});
