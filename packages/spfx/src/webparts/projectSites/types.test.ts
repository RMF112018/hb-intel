import { describe, expect, it } from 'vitest';
import {
  isValidYear,
  normalizeProjectSitesRuntimeConfig,
  parseProjectSitesRuntimeYear,
  PROJECT_SITES_ALL_SCOPE_LIMIT,
  PROJECT_SITES_SELECT_FIELDS,
  SP_PROJECTS_FIELDS,
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

  it('defaults to All Projects when no authoritative override is present, regardless of available years', () => {
    const withYears = resolveInitialProjectSitesScope(
      [2025, 2024],
      normalizeProjectSitesRuntimeConfig({}),
    );
    expect(withYears.scope).toEqual({ kind: 'all' });
    expect(withYears.source).toBe('all-projects-default');
    expect(withYears.resolvedYear).toBeNull();

    const withoutYears = resolveInitialProjectSitesScope(
      [],
      normalizeProjectSitesRuntimeConfig({}),
    );
    expect(withoutYears.scope).toEqual({ kind: 'all' });
    expect(withoutYears.source).toBe('all-projects-default');
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

  it('does not include display-name fallback fields in repository $select', () => {
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('ProjectNumber');
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('ProjectName');
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('ProjectLocation');
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('ProjectType');
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('ProjectStage');
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('Department');
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('ClientName');
    expect(PROJECT_SITES_SELECT_FIELDS).not.toContain('SiteUrl');
  });

  it('keeps all-projects reads explicitly bounded', () => {
    expect(PROJECT_SITES_ALL_SCOPE_LIMIT).toBeGreaterThan(0);
    expect(PROJECT_SITES_ALL_SCOPE_LIMIT).toBeLessThanOrEqual(5000);
  });
});
