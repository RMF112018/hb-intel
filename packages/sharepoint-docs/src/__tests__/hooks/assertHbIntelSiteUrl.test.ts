import { assertHbIntelSiteUrl } from '../../hooks/internal/useSharePointDocsServices.js';

describe('assertHbIntelSiteUrl', () => {
  it('throws when value is an empty string', () => {
    expect(() => assertHbIntelSiteUrl('')).toThrow(
      '[sharepoint-docs] VITE_HBINTEL_SITE_URL is required'
    );
  });

  it('throws when value is undefined', () => {
    expect(() => assertHbIntelSiteUrl(undefined)).toThrow(
      '[sharepoint-docs] VITE_HBINTEL_SITE_URL is required'
    );
  });

  it('throws when value is null', () => {
    expect(() => assertHbIntelSiteUrl(null)).toThrow(
      '[sharepoint-docs] VITE_HBINTEL_SITE_URL is required'
    );
  });

  it('throws when value is whitespace only', () => {
    expect(() => assertHbIntelSiteUrl('   ')).toThrow(
      '[sharepoint-docs] VITE_HBINTEL_SITE_URL is required'
    );
  });

  it('returns the trimmed string for a valid URL', () => {
    const result = assertHbIntelSiteUrl('https://contoso.sharepoint.com/sites/hb-intel');
    expect(result).toBe('https://contoso.sharepoint.com/sites/hb-intel');
  });

  it('trims leading and trailing whitespace from a valid URL', () => {
    const result = assertHbIntelSiteUrl('  https://contoso.sharepoint.com/sites/hb-intel  ');
    expect(result).toBe('https://contoso.sharepoint.com/sites/hb-intel');
  });
});
