import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSharePointProbe, sharePointProbe } from '../probes/sharePointProbe.js';

const NOW = '2026-03-15T12:00:00Z';

describe('createSharePointProbe', () => {
  const mockFetch = vi.fn();
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns healthy when endpoint responds with 200', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const probe = createSharePointProbe({ baseUrl: 'https://fn.example.com', getToken: async () => 'tok' });
    const result = await probe.run(NOW);
    expect(result.status).toBe('healthy');
    expect(result.probeKey).toBe('sharepoint-infrastructure');
    expect(result.summary).toContain('verified');
  });

  it('returns degraded on non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    const probe = createSharePointProbe({ baseUrl: 'https://fn.example.com', getToken: async () => 'tok' });
    const result = await probe.run(NOW);
    expect(result.status).toBe('degraded');
    expect(result.anomalies).toContain('HTTP 401');
  });

  it('returns error on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('timeout'));
    const probe = createSharePointProbe({ baseUrl: 'https://fn.example.com', getToken: async () => 'tok' });
    const result = await probe.run(NOW);
    expect(result.status).toBe('error');
    expect(result.anomalies).toContain('Connection failed');
  });
});

describe('sharePointProbe (stub)', () => {
  it('returns healthy with no-live-connection message', async () => {
    const result = await sharePointProbe.run(NOW);
    expect(result.status).toBe('healthy');
    expect(result.summary).toContain('no live connection');
  });
});
