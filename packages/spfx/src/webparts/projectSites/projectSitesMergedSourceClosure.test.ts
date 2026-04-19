/**
 * Merged-source bridge closure-regression matrix.
 *
 * Existing per-module tests cover the resolver, filter, and facet pieces
 * in isolation. This suite proves the end-to-end bridge cases that must
 * never silently regress once the Projects-list → merged-source migration
 * is live:
 *
 *   - fallback-only records stay visible,
 *   - merged records stay single,
 *   - approved linkage beats heuristic,
 *   - the weaker heuristic candidate still surfaces as synthetic,
 *   - record identity stays deterministic,
 *   - source-aware filtering actually yields the narrow set, and
 *   - facet counts match what the resolver emitted.
 *
 * Fixtures are source-explicit (a `projectRow({...})` builder plus a
 * `fallbackCandidate({...})` builder) so every case reads as a small
 * scenario, not a pile of unrelated fields.
 */
import { describe, expect, it } from 'vitest';
import {
  applyProjectSitesPipeline,
  extractProjectSitesFacets,
} from './projectSitesFilter.js';
import { resolveProjectSiteEntries } from './projectSitesResolver.js';
import { DEFAULT_SORT_KEY, EMPTY_FILTERS } from './types.js';
import type { ILegacyFallbackRegistryCandidate } from './repository/legacyFallbackRegistryAdapter.js';

function projectRow(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    Id: 1,
    Title: '25-001-01 - Alpha',
    Year: 2025,
    field_2: '25-001-01',
    field_3: 'Alpha',
    field_6: 'Active',
    field_23: 'https://tenant.sharepoint.com/sites/alpha',
    ...overrides,
  };
}

