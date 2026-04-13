import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchListItemsJson } from '../listRead.js';

const URL = 'https://tenant.sharepoint.com/sites/X/_api/web/lists(guid\'abc\')/items';

describe('fetchListItemsJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the odata=nometadata Accept header and returns the value array', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ value: [{ Id: 1 }, { Id: 2 }] }),
    });
    (globalThis.fetch as unknown) = mockFetch;

    const items = await fetchListItemsJson<{ Id: number }>(URL);
    expect(items).toEqual([{ Id: 1 }, { Id: 2 }]);
    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Accept).toBe(
      'application/json;odata=nometadata',
    );
  });

  it('returns an empty array when the body omits value', async () => {
    (globalThis.fetch as unknown) = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    });
    await expect(fetchListItemsJson(URL)).resolves.toEqual([]);
  });

  it('throws a labeled error on non-OK responses', async () => {
    (globalThis.fetch as unknown) = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Busy',
      json: () => Promise.resolve({}),
    });
    await expect(
      fetchListItemsJson(URL, { label: 'Spotlight list' }),
    ).rejects.toThrow(/Spotlight list request failed: 503 Busy/);
  });

  it('forwards AbortSignal to fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ value: [] }),
    });
    (globalThis.fetch as unknown) = mockFetch;
    const controller = new AbortController();
    await fetchListItemsJson(URL, { signal: controller.signal });
    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBe(controller.signal);
  });
});
