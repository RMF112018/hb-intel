import { describe, expect, it, vi } from 'vitest';
import {
  ASSET_LIBRARY_DEFAULT_LIST_TITLE,
  ASSET_LIBRARY_IMAGE_FILE_TYPES,
  createAssetLibrarySearch,
  mapRawAssetRow,
  type RawAssetLibraryItem,
} from './assetLibrarySource.js';

vi.mock('@hbc/sharepoint-platform', () => ({
  fetchListItemsJson: vi.fn(async () => []),
}));

const HOST = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

describe('mapRawAssetRow', () => {
  it('maps a well-formed row with curated Title into title + suggestedAltText', () => {
    const row: RawAssetLibraryItem = {
      Id: 42,
      UniqueId: 'F1D2A3B4-5C6D-7E8F-9012-345678901234',
      Title: 'Bayshore Tower exterior — sunset',
      FileLeafRef: 'bayshore-tower-sunset.jpg',
      FileRef: '/sites/HBCentral/SiteAssets/bayshore-tower-sunset.jpg',
      EncodedAbsUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SiteAssets/bayshore-tower-sunset.jpg',
      File_x0020_Type: 'jpg',
    };
    expect(mapRawAssetRow(row, { hostSiteUrl: HOST, source: 'Site Assets' })).toEqual({
      assetId: 'F1D2A3B4-5C6D-7E8F-9012-345678901234',
      imageUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SiteAssets/bayshore-tower-sunset.jpg',
      title: 'Bayshore Tower exterior — sunset',
      source: 'Site Assets',
      suggestedAltText: 'Bayshore Tower exterior — sunset',
    });
  });

  it('falls back to FileLeafRef for the title when Title is empty', () => {
    const entry = mapRawAssetRow(
      {
        Id: 7,
        UniqueId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        Title: '   ',
        FileLeafRef: 'site-hero.png',
        EncodedAbsUrl: 'https://example.com/site-hero.png',
      },
      { hostSiteUrl: HOST, source: 'Site Assets' },
    );
    expect(entry?.title).toBe('site-hero.png');
    expect(entry?.suggestedAltText).toBeUndefined();
  });

  it('composes imageUrl from FileRef when EncodedAbsUrl is missing', () => {
    const entry = mapRawAssetRow(
      {
        Id: 1,
        UniqueId: 'u-1',
        FileLeafRef: 'a.png',
        FileRef: '/sites/HBCentral/SiteAssets/a.png',
      },
      { hostSiteUrl: HOST, source: 'Site Assets' },
    );
    expect(entry?.imageUrl).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SiteAssets/a.png',
    );
  });

  it('returns null when neither EncodedAbsUrl nor FileRef yields a URL', () => {
    expect(
      mapRawAssetRow(
        { Id: 1, UniqueId: 'u', Title: 'Nameless', FileLeafRef: 'x.png' },
        { hostSiteUrl: HOST, source: 'Site Assets' },
      ),
    ).toBeNull();
  });

  it('returns null when neither UniqueId nor Id can produce a stable asset id', () => {
    expect(
      mapRawAssetRow(
        {
          Title: 'X',
          FileLeafRef: 'x.png',
          EncodedAbsUrl: 'https://example.com/x.png',
        },
        { hostSiteUrl: HOST, source: 'Site Assets' },
      ),
    ).toBeNull();
  });

  it('falls back to numeric Id as assetId when UniqueId is absent', () => {
    const entry = mapRawAssetRow(
      {
        Id: 512,
        Title: 'Hero 2',
        FileLeafRef: 'hero-2.png',
        EncodedAbsUrl: 'https://example.com/hero-2.png',
      },
      { hostSiteUrl: HOST, source: 'Site Assets' },
    );
    expect(entry?.assetId).toBe('512');
  });

  it('omits suggestedAltText when Title is whitespace-only', () => {
    const entry = mapRawAssetRow(
      {
        Id: 1,
        UniqueId: 'u-1',
        Title: '   ',
        FileLeafRef: 'x.png',
        EncodedAbsUrl: 'https://example.com/x.png',
      },
      { hostSiteUrl: HOST, source: 'Site Assets' },
    );
    expect(entry?.suggestedAltText).toBeUndefined();
  });

  it('carries the provided source label through the mapping', () => {
    const entry = mapRawAssetRow(
      {
        Id: 1,
        UniqueId: 'u-1',
        Title: 'Brand hero',
        FileLeafRef: 'hero.png',
        EncodedAbsUrl: 'https://example.com/hero.png',
      },
      { hostSiteUrl: HOST, source: 'Brand Library' },
    );
    expect(entry?.source).toBe('Brand Library');
  });
});

