import { describe, it, expect } from 'vitest';
import { mergeItemById } from '../merge.js';
import type { SharePointListDescriptor } from '../listDescriptor.js';
import { installFetchMock, jsonResponse, textResponse } from './setup.js';

const DESC: SharePointListDescriptor = {
  id: 'b01fa4d2-29b1-4e11-b581-4cb3d0951a79',
  title: 'Sample List',
  urlSegment: 'Sample List',
};

describe('mergeItemById', () => {
  it('sends POST with X-HTTP-Method MERGE, If-Match etag, and JSON body', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 204, ok: true }));

    const result = await mergeItemById(
      'https://site',
      DESC,
      10,
      '"3"',
      'DIG',
      { Headline: 'x' },
    );
    expect(result).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://site/_api/web/lists(guid'${DESC.id}')/items(10)`);
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers['X-HTTP-Method']).toBe('MERGE');
    expect(headers['If-Match']).toBe('"3"');
    expect(headers['X-RequestDigest']).toBe('DIG');
    expect(headers['Content-Type']).toContain('nometadata');
    expect(init.body).toBe(JSON.stringify({ Headline: 'x' }));
  });

  it('returns error envelope on non-OK', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(textResponse('nope', { status: 412, ok: false }));

    const result = await mergeItemById('https://site', DESC, 1, '*', 'd', {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('412');
      expect(result.error).toContain('nope');
    }
  });
});
