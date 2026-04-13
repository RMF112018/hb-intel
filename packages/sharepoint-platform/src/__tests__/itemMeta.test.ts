import { describe, it, expect } from 'vitest';
import { fetchItemMetaByFieldValue } from '../itemMeta.js';
import type { SharePointListDescriptor } from '../listDescriptor.js';
import { installFetchMock, jsonResponse } from './setup.js';

const DESC: SharePointListDescriptor = {
  id: 'b01fa4d2-29b1-4e11-b581-4cb3d0951a79',
  title: 'Sample List',
  urlSegment: 'Sample List',
};

describe('fetchItemMetaByFieldValue', () => {
  it('returns undefined when value is empty/whitespace', async () => {
    expect(await fetchItemMetaByFieldValue('https://site', DESC, 'ExternalId', '  ')).toBeUndefined();
  });

  it('builds the filtered endpoint with top=1 and minimalmetadata Accept', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ value: [{ Id: 5, '@odata.etag': '"11"' }] }),
    );

    const meta = await fetchItemMetaByFieldValue('https://site', DESC, 'ExternalId', 'abc');
    expect(meta).toEqual({ itemId: 5, etag: '"11"' });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`lists(guid'${DESC.id}')/items`);
    expect(url).toContain('$top=1');
    expect(url).toContain(`$filter=${encodeURIComponent("ExternalId eq 'abc'")}`);
    expect((init.headers as Record<string, string>).Accept).toContain('minimalmetadata');
  });

  it('escapes single quotes in filter value', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({ value: [] }));
    await fetchItemMetaByFieldValue('https://site', DESC, 'ExternalId', "O'Neil");
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(encodeURIComponent("ExternalId eq 'O''Neil'"));
  });

  it('falls back to odata.etag then * when @odata.etag missing', async () => {
    const fm1 = installFetchMock();
    fm1.mockResolvedValueOnce(jsonResponse({ value: [{ Id: 1, 'odata.etag': '"7"' }] }));
    expect(await fetchItemMetaByFieldValue('https://site', DESC, 'F', 'v')).toEqual({
      itemId: 1,
      etag: '"7"',
    });

    const fm2 = installFetchMock();
    fm2.mockResolvedValueOnce(jsonResponse({ value: [{ Id: 2 }] }));
    expect(await fetchItemMetaByFieldValue('https://site', DESC, 'F', 'v')).toEqual({
      itemId: 2,
      etag: '*',
    });
  });

  it('returns undefined when no match', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({ value: [] }));
    expect(await fetchItemMetaByFieldValue('https://site', DESC, 'F', 'v')).toBeUndefined();
  });

  it('throws on non-OK', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500, ok: false }));
    await expect(
      fetchItemMetaByFieldValue('https://site', DESC, 'F', 'v'),
    ).rejects.toThrow(/lookup by F failed/i);
  });
});
