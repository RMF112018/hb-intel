import { describe, it, expect } from 'vitest';
import { fetchRequestDigest } from '../requestDigest.js';
import { installFetchMock, jsonResponse } from './setup.js';

describe('fetchRequestDigest', () => {
  it('POSTs to /_api/contextinfo and returns FormDigestValue', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({ FormDigestValue: 'DIGEST_TOKEN' }));

    const digest = await fetchRequestDigest('https://site');
    expect(digest).toBe('DIGEST_TOKEN');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://site/_api/contextinfo');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Accept).toContain('application/json');
  });

  it('throws on non-OK', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500, ok: false }));
    await expect(fetchRequestDigest('https://site')).rejects.toThrow(/request digest/i);
  });

  it('throws when FormDigestValue is missing', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    await expect(fetchRequestDigest('https://site')).rejects.toThrow(/not found/i);
  });
});
