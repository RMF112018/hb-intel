/**
 * Vitest setup — installs a reset helper for `global.fetch` and
 * clears any installed mock between tests.
 *
 * Usage in tests:
 *   import { installFetchMock } from './setup.js';
 *   const fetchMock = installFetchMock();
 *   fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({...}), { status: 200 }));
 */
import { afterEach, vi, type Mock } from 'vitest';

export type FetchMock = Mock<typeof fetch>;

export function installFetchMock(): FetchMock {
  const mock = vi.fn() as unknown as FetchMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).fetch = mock;
  return mock;
}

/** Build a minimal Response-like object for fetch mocks. */
export function jsonResponse(
  body: unknown,
  init: { status?: number; ok?: boolean } = {},
): Response {
  const status = init.status ?? 200;
  const ok = init.ok ?? (status >= 200 && status < 300);
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'ERR',
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

export function textResponse(
  body: string,
  init: { status?: number; ok?: boolean } = {},
): Response {
  const status = init.status ?? 200;
  const ok = init.ok ?? (status >= 200 && status < 300);
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'ERR',
    json: async () => {
      throw new Error('not json');
    },
    text: async () => body,
  } as unknown as Response;
}

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).fetch = undefined;
  vi.restoreAllMocks();
});
