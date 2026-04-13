import { describe, expect, it } from 'vitest';
import {
  HBCENTRAL_SITE_URL,
  resolveHeroMode,
} from '../../webparts/hbSignatureHero/heroModeResolver.js';

describe('resolveHeroMode — Phase-01 HBCentral homepage lock', () => {
  it('locks HBCentral to homepage mode', () => {
    expect(resolveHeroMode(HBCENTRAL_SITE_URL)).toBe('homepage');
  });

  it('ignores a trailing slash', () => {
    expect(resolveHeroMode(`${HBCENTRAL_SITE_URL}/`)).toBe('homepage');
  });

  it('is case-insensitive', () => {
    expect(
      resolveHeroMode('HTTPS://HEDRICKBROTHERSCOM.SHAREPOINT.COM/sites/HBCENTRAL'),
    ).toBe('homepage');
  });

  it('falls through to homepage for non-HBCentral URLs in Phase-01', () => {
    // Phase-01 preserves current behavior on non-HBCentral hosts. Phase-02
    // will flip this branch to 'article'.
    expect(
      resolveHeroMode('https://hedrickbrotherscom.sharepoint.com/sites/OtherSite'),
    ).toBe('homepage');
  });

  it('falls through to homepage when siteUrl is undefined', () => {
    expect(resolveHeroMode(undefined)).toBe('homepage');
  });

  it('falls through to homepage when siteUrl is an empty string', () => {
    expect(resolveHeroMode('')).toBe('homepage');
  });
});
