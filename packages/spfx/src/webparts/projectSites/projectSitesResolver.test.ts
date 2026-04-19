import { describe, expect, it } from 'vitest';
import { resolveProjectSiteEntries } from './projectSitesResolver.js';
import type { ILegacyFallbackRegistryCandidate } from './repository/legacyFallbackRegistryAdapter.js';

function projectRow(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    Id: 1,
    Title: '25-244-01 - The Wellington Estate Homes',
    Year: 2025,
    field_2: '25-244-01',
    field_3: 'The Wellington Estate Homes',
    field_6: 'Active',
    field_23: 'https://tenant.sharepoint.com/sites/25-244-01TheWellingtonEstateHomes',
    ...overrides,
  };
}

function candidate(
  overrides?: Partial<ILegacyFallbackRegistryCandidate>,
): ILegacyFallbackRegistryCandidate {
  return {
    id: 10,
    projectNumber: '25-244-01',
    projectNameRaw: 'The Wellington Estate Homes',
    legacyYear: 2025,
    folderWebUrl: 'https://tenant.sharepoint.com/sites/2025Projects/Shared%20Documents/25-244-01',
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

describe('resolveProjectSiteEntries', () => {
  it('emits a project-only entry when a project row has no fallback match', () => {
    const result = resolveProjectSiteEntries({
      projectRows: [projectRow()],
      fallbackCandidates: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0].sourceClassification).toBe('project-only');
    expect(result[0].recordKey).toBe('project:1');
    expect(result[0].launchTargetKind).toBe('primary-site');
  });

  it('emits a merged entry when a heuristic fallback match exists', () => {
    const result = resolveProjectSiteEntries({
      projectRows: [projectRow({ field_23: '' })],
      fallbackCandidates: [candidate()],
    });
    expect(result).toHaveLength(1);
    expect(result[0].sourceClassification).toBe('merged');
    expect(result[0].recordKey).toBe('project:1');
    expect(result[0].launchTargetKind).toBe('legacy-fallback');
    expect(result[0].legacyFallbackFolderUrl).toContain('/25-244-01');
  });

  it('prefers strong linkage over heuristic when both can match', () => {
    // Strong candidate points at project Id=1 but with a different (projectNumber, year).
    // Heuristic candidate matches the project's own number+year.
    const strong = candidate({
      id: 20,
      matchedProjectListItemId: 1,
      projectNumber: '99-999-99',
      legacyYear: 1999,
      folderWebUrl: 'https://tenant/strong',
      lastValidatedUtc: '2026-04-10T00:00:00.000Z',
    });
    const heuristic = candidate({
      id: 21,
      matchedProjectListItemId: null,
      folderWebUrl: 'https://tenant/heuristic',
      lastValidatedUtc: '2026-04-18T00:00:00.000Z',
    });
    const result = resolveProjectSiteEntries({
      projectRows: [projectRow({ field_23: '' })],
      fallbackCandidates: [heuristic, strong],
    });
    expect(result).toHaveLength(2);
    const merged = result.find((e) => e.sourceClassification === 'merged');
    expect(merged?.legacyFallbackFolderUrl).toBe('https://tenant/strong');
    // The strong-linkage registryKey preserves the registry row's own
    // (projectNumber, year), not the project row's.
    expect(merged?.sourceRefs.legacyRegistryKey).toBe('99-999-99:1999');
    // Heuristic candidate was not consumed, so it surfaces as synthetic.
    const synthetic = result.find((e) => e.sourceClassification === 'legacy-only');
    expect(synthetic?.legacyFallbackFolderUrl).toBe('https://tenant/heuristic');
  });

  it('emits a synthetic legacy-only entry when no project row claims the candidate', () => {
    const result = resolveProjectSiteEntries({
      projectRows: [],
      fallbackCandidates: [candidate({
        projectNumber: '22-100-01',
        legacyYear: 2022,
        projectNameRaw: 'Orphan Legacy Project',
        folderWebUrl: 'https://tenant/orphan',
      })],
    });
    expect(result).toHaveLength(1);
    expect(result[0].sourceClassification).toBe('legacy-only');
    expect(result[0].recordKey).toBe('legacy:22-100-01:2022');
    expect(result[0].projectName).toBe('Orphan Legacy Project');
    expect(result[0].year).toBe(2022);
    expect(result[0].launchTargetKind).toBe('legacy-fallback');
    expect(result[0].siteUrl).toBe('https://tenant/orphan');
    expect(result[0].sourceRefs.projectsListId).toBeNull();
    expect(result[0].sourceRefs.legacyRegistryKey).toBe('22-100-01:2022');
  });

  it('falls back to a placeholder name when the registry has no usable name', () => {
    const result = resolveProjectSiteEntries({
      projectRows: [],
      fallbackCandidates: [candidate({ projectNameRaw: '', matchedProjectTitle: '' })],
    });
    expect(result[0].projectName).toBe('(Legacy Project) 25-244-01');
    expect(result[0].dataQuality.issues).toContain('missing-project-name');
  });

  it('renders a merged project once, not twice, even if the candidate would also qualify as synthetic', () => {
    const c = candidate();
    const result = resolveProjectSiteEntries({
      projectRows: [projectRow({ field_23: '' })],
      fallbackCandidates: [c],
    });
    expect(result).toHaveLength(1);
    expect(result[0].sourceClassification).toBe('merged');
  });

  it('deduplicates colliding record keys deterministically (project wins)', () => {
    // Two project rows with the same Id collapse to one merged entry —
    // the first-seen wins, and project-anchored entries always precede
    // synthetic emission.
    const result = resolveProjectSiteEntries({
      projectRows: [projectRow({ Id: 1, field_3: 'First' }), projectRow({ Id: 1, field_3: 'Second' })],
      fallbackCandidates: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0].projectName).toBe('First');
  });
});