describe('createAssetLibrarySearch', () => {
  async function getFetchMock() {
    const { fetchListItemsJson } = await import('@hbc/sharepoint-platform');
    const fetchMock = fetchListItemsJson as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockClear();
    return fetchMock;
  }

  it('returns [] without calling the network for blank queries', async () => {
    const fetchMock = await getFetchMock();
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST });
    expect(await search('   ')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('binds to the default Site Assets list and filters by Title + FileLeafRef + image types', async () => {
    const fetchMock = await getFetchMock();
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST });
    await search('bayshore');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(
      `/_api/web/lists/getbytitle('${encodeURIComponent(ASSET_LIBRARY_DEFAULT_LIST_TITLE)}')/items`,
    );
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("substringof('bayshore',Title)");
    expect(decoded).toContain("substringof('bayshore',FileLeafRef)");
    for (const ext of ASSET_LIBRARY_IMAGE_FILE_TYPES) {
      expect(decoded).toContain(`File_x0020_Type eq '${ext}'`);
    }
    expect(url).toContain('$orderby=FileLeafRef');
    expect(url).toContain('$top=20');
  });

  it('URL-encodes the filter parameter so spaces and quotes are transport-safe', async () => {
    const fetchMock = await getFetchMock();
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST });
    await search('two words');
    const url = fetchMock.mock.calls[0][0] as string;
    // raw URL carries the encoded filter, not literal spaces
    expect(url).not.toContain("substringof('two words',Title)");
    expect(decodeURIComponent(url)).toContain("substringof('two words',Title)");
  });

  it('forwards the AbortSignal and labels the request with the list title', async () => {
    const fetchMock = await getFetchMock();
    const controller = new AbortController();
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST });
    await search('x', controller.signal);
    const options = fetchMock.mock.calls[0][1] as {
      signal?: AbortSignal;
      label?: string;
    };
    expect(options.signal).toBe(controller.signal);
    expect(options.label).toBe(`${ASSET_LIBRARY_DEFAULT_LIST_TITLE} library`);
  });

  it('applies folderServerRelativeUrl as a FileDirRef filter', async () => {
    const fetchMock = await getFetchMock();
    const search = createAssetLibrarySearch({
      hostSiteUrl: HOST,
      folderServerRelativeUrl: '/sites/HBCentral/SiteAssets/ArticleImages',
    });
    await search('hero');
    const decoded = decodeURIComponent(fetchMock.mock.calls[0][0] as string);
    expect(decoded).toContain(
      "FileDirRef eq '/sites/HBCentral/SiteAssets/ArticleImages'",
    );
  });

  it('uses an overridden list title in the endpoint and the source label', async () => {
    const fetchMock = await getFetchMock();
    fetchMock.mockResolvedValueOnce([
      {
        Id: 1,
        UniqueId: 'u-1',
        Title: 'Hero',
        FileLeafRef: 'hero.png',
        EncodedAbsUrl: 'https://example.com/hero.png',
      },
    ] satisfies RawAssetLibraryItem[]);
    const search = createAssetLibrarySearch({
      hostSiteUrl: HOST,
      listTitle: 'HBC Image Library',
    });
    const results = await search('hero');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(
      `/_api/web/lists/getbytitle('${encodeURIComponent('HBC Image Library')}')/items`,
    );
    expect(results[0]?.source).toBe('HBC Image Library');
  });

  it('respects a custom maxResults value', async () => {
    const fetchMock = await getFetchMock();
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST, maxResults: 5 });
    await search('x');
    expect((fetchMock.mock.calls[0][0] as string)).toContain('$top=5');
  });

  it('drops rows that cannot produce a usable asset entry', async () => {
    const fetchMock = await getFetchMock();
    fetchMock.mockResolvedValueOnce([
      {
        Id: 1,
        UniqueId: 'u-1',
        Title: 'Good',
        FileLeafRef: 'good.png',
        EncodedAbsUrl: 'https://example.com/good.png',
      },
      {
        // Missing UniqueId, Id, and any URL — unmappable
        Title: 'Broken',
        FileLeafRef: 'broken.png',
      },
    ] satisfies RawAssetLibraryItem[]);
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST });
    const results = await search('x');
    expect(results.map((r) => r.assetId)).toEqual(['u-1']);
  });

  it('propagates the labeled error when the REST helper throws', async () => {
    const fetchMock = await getFetchMock();
    fetchMock.mockRejectedValueOnce(new Error('Site Assets library read failed: 403'));
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST });
    await expect(search('x')).rejects.toThrow(/Site Assets library read failed/);
  });

  it('escapes single quotes inside the query so an OData literal cannot break out', async () => {
    const fetchMock = await getFetchMock();
    const search = createAssetLibrarySearch({ hostSiteUrl: HOST });
    await search("O'Malley");
    const decoded = decodeURIComponent(fetchMock.mock.calls[0][0] as string);
    expect(decoded).toContain("substringof('O''Malley',Title)");
  });
});
