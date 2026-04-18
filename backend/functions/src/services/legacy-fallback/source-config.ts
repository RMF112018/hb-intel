/**
 * Prompt 01 contract lock: annual legacy source resolution configuration.
 *
 * This module defines the authoritative annual source catalog for the legacy
 * project fallback bridge. Discovery/crawl implementation is intentionally
 * deferred to Prompt 03.
 */

export type LegacyProjectSourceYear =
  | 2019
  | 2020
  | 2021
  | 2022
  | 2023
  | 2024
  | 2025
  | 2026;

export interface ILegacyAnnualSourceConfig {
  year: LegacyProjectSourceYear;
  siteUrl: string;
  sitePath: string;
  preferredLibraryName?: string;
  driveOverrideId?: string;
}

export const LEGACY_PROJECT_SITE_COLLECTION_ROOT =
  'https://hedrickbrotherscom.sharepoint.com/sites';

export const LEGACY_FALLBACK_LIST_HOST_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

export const DEFAULT_LEGACY_LIBRARY_NAME = 'Documents';

const LEGACY_SOURCE_YEARS: readonly LegacyProjectSourceYear[] = [
  2019,
  2020,
  2021,
  2022,
  2023,
  2024,
  2025,
  2026,
] as const;

export const LEGACY_PROJECT_ANNUAL_SOURCES: readonly ILegacyAnnualSourceConfig[] =
  LEGACY_SOURCE_YEARS.map((year) => ({
    year,
    sitePath: `/sites/${year}Projects`,
    siteUrl: `${LEGACY_PROJECT_SITE_COLLECTION_ROOT}/${year}Projects`,
    preferredLibraryName: DEFAULT_LEGACY_LIBRARY_NAME,
  }));

export function validateLegacySourceConfiguration(
  sources: readonly ILegacyAnnualSourceConfig[],
): string[] {
  const issues: string[] = [];

  const expectedYears = [...LEGACY_SOURCE_YEARS];
  const actualYears = [...sources.map((source) => source.year)].sort((a, b) => a - b);
  if (JSON.stringify(actualYears) !== JSON.stringify(expectedYears)) {
    issues.push(
      `Legacy source years must be contiguous 2019..2026. Found: ${actualYears.join(', ')}`,
    );
  }

  for (const source of sources) {
    if (!/^https:\/\/.+/.test(source.siteUrl)) {
      issues.push(`Invalid siteUrl for year ${source.year}: ${source.siteUrl}`);
    }

    if (!source.sitePath.startsWith('/sites/')) {
      issues.push(`Invalid sitePath for year ${source.year}: ${source.sitePath}`);
    }
  }

  return issues;
}
