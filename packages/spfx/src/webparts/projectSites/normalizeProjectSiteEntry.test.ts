import { describe, expect, it } from 'vitest';
import { normalizeProjectSiteEntry } from './normalizeProjectSiteEntry.js';
import type { ILegacyFallbackRegistryCandidate } from './repository/legacyFallbackRegistryAdapter.js';

function candidate(
  overrides?: Partial<ILegacyFallbackRegistryCandidate>,
): ILegacyFallbackRegistryCandidate {
  return {
    id: 500,
    projectNumber: '25-244-01',
    projectNameRaw: '',
    legacyYear: 2025,
    folderWebUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/2025Projects/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2F2025Projects%2FShared%20Documents%2F25%2D244%2D01',
    matchStatus: 'matched',
    matchedProjectListItemId: null,
    matchedProjectTitle: '',
    matchConfidence: null,
    matchMethod: null,
    lastValidatedUtc: '2026-04-18T10:00:00.000Z',
    lastSeenUtc: '2026-04-18T09:00:00.000Z',
    ...overrides,
  };
}

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
    expect(result.primarySiteUrl).toBe('https://hedrickbrotherscom.sharepoint.com/sites/25-244-01TheWellingtonEstateHomes');
    expect(result.siteUrl).toBe('https://hedrickbrotherscom.sharepoint.com/sites/25-244-01TheWellingtonEstateHomes');
    expect(result.hasSiteUrl).toBe(true);
    expect(result.launchTargetKind).toBe('primary-site');
    expect(result.dataQuality.classification).toBe('complete');
    expect(result.dataQuality.issues).toEqual([]);
    expect(result.launchStatus.state).toBe('live');
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
    expect(result.primarySiteUrl).toBe('');
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
    expect(result.launchTargetKind).toBe('none');
    expect(result.dataQuality.classification).toBe('partial');
    expect(result.dataQuality.issues).toContain('missing-site-url');
    expect(result.launchStatus.state).toBe('provisioning');
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

  it('classifies malformed site URL explicitly', () => {
    const result = normalizeProjectSiteEntry(createItem({ field_23: 'not-a-url' }));
    expect(result.siteUrl).toBe('');
    expect(result.hasSiteUrl).toBe(false);
    expect(result.dataQuality.classification).toBe('malformed');
    expect(result.dataQuality.issues).toContain('malformed-site-url');
    expect(result.launchStatus.state).toBe('attention-needed');
  });

  it('uses legacy fallback folder when primary site is missing', () => {
    const result = normalizeProjectSiteEntry(createItem({ field_23: '' }), {
      candidate: candidate(),
    });

    expect(result.primarySiteUrl).toBe('');
    expect(result.legacyFallbackFolderUrl).toContain('/sites/2025Projects/');
    expect(result.siteUrl).toBe(result.legacyFallbackFolderUrl);
    expect(result.launchTargetKind).toBe('legacy-fallback');
    expect(result.launchStatus.isLaunchable).toBe(true);
    expect(result.launchStatus.reasonCode).toBe('legacy-fallback-ready');
  });

  it('keeps primary site precedence when both primary and fallback are present', () => {
    const result = normalizeProjectSiteEntry(
      createItem({
        field_23: 'https://hedrickbrotherscom.sharepoint.com/sites/25-244-01TheWellingtonEstateHomes',
      }),
      {
        candidate: candidate({
          folderWebUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/2025Projects/Shared%20Documents',
        }),
      },
    );

    expect(result.launchTargetKind).toBe('primary-site');
    expect(result.primarySiteUrl).toContain('/sites/25-244-01TheWellingtonEstateHomes');
    expect(result.siteUrl).toBe(result.primarySiteUrl);
    expect(result.legacyFallbackFolderUrl).toContain('/sites/2025Projects/');
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

  it('classifies invalid year explicitly', () => {
    const result = normalizeProjectSiteEntry(createItem({ Year: 2200 }));
    expect(result.dataQuality.classification).toBe('malformed');
    expect(result.dataQuality.issues).toContain('invalid-year');
    expect(result.launchStatus.state).toBe('attention-needed');
  });

  it('classifies inactive stage with live site as archived', () => {
    const result = normalizeProjectSiteEntry(createItem({ field_6: 'Archived' }));
    expect(result.launchStatus.state).toBe('archived');
    expect(result.launchStatus.isLaunchable).toBe(true);
  });
});

// ── Merged-record identity ────────────────────────────────────────────────

describe('normalizeProjectSiteEntry — merged record identity', () => {
  it('emits a project-anchored recordKey and project-only classification when no fallback matched', () => {
    const result = normalizeProjectSiteEntry(createItem({ Id: 42 }));
    expect(result.recordKey).toBe('project:42');
    expect(result.sourceClassification).toBe('project-only');
    expect(result.sourceRefs.projectsListId).toBe(42);
    expect(result.sourceRefs.legacyRegistryKey).toBeNull();
    expect(result.sourceRefs.legacyRegistrySourceYear).toBeNull();
  });

  it('classifies as merged and exposes a legacyRegistryKey when the fallback matched', () => {
    const result = normalizeProjectSiteEntry(
      createItem({ Id: 7, field_2: '25-244-01' }),
      { candidate: candidate({ projectNumber: '25-244-01', legacyYear: 2025 }) },
    );
    expect(result.sourceClassification).toBe('merged');
    expect(result.recordKey).toBe('project:7');
    expect(result.sourceRefs.projectsListId).toBe(7);
    expect(result.sourceRefs.legacyRegistryKey).toBe('25-244-01:2025');
    expect(result.sourceRefs.legacyRegistrySourceYear).toBe(2025);
  });

  it('honors registryKeyOverride for strong-linkage joins', () => {
    const result = normalizeProjectSiteEntry(
      createItem({ Id: 7, field_2: '25-244-01' }),
      {
        candidate: candidate({ projectNumber: '99-999-99', legacyYear: 1999 }),
        registryKeyOverride: '99-999-99:1999',
      },
    );
    expect(result.sourceClassification).toBe('merged');
    expect(result.sourceRefs.legacyRegistryKey).toBe('99-999-99:1999');
    expect(result.sourceRefs.legacyRegistrySourceYear).toBe(1999);
  });

  it('produces a non-empty recordKey for every normalized entry', () => {
    const items = [
      createItem({ Id: 1 }),
      createItem({ Id: 2, field_23: null }),
      createItem({ Id: 3, Year: 'not-a-year' }),
    ];
    for (const item of items) {
      const entry = normalizeProjectSiteEntry(item);
      expect(entry.recordKey.length).toBeGreaterThan(0);
    }
  });
});
