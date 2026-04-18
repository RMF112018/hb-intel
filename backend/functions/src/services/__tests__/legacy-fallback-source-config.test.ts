import { describe, expect, it } from 'vitest';
import {
  LEGACY_FALLBACK_LIST_HOST_SITE_URL,
  LEGACY_PROJECT_ANNUAL_SOURCES,
  validateLegacySourceConfiguration,
} from '../legacy-fallback/source-config.js';

describe('legacy fallback source configuration', () => {
  it('covers contiguous years 2019 through 2026 with valid URLs', () => {
    const issues = validateLegacySourceConfiguration(LEGACY_PROJECT_ANNUAL_SOURCES);

    expect(issues).toEqual([]);
    expect(LEGACY_PROJECT_ANNUAL_SOURCES.map((source) => source.year)).toEqual([
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025,
      2026,
    ]);

    for (const source of LEGACY_PROJECT_ANNUAL_SOURCES) {
      expect(source.siteUrl).toMatch(/^https:\/\//);
      expect(source.sitePath).toMatch(/^\/sites\//);
    }
  });

  it('locks HBCentral as the bridge list host site', () => {
    expect(LEGACY_FALLBACK_LIST_HOST_SITE_URL).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );
  });
});
