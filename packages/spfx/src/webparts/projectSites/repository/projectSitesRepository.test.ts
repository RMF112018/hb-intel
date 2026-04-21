import { describe, expect, it } from 'vitest';
import {
  __drainPagedForTests,
  buildLegacyFallbackLookup,
  pickBestLegacyFallbackCandidate,
  toLegacyFallbackCandidate,
} from './projectSitesRepository.js';

async function* pages<T>(...pageBatches: T[][]): AsyncGenerator<T[]> {
  for (const batch of pageBatches) yield batch;
}

describe('projectSitesRepository fallback selection', () => {
  it('accepts only matched rows with valid folder URLs', () => {
    const candidate = toLegacyFallbackCandidate({
      Id: 1,
      ProjectNumber: '24-001-01',
      LegacyYear: 2024,
      FolderWebUrl: 'https://tenant.sharepoint.com/sites/2024Projects/Shared%20Documents',
      MatchStatus: 'matched',
      LastValidatedUtc: '2026-04-18T10:00:00.000Z',
      LastSeenUtc: '2026-04-18T09:00:00.000Z',
    });
    expect(candidate).not.toBeNull();
    // Provenance fields default to null when registry omitted them.
    expect(candidate?.matchConfidence).toBeNull();
    expect(candidate?.matchMethod).toBeNull();
    expect(candidate?.matchedProjectListItemId).toBeNull();

    expect(toLegacyFallbackCandidate({
      Id: 2,
      ProjectNumber: '24-001-01',
      LegacyYear: 2024,
      FolderWebUrl: '',
      MatchStatus: 'matched',
    })).toBeNull();

    expect(toLegacyFallbackCandidate({
      Id: 3,
      ProjectNumber: '24-001-01',
      LegacyYear: 2024,
      FolderWebUrl: 'https://tenant.sharepoint.com/sites/2024Projects/Shared%20Documents',
      MatchStatus: 'review-required',
    })).toBeNull();
  });

  it('selects the best duplicate fallback candidate deterministically', () => {
    const best = pickBestLegacyFallbackCandidate([
      {
        id: 10,
        projectNumber: '25-244-01',
        legacyYear: 2025,
        folderWebUrl: 'https://tenant/a',
        matchStatus: 'matched',
        projectNameRaw: '',
        matchedProjectListItemId: null,
        matchedProjectTitle: '',
        matchConfidence: null,
        matchMethod: null,
        lastValidatedUtc: '2026-04-18T08:00:00.000Z',
        lastSeenUtc: '2026-04-18T09:00:00.000Z',
      },
      {
        id: 11,
        projectNumber: '25-244-01',
        legacyYear: 2025,
        folderWebUrl: 'https://tenant/b',
        matchStatus: 'matched',
        projectNameRaw: '',
        matchedProjectListItemId: null,
        matchedProjectTitle: '',
        matchConfidence: null,
        matchMethod: null,
        lastValidatedUtc: '2026-04-18T09:00:00.000Z',
        lastSeenUtc: '2026-04-18T08:00:00.000Z',
      },
      {
        id: 12,
        projectNumber: '25-244-01',
        legacyYear: 2025,
        folderWebUrl: 'https://tenant/c',
        matchStatus: 'matched',
        projectNameRaw: '',
        matchedProjectListItemId: null,
        matchedProjectTitle: '',
        matchConfidence: null,
        matchMethod: null,
        lastValidatedUtc: '2026-04-18T09:00:00.000Z',
        lastSeenUtc: '2026-04-18T10:00:00.000Z',
      },
    ]);

    expect(best?.id).toBe(12);
    expect(best?.folderWebUrl).toBe('https://tenant/c');
  });

  it('carries provenance fields (confidence, method, linkage) when the registry supplies them', () => {
    const candidate = toLegacyFallbackCandidate({
      Id: 99,
      ProjectNumber: '25-244-01',
      LegacyYear: 2025,
      FolderWebUrl: 'https://tenant/site',
      MatchStatus: 'matched',
      MatchConfidence: 'high',
      MatchMethod: 'project-number-exact',
      MatchedProjectListItemId: 4242,
      LastValidatedUtc: '2026-04-18T10:00:00.000Z',
    });
    expect(candidate).not.toBeNull();
    expect(candidate?.matchConfidence).toBe('high');
    expect(candidate?.matchMethod).toBe('project-number-exact');
    expect(candidate?.matchedProjectListItemId).toBe(4242);
  });

  it('rejects unknown match-confidence and match-method values rather than leaking them', () => {
    const candidate = toLegacyFallbackCandidate({
      Id: 100,
      ProjectNumber: '25-244-01',
      LegacyYear: 2025,
      FolderWebUrl: 'https://tenant/site',
      MatchStatus: 'matched',
      MatchConfidence: 'ultra',
      MatchMethod: 'psychic',
    });
    expect(candidate?.matchConfidence).toBeNull();
    expect(candidate?.matchMethod).toBeNull();
  });

  it('drains a paged async iterable to completion when ceiling is comfortably above the dataset', async () => {
    const result = await __drainPagedForTests(
      pages([1, 2, 3], [4, 5], [6]),
      100,
    );
    expect(result.rows).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.bounded).toBe(false);
  });

  it('signals bounded=true when the ceiling halts the drain mid-dataset', async () => {
    // Three pages of two items would naturally yield six rows; ceiling
    // of four must trim to exactly four and report bounded=true.
    const result = await __drainPagedForTests(
      pages([1, 2], [3, 4], [5, 6]),
      4,
    );
    expect(result.rows).toEqual([1, 2, 3, 4]);
    expect(result.bounded).toBe(true);
  });

  it('reports bounded=false when the natural end coincides with the ceiling', async () => {
    // Exactly-at-ceiling means we drained the dataset; no overflow.
    const result = await __drainPagedForTests(
      pages([1, 2], [3, 4]),
      4,
    );
    expect(result.rows).toEqual([1, 2, 3, 4]);
    expect(result.bounded).toBe(false);
  });

  it('handles empty pages without inflating the result', async () => {
    const result = await __drainPagedForTests(
      pages<number>([], [1], [], [2, 3]),
      100,
    );
    expect(result.rows).toEqual([1, 2, 3]);
    expect(result.bounded).toBe(false);
  });

  it('builds one lookup winner per project number + year', () => {
    const lookup = buildLegacyFallbackLookup([
      {
        Id: 20,
        ProjectNumber: '24-001-01',
        LegacyYear: 2024,
        FolderWebUrl: 'https://tenant/first',
        MatchStatus: 'matched',
        LastValidatedUtc: '2026-04-18T09:00:00.000Z',
      },
      {
        Id: 21,
        ProjectNumber: '24-001-01',
        LegacyYear: 2024,
        FolderWebUrl: 'https://tenant/second',
        MatchStatus: 'matched',
        LastValidatedUtc: '2026-04-18T10:00:00.000Z',
      },
      {
        Id: 22,
        ProjectNumber: '24-001-01',
        LegacyYear: 2025,
        FolderWebUrl: 'https://tenant/year-2025',
        MatchStatus: 'matched',
        LastValidatedUtc: '2026-04-18T07:00:00.000Z',
      },
    ]);

    expect(lookup.size).toBe(2);
    expect(lookup.get('24-001-01::2024')?.folderWebUrl).toBe('https://tenant/second');
    expect(lookup.get('24-001-01::2025')?.folderWebUrl).toBe('https://tenant/year-2025');
  });
});
