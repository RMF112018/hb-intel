/**
 * Unit tests for the Project Sites client-side filter / sort / search pipeline.
 * W01r-P12.
 */
import { describe, expect, it } from 'vitest';
import {
  applyProjectSitesPipeline,
  extractProjectSitesFacets,
  humanizeUpn,
} from './projectSitesFilter.js';
import type {
  IProjectSiteEntry,
  ProjectSitesFilters,
  ProjectSitesSortKey,
} from './types.js';
import { DEFAULT_SORT_KEY, EMPTY_FILTERS } from './types.js';

function makeEntry(overrides?: Partial<IProjectSiteEntry>): IProjectSiteEntry {
  const id = overrides?.id ?? 1;
  return {
    recordKey: `project:${id}`,
    id,
    sourceClassification: 'project-only',
    sourceRefs: {
      projectsListId: id,
      legacyRegistryKey: null,
      legacyRegistrySourceYear: null,
    },
    projectName: 'Sample Project',
    projectNumber: '25-000-00',
    year: 2025,
    department: 'commercial',
    officeDivision: 'south-florida',
    projectType: 'GC',
    projectStage: 'Active',
    clientName: 'Sample Client',
    projectLocation: 'Miami, FL',
    projectStreetAddress: '100 Biscayne Blvd',
    projectCity: 'Miami',
    projectCounty: 'Miami-Dade',
    projectState: 'FL',
    projectZip: '33101',
    projectExecutiveUpn: 'exec@hedrickbrothers.com',
    projectManagerUpn: 'pm.smith@hedrickbrothers.com',
    leadEstimatorUpn: 'lead.estimator@hedrickbrothers.com',
    supportingEstimatorUpns: ['supp1@hedrickbrothers.com'],
    procoreProject: '',
    primarySiteUrl: 'https://example.com/sample',
    legacyFallbackFolderUrl: '',
    legacyFallbackSourceYear: null,
    legacyFallbackMatchStatus: '',
    launchTargetKind: 'primary-site',
    siteUrl: 'https://example.com/sample',
    hasSiteUrl: true,
    dataQuality: {
      classification: 'complete',
      issues: [],
      hasAnyIssue: false,
      hasLaunchCriticalIssue: false,
    },
    launchStatus: {
      state: 'live',
      reasonCode: 'live-site-ready',
      isLaunchable: true,
      userMessage: 'Live site is available and launch-ready.',
    },
    ...overrides,
  };
}

function runPipeline(
  entries: IProjectSiteEntry[],
  partial?: {
    searchTerm?: string;
    sortKey?: ProjectSitesSortKey;
    filters?: ProjectSitesFilters;
  },
): IProjectSiteEntry[] {
  return applyProjectSitesPipeline({
    entries,
    searchTerm: partial?.searchTerm ?? '',
    sortKey: partial?.sortKey ?? DEFAULT_SORT_KEY,
    filters: partial?.filters ?? EMPTY_FILTERS,
  });
}

// ── Search ────────────────────────────────────────────────────────────────

describe('applyProjectSitesPipeline — search', () => {
  it('returns all entries when search is empty', () => {
    const result = runPipeline([
      makeEntry({ id: 1, projectName: 'Alpha' }),
      makeEntry({ id: 2, projectName: 'Beta' }),
    ]);
    expect(result).toHaveLength(2);
  });

  it('matches against projectName (case-insensitive)', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectName: 'Riverside Medical Center' }),
        makeEntry({ id: 2, projectName: 'Downtown Office Tower' }),
      ],
      { searchTerm: 'riverside' },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('matches against projectNumber', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectNumber: '24-001-01' }),
        makeEntry({ id: 2, projectNumber: '25-002-01' }),
      ],
      { searchTerm: '25-002' },
    );
    expect(result.map((e) => e.id)).toEqual([2]);
  });

  it('matches against clientName', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, clientName: 'HCA Healthcare' }),
        makeEntry({ id: 2, clientName: 'Regions Bank' }),
      ],
      { searchTerm: 'regions' },
    );
    expect(result.map((e) => e.id)).toEqual([2]);
  });

  it('matches against projectCity', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectCity: 'Tampa' }),
        makeEntry({ id: 2, projectCity: 'Palm Beach' }),
      ],
      { searchTerm: 'tampa' },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('requires ALL tokens to match (AND across tokens)', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectName: 'Alpha Medical', clientName: 'HCA' }),
        makeEntry({ id: 2, projectName: 'Alpha Office', clientName: 'Other' }),
      ],
      { searchTerm: 'alpha medical' },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('matches against manager UPN', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectManagerUpn: 'jane.doe@hedrickbrothers.com' }),
        makeEntry({ id: 2, projectManagerUpn: 'bob.smith@hedrickbrothers.com' }),
      ],
      { searchTerm: 'jane' },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('trims whitespace from the search term', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectName: 'Alpha' }),
        makeEntry({ id: 2, projectName: 'Beta' }),
      ],
      { searchTerm: '   alpha   ' },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });
});

