import { describe, expect, it } from 'vitest';
import type { IRawProjectSiteItem } from './types.js';
import {
  normalizeProjectSiteEntry,
  normalizeProjectSiteEntries,
} from './normalizeProjectSiteEntry.js';

// ── Factory ───────────────────────────────────────────────────────────────

function createRawItem(overrides?: Partial<IRawProjectSiteItem>): IRawProjectSiteItem {
  return {
    Id: 1,
    ProjectName: 'Riverside Medical Center',
    ProjectNumber: '24-001-01',
    SiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/RMC',
    Year: 2024,
    Department: 'commercial',
    ProjectLocation: 'Austin, TX',
    ProjectType: 'Healthcare',
    ProjectStage: 'Active',
    ClientName: 'HCA Healthcare',
    ...overrides,
  };
}

// ── normalizeProjectSiteEntry ─────────────────────────────────────────────

describe('normalizeProjectSiteEntry', () => {
  it('normalizes a complete raw item', () => {
    const result = normalizeProjectSiteEntry(createRawItem());
    expect(result).toEqual({
      id: 1,
      projectName: 'Riverside Medical Center',
      projectNumber: '24-001-01',
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/RMC',
      year: 2024,
      department: 'commercial',
      projectLocation: 'Austin, TX',
      projectType: 'Healthcare',
      projectStage: 'Active',
      clientName: 'HCA Healthcare',
      hasSiteUrl: true,
    });
  });

  it('handles null ProjectName with fallback', () => {
    const result = normalizeProjectSiteEntry(createRawItem({ ProjectName: null }));
    expect(result.projectName).toBe('(Untitled Project)');
  });

  it('handles null SiteUrl', () => {
    const result = normalizeProjectSiteEntry(createRawItem({ SiteUrl: null }));
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
  });

  it('handles empty string SiteUrl', () => {
    const result = normalizeProjectSiteEntry(createRawItem({ SiteUrl: '' }));
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
  });

  it('handles whitespace-only SiteUrl', () => {
    const result = normalizeProjectSiteEntry(createRawItem({ SiteUrl: '   ' }));
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
  });

  it('handles null optional fields with empty string defaults', () => {
    const result = normalizeProjectSiteEntry(
      createRawItem({
        ProjectNumber: null,
        Department: null,
        ProjectLocation: null,
        ProjectType: null,
        ProjectStage: null,
        ClientName: null,
      }),
    );
    expect(result.projectNumber).toBe('');
    expect(result.department).toBe('');
    expect(result.projectLocation).toBe('');
    expect(result.projectType).toBe('');
    expect(result.projectStage).toBe('');
    expect(result.clientName).toBe('');
  });

  it('handles null Year with 0 default', () => {
    const result = normalizeProjectSiteEntry(createRawItem({ Year: null }));
    expect(result.year).toBe(0);
  });

  it('handles null Id with 0 default', () => {
    const result = normalizeProjectSiteEntry(
      createRawItem({ Id: null as unknown as number }),
    );
    expect(result.id).toBe(0);
  });

  it('trims whitespace from string fields', () => {
    const result = normalizeProjectSiteEntry(
      createRawItem({
        ProjectName: '  Riverside  ',
        ProjectNumber: ' 24-001-01 ',
        SiteUrl: ' https://example.com ',
      }),
    );
    expect(result.projectName).toBe('Riverside');
    expect(result.projectNumber).toBe('24-001-01');
    expect(result.siteUrl).toBe('https://example.com');
    expect(result.hasSiteUrl).toBe(true);
  });
});

// ── normalizeProjectSiteEntries ───────────────────────────────────────────

describe('normalizeProjectSiteEntries', () => {
  it('sorts by project number ascending', () => {
    const items = [
      createRawItem({ Id: 3, ProjectNumber: '24-003-01' }),
      createRawItem({ Id: 1, ProjectNumber: '24-001-01' }),
      createRawItem({ Id: 2, ProjectNumber: '24-002-01' }),
    ];
    const result = normalizeProjectSiteEntries(items);
    expect(result.map((r) => r.projectNumber)).toEqual([
      '24-001-01',
      '24-002-01',
      '24-003-01',
    ]);
  });

  it('places items without project number after numbered items', () => {
    const items = [
      createRawItem({ Id: 1, ProjectNumber: null, ProjectName: 'Unnamed' }),
      createRawItem({ Id: 2, ProjectNumber: '24-001-01' }),
    ];
    const result = normalizeProjectSiteEntries(items);
    expect(result[0].projectNumber).toBe('24-001-01');
    expect(result[1].projectNumber).toBe('');
  });

  it('sorts by project name when numbers are equal', () => {
    const items = [
      createRawItem({ Id: 2, ProjectNumber: '24-001-01', ProjectName: 'Bravo' }),
      createRawItem({ Id: 1, ProjectNumber: '24-001-01', ProjectName: 'Alpha' }),
    ];
    const result = normalizeProjectSiteEntries(items);
    expect(result[0].projectName).toBe('Alpha');
    expect(result[1].projectName).toBe('Bravo');
  });

  it('returns empty array for empty input', () => {
    expect(normalizeProjectSiteEntries([])).toEqual([]);
  });
});
