import { describe, expect, it } from 'vitest';
import {
  normalizeProjectSiteEntry,
  normalizeProjectSiteEntries,
} from './normalizeProjectSiteEntry.js';

// ── Factories using confirmed internal field names ────────────────────────

/** Item with confirmed field_N internal names (as returned by SP REST). */
function createItem(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    Id: 1,
    Title: '25-244-01 - The Wellington Estate Homes',
    Year: 2025,
    field_1: '00000000-0000-0000-0000-000000000002',   // ProjectId
    field_2: '25-244-01',                                // ProjectNumber
    field_3: 'The Wellington Estate Homes',              // ProjectName
    field_4: 'Wellington, FL',                           // ProjectLocation
    field_5: 'Residential',                              // ProjectType
    field_6: 'Preconstruction',                          // ProjectStage
    field_12: 'luxury-residential',                      // Department (not in CSV but schema confirmed)
    field_14: 'Wellington Estates LLC',                   // ClientName
    field_23: 'https://hedrickbrotherscom.sharepoint.com/sites/25-244-01TheWellingtonEstateHomes', // SiteUrl
    ...overrides,
  };
}

// ── field_23 -> siteUrl (THE critical path for clickable cards) ───────────

describe('normalizeProjectSiteEntry — SiteUrl (field_23)', () => {
  it('extracts plain string URL from field_23', () => {
    const result = normalizeProjectSiteEntry(createItem());
    expect(result.siteUrl).toBe('https://hedrickbrotherscom.sharepoint.com/sites/25-244-01TheWellingtonEstateHomes');
    expect(result.hasSiteUrl).toBe(true);
  });

  it('extracts URL from SharePoint Hyperlink object { Url }', () => {
    const result = normalizeProjectSiteEntry(createItem({
      field_23: { Url: 'https://example.com/sites/test', Description: 'Test' },
    }));
    expect(result.siteUrl).toBe('https://example.com/sites/test');
    expect(result.hasSiteUrl).toBe(true);
  });

  it('extracts URL from object with lowercase url', () => {
    const result = normalizeProjectSiteEntry(createItem({
      field_23: { url: 'https://example.com' },
    }));
    expect(result.siteUrl).toBe('https://example.com');
    expect(result.hasSiteUrl).toBe(true);
  });

  it('returns empty and hasSiteUrl=false when field_23 is null', () => {
    const result = normalizeProjectSiteEntry(createItem({ field_23: null }));
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
  });

  it('returns empty when field_23 is missing', () => {
    const item = createItem();
    delete item.field_23;
    const result = normalizeProjectSiteEntry(item);
    expect(result.hasSiteUrl).toBe(false);
  });

  it('falls back to display-name SiteUrl if field_23 absent', () => {
    const item = createItem();
    delete item.field_23;
    item['SiteUrl'] = 'https://fallback.com';
    const result = normalizeProjectSiteEntry(item);
    expect(result.siteUrl).toBe('https://fallback.com');
    expect(result.hasSiteUrl).toBe(true);
  });
});

// ── field_3 -> projectName, field_2 -> projectNumber ──────────────────────

describe('normalizeProjectSiteEntry — ProjectName (field_3) + ProjectNumber (field_2)', () => {
  it('maps field_3 to projectName', () => {
    const result = normalizeProjectSiteEntry(createItem());
    expect(result.projectName).toBe('The Wellington Estate Homes');
  });

  it('maps field_2 to projectNumber', () => {
    const result = normalizeProjectSiteEntry(createItem());
    expect(result.projectNumber).toBe('25-244-01');
  });

  it('falls back to Title parsing when field_3 is empty', () => {
    const result = normalizeProjectSiteEntry(createItem({ field_3: '' }));
    expect(result.projectName).toBe('The Wellington Estate Homes'); // from Title parse
  });

  it('falls back to Title parsing when field_2 is empty', () => {
    const result = normalizeProjectSiteEntry(createItem({ field_2: '' }));
    expect(result.projectNumber).toBe('25-244-01'); // from Title parse
  });

  it('returns (Untitled Project) when both field_3 and Title are empty', () => {
    const result = normalizeProjectSiteEntry({ Id: 1, Title: null, Year: 2025 });
    expect(result.projectName).toBe('(Untitled Project)');
  });
});

// ── Other custom fields ───────────────────────────────────────────────────

describe('normalizeProjectSiteEntry — other custom fields', () => {
  it('maps field_4 to projectLocation', () => {
    expect(normalizeProjectSiteEntry(createItem()).projectLocation).toBe('Wellington, FL');
  });

  it('maps field_5 to projectType', () => {
    expect(normalizeProjectSiteEntry(createItem()).projectType).toBe('Residential');
  });

  it('maps field_6 to projectStage', () => {
    expect(normalizeProjectSiteEntry(createItem()).projectStage).toBe('Preconstruction');
  });

  it('maps field_14 to clientName', () => {
    expect(normalizeProjectSiteEntry(createItem()).clientName).toBe('Wellington Estates LLC');
  });

  it('returns empty for missing optional fields', () => {
    const result = normalizeProjectSiteEntry({ Id: 1, Title: 'Test', Year: 2025 });
    expect(result.department).toBe('');
    expect(result.projectLocation).toBe('');
    expect(result.projectType).toBe('');
    expect(result.clientName).toBe('');
  });
});

// ── Standard fields ───────────────────────────────────────────────────────

describe('normalizeProjectSiteEntry — standard fields', () => {
  it('reads Id, Title, Year directly', () => {
    const result = normalizeProjectSiteEntry(createItem());
    expect(result.id).toBe(1);
    expect(result.year).toBe(2025);
  });
});

// ── Sorting ───────────────────────────────────────────────────────────────

describe('normalizeProjectSiteEntries', () => {
  it('sorts by project number ascending', () => {
    const items = [
      createItem({ Id: 3, field_2: '25-003-01', Title: '25-003-01 - C' }),
      createItem({ Id: 1, field_2: '25-001-01', Title: '25-001-01 - A' }),
      createItem({ Id: 2, field_2: '25-002-01', Title: '25-002-01 - B' }),
    ];
    const result = normalizeProjectSiteEntries(items);
    expect(result.map((r) => r.projectNumber)).toEqual(['25-001-01', '25-002-01', '25-003-01']);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeProjectSiteEntries([])).toEqual([]);
  });
});
