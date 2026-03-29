import { describe, expect, it } from 'vitest';
import type { IRawProjectSiteItem } from './types.js';
import {
  normalizeProjectSiteEntry,
  normalizeProjectSiteEntries,
} from './normalizeProjectSiteEntry.js';

// ── Factory ───────────────────────────────────────────────────────────────

/** Full-select item with all custom fields. */
function createFullItem(overrides?: Partial<IRawProjectSiteItem>): IRawProjectSiteItem {
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

/** Core-only item (fallback when custom fields are missing). */
function createCoreItem(overrides?: Partial<IRawProjectSiteItem>): IRawProjectSiteItem {
  return {
    Id: 2,
    Title: '25-244-01 - The Wellington Estate Homes',
    Year: 2025,
    ...overrides,
  };
}

// ── normalizeProjectSiteEntry ─────────────────────────────────────────────

describe('normalizeProjectSiteEntry — full select', () => {
  it('normalizes a complete raw item', () => {
    const result = normalizeProjectSiteEntry(createFullItem());
    expect(result.id).toBe(1);
    expect(result.projectName).toBe('Riverside Medical Center');
    expect(result.projectNumber).toBe('24-001-01');
    expect(result.siteUrl).toBe('https://hedrickbrotherscom.sharepoint.com/sites/RMC');
    expect(result.year).toBe(2024);
    expect(result.department).toBe('commercial');
    expect(result.hasSiteUrl).toBe(true);
  });

  it('prefers ProjectName over Title-parsed name', () => {
    const result = normalizeProjectSiteEntry(createFullItem({
      Title: '24-001-01 — Different Name',
      ProjectName: 'Correct Name',
    }));
    expect(result.projectName).toBe('Correct Name');
  });

  it('handles null SiteUrl', () => {
    const result = normalizeProjectSiteEntry(createFullItem({ SiteUrl: null }));
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
  });

  it('handles null optional fields', () => {
    const result = normalizeProjectSiteEntry(createFullItem({
      ProjectNumber: null,
      Department: null,
      ProjectLocation: null,
      ProjectType: null,
      ProjectStage: null,
      ClientName: null,
    }));
    expect(result.projectNumber).toBe('24-001-01'); // parsed from Title
    expect(result.department).toBe('');
  });
});

describe('normalizeProjectSiteEntry — core-only fallback', () => {
  it('parses project number and name from Title with dash separator', () => {
    const result = normalizeProjectSiteEntry(createCoreItem());
    expect(result.projectNumber).toBe('25-244-01');
    expect(result.projectName).toBe('The Wellington Estate Homes');
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
  });

  it('parses Title with em-dash separator', () => {
    const result = normalizeProjectSiteEntry(createCoreItem({
      Title: '24-001-01 — Medical Center',
    }));
    expect(result.projectNumber).toBe('24-001-01');
    expect(result.projectName).toBe('Medical Center');
  });

  it('handles Title with no separator', () => {
    const result = normalizeProjectSiteEntry(createCoreItem({
      Title: 'Just A Name',
    }));
    expect(result.projectNumber).toBe('');
    expect(result.projectName).toBe('Just A Name');
  });

  it('handles null Title', () => {
    const result = normalizeProjectSiteEntry(createCoreItem({ Title: null }));
    expect(result.projectName).toBe('(Untitled Project)');
  });

  it('returns empty strings for all missing optional fields', () => {
    const result = normalizeProjectSiteEntry(createCoreItem());
    expect(result.department).toBe('');
    expect(result.projectLocation).toBe('');
    expect(result.projectType).toBe('');
    expect(result.projectStage).toBe('');
    expect(result.clientName).toBe('');
  });
});

// ── normalizeProjectSiteEntries ───────────────────────────────────────────

describe('normalizeProjectSiteEntries', () => {
  it('sorts by project number ascending', () => {
    const items = [
      createFullItem({ Id: 3, ProjectNumber: '24-003-01', Title: '24-003-01 — C' }),
      createFullItem({ Id: 1, ProjectNumber: '24-001-01', Title: '24-001-01 — A' }),
      createFullItem({ Id: 2, ProjectNumber: '24-002-01', Title: '24-002-01 — B' }),
    ];
    const result = normalizeProjectSiteEntries(items);
    expect(result.map((r) => r.projectNumber)).toEqual(['24-001-01', '24-002-01', '24-003-01']);
  });

  it('places items without project number after numbered items', () => {
    const items = [
      createCoreItem({ Id: 1, Title: 'No Number Project' }),
      createFullItem({ Id: 2, ProjectNumber: '24-001-01' }),
    ];
    const result = normalizeProjectSiteEntries(items);
    expect(result[0].projectNumber).toBe('24-001-01');
    expect(result[1].projectNumber).toBe('');
  });

  it('returns empty array for empty input', () => {
    expect(normalizeProjectSiteEntries([])).toEqual([]);
  });
});
