import { describe, expect, it } from 'vitest';
import {
  normalizeProjectSiteEntry,
  normalizeProjectSiteEntries,
} from './normalizeProjectSiteEntry.js';

// ── Factories ─────────────────────────────────────────────────────────────

/** Item with standard display-name fields. */
function createStandardItem(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    Id: 1,
    Title: '24-001-01 — Riverside Medical Center',
    Year: 2024,
    ProjectName: 'Riverside Medical Center',
    ProjectNumber: '24-001-01',
    SiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/RMC',
    Department: 'commercial',
    ProjectLocation: 'Austin, TX',
    ProjectType: 'Healthcare',
    ProjectStage: 'Active',
    ClientName: 'HCA Healthcare',
    ...overrides,
  };
}

/** Item with only Title + Year (minimum viable). */
function createMinimalItem(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    Id: 2,
    Title: '25-244-01 - The Wellington Estate Homes',
    Year: 2025,
    ...overrides,
  };
}

// ── normalizeProjectSiteEntry ─────────────────────────────────────────────

describe('normalizeProjectSiteEntry — standard field names', () => {
  it('normalizes a complete item', () => {
    const result = normalizeProjectSiteEntry(createStandardItem());
    expect(result.projectName).toBe('Riverside Medical Center');
    expect(result.projectNumber).toBe('24-001-01');
    expect(result.siteUrl).toBe('https://hedrickbrotherscom.sharepoint.com/sites/RMC');
    expect(result.hasSiteUrl).toBe(true);
    expect(result.department).toBe('commercial');
  });

  it('handles null SiteUrl', () => {
    const result = normalizeProjectSiteEntry(createStandardItem({ SiteUrl: null }));
    expect(result.hasSiteUrl).toBe(false);
  });
});

describe('normalizeProjectSiteEntry — fuzzy field matching', () => {
  it('finds SiteUrl under OData-encoded internal name', () => {
    const result = normalizeProjectSiteEntry({
      Id: 1, Title: 'Test', Year: 2025,
      Site_x0020_Url: 'https://example.com/sites/test',
    });
    expect(result.siteUrl).toBe('https://example.com/sites/test');
    expect(result.hasSiteUrl).toBe(true);
  });

  it('finds ProjectName under OData-encoded internal name', () => {
    const result = normalizeProjectSiteEntry({
      Id: 1, Title: '25-001 — Fallback', Year: 2025,
      Project_x0020_Name: 'OData Name',
    });
    expect(result.projectName).toBe('OData Name');
  });

  it('finds fields under lowercase keys', () => {
    const result = normalizeProjectSiteEntry({
      Id: 1, Title: 'Test', Year: 2025,
      siteurl: 'https://example.com',
      department: 'luxury-residential',
    });
    expect(result.siteUrl).toBe('https://example.com');
    expect(result.department).toBe('luxury-residential');
  });
});

describe('normalizeProjectSiteEntry — Title parsing fallback', () => {
  it('parses number and name from Title with dash', () => {
    const result = normalizeProjectSiteEntry(createMinimalItem());
    expect(result.projectNumber).toBe('25-244-01');
    expect(result.projectName).toBe('The Wellington Estate Homes');
  });

  it('parses Title with em-dash', () => {
    const result = normalizeProjectSiteEntry(createMinimalItem({
      Title: '24-001-01 — Medical Center',
    }));
    expect(result.projectNumber).toBe('24-001-01');
    expect(result.projectName).toBe('Medical Center');
  });

  it('handles Title with no separator', () => {
    const result = normalizeProjectSiteEntry(createMinimalItem({ Title: 'Just A Name' }));
    expect(result.projectNumber).toBe('');
    expect(result.projectName).toBe('Just A Name');
  });

  it('handles null Title', () => {
    const result = normalizeProjectSiteEntry({ Id: 1, Year: 2025, Title: null });
    expect(result.projectName).toBe('(Untitled Project)');
  });

  it('returns empty strings for all missing optional fields', () => {
    const result = normalizeProjectSiteEntry(createMinimalItem());
    expect(result.department).toBe('');
    expect(result.projectLocation).toBe('');
    expect(result.clientName).toBe('');
    expect(result.hasSiteUrl).toBe(false);
  });
});

// ── normalizeProjectSiteEntries ───────────────────────────────────────────

describe('normalizeProjectSiteEntries', () => {
  it('sorts by project number ascending', () => {
    const items = [
      createStandardItem({ Id: 3, ProjectNumber: '24-003-01', Title: '24-003-01 — C' }),
      createStandardItem({ Id: 1, ProjectNumber: '24-001-01', Title: '24-001-01 — A' }),
      createStandardItem({ Id: 2, ProjectNumber: '24-002-01', Title: '24-002-01 — B' }),
    ];
    const result = normalizeProjectSiteEntries(items);
    expect(result.map((r) => r.projectNumber)).toEqual(['24-001-01', '24-002-01', '24-003-01']);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeProjectSiteEntries([])).toEqual([]);
  });
});