function fallbackCandidate(
  overrides?: Partial<ILegacyFallbackRegistryCandidate>,
): ILegacyFallbackRegistryCandidate {
  return {
    id: 900,
    projectNumber: '25-001-01',
    projectNameRaw: 'Alpha',
    legacyYear: 2025,
    folderWebUrl: 'https://tenant.sharepoint.com/sites/2025Projects/Shared%20Documents/Alpha',
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

// ── 1. Fallback-only visibility ───────────────────────────────────────────

describe('closure: fallback-only visibility', () => {
  it('surfaces a synthetic legacy-only record when no project row claims the candidate', () => {
    const result = resolveProjectSiteEntries({
      projectRows: [],
      fallbackCandidates: [
        fallbackCandidate({
          projectNumber: '22-100-01',
          legacyYear: 2022,
          projectNameRaw: 'Orphan Legacy',
          folderWebUrl: 'https://tenant/orphan',
        }),
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0].sourceClassification).toBe('legacy-only');
    expect(result[0].recordKey).toBe('legacy:22-100-01:2022');
    expect(result[0].siteUrl).toBe('https://tenant/orphan');
    expect(result[0].launchTargetKind).toBe('legacy-fallback');
  });
});

// ── 2. Merged record stays single ─────────────────────────────────────────

describe('closure: merged records render once', () => {
  it('does not emit both a merged project entry and a synthetic legacy-only entry for the same candidate', () => {
    const result = resolveProjectSiteEntries({
      projectRows: [projectRow({ Id: 1, field_23: '' })],
      fallbackCandidates: [fallbackCandidate({ id: 901 })],
    });

    expect(result).toHaveLength(1);
    expect(result[0].sourceClassification).toBe('merged');
    expect(result[0].recordKey).toBe('project:1');
    expect(result[0].siteUrl).toContain('/Alpha');
  });
});

// ── 3. Approved-linkage precedence ────────────────────────────────────────

describe('closure: approved linkage beats heuristic', () => {
  it('uses a strong-linkage candidate even when a heuristic candidate has fresher timestamps', () => {
    // The strong candidate intentionally has an *older* validation
    // timestamp and a different (projectNumber, year); it must still
    // win because `matchedProjectListItemId` binds it to the project.
    const strong = fallbackCandidate({
      id: 800,
      matchedProjectListItemId: 1,
      projectNumber: '99-999-99',
      legacyYear: 1999,
      folderWebUrl: 'https://tenant/strong-linked',
      lastValidatedUtc: '2020-01-01T00:00:00.000Z',
    });
    const heuristic = fallbackCandidate({
      id: 801,
      matchedProjectListItemId: null,
      folderWebUrl: 'https://tenant/heuristic',
      lastValidatedUtc: '2026-04-18T23:59:59.000Z',
    });

    const result = resolveProjectSiteEntries({
      projectRows: [projectRow({ Id: 1, field_23: '' })],
      fallbackCandidates: [heuristic, strong],
    });

    const merged = result.find((e) => e.sourceClassification === 'merged');
    expect(merged?.legacyFallbackFolderUrl).toBe('https://tenant/strong-linked');
    // Registry-side (projectNumber, year) flows through sourceRefs so
    // linkage diagnostics stay accurate for strong-linkage joins.
    expect(merged?.sourceRefs.legacyRegistryKey).toBe('99-999-99:1999');
  });
});

// ── 4. Unused heuristic candidate still surfaces ──────────────────────────

describe('closure: losing heuristic candidate surfaces as synthetic', () => {
  it('emits the unconsumed candidate as legacy-only when strong linkage took the project', () => {
    const strong = fallbackCandidate({
      id: 810,
      matchedProjectListItemId: 1,
      projectNumber: '99-999-99',
      legacyYear: 1999,
      folderWebUrl: 'https://tenant/strong-linked',
    });
    const heuristic = fallbackCandidate({
      id: 811,
      matchedProjectListItemId: null,
      projectNumber: '25-001-01',
      legacyYear: 2025,
      folderWebUrl: 'https://tenant/heuristic',
    });

    const result = resolveProjectSiteEntries({
      projectRows: [projectRow({ Id: 1, field_23: '' })],
      fallbackCandidates: [heuristic, strong],
    });

    expect(result).toHaveLength(2);
    const synthetic = result.find((e) => e.sourceClassification === 'legacy-only');
    expect(synthetic?.legacyFallbackFolderUrl).toBe('https://tenant/heuristic');
    expect(synthetic?.recordKey).toBe('legacy:25-001-01:2025');
  });
});

// ── 5. Deterministic identity ─────────────────────────────────────────────

describe('closure: record identity is deterministic', () => {
  it('produces the same recordKey set across repeated resolution of identical input', () => {
    const input = {
      projectRows: [
        projectRow({ Id: 1 }),
        projectRow({ Id: 2, field_2: '25-002-01', field_3: 'Beta', field_23: '' }),
      ],
      fallbackCandidates: [
        fallbackCandidate({ id: 820, projectNumber: '25-002-01', legacyYear: 2025 }),
        fallbackCandidate({
          id: 821,
          projectNumber: '22-100-01',
          legacyYear: 2022,
          matchedProjectListItemId: null,
          folderWebUrl: 'https://tenant/orphan-22',
        }),
      ],
    };

    const first = resolveProjectSiteEntries(input).map((e) => e.recordKey);
    const second = resolveProjectSiteEntries(input).map((e) => e.recordKey);
    expect(second).toEqual(first);
    expect(first).toEqual(['project:1', 'project:2', 'legacy:22-100-01:2022']);
  });
});

// ── 6. Source-aware filtering end-to-end ──────────────────────────────────

describe('closure: source-aware filter narrows to the intended slice', () => {
  it('returns only legacy-only entries when the filter selects that classification', () => {
    const resolved = resolveProjectSiteEntries({
      projectRows: [projectRow({ Id: 1 })],
      fallbackCandidates: [
        fallbackCandidate({
          id: 830,
          projectNumber: '22-100-01',
          legacyYear: 2022,
          matchedProjectListItemId: null,
          folderWebUrl: 'https://tenant/orphan-22',
        }),
      ],
    });

    const visible = applyProjectSitesPipeline({
      entries: resolved,
      searchTerm: '',
      sortKey: DEFAULT_SORT_KEY,
      filters: { ...EMPTY_FILTERS, sourceClassifications: ['legacy-only'] },
    });

    expect(visible).toHaveLength(1);
    expect(visible[0].sourceClassification).toBe('legacy-only');
    expect(visible[0].recordKey).toBe('legacy:22-100-01:2022');
  });
});

// ── 7. Facet counts match emission ────────────────────────────────────────

describe('closure: facet counts match resolver emission', () => {
  it('counts per classification align with the resolved entry set', () => {
    const resolved = resolveProjectSiteEntries({
      projectRows: [
        projectRow({ Id: 1 }),
        projectRow({ Id: 2, field_2: '25-002-01', field_3: 'Beta', field_23: '' }),
        projectRow({ Id: 3, field_2: '25-003-01', field_3: 'Gamma' }),
      ],
      fallbackCandidates: [
        // Heuristic match for Id=2 → merged
        fallbackCandidate({
          id: 840,
          projectNumber: '25-002-01',
          legacyYear: 2025,
        }),
        // Unclaimed → synthetic legacy-only
        fallbackCandidate({
          id: 841,
          projectNumber: '22-100-01',
          legacyYear: 2022,
          folderWebUrl: 'https://tenant/orphan-22',
        }),
      ],
    });

    const facets = extractProjectSitesFacets(resolved);

    // Canonical order: project-only, merged, legacy-only.
    expect(facets.sourceClassifications).toEqual([
      { value: 'project-only', count: 2 },
      { value: 'merged', count: 1 },
      { value: 'legacy-only', count: 1 },
    ]);
    expect(resolved).toHaveLength(4);
  });
});
