import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { HbcDataAccessError, NotFoundError, ValidationError } from '../../errors/index.js';

const BASE_URL = 'https://api.example.com/api';

/** No-retry policy for tests that expect single-attempt behavior. */
const NO_RETRY = {
  maxAttempts: 1,
  initialDelayMs: 0,
  backoffFactor: 1,
  maxDelayMs: 0,
  jitterFactor: 0,
  maxTotalDurationMs: 0,
  retryableErrors: new Set<string>(),
};

function createClient(overrides?: { accessToken?: string; timeout?: number }): ProxyHttpClient {
  return new ProxyHttpClient({
    baseUrl: BASE_URL,
    accessToken: overrides?.accessToken ?? 'test-bearer-token',
    timeout: overrides?.timeout ?? 5000,
    readRetryPolicy: NO_RETRY,
    writeRetryPolicy: NO_RETRY,
  });
}

function mockFetch(response: Partial<Response> & { jsonBody?: unknown }): void {
  const { jsonBody, ...rest } = response;
  const resp = {
    ok: (rest.status ?? 200) < 400,
    status: rest.status ?? 200,
    json: vi.fn().mockResolvedValue(jsonBody ?? {}),
    ...rest,
  } as unknown as Response;

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp));
}

function mockFetchReject(error: Error): void {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
}

/** Return the RequestInit passed to the most recent fetch() call. */
function lastFetchInit(): RequestInit {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[1] as RequestInit;
}

