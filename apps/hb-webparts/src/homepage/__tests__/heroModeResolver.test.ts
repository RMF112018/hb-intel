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

  it('routes non-HBCentral URLs to article mode', () => {
    expect(
      resolveHeroMode('https://hedrickbrotherscom.sharepoint.com/sites/OtherSite'),
    ).toBe('article');
  });

  it('routes undefined siteUrl to article mode', () => {
    expect(resolveHeroMode(undefined)).toBe('article');
  });

  it('routes an empty siteUrl to article mode', () => {
    expect(resolveHeroMode('')).toBe('article');
  });
});
