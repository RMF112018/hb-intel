import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  isValidYear,
  normalizeProjectSitesRuntimeConfig,
  parseProjectSitesRuntimeYear,
  PROJECT_SITES_ALL_SCOPE_LIMIT,
  PROJECT_SITES_SELECT_FIELDS,
  SP_PROJECTS_FIELDS,
  resolveDefaultYear,
  resolveInitialProjectSitesScope,
} from './types.js';

describe('isValidYear', () => {
  it('accepts typical 4-digit years', () => {
    expect(isValidYear(2024)).toBe(true);
    expect(isValidYear(2026)).toBe(true);
    expect(isValidYear(2000)).toBe(true);
  });

  it('accepts boundary years', () => {
    expect(isValidYear(1900)).toBe(true);
    expect(isValidYear(2100)).toBe(true);
  });

  it('rejects years below minimum', () => {
    expect(isValidYear(1899)).toBe(false);
    expect(isValidYear(0)).toBe(false);
    expect(isValidYear(-1)).toBe(false);
  });

  it('rejects years above maximum', () => {
    expect(isValidYear(2101)).toBe(false);
    expect(isValidYear(99999)).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(isValidYear(2024.5)).toBe(false);
    expect(isValidYear(NaN)).toBe(false);
    expect(isValidYear(Infinity)).toBe(false);
  });
});

describe('resolveDefaultYear', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null for empty array', () => {
    expect(resolveDefaultYear([])).toBeNull();
  });

  it('returns current calendar year if present in list', () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear + 1, currentYear, currentYear - 1];
    expect(resolveDefaultYear(years)).toBe(currentYear);
  });

  it('returns the first (most recent) year if current year is not in list', () => {
    // Use years that are definitely not the current year
    const years = [2099, 2098, 2097];
    expect(resolveDefaultYear(years)).toBe(2099);
  });

  it('returns the only year if list has one element', () => {
    expect(resolveDefaultYear([2025])).toBe(2025);
  });
});

describe('parseProjectSitesRuntimeYear', () => {
  it('accepts valid numeric and string year values', () => {
    expect(parseProjectSitesRuntimeYear(2026)).toBe(2026);
    expect(parseProjectSitesRuntimeYear('2026')).toBe(2026);
    expect(parseProjectSitesRuntimeYear(' 2026 ')).toBe(2026);
  });

  it('rejects invalid values', () => {
    expect(parseProjectSitesRuntimeYear('abc')).toBeNull();
    expect(parseProjectSitesRuntimeYear('2026.4')).toBeNull();
    expect(parseProjectSitesRuntimeYear(1899)).toBeNull();
    expect(parseProjectSitesRuntimeYear(2101)).toBeNull();
    expect(parseProjectSitesRuntimeYear(undefined)).toBeNull();
  });
});

describe('normalizeProjectSitesRuntimeConfig', () => {
  it('parses yearOverride and hostPageYear with strict validation', () => {
    const result = normalizeProjectSitesRuntimeConfig({
      webPartId: 'abc',
      hostPageYear: '2024',
      webPartProperties: { yearOverride: '2026' },
      functionAppUrl: 'https://example.com',
      backendMode: 'production',
      allowBackendModeSwitch: true,
      apiAudience: 'api://aud',
      assetBaseUrl: 'https://cdn/',
    });

    expect(result.yearOverride).toBe(2026);
    expect(result.hostPageYear).toBe(2024);
    expect(result.webPartId).toBe('abc');
    expect(result.functionAppUrl).toBe('https://example.com');
    expect(result.allowBackendModeSwitch).toBe(true);
  });

  it('treats 0 as no year override', () => {
    expect(
      normalizeProjectSitesRuntimeConfig({
        webPartProperties: { yearOverride: 0 },
      }).yearOverride,
    ).toBeNull();
  });
});

describe('resolveInitialProjectSitesScope', () => {
  it('prefers author override over host year and default', () => {
    const result = resolveInitialProjectSitesScope(
      [2025, 2024],
      normalizeProjectSitesRuntimeConfig({
        webPartProperties: { yearOverride: 2026 },
        hostPageYear: 2025,
      }),
    );
    expect(result.scope).toEqual({ kind: 'year', year: 2026 });
    expect(result.source).toBe('author-override');
  });

  it('falls back to host page year when no valid override', () => {
    const result = resolveInitialProjectSitesScope(
      [2025, 2024],
      normalizeProjectSitesRuntimeConfig({
        webPartProperties: { yearOverride: 'invalid' },
        hostPageYear: 2024,
      }),
    );
    expect(result.scope).toEqual({ kind: 'year', year: 2024 });
    expect(result.source).toBe('host-page-year');
  });

  it('falls back to default year and finally all-projects', () => {
    const withDefault = resolveInitialProjectSitesScope(
      [2025, 2024],
      normalizeProjectSitesRuntimeConfig({}),
    );
    expect(withDefault.scope).toEqual({ kind: 'year', year: 2025 });
    expect(withDefault.source).toBe('default-year');

    const allFallback = resolveInitialProjectSitesScope(
      [],
      normalizeProjectSitesRuntimeConfig({}),
    );
    expect(allFallback.scope).toEqual({ kind: 'all' });
    expect(allFallback.source).toBe('all-projects-fallback');
  });
});

describe('repository field contract', () => {
  it('declares explicit selected fields for Project Sites adapter', () => {
    expect(PROJECT_SITES_SELECT_FIELDS).toContain(SP_PROJECTS_FIELDS.ID);
    expect(PROJECT_SITES_SELECT_FIELDS).toContain(SP_PROJECTS_FIELDS.TITLE);
    expect(PROJECT_SITES_SELECT_FIELDS).toContain(SP_PROJECTS_FIELDS.YEAR);
    expect(PROJECT_SITES_SELECT_FIELDS).toContain(SP_PROJECTS_FIELDS.PROJECT_NUMBER);
    expect(PROJECT_SITES_SELECT_FIELDS).toContain(SP_PROJECTS_FIELDS.PROJECT_NAME);
    expect(PROJECT_SITES_SELECT_FIELDS).toContain(SP_PROJECTS_FIELDS.SITE_URL);
  });

  it('keeps all-projects reads explicitly bounded', () => {
    expect(PROJECT_SITES_ALL_SCOPE_LIMIT).toBeGreaterThan(0);
    expect(PROJECT_SITES_ALL_SCOPE_LIMIT).toBeLessThanOrEqual(5000);
  });
});