describe('ProxyHttpClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET', () => {
    it('sends GET request and returns parsed JSON', async () => {
      mockFetch({ jsonBody: { data: { id: 1 } } });
      const client = createClient();
      const result = await client.get<{ data: { id: number } }>('/leads');
      expect(result).toEqual({ data: { id: 1 } });
    });

    it('appends query params to URL', async () => {
      mockFetch({ jsonBody: { items: [] } });
      const client = createClient();
      await client.get('/leads', { page: '1', pageSize: '25' });
      const calledUrl = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('pageSize=25');
    });
  });

  describe('POST', () => {
    it('sends POST with JSON body and returns parsed response', async () => {
      mockFetch({ status: 201, jsonBody: { data: { id: 42 } } });
      const client = createClient();
      const result = await client.post<{ data: { id: number } }>('/leads', { name: 'New Lead' });
      expect(result).toEqual({ data: { id: 42 } });
      const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
      expect(init.body).toBe(JSON.stringify({ name: 'New Lead' }));
    });
  });

  describe('PUT', () => {
    it('sends PUT with JSON body', async () => {
      mockFetch({ jsonBody: { data: { id: 1, name: 'Updated' } } });
      const client = createClient();
      const result = await client.put<{ data: { id: number } }>('/leads/1', { name: 'Updated' });
      expect(result).toEqual({ data: { id: 1, name: 'Updated' } });
      const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
      expect(init.method).toBe('PUT');
    });
  });

  describe('DELETE', () => {
    it('sends DELETE and returns void on 204', async () => {
      mockFetch({ status: 204 });
      const client = createClient();
      await expect(client.delete('/leads/1')).resolves.toBeUndefined();
    });
  });

  describe('Headers', () => {
    it('includes Bearer token in Authorization header', async () => {
      mockFetch({ jsonBody: {} });
      const client = createClient({ accessToken: 'my-token' });
      await client.get('/test');
      const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
      const headers = init.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer my-token');
    });

    it('includes X-Request-Id header', async () => {
      mockFetch({ jsonBody: {} });
      const client = createClient();
      await client.get('/test');
      const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
      const headers = init.headers as Record<string, string>;
      expect(headers['X-Request-Id']).toBeDefined();
      expect(headers['X-Request-Id'].length).toBeGreaterThan(0);
    });

    it('omits Authorization when no token provided', async () => {
      mockFetch({ jsonBody: {} });
      const client = new ProxyHttpClient({ baseUrl: BASE_URL, timeout: 5000, readRetryPolicy: NO_RETRY, writeRetryPolicy: NO_RETRY });
      await client.get('/test');
      const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
      const headers = init.headers as Record<string, string>;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('throws NotFoundError on 404', async () => {
      mockFetch({ status: 404, jsonBody: { message: 'Not found', code: 'NOT_FOUND' } });
      const client = createClient();
      await expect(client.get('/leads/999')).rejects.toThrow(NotFoundError);
    });

    it('throws ValidationError on 422', async () => {
      mockFetch({
        status: 422,
        jsonBody: {
          message: 'Invalid input',
          code: 'VALIDATION_ERROR',
          details: [{ field: 'name', message: 'Required' }],
        },
      });
      const client = createClient();
      await expect(client.post('/leads', {})).rejects.toThrow(ValidationError);
    });

    it('throws UNAUTHORIZED on 401', async () => {
      mockFetch({ status: 401, jsonBody: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
      const client = createClient();
      try {
        await client.get('/leads');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(HbcDataAccessError);
        expect((err as HbcDataAccessError).code).toBe('UNAUTHORIZED');
      }
    });

    it('throws SERVER_ERROR on 500', async () => {
      mockFetch({ status: 500, jsonBody: { message: 'Internal error', code: 'INTERNAL_ERROR' } });
      const client = createClient();
      try {
        await client.get('/leads');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(HbcDataAccessError);
        expect((err as HbcDataAccessError).code).toBe('SERVER_ERROR');
      }
    });

    it('throws NETWORK_ERROR on fetch failure', async () => {
      mockFetchReject(new TypeError('Failed to fetch'));
      const client = createClient();
      try {
        await client.get('/leads');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(HbcDataAccessError);
        expect((err as HbcDataAccessError).code).toBe('NETWORK_ERROR');
      }
    });

    it('throws TIMEOUT on abort', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockFetchReject(abortError);
      const client = createClient({ timeout: 1 });
      try {
        await client.get('/leads');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(HbcDataAccessError);
        expect((err as HbcDataAccessError).code).toBe('TIMEOUT');
      }
    });
  });

  describe('Hooks', () => {
    it('calls onBeforeRequest with metadata', async () => {
      mockFetch({ jsonBody: {} });
      const client = createClient();
      const hook = vi.fn();
      client.onBeforeRequest = hook;
      await client.get('/test', undefined, { domain: 'leads', operation: 'getAll' });
      expect(hook).toHaveBeenCalledOnce();
      expect(hook.mock.calls[0][0]).toContain('/test');
      expect(hook.mock.calls[0][2]).toEqual({ domain: 'leads', operation: 'getAll' });
    });

    it('calls onAfterResponse with metadata', async () => {
      mockFetch({ jsonBody: {} });
      const client = createClient();
      const hook = vi.fn();
      client.onAfterResponse = hook;
      await client.get('/test', undefined, { domain: 'leads', operation: 'getAll' });
      expect(hook).toHaveBeenCalledOnce();
      expect(hook.mock.calls[0][2]).toEqual({ domain: 'leads', operation: 'getAll' });
    });
  });

  describe('P1-C3 Telemetry', () => {
    it('emits proxy.request.start and proxy.request.success on success', async () => {
      mockFetch({ status: 200, jsonBody: { data: 'ok' } });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const client = createClient();
      await client.get('/test', undefined, { domain: 'leads', operation: 'getAll' });

      const events = consoleSpy.mock.calls
        .map((call) => { try { return JSON.parse(call[0] as string); } catch { return null; } })
        .filter(Boolean);

      const start = events.find((e: Record<string, unknown>) => e.name === 'proxy.request.start');
      expect(start).toBeDefined();
      expect(start.domain).toBe('leads');
      expect(start.operation).toBe('getAll');
      expect(start.method).toBe('GET');

      const success = events.find((e: Record<string, unknown>) => e.name === 'proxy.request.success');
      expect(success).toBeDefined();
      expect(success.statusCode).toBe(200);
      expect(typeof success.durationMs).toBe('number');

      consoleSpy.mockRestore();
    });

    it('emits proxy.request.error on HTTP error', async () => {
      mockFetch({ status: 500, jsonBody: { message: 'fail' } });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const client = createClient();

      try {
        await client.get('/test', undefined, { domain: 'leads', operation: 'getAll' });
      } catch {
        // expected
      }

      const events = consoleSpy.mock.calls
        .map((call) => { try { return JSON.parse(call[0] as string); } catch { return null; } })
        .filter(Boolean);

      const error = events.find((e: Record<string, unknown>) => e.name === 'proxy.request.error');
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(500);
      expect(error.domain).toBe('leads');

      consoleSpy.mockRestore();
    });

    it('does not emit telemetry when metadata is omitted', async () => {
      mockFetch({ status: 200, jsonBody: { data: 'ok' } });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const client = createClient();
      await client.get('/test');

      const events = consoleSpy.mock.calls
        .map((call) => { try { return JSON.parse(call[0] as string); } catch { return null; } })
        .filter((e) => e && e._telemetryType === 'customEvent');

      expect(events.length).toBe(0);
      consoleSpy.mockRestore();
    });
  });

  describe('P1-D1 Retry Wiring', () => {
    it('GET retries on NETWORK_ERROR and succeeds on 2nd attempt', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      let callCount = 0;
      vi.stubGlobal('fetch', vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          throw new TypeError('fetch failed');
        }
        return {
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({ data: 'recovered' }),
        } as unknown as Response;
      }));

      const client = new ProxyHttpClient({
        baseUrl: BASE_URL,
        accessToken: 'test-token',
        timeout: 5000,
        readRetryPolicy: {
          maxAttempts: 3,
          initialDelayMs: 1,
          backoffFactor: 1,
          maxDelayMs: 10,
          jitterFactor: 0,
          maxTotalDurationMs: 30000,
          retryableErrors: new Set(['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR']),
        },
      });

      const result = await client.get<{ data: string }>('/test');
      expect(result.data).toBe('recovered');
      expect(callCount).toBe(2);
      consoleSpy.mockRestore();
    });

    it('POST uses write retry policy (fewer attempts)', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      let callCount = 0;
      vi.stubGlobal('fetch', vi.fn(async () => {
        callCount++;
        throw new TypeError('fetch failed');
      }));

      const client = new ProxyHttpClient({
        baseUrl: BASE_URL,
        accessToken: 'test-token',
        timeout: 5000,
        writeRetryPolicy: {
          maxAttempts: 2,
          initialDelayMs: 1,
          backoffFactor: 1,
          maxDelayMs: 10,
          jitterFactor: 0,
          maxTotalDurationMs: 30000,
          retryableErrors: new Set(['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR']),
        },
      });

      await expect(client.post('/test', {})).rejects.toThrow('Network error');
      expect(callCount).toBe(2);
      consoleSpy.mockRestore();
    });

    it('non-retryable error (404) throws immediately without retry', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      let callCount = 0;
      vi.stubGlobal('fetch', vi.fn(async () => {
        callCount++;
        return {
          ok: false,
          status: 404,
          json: vi.fn().mockResolvedValue({ message: 'Not found' }),
        } as unknown as Response;
      }));

      const client = createClient();
      await expect(client.get('/test')).rejects.toThrow();
      expect(callCount).toBe(1);
      consoleSpy.mockRestore();
    });
  });

  describe('P1-D1 Idempotency Headers', () => {
    it('injects Idempotency-Key and X-Idempotency-Operation headers on POST', async () => {
      mockFetch({ status: 200, jsonBody: { data: 'created' } });
      const client = createClient();
      await client.post('/test', { name: 'test' }, undefined, {
        key: 'idem-uuid-123',
        operation: 'create-lead',
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      });

      const init = lastFetchInit();
      const headers = init.headers as Record<string, string>;
      expect(headers['Idempotency-Key']).toBe('idem-uuid-123');
      expect(headers['X-Idempotency-Operation']).toBe('create-lead');
    });

    it('does not inject idempotency headers when context is omitted', async () => {
      mockFetch({ status: 200, jsonBody: { data: 'created' } });
      const client = createClient();
      await client.post('/test', { name: 'test' });

      const init = lastFetchInit();
      const headers = init.headers as Record<string, string>;
      expect(headers['Idempotency-Key']).toBeUndefined();
      expect(headers['X-Idempotency-Operation']).toBeUndefined();
    });
  });
});
