import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { HbcDataAccessError, NotFoundError, ValidationError } from '../../errors/index.js';

const BASE_URL = 'https://api.example.com/api';

function createClient(overrides?: { accessToken?: string; timeout?: number }): ProxyHttpClient {
  return new ProxyHttpClient({
    baseUrl: BASE_URL,
    accessToken: overrides?.accessToken ?? 'test-bearer-token',
    timeout: overrides?.timeout ?? 5000,
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
      const client = new ProxyHttpClient({ baseUrl: BASE_URL, timeout: 5000 });
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
    it('calls onBeforeRequest before fetch', async () => {
      mockFetch({ jsonBody: {} });
      const client = createClient();
      const hook = vi.fn();
      client.onBeforeRequest = hook;
      await client.get('/test');
      expect(hook).toHaveBeenCalledOnce();
      expect(hook.mock.calls[0][0]).toContain('/test');
    });

    it('calls onAfterResponse after fetch', async () => {
      mockFetch({ jsonBody: {} });
      const client = createClient();
      const hook = vi.fn();
      client.onAfterResponse = hook;
      await client.get('/test');
      expect(hook).toHaveBeenCalledOnce();
    });
  });
});
