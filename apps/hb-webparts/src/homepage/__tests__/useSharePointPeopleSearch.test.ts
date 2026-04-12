/**
 * Phase-16 — people search seam validation.
 *
 * Proves the hook's query-threshold gate (short queries never hit the
 * network) and that digest/search failures propagate as errors rather
 * than being swallowed into empty arrays.
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSharePointPeopleSearch } from '../data/useSharePointPeopleSearch.js';

vi.mock('../data/spContext.js', () => ({
  getSiteUrl: () => 'https://tenant.sharepoint.com/sites/hb',
  getKudosListHostUrl: () => 'https://tenant.sharepoint.com/sites/hb',
}));

describe('useSharePointPeopleSearch — seam', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns a defined search function when a site URL resolves', () => {
    const { result } = renderHook(() => useSharePointPeopleSearch());
    expect(typeof result.current).toBe('function');
  });

  it('short queries (< 2 chars) short-circuit to [] without dispatching fetch', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { result } = renderHook(() => useSharePointPeopleSearch());
    const fn = result.current!;
    await expect(fn('')).resolves.toEqual([]);
    await expect(fn('a')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('propagates digest fetch failure as a thrown error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'err',
      text: async () => '',
      json: async () => ({}),
    }) as unknown as typeof fetch;
    const { result } = renderHook(() => useSharePointPeopleSearch());
    const fn = result.current!;
    await expect(fn('ren')).rejects.toThrow();
  });

  it('propagates non-ok people-search response as a thrown error', async () => {
    const fetchMock = vi
      .fn()
      // digest success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ FormDigestValue: 'digest' }),
      })
      // search non-ok
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'forbidden',
        text: async () => '',
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { result } = renderHook(() => useSharePointPeopleSearch());
    await expect(result.current!('ren')).rejects.toThrow(/403/);
  });

  it('propagates missing principal payload as an error (contract drift guard)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ FormDigestValue: 'digest' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ somethingElse: 'x' }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { result } = renderHook(() => useSharePointPeopleSearch());
    await expect(result.current!('ren')).rejects.toThrow(/no principal payload/);
  });
});
