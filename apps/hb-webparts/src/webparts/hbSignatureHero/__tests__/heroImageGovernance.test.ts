import { describe, expect, it } from 'vitest';
import {
  HOMEPAGE_HERO_BANNER_NEUTRAL_GOVERNANCE,
  resolveHomepageHeroBannerGovernance,
} from '../homepageHeroBannerAssetResolver.js';
import { HOMEPAGE_HERO_BANNER_FILE_BY_DAYPART } from '../homepageHeroBannerTimeOfDaySelector.js';

describe('resolveHomepageHeroBannerGovernance', () => {
  it('returns tuned governance for every approved daypart banner', () => {
    for (const fileName of Object.values(HOMEPAGE_HERO_BANNER_FILE_BY_DAYPART)) {
      const governance = resolveHomepageHeroBannerGovernance(fileName);
      expect(governance).not.toBe(HOMEPAGE_HERO_BANNER_NEUTRAL_GOVERNANCE);
      expect(governance.focal.x).toBeGreaterThanOrEqual(0);
      expect(governance.focal.x).toBeLessThanOrEqual(100);
      expect(governance.focal.y).toBeGreaterThanOrEqual(0);
      expect(governance.focal.y).toBeLessThanOrEqual(100);
      expect(governance.tabletFocal).toBeDefined();
      expect(governance.phoneFocal).toBeDefined();
      expect(governance.textSafeIntensity).toBeGreaterThan(0);
      expect(governance.logoSafeIntensity).toBeGreaterThan(0);
    }
  });

  it('tunes night intensities differently from mid-day so the contrast stack adapts per image', () => {
    const night = resolveHomepageHeroBannerGovernance('banner_home_7_night.png');
    const midDay = resolveHomepageHeroBannerGovernance('banner_home_7_mid-day.png');

    // Night imagery is already dark — text-safe darken should be reduced.
    expect(night.textSafeIntensity).toBeLessThan(midDay.textSafeIntensity);
    // Night imagery is already dark — logo-safe brighten should be amplified.
    expect(night.logoSafeIntensity).toBeGreaterThan(midDay.logoSafeIntensity);
  });

  it('returns neutral defaults for unknown filenames (e.g., authored overrides)', () => {
    const governance = resolveHomepageHeroBannerGovernance('not-a-real-banner.jpg');
    expect(governance.focal).toEqual({ x: 50, y: 50 });
    expect(governance.tabletFocal).toBeUndefined();
    expect(governance.phoneFocal).toBeUndefined();
    expect(governance.textSafeIntensity).toBe(1);
    expect(governance.logoSafeIntensity).toBe(1);
  });

  it('exposes neutral defaults via the named export for downstream callers', () => {
    expect(HOMEPAGE_HERO_BANNER_NEUTRAL_GOVERNANCE.focal).toEqual({ x: 50, y: 50 });
    expect(HOMEPAGE_HERO_BANNER_NEUTRAL_GOVERNANCE.textSafeIntensity).toBe(1);
    expect(HOMEPAGE_HERO_BANNER_NEUTRAL_GOVERNANCE.logoSafeIntensity).toBe(1);
  });
});