// ── Sort ──────────────────────────────────────────────────────────────────

describe('applyProjectSitesPipeline — sort', () => {
  it('default sort is number-asc', () => {
    const result = runPipeline([
      makeEntry({ id: 1, projectNumber: '25-999-01' }),
      makeEntry({ id: 2, projectNumber: '25-001-01' }),
    ]);
    expect(result.map((e) => e.id)).toEqual([2, 1]);
  });

  it('name-asc sorts A → Z', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectName: 'Zulu' }),
        makeEntry({ id: 2, projectName: 'Alpha' }),
      ],
      { sortKey: 'name-asc' },
    );
    expect(result.map((e) => e.id)).toEqual([2, 1]);
  });

  it('name-desc sorts Z → A', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectName: 'Alpha' }),
        makeEntry({ id: 2, projectName: 'Zulu' }),
      ],
      { sortKey: 'name-desc' },
    );
    expect(result.map((e) => e.id)).toEqual([2, 1]);
  });

  it('number-desc sorts by project number descending', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectNumber: '25-001-01' }),
        makeEntry({ id: 2, projectNumber: '25-999-01' }),
      ],
      { sortKey: 'number-desc' },
    );
    expect(result.map((e) => e.id)).toEqual([2, 1]);
  });

  it('year-desc sorts newest first', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, year: 2024 }),
        makeEntry({ id: 2, year: 2026 }),
        makeEntry({ id: 3, year: 2025 }),
      ],
      { sortKey: 'year-desc' },
    );
    expect(result.map((e) => e.id)).toEqual([2, 3, 1]);
  });

  it('year-asc sorts oldest first', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, year: 2024 }),
        makeEntry({ id: 2, year: 2026 }),
      ],
      { sortKey: 'year-asc' },
    );
    expect(result.map((e) => e.id)).toEqual([1, 2]);
  });
});

// ── Filters ───────────────────────────────────────────────────────────────

describe('applyProjectSitesPipeline — filters', () => {
  it('filters by stage (multi-select OR within field)', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectStage: 'Active' }),
        makeEntry({ id: 2, projectStage: 'Pursuit' }),
        makeEntry({ id: 3, projectStage: 'Archived' }),
      ],
      { filters: { ...EMPTY_FILTERS, stages: ['Active', 'Pursuit'] } },
    );
    expect(result.map((e) => e.id).sort()).toEqual([1, 2]);
  });

  it('stage filter is case-insensitive', () => {
    const result = runPipeline(
      [makeEntry({ id: 1, projectStage: 'Active' })],
      { filters: { ...EMPTY_FILTERS, stages: ['ACTIVE'] } },
    );
    expect(result).toHaveLength(1);
  });

  it('filters by project manager UPN', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectManagerUpn: 'a@x.com' }),
        makeEntry({ id: 2, projectManagerUpn: 'b@x.com' }),
      ],
      { filters: { ...EMPTY_FILTERS, projectManagerUpns: ['b@x.com'] } },
    );
    expect(result.map((e) => e.id)).toEqual([2]);
  });

  it('filters by lead estimator UPN', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, leadEstimatorUpn: 'lead1@x.com' }),
        makeEntry({ id: 2, leadEstimatorUpn: 'lead2@x.com' }),
      ],
      { filters: { ...EMPTY_FILTERS, leadEstimatorUpns: ['lead2@x.com'] } },
    );
    expect(result.map((e) => e.id)).toEqual([2]);
  });

  it('filters by project executive UPN', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectExecutiveUpn: 'exec1@x.com' }),
        makeEntry({ id: 2, projectExecutiveUpn: 'exec2@x.com' }),
      ],
      { filters: { ...EMPTY_FILTERS, projectExecutiveUpns: ['exec1@x.com'] } },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('combines multiple filter fields with AND', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectStage: 'Active', department: 'commercial' }),
        makeEntry({ id: 2, projectStage: 'Active', department: 'residential' }),
        makeEntry({ id: 3, projectStage: 'Pursuit', department: 'commercial' }),
      ],
      {
        filters: {
          ...EMPTY_FILTERS,
          stages: ['Active'],
          departments: ['commercial'],
        },
      },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('filters by hasSiteOnly=true', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, hasSiteUrl: true }),
        makeEntry({ id: 2, hasSiteUrl: false }),
      ],
      { filters: { ...EMPTY_FILTERS, hasSiteOnly: true } },
    );
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('filters by hasSiteOnly=false', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, hasSiteUrl: true }),
        makeEntry({ id: 2, hasSiteUrl: false }),
      ],
      { filters: { ...EMPTY_FILTERS, hasSiteOnly: false } },
    );
    expect(result.map((e) => e.id)).toEqual([2]);
  });

  it('filters by sourceClassifications (single value)', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, sourceClassification: 'project-only' }),
        makeEntry({ id: 2, sourceClassification: 'merged' }),
        makeEntry({ id: 3, sourceClassification: 'legacy-only' }),
      ],
      { filters: { ...EMPTY_FILTERS, sourceClassifications: ['legacy-only'] } },
    );
    expect(result.map((e) => e.id)).toEqual([3]);
  });

  it('filters by sourceClassifications (OR within the field)', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, sourceClassification: 'project-only' }),
        makeEntry({ id: 2, sourceClassification: 'merged' }),
        makeEntry({ id: 3, sourceClassification: 'legacy-only' }),
      ],
      { filters: { ...EMPTY_FILTERS, sourceClassifications: ['merged', 'legacy-only'] } },
    );
    expect(result.map((e) => e.id)).toEqual([2, 3]);
  });

  it('returns all entries when sourceClassifications is empty', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, sourceClassification: 'project-only' }),
        makeEntry({ id: 2, sourceClassification: 'merged' }),
      ],
      { filters: { ...EMPTY_FILTERS, sourceClassifications: [] } },
    );
    expect(result.map((e) => e.id)).toEqual([1, 2]);
  });
});

