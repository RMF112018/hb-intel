import { describe, it, expect } from 'vitest';
import { ensureUserByEmail, resolveCurrentUserId } from '../users.js';
import { installFetchMock, jsonResponse } from './setup.js';

describe('ensureUserByEmail', () => {
  it('POSTs ensureuser with digest header and returns Id', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({ Id: 42 }));

    const id = await ensureUserByEmail('https://site', 'a@b.com', 'DIGEST');
    expect(id).toBe(42);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://site/_api/web/ensureuser('a%40b.com')");
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['X-RequestDigest']).toBe('DIGEST');
  });

  it('returns undefined on non-OK', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 404, ok: false }));
    expect(await ensureUserByEmail('https://site', 'a@b.com', 'd')).toBeUndefined();
  });

  it('returns undefined on thrown error', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockRejectedValueOnce(new Error('net'));
    expect(await ensureUserByEmail('https://site', 'a@b.com', 'd')).toBeUndefined();
  });
});

describe('resolveCurrentUserId', () => {
  it('returns undefined without a site URL', async () => {
    expect(await resolveCurrentUserId(undefined)).toBeUndefined();
  });

  it('GETs currentuser and returns Id', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({ Id: 7 }));
    expect(await resolveCurrentUserId('https://site')).toBe(7);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://site/_api/web/currentuser');
  });

  it('returns undefined on non-OK or error', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 401, ok: false }));
    expect(await resolveCurrentUserId('https://site')).toBeUndefined();
  });
});
