import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAzureFunctionsProbe, azureFunctionsProbe } from '../probes/azureFunctionsProbe.js';

const NOW = '2026-03-15T12:00:00Z';

describe('createAzureFunctionsProbe', () => {
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
    const probe = createAzureFunctionsProbe({ baseUrl: 'https://fn.example.com', getToken: async () => 'tok' });
    const result = await probe.run(NOW);
    expect(result.status).toBe('healthy');
    expect(result.probeKey).toBe('azure-functions');
    expect(result.summary).toContain('200');
    expect(result.metrics.statusCode).toBe(200);
  });

  it('returns degraded when endpoint responds with non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });
    const probe = createAzureFunctionsProbe({ baseUrl: 'https://fn.example.com', getToken: async () => 'tok' });
    const result = await probe.run(NOW);
    expect(result.status).toBe('degraded');
    expect(result.anomalies).toContain('HTTP 503');
  });

  it('returns error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    const probe = createAzureFunctionsProbe({ baseUrl: 'https://fn.example.com', getToken: async () => 'tok' });
    const result = await probe.run(NOW);
    expect(result.status).toBe('error');
    expect(result.summary).toContain('network down');
    expect(result.anomalies).toContain('Connection failed');
  });

  it('sends Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const probe = createAzureFunctionsProbe({ baseUrl: 'https://fn.example.com', getToken: async () => 'my-token' });
    await probe.run(NOW);
    expect(mockFetch).toHaveBeenCalledWith('https://fn.example.com/api/health', expect.objectContaining({
      headers: { Authorization: 'Bearer my-token' },
    }));
  });
});

describe('azureFunctionsProbe (stub)', () => {
  it('returns healthy with no-live-connection message', async () => {
    const result = await azureFunctionsProbe.run(NOW);
    expect(result.status).toBe('healthy');
    expect(result.summary).toContain('no live connection');
  });
});