// ── Composition ───────────────────────────────────────────────────────────

describe('applyProjectSitesPipeline — composition', () => {
  it('applies search before filter before sort', () => {
    const result = runPipeline(
      [
        makeEntry({ id: 1, projectName: 'Zulu Medical', projectStage: 'Active' }),
        makeEntry({ id: 2, projectName: 'Alpha Medical', projectStage: 'Active' }),
        makeEntry({ id: 3, projectName: 'Bravo Medical', projectStage: 'Pursuit' }),
      ],
      {
        searchTerm: 'medical',
        filters: { ...EMPTY_FILTERS, stages: ['Active'] },
        sortKey: 'name-asc',
      },
    );
    expect(result.map((e) => e.id)).toEqual([2, 1]);
  });

  it('returns an empty array when nothing matches', () => {
    const result = runPipeline(
      [makeEntry({ id: 1, projectName: 'Alpha' })],
      { searchTerm: 'zzz-nomatch' },
    );
    expect(result).toEqual([]);
  });
});

// ── Facets ────────────────────────────────────────────────────────────────

describe('extractProjectSitesFacets', () => {
  it('de-duplicates and sorts facet values alphabetically', () => {
    const facets = extractProjectSitesFacets([
      makeEntry({ id: 1, projectStage: 'Active' }),
      makeEntry({ id: 2, projectStage: 'Pursuit' }),
      makeEntry({ id: 3, projectStage: 'active' }),
      makeEntry({ id: 4, projectStage: '' }),
    ]);
    expect(facets.stages.length).toBe(2);
    expect(facets.stages[0]!.toLowerCase()).toBe('active');
    expect(facets.stages[1]!.toLowerCase()).toBe('pursuit');
  });

  it('omits empty strings from facets', () => {
    const facets = extractProjectSitesFacets([
      makeEntry({ id: 1, department: 'commercial' }),
      makeEntry({ id: 2, department: '' }),
    ]);
    expect(facets.departments).toEqual(['commercial']);
  });

  it('counts source classifications in canonical order, omitting zero-count values', () => {
    const facets = extractProjectSitesFacets([
      makeEntry({ id: 1, sourceClassification: 'legacy-only' }),
      makeEntry({ id: 2, sourceClassification: 'project-only' }),
      makeEntry({ id: 3, sourceClassification: 'project-only' }),
      makeEntry({ id: 4, sourceClassification: 'legacy-only' }),
    ]);
    expect(facets.sourceClassifications).toEqual([
      { value: 'project-only', count: 2 },
      { value: 'legacy-only', count: 2 },
    ]);
  });

  it('emits an empty source-classification facet list for an empty entry set', () => {
    const facets = extractProjectSitesFacets([]);
    expect(facets.sourceClassifications).toEqual([]);
  });
});

// ── humanizeUpn ───────────────────────────────────────────────────────────

describe('humanizeUpn', () => {
  it('title-cases a dotted UPN local part', () => {
    expect(humanizeUpn('jane.doe@hedrickbrothers.com')).toBe('Jane Doe');
  });

  it('handles underscore separators', () => {
    expect(humanizeUpn('john_smith@example.com')).toBe('John Smith');
  });

  it('returns empty string for empty input', () => {
    expect(humanizeUpn('')).toBe('');
    expect(humanizeUpn('   ')).toBe('');
  });

  it('passes through values that already look human', () => {
    expect(humanizeUpn('Jane Doe')).toBe('Jane Doe');
  });
});
