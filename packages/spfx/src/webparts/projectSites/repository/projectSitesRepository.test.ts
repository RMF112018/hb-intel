import { describe, expect, it, vi } from 'vitest';

vi.mock('@microsoft/sp-http', () => ({
  SPHttpClient: { configurations: { v1: {} } },
}));

import {
  __buildItemsUrlForTests,
  __drainAllItemsForTests,
  buildLegacyFallbackLookup,
  pickBestLegacyFallbackCandidate,
  toLegacyFallbackCandidate,
} from './projectSitesRepository.js';

/**
 * Fake SPFx requester: fabricates paged responses from a pre-built
 * chain of batches. `pages[0]` is returned for the initial URL;
 * subsequent calls resolve to the URL this fake wrote into the
 * previous response's `odata.nextLink`. When the chain is exhausted,
 * the last response carries `nextLink: null`, terminating the drain.
 */
function makeFakeRequester<T>(pages: T[][]): {
  webUrl: string;
  client: {
    get: (url: string) => Promise<Response>;
  };
  getCallCount(): number;
} {
  let callCount = 0;
  const nextLinkFor = (idx: number) =>
    idx < pages.length - 1 ? `https://fake.test/page/${idx + 1}` : null;
  return {
    webUrl: 'https://fake.test',
    client: {
      get: (url: string) => {
        let idx = 0;
        const match = /page\/(\d+)$/.exec(url);
        if (match) idx = Number.parseInt(match[1], 10);
        callCount += 1;
        const body = {
          value: pages[idx] ?? [],
          'odata.nextLink': nextLinkFor(idx),
        };
        const response = new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
        return Promise.resolve(response);
      },
    },
    getCallCount: () => callCount,
  };
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

  it('builds the initial REST URL with encoded select, filter, orderby, and top', () => {
    const url = __buildItemsUrlForTests({
      webUrl: 'https://tenant.sharepoint.com/sites/hb',
      listTitle: 'Projects',
      select: ['Id', 'Title', 'Year'],
      filter: 'Year eq 2025',
      orderBy: { field: 'Year', ascending: false },
      top: 5000,
    });
    expect(url).toContain("getByTitle('Projects')/items?");
    expect(url).toContain('%24select=Id%2CTitle%2CYear'.replace('%24', '$') || '$select=Id%2CTitle%2CYear');
    expect(url).toContain('$select=Id%2CTitle%2CYear');
    expect(url).toContain('$filter=Year%20eq%202025');
    expect(url).toContain('$orderby=Year%20desc');
    expect(url).toContain('$top=5000');
  });

  it('escapes single-quotes in list titles to survive SharePoint REST', () => {
    const url = __buildItemsUrlForTests({
      webUrl: 'https://tenant.sharepoint.com',
      listTitle: "Bob's Projects",
      select: ['Id'],
      top: 100,
    });
    expect(url).toContain("getByTitle('Bob''s%20Projects')");
  });

  it('drains the full dataset by following nextLink continuation tokens', async () => {
    const fake = makeFakeRequester<number>([[1, 2, 3], [4, 5], [6]]);
    const result = await __drainAllItemsForTests<number>(
      fake as unknown as Parameters<typeof __drainAllItemsForTests>[0],
      'https://fake.test/initial',
      100,
    );
    expect(result.rows).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.bounded).toBe(false);
    expect(fake.getCallCount()).toBe(3);
  });

  it('signals bounded=true when the ceiling halts the drain mid-dataset', async () => {
    const fake = makeFakeRequester<number>([[1, 2], [3, 4], [5, 6]]);
    const result = await __drainAllItemsForTests<number>(
      fake as unknown as Parameters<typeof __drainAllItemsForTests>[0],
      'https://fake.test/initial',
      4,
    );
    expect(result.rows).toEqual([1, 2, 3, 4]);
    expect(result.bounded).toBe(true);
  });

  it('reports bounded=false when the dataset ends exactly at the ceiling', async () => {
    const fake = makeFakeRequester<number>([[1, 2], [3, 4]]);
    const result = await __drainAllItemsForTests<number>(
      fake as unknown as Parameters<typeof __drainAllItemsForTests>[0],
      'https://fake.test/initial',
      4,
    );
    expect(result.rows).toEqual([1, 2, 3, 4]);
    expect(result.bounded).toBe(false);
  });

  it('handles empty pages without inflating the result', async () => {
    const fake = makeFakeRequester<number>([[], [1], [], [2, 3]]);
    const result = await __drainAllItemsForTests<number>(
      fake as unknown as Parameters<typeof __drainAllItemsForTests>[0],
      'https://fake.test/initial',
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
