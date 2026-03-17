# Proxy Adapter Implementation Plan

**Goal:** Implement a production-ready HTTP proxy adapter for the HB Intel frontend PWA, enabling all 11 domain repositories to communicate with Azure Functions backend via Bearer token authentication.

**Audience:** Developers implementing proxy adapter repositories with zero prior HB Intel codebase knowledge.

**Approach:** Test-driven development (TDD) with checkpoint commits after each task. Full TypeScript implementations, exact test harnesses, and complete factory wiring.

**Architecture:** The proxy adapter follows the factory pattern established in `factory.ts`. Each domain repository (e.g., `ProxyLeadRepository`) implements the corresponding port interface (e.g., `ILeadRepository`) by delegating HTTP calls through a shared `ProxyHttpClient`. The client handles auth headers, request tracing, and error translation. Each repository has its own domain-specific contract — method names, entity types, and query patterns vary per domain. Only Lead follows a generic CRUD+search shape; most repositories are project-scoped, handle multiple entity types, or have entirely non-CRUD contracts (e.g., Auth).

**Tech Stack:**
- TypeScript, Vitest (mocked `fetch`)
- Native `fetch` API (Node 18+), zero third-party HTTP libraries
- Bearer token from frontend context; backend performs MSAL OBO internally
- Error translation: HTTP status codes → `NotFoundError`, `ValidationError`, `HbcDataAccessError`

**Governance:**
- Authority: `factory.ts`, `base.ts`, error hierarchy in `errors/index.ts`
- Test pattern: mirror the mock adapter structure
- Factory wiring: follow existing switch pattern, remove `AdapterNotImplementedError` throws for proxy mode

---

## Chunk 1: HTTP Client Foundation (≈450 lines)

### Task 1: Create `ProxyHttpClient` class

**Files:**
- Create: `packages/data-access/src/adapters/proxy/http-client.ts`
- Create: `packages/data-access/src/adapters/proxy/http-client.test.ts`

**Implementation:**

```typescript
// packages/data-access/src/adapters/proxy/http-client.ts

import { NotFoundError, ValidationError, HbcDataAccessError } from '../../errors/index.js';

export interface ProxyHttpClientOptions {
  baseUrl: string;
  getToken: () => Promise<string>;
  timeoutMs?: number;
}

/**
 * HTTP client for proxy adapter.
 * Handles Bearer auth, request tracing (X-Request-Id), error translation,
 * and header injection for Azure Functions backend.
 *
 * Does NOT retry or handle MSAL OBO; the backend performs OBO internally.
 */
export class ProxyHttpClient {
  private readonly baseUrl: string;
  private readonly getToken: () => Promise<string>;
  private readonly timeoutMs: number;

  constructor(options: ProxyHttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.getToken = options.getToken;
    this.timeoutMs = options.timeoutMs ?? 10000;
  }

  /**
   * Execute a GET request.
   * @param path - URL path (e.g. "/api/leads")
   * @param params - Optional query string parameters
   * @returns Parsed JSON response as T
   * @throws {NotFoundError} on 404
   * @throws {ValidationError} on 422
   * @throws {HbcDataAccessError} on other errors
   */
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  /**
   * Execute a POST request with JSON body.
   * @param path - URL path (e.g. "/api/leads")
   * @param body - Request body (will be JSON-stringified)
   * @returns Parsed JSON response as T
   * @throws {ValidationError} on 422
   * @throws {HbcDataAccessError} on other errors
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Execute a PUT request with JSON body.
   * @param path - URL path (e.g. "/api/leads/123")
   * @param body - Request body (will be JSON-stringified)
   * @returns Parsed JSON response as T
   * @throws {NotFoundError} on 404
   * @throws {ValidationError} on 422
   * @throws {HbcDataAccessError} on other errors
   */
  async put<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Execute a DELETE request.
   * @param path - URL path (e.g. "/api/leads/123")
   * @throws {NotFoundError} on 404
   * @throws {HbcDataAccessError} on other errors
   */
  async delete(path: string): Promise<void> {
    const url = this.buildUrl(path);
    await this.request<unknown>(url, {
      method: 'DELETE',
    });
  }

  // Private helpers

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    url: string,
    init: RequestInit,
  ): Promise<T> {
    const token = await this.getToken();
    const requestId = crypto.randomUUID();

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-Id': requestId,
    };

    const signal = AbortSignal.timeout(this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal,
      });

      return await this.handleResponse<T>(response);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new HbcDataAccessError(
          `Request timeout after ${this.timeoutMs}ms`,
          'TIMEOUT',
          err,
        );
      }
      if (err instanceof TypeError) {
        throw new HbcDataAccessError(
          `Network error: ${err.message}`,
          'NETWORK_ERROR',
          err,
        );
      }
      throw err;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let body: unknown;
    if (isJson) {
      body = await response.json();
    } else if (response.status === 204) {
      // 204 No Content — no body to parse
      body = undefined;
    } else {
      body = await response.text();
    }

    // Success responses (2xx)
    if (response.ok) {
      return body as T;
    }

    // Handle errors based on status code
    switch (response.status) {
      case 404:
        throw new NotFoundError('Resource', 'unknown');

      case 422:
        // Unprocessable entity — validation error
        const validationData = isJson ? body : undefined;
        const message =
          typeof validationData === 'object' &&
          validationData !== null &&
          'message' in validationData
            ? String(validationData.message)
            : 'Validation failed';
        throw new ValidationError(message);

      case 401:
      case 403:
        throw new HbcDataAccessError(
          response.status === 401
            ? 'Unauthorized: invalid or expired token'
            : 'Forbidden: insufficient permissions',
          response.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        );

      case 500:
      case 502:
      case 503:
        throw new HbcDataAccessError(
          `Server error (${response.status}): backend service unavailable`,
          'SERVER_ERROR',
        );

      default:
        const message =
          typeof body === 'object' &&
          body !== null &&
          'message' in body
            ? String(body.message)
            : `HTTP ${response.status}`;
        throw new HbcDataAccessError(
          `${response.status} ${response.statusText}: ${message}`,
          `HTTP_${response.status}`,
        );
    }
  }
}
```

**Tests:**

```typescript
// packages/data-access/src/adapters/proxy/http-client.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ProxyHttpClient,
  ProxyHttpClientOptions,
} from './http-client.js';
import {
  NotFoundError,
  ValidationError,
  HbcDataAccessError,
} from '../../errors/index.js';

describe('ProxyHttpClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: ProxyHttpClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createClient = (
    overrides?: Partial<ProxyHttpClientOptions>,
  ): ProxyHttpClient => {
    const opts: ProxyHttpClientOptions = {
      baseUrl: 'https://api.example.com',
      getToken: async () => 'test-token',
      timeoutMs: 5000,
      ...overrides,
    };
    return new ProxyHttpClient(opts);
  };

  describe('get()', () => {
    it('should make a GET request with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, name: 'Test' }),
      });

      client = createClient();
      const result = await client.get('/api/leads');

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/leads');
      expect(init.method).toBe('GET');
      expect(init.headers['Authorization']).toBe('Bearer test-token');
      expect(init.headers['Content-Type']).toBe('application/json');
      expect(init.headers['X-Request-Id']).toBeDefined();
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [],
      });

      client = createClient();
      await client.get('/api/leads', { page: '1', pageSize: '20' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=20');
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Not found' }),
      });

      client = createClient();
      await expect(client.get('/api/leads/999')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw HbcDataAccessError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('should throw HbcDataAccessError on 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Database error' }),
      });

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('SERVER_ERROR');
    });

    it('should throw HbcDataAccessError on network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('NETWORK_ERROR');
    });
  });

  describe('post()', () => {
    it('should make a POST request with JSON body', async () => {
      const responseData = { id: 101, title: 'New Lead' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => responseData,
      });

      client = createClient();
      const body = { title: 'New Lead', stage: 'prospecting' };
      const result = await client.post('/api/leads', body);

      const [, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(body));
      expect(result).toEqual(responseData);
    });

    it('should throw ValidationError on 422', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Title is required' }),
      });

      client = createClient();
      await expect(
        client.post('/api/leads', { title: '' }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('put()', () => {
    it('should make a PUT request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, title: 'Updated' }),
      });

      client = createClient();
      const body = { title: 'Updated' };
      const result = await client.put('/api/leads/1', body);

      const [, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe('PUT');
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      await expect(
        client.put('/api/leads/999', { title: 'x' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete()', () => {
    it('should make a DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      });

      client = createClient();
      await client.delete('/api/leads/1');

      const [, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe('DELETE');
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      await expect(client.delete('/api/leads/999')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('error handling', () => {
    it('should handle 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      const err = await client.get('/api/admin').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('FORBIDDEN');
    });

    it('should handle 502 Bad Gateway', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      });

      client = createClient();
      const err = await client.get('/api/leads').catch((e) => e);
      expect(err).toBeInstanceOf(HbcDataAccessError);
      expect(err.code).toBe('SERVER_ERROR');
    });
  });
});
```

**Verification:**

```bash
# Run tests for the HTTP client
pnpm --filter @hbc/data-access test http-client.test.ts

# Expected: All 12+ tests pass, no type errors
# Commit: git commit -m "feat: create ProxyHttpClient with full error translation and header injection"
```

---

### Task 2: Create `ProxyBaseRepository<T>` abstract class

**Files:**
- Create: `packages/data-access/src/adapters/proxy/proxy-base.ts`
- Create: `packages/data-access/src/adapters/proxy/proxy-base.test.ts`

**Implementation:**

```typescript
// packages/data-access/src/adapters/proxy/proxy-base.ts

import type { IPagedResult, IListQueryOptions } from '@hbc/models';
import { BaseRepository } from '../base.js';
import { ProxyHttpClient } from './http-client.js';

/**
 * Base class for all proxy repository implementations.
 * Provides shared URL building, query parameter marshaling, and HTTP client access.
 */
export abstract class ProxyBaseRepository<T> extends BaseRepository<T> {
  protected httpClient: ProxyHttpClient;
  protected resourcePath: string;

  constructor(httpClient: ProxyHttpClient, resourcePath: string) {
    super();
    this.httpClient = httpClient;
    this.resourcePath = resourcePath;
  }

  /**
   * Build a resource path with optional ID.
   * @param id - Optional entity ID
   * @returns Path like "/api/leads" or "/api/leads/123"
   */
  protected buildPath(id?: string | number): string {
    if (id !== undefined) {
      return `${this.resourcePath}/${id}`;
    }
    return this.resourcePath;
  }

  /**
   * Build a project-scoped resource path.
   * Most domain repositories scope queries by project.
   * @param projectId - Project UUID
   * @param subResource - Sub-resource name (e.g., "activities", "entries")
   * @param id - Optional entity ID within the sub-resource
   * @returns Path like "/api/projects/{projectId}/activities" or "/api/projects/{projectId}/activities/42"
   */
  protected buildProjectScopedPath(
    projectId: string,
    subResource: string,
    id?: string | number,
  ): string {
    const base = `/api/projects/${projectId}/${subResource}`;
    if (id !== undefined) {
      return `${base}/${id}`;
    }
    return base;
  }

  /**
   * Convert query options to URL search parameters.
   * Filters out undefined or empty values.
   * @param options - Query options
   * @returns Record of string parameters ready for fetch
   */
  protected buildQueryParams(options?: IListQueryOptions): Record<string, string> {
    const params: Record<string, string> = {};

    if (options?.page !== undefined) {
      params.page = String(options.page);
    }
    if (options?.pageSize !== undefined) {
      params.pageSize = String(options.pageSize);
    }
    if (options?.sortBy) {
      params.sortBy = options.sortBy;
    }
    if (options?.sortOrder) {
      params.sortOrder = options.sortOrder;
    }
    if (options?.search) {
      params.search = options.search;
    }

    return params;
  }

  /**
   * Handle a paginated API response, normalizing the backend structure
   * to IPagedResult. Backend returns { data: T[], total, page, pageSize };
   * we extract and return as { items: T[], total, page, pageSize }.
   */
  protected mapPagedResponse<U>(response: unknown): IPagedResult<U> {
    const data = response as any;
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray(data.data)
    ) {
      throw new Error('Invalid paginated response structure');
    }
    return {
      items: data.data,
      total: data.total ?? 0,
      page: data.page ?? 1,
      pageSize: data.pageSize ?? 20,
    };
  }
}
```

**Tests:**

```typescript
// packages/data-access/src/adapters/proxy/proxy-base.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IPagedResult, IListQueryOptions } from '@hbc/models';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

describe('ProxyBaseRepository', () => {
  let httpClient: ProxyHttpClient;
  let repo: ProxyBaseRepository<{ id: number; name: string }>;

  beforeEach(() => {
    httpClient = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'test-token',
    });

    // Concrete test subclass
    class TestRepository extends ProxyBaseRepository<{
      id: number;
      name: string;
    }> {
      constructor(client: ProxyHttpClient) {
        super(client, '/api/items');
      }
    }

    repo = new TestRepository(httpClient);
  });

  describe('buildPath()', () => {
    it('should build resource path without ID', () => {
      const path = repo['buildPath']();
      expect(path).toBe('/api/items');
    });

    it('should build resource path with numeric ID', () => {
      const path = repo['buildPath'](42);
      expect(path).toBe('/api/items/42');
    });

    it('should build resource path with string ID', () => {
      const path = repo['buildPath']('uuid-123');
      expect(path).toBe('/api/items/uuid-123');
    });
  });

  describe('buildProjectScopedPath()', () => {
    it('should build project-scoped path without ID', () => {
      const path = repo['buildProjectScopedPath']('proj-uuid', 'activities');
      expect(path).toBe('/api/projects/proj-uuid/activities');
    });

    it('should build project-scoped path with numeric ID', () => {
      const path = repo['buildProjectScopedPath']('proj-uuid', 'activities', 42);
      expect(path).toBe('/api/projects/proj-uuid/activities/42');
    });
  });

  describe('buildQueryParams()', () => {
    it('should convert all query options to params', () => {
      const opts: IListQueryOptions = {
        page: 2,
        pageSize: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'highway',
      };
      const params = repo['buildQueryParams'](opts);

      expect(params).toEqual({
        page: '2',
        pageSize: '50',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'highway',
      });
    });

    it('should omit undefined fields', () => {
      const opts: IListQueryOptions = {
        page: 1,
        pageSize: 10,
      };
      const params = repo['buildQueryParams'](opts);

      expect(params).toEqual({
        page: '1',
        pageSize: '10',
      });
      expect(params.sortBy).toBeUndefined();
      expect(params.search).toBeUndefined();
    });

    it('should handle undefined options', () => {
      const params = repo['buildQueryParams'](undefined);
      expect(params).toEqual({});
    });

    it('should omit empty search strings', () => {
      const opts: IListQueryOptions = {
        search: '',
      };
      const params = repo['buildQueryParams'](opts);
      expect(params.search).toBeUndefined();
    });
  });

  describe('mapPagedResponse()', () => {
    it('should map backend paginated response to IPagedResult', () => {
      const backendResponse = {
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 50,
        page: 2,
        pageSize: 25,
      };

      const result = repo['mapPagedResponse'](backendResponse);

      expect(result).toEqual({
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 50,
        page: 2,
        pageSize: 25,
      });
    });

    it('should provide defaults for missing pagination fields', () => {
      const backendResponse = {
        data: [{ id: 1, name: 'Item 1' }],
      };

      const result = repo['mapPagedResponse'](backendResponse);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should throw on invalid response structure', () => {
      expect(() => {
        repo['mapPagedResponse']({ data: 'not an array' });
      }).toThrow();

      expect(() => {
        repo['mapPagedResponse'](null);
      }).toThrow();

      expect(() => {
        repo['mapPagedResponse']({});
      }).toThrow();
    });
  });
});
```

**Verification:**

```bash
# Run tests for proxy base
pnpm --filter @hbc/data-access test proxy-base.test.ts

# Expected: All 12+ tests pass
# Commit: git commit -m "feat: create ProxyBaseRepository with path building and query marshaling"
```

---

## Chunk 2: Lead and Project Repository Implementations (≈550 lines)

### Task 3: ProxyLeadRepository

**Files:**
- Create: `packages/data-access/src/adapters/proxy/lead-repository.ts`
- Create: `packages/data-access/src/adapters/proxy/lead-repository.test.ts`

**Implementation:**

```typescript
// packages/data-access/src/adapters/proxy/lead-repository.ts

import type {
  ILead,
  ILeadFormData,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { ILeadRepository } from '../../ports/ILeadRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyLeadRepository
  extends ProxyBaseRepository<ILead>
  implements ILeadRepository
{
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/leads');
  }

  async getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>('/api/leads', params);
      return this.mapPagedResponse<ILead>(response);
    }, 'ProxyLeadRepository.getAll');
  }

  async getById(id: number): Promise<ILead | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Lead');
      try {
        const path = this.buildPath(id);
        const response = await this.httpClient.get<{ data: ILead }>(path);
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyLeadRepository.getById');
  }

  async create(data: ILeadFormData): Promise<ILead> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: ILead }>(
        '/api/leads',
        data,
      );
      return response.data;
    }, 'ProxyLeadRepository.create');
  }

  async update(id: number, data: Partial<ILeadFormData>): Promise<ILead> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Lead');
      const path = this.buildPath(id);
      const response = await this.httpClient.put<{ data: ILead }>(
        path,
        data,
      );
      return response.data;
    }, 'ProxyLeadRepository.update');
  }

  async delete(id: number): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Lead');
      const path = this.buildPath(id);
      await this.httpClient.delete(path);
    }, 'ProxyLeadRepository.delete');
  }

  async search(
    query: string,
    options?: IListQueryOptions,
  ): Promise<IPagedResult<ILead>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      params.q = query;
      const response = await this.httpClient.get<unknown>(
        '/api/leads/search',
        params,
      );
      return this.mapPagedResponse<ILead>(response);
    }, 'ProxyLeadRepository.search');
  }
}
```

**Tests:**

```typescript
// packages/data-access/src/adapters/proxy/lead-repository.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ILead, ILeadFormData } from '@hbc/models';
import { ProxyLeadRepository } from './lead-repository.js';
import { ProxyHttpClient } from './http-client.js';
import { NotFoundError, ValidationError } from '../../errors/index.js';

describe('ProxyLeadRepository', () => {
  let httpClient: ProxyHttpClient;
  let repo: ProxyLeadRepository;

  const mockLead: ILead = {
    id: 1,
    title: 'Test Lead',
    stage: 'prospecting',
    clientName: 'Acme Corp',
    estimatedValue: 50000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    httpClient = new ProxyHttpClient({
      baseUrl: 'https://api.example.com',
      getToken: async () => 'test-token',
    });
    repo = new ProxyLeadRepository(httpClient);
  });

  describe('getAll()', () => {
    it('should fetch paginated leads', async () => {
      const spy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [mockLead],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      const result = await repo.getAll({ page: 1, pageSize: 20 });

      expect(spy).toHaveBeenCalledWith('/api/leads', {
        page: '1',
        pageSize: '20',
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test Lead');
      expect(result.total).toBe(1);
    });

    it('should handle empty result set', async () => {
      vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      const result = await repo.getAll();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getById()', () => {
    it('should fetch a single lead by ID', async () => {
      const spy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: mockLead,
      });

      const result = await repo.getById(1);

      expect(spy).toHaveBeenCalledWith('/api/leads/1');
      expect(result).toEqual(mockLead);
    });

    it('should return null on 404', async () => {
      vi.spyOn(httpClient, 'get').mockRejectedValueOnce(
        new NotFoundError('Lead', 1),
      );

      const result = await repo.getById(1);

      expect(result).toBeNull();
    });

    it('should throw ValidationError on invalid ID', async () => {
      await expect(repo.getById(0)).rejects.toThrow(ValidationError);
      await expect(repo.getById(-1)).rejects.toThrow(ValidationError);
      await expect(repo.getById(NaN)).rejects.toThrow(ValidationError);
    });

    it('should propagate other errors', async () => {
      vi.spyOn(httpClient, 'get').mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(repo.getById(1)).rejects.toThrow();
    });
  });

  describe('create()', () => {
    it('should create a new lead', async () => {
      const spy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
        data: mockLead,
      });

      const input: ILeadFormData = {
        title: 'Test Lead',
        stage: 'prospecting',
        clientName: 'Acme Corp',
        estimatedValue: 50000,
      };

      const result = await repo.create(input);

      expect(spy).toHaveBeenCalledWith('/api/leads', input);
      expect(result).toEqual(mockLead);
    });

    it('should propagate validation errors from server', async () => {
      vi.spyOn(httpClient, 'post').mockRejectedValueOnce(
        new ValidationError('Title is required'),
      );

      const input: ILeadFormData = {
        title: '',
        stage: 'prospecting',
        clientName: 'Acme Corp',
        estimatedValue: 50000,
      };

      await expect(repo.create(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('update()', () => {
    it('should update an existing lead', async () => {
      const updated: ILead = { ...mockLead, title: 'Updated' };
      const spy = vi.spyOn(httpClient, 'put').mockResolvedValueOnce({
        data: updated,
      });

      const result = await repo.update(1, { title: 'Updated' });

      expect(spy).toHaveBeenCalledWith('/api/leads/1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundError on missing lead', async () => {
      vi.spyOn(httpClient, 'put').mockRejectedValueOnce(
        new NotFoundError('Lead', 999),
      );

      await expect(
        repo.update(999, { title: 'Updated' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should validate ID before sending request', async () => {
      const spy = vi.spyOn(httpClient, 'put');

      await expect(repo.update(0, { title: 'x' })).rejects.toThrow(
        ValidationError,
      );
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should delete a lead', async () => {
      const spy = vi.spyOn(httpClient, 'delete').mockResolvedValueOnce(
        undefined,
      );

      await repo.delete(1);

      expect(spy).toHaveBeenCalledWith('/api/leads/1');
    });

    it('should throw NotFoundError on missing lead', async () => {
      vi.spyOn(httpClient, 'delete').mockRejectedValueOnce(
        new NotFoundError('Lead', 999),
      );

      await expect(repo.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('search()', () => {
    it('should search leads by query', async () => {
      const spy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [mockLead],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      const result = await repo.search('highway', { page: 1 });

      expect(spy).toHaveBeenCalledWith('/api/leads/search', {
        q: 'highway',
        page: '1',
      });
      expect(result.items).toHaveLength(1);
    });

    it('should include pagination in search results', async () => {
      vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
        data: [mockLead],
        total: 100,
        page: 2,
        pageSize: 50,
      });

      const result = await repo.search('test', { page: 2, pageSize: 50 });

      expect(result.total).toBe(100);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(50);
    });
  });
});
```

**Verification:**

```bash
# Run lead repository tests
pnpm --filter @hbc/data-access test lead-repository.test.ts

# Expected: All 13+ tests pass
# Commit: git commit -m "feat: implement ProxyLeadRepository with full CRUD and search"
```

---

### Task 4: ProxyProjectRepository

**Files:**
- Create: `packages/data-access/src/adapters/proxy/project-repository.ts`
- Create: `packages/data-access/src/adapters/proxy/project-repository.test.ts`

**Implementation:** The Project repository uses `IActiveProject` (not `IProject`) and `IPortfolioSummary`. Method names are domain-specific (`getProjects`, `getProjectById`, etc.) and the repository has no `search` method. IDs are strings (UUIDs). The repository also exposes a `getPortfolioSummary()` aggregate query.

```typescript
// packages/data-access/src/adapters/proxy/project-repository.ts

import type {
  IActiveProject,
  IPortfolioSummary,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { IProjectRepository } from '../../ports/IProjectRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyProjectRepository
  extends ProxyBaseRepository<IActiveProject>
  implements IProjectRepository
{
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/projects');
  }

  async getProjects(options?: IListQueryOptions): Promise<IPagedResult<IActiveProject>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>(
        '/api/projects',
        params,
      );
      return this.mapPagedResponse<IActiveProject>(response);
    }, 'ProxyProjectRepository.getProjects');
  }

  async getProjectById(id: string): Promise<IActiveProject | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Project');
      try {
        const path = this.buildPath(id);
        const response = await this.httpClient.get<{ data: IActiveProject }>(path);
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyProjectRepository.getProjectById');
  }

  async createProject(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IActiveProject }>(
        '/api/projects',
        data,
      );
      return response.data;
    }, 'ProxyProjectRepository.createProject');
  }

  async updateProject(
    id: string,
    data: Partial<IActiveProject>,
  ): Promise<IActiveProject> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Project');
      const path = this.buildPath(id);
      const response = await this.httpClient.put<{ data: IActiveProject }>(
        path,
        data,
      );
      return response.data;
    }, 'ProxyProjectRepository.updateProject');
  }

  async deleteProject(id: string): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'Project');
      const path = this.buildPath(id);
      await this.httpClient.delete(path);
    }, 'ProxyProjectRepository.deleteProject');
  }

  async getPortfolioSummary(): Promise<IPortfolioSummary> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IPortfolioSummary }>(
        '/api/projects/portfolio-summary',
      );
      return response.data;
    }, 'ProxyProjectRepository.getPortfolioSummary');
  }
}
```

**Tests:** 10+ test cases covering getProjects, getProjectById, createProject, updateProject, deleteProject, getPortfolioSummary, and error handling. String IDs throughout.

**Verification:**

```bash
pnpm --filter @hbc/data-access test project-repository.test.ts

# Expected: All tests pass
# Commit: git commit -m "feat: implement ProxyProjectRepository with domain-specific methods"
```

---

## Chunk 3: Remaining Domain Repositories (≈700 lines of listings + commits)

**Overview:** Tasks 5–7 each implement their port interface by delegating to `ProxyHttpClient` through `ProxyBaseRepository`. Unlike Lead (Task 3), each repository has its own domain-specific method names, entity types, and query patterns. Most are project-scoped (taking `projectId` as a parameter on list methods) and several manage multiple entity types (e.g., tracker + kickoff, contract + approval). None of the remaining repositories have a generic `search()` method.

### Task 5: ProxyEstimatingRepository, ProxyScheduleRepository, ProxyBuyoutRepository

**Files to create:**
- `packages/data-access/src/adapters/proxy/estimating-repository.ts`
- `packages/data-access/src/adapters/proxy/estimating-repository.test.ts`
- `packages/data-access/src/adapters/proxy/schedule-repository.ts`
- `packages/data-access/src/adapters/proxy/schedule-repository.test.ts`
- `packages/data-access/src/adapters/proxy/buyout-repository.ts`
- `packages/data-access/src/adapters/proxy/buyout-repository.test.ts`

**ProxyEstimatingRepository:**

The Estimating domain manages two entity types: `IEstimatingTracker` (bid tracking) and `IEstimatingKickoff` (kickoff meetings). Methods use domain-specific names (`getAllTrackers`, `getTrackerById`, `createTracker`, etc.) rather than generic CRUD. The kickoff entity has separate `getKickoff(projectId)` and `createKickoff()` methods.

```typescript
// packages/data-access/src/adapters/proxy/estimating-repository.ts

import type {
  IEstimatingTracker,
  IEstimatingKickoff,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { IEstimatingRepository } from '../../ports/IEstimatingRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyEstimatingRepository
  extends ProxyBaseRepository<IEstimatingTracker>
  implements IEstimatingRepository
{
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/estimating/trackers');
  }

  async getAllTrackers(
    options?: IListQueryOptions,
  ): Promise<IPagedResult<IEstimatingTracker>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>(
        '/api/estimating/trackers',
        params,
      );
      return this.mapPagedResponse<IEstimatingTracker>(response);
    }, 'ProxyEstimatingRepository.getAllTrackers');
  }

  async getTrackerById(id: number): Promise<IEstimatingTracker | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'EstimatingTracker');
      try {
        const path = this.buildPath(id);
        const response = await this.httpClient.get<{ data: IEstimatingTracker }>(path);
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyEstimatingRepository.getTrackerById');
  }

  async createTracker(
    data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IEstimatingTracker> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IEstimatingTracker }>(
        '/api/estimating/trackers',
        data,
      );
      return response.data;
    }, 'ProxyEstimatingRepository.createTracker');
  }

  async updateTracker(
    id: number,
    data: Partial<IEstimatingTracker>,
  ): Promise<IEstimatingTracker> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'EstimatingTracker');
      const path = this.buildPath(id);
      const response = await this.httpClient.put<{ data: IEstimatingTracker }>(
        path,
        data,
      );
      return response.data;
    }, 'ProxyEstimatingRepository.updateTracker');
  }

  async deleteTracker(id: number): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'EstimatingTracker');
      const path = this.buildPath(id);
      await this.httpClient.delete(path);
    }, 'ProxyEstimatingRepository.deleteTracker');
  }

  async getKickoff(projectId: string): Promise<IEstimatingKickoff | null> {
    return this.wrapAsync(async () => {
      try {
        const response = await this.httpClient.get<{ data: IEstimatingKickoff }>(
          `/api/estimating/kickoffs/${projectId}`,
        );
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyEstimatingRepository.getKickoff');
  }

  async createKickoff(
    data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>,
  ): Promise<IEstimatingKickoff> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IEstimatingKickoff }>(
        '/api/estimating/kickoffs',
        data,
      );
      return response.data;
    }, 'ProxyEstimatingRepository.createKickoff');
  }
}
```

**ProxyScheduleRepository:**

The Schedule domain is project-scoped and manages `IScheduleActivity` entries plus an `IScheduleMetrics` aggregate. Methods: `getActivities(projectId)`, `getActivityById(id)`, `createActivity(data)`, `updateActivity(id, data)`, `deleteActivity(id)`, `getMetrics(projectId)`. No search method.

```typescript
// packages/data-access/src/adapters/proxy/schedule-repository.ts

import type {
  IScheduleActivity,
  IScheduleMetrics,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import type { IScheduleRepository } from '../../ports/IScheduleRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyScheduleRepository
  extends ProxyBaseRepository<IScheduleActivity>
  implements IScheduleRepository
{
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/schedules');
  }

  async getActivities(
    projectId: string,
    options?: IListQueryOptions,
  ): Promise<IPagedResult<IScheduleActivity>> {
    return this.wrapAsync(async () => {
      const params = this.buildQueryParams(options);
      const response = await this.httpClient.get<unknown>(
        this.buildProjectScopedPath(projectId, 'activities'),
        params,
      );
      return this.mapPagedResponse<IScheduleActivity>(response);
    }, 'ProxyScheduleRepository.getActivities');
  }

  async getActivityById(id: number): Promise<IScheduleActivity | null> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'ScheduleActivity');
      try {
        const response = await this.httpClient.get<{ data: IScheduleActivity }>(
          `/api/schedules/activities/${id}`,
        );
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyScheduleRepository.getActivityById');
  }

  async createActivity(
    data: Omit<IScheduleActivity, 'id'>,
  ): Promise<IScheduleActivity> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.post<{ data: IScheduleActivity }>(
        '/api/schedules/activities',
        data,
      );
      return response.data;
    }, 'ProxyScheduleRepository.createActivity');
  }

  async updateActivity(
    id: number,
    data: Partial<IScheduleActivity>,
  ): Promise<IScheduleActivity> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'ScheduleActivity');
      const response = await this.httpClient.put<{ data: IScheduleActivity }>(
        `/api/schedules/activities/${id}`,
        data,
      );
      return response.data;
    }, 'ProxyScheduleRepository.updateActivity');
  }

  async deleteActivity(id: number): Promise<void> {
    return this.wrapAsync(async () => {
      this.validateId(id, 'ScheduleActivity');
      await this.httpClient.delete(`/api/schedules/activities/${id}`);
    }, 'ProxyScheduleRepository.deleteActivity');
  }

  async getMetrics(projectId: string): Promise<IScheduleMetrics> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IScheduleMetrics }>(
        this.buildProjectScopedPath(projectId, 'metrics'),
      );
      return response.data;
    }, 'ProxyScheduleRepository.getMetrics');
  }
}
```

**ProxyBuyoutRepository:**

The Buyout domain is project-scoped and manages `IBuyoutEntry` entries plus an `IBuyoutSummary` aggregate. Methods: `getEntries(projectId)`, `getEntryById(id)`, `createEntry(data)`, `updateEntry(id, data)`, `deleteEntry(id)`, `getSummary(projectId)`. No search method.

Implementation follows the same project-scoped pattern as Schedule above, substituting `IBuyoutEntry`/`IBuyoutSummary` and using resource paths under `/api/buyouts`.

**Test each:** 10+ test cases per repository, covering all domain-specific methods and error handling.

**Verification:**

```bash
# Test all three in one pass
pnpm --filter @hbc/data-access test \
  estimating-repository.test.ts \
  schedule-repository.test.ts \
  buyout-repository.test.ts

# Expected: 30+ tests pass
# Commit (one per repo):
git commit -m "feat: implement ProxyEstimatingRepository with tracker and kickoff methods"
git commit -m "feat: implement ProxyScheduleRepository with project-scoped activities and metrics"
git commit -m "feat: implement ProxyBuyoutRepository with project-scoped entries and summary"
```

---

### Task 6: ProxyComplianceRepository, ProxyContractRepository, ProxyRiskRepository

**Files to create:**
- `packages/data-access/src/adapters/proxy/compliance-repository.ts`
- `packages/data-access/src/adapters/proxy/compliance-repository.test.ts`
- `packages/data-access/src/adapters/proxy/contract-repository.ts`
- `packages/data-access/src/adapters/proxy/contract-repository.test.ts`
- `packages/data-access/src/adapters/proxy/risk-repository.ts`
- `packages/data-access/src/adapters/proxy/risk-repository.test.ts`

**ProxyComplianceRepository:**

Project-scoped. Manages `IComplianceEntry` + `IComplianceSummary`. Methods: `getEntries(projectId, options?)`, `getEntryById(id)`, `createEntry(data)`, `updateEntry(id, data)`, `deleteEntry(id)`, `getSummary(projectId)`. No search. Follows the same project-scoped pattern as Buyout (Task 5).

**ProxyContractRepository:**

Project-scoped with two entity types. Manages `IContractInfo` + `ICommitmentApproval`. Methods: `getContracts(projectId, options?)`, `getContractById(id)`, `createContract(data)`, `updateContract(id, data)`, `deleteContract(id)`, `getApprovals(contractId)`, `createApproval(data)`. No search. The approval methods operate on a sub-resource scoped by contract ID.

**ProxyRiskRepository:**

Project-scoped. Manages `IRiskCostItem` + `IRiskCostManagement`. Methods: `getItems(projectId, options?)`, `getItemById(id)`, `createItem(data)`, `updateItem(id, data)`, `deleteItem(id)`, `getManagement(projectId)`. No search. Follows the project-scoped pattern with an aggregate query.

**Verification:**

```bash
pnpm --filter @hbc/data-access test \
  compliance-repository.test.ts \
  contract-repository.test.ts \
  risk-repository.test.ts

# Expected: 30+ tests pass
# Commits (one per repo):
git commit -m "feat: implement ProxyComplianceRepository with project-scoped entries and summary"
git commit -m "feat: implement ProxyContractRepository with contracts and approval sub-resource"
git commit -m "feat: implement ProxyRiskRepository with project-scoped items and management aggregate"
```

---

### Task 7: ProxyScorecardRepository, ProxyPmpRepository, ProxyAuthRepository

**Files to create:**
- `packages/data-access/src/adapters/proxy/scorecard-repository.ts`
- `packages/data-access/src/adapters/proxy/scorecard-repository.test.ts`
- `packages/data-access/src/adapters/proxy/pmp-repository.ts`
- `packages/data-access/src/adapters/proxy/pmp-repository.test.ts`
- `packages/data-access/src/adapters/proxy/auth-repository.ts`
- `packages/data-access/src/adapters/proxy/auth-repository.test.ts`

**ProxyScorecardRepository:**

Project-scoped with two entity types. Manages `IGoNoGoScorecard` + `IScorecardVersion`. Methods: `getScorecards(projectId, options?)`, `getScorecardById(id)`, `createScorecard(data)`, `updateScorecard(id, data)`, `deleteScorecard(id)`, `getVersions(scorecardId)`. No search. The versions method operates on a sub-resource scoped by scorecard ID.

**ProxyPmpRepository:**

Project-scoped with two entity types. Manages `IProjectManagementPlan` + `IPMPSignature`. Methods: `getPlans(projectId, options?)`, `getPlanById(id)`, `createPlan(data)`, `updatePlan(id, data)`, `deletePlan(id)`, `getSignatures(pmpId)`, `createSignature(data)`. No search. Signatures are a sub-resource scoped by PMP ID.

**ProxyAuthRepository:**

**This repository has no CRUD pattern at all.** It does not extend `ProxyBaseRepository` in a meaningful way (or uses it only for `httpClient` access). The Auth port manages users, roles, and permissions with these methods:

- `getCurrentUser(): Promise<ICurrentUser>` — retrieve authenticated user profile
- `getRoles(): Promise<IRole[]>` — list all available roles
- `getRoleById(id: string): Promise<IRole | null>` — retrieve a single role by ID
- `getPermissionTemplates(): Promise<IPermissionTemplate[]>` — list permission templates
- `assignRole(userId: string, roleId: string): Promise<void>` — assign a role to a user
- `removeRole(userId: string, roleId: string): Promise<void>` — remove a role from a user

All methods delegate to `/api/auth/*` endpoints. No pagination, no entity creation/deletion in the traditional sense. IDs are strings.

```typescript
// packages/data-access/src/adapters/proxy/auth-repository.ts

import type {
  ICurrentUser,
  IRole,
  IPermissionTemplate,
} from '@hbc/models';
import type { IAuthRepository } from '../../ports/IAuthRepository.js';
import { NotFoundError } from '../../errors/index.js';
import { ProxyBaseRepository } from './proxy-base.js';
import { ProxyHttpClient } from './http-client.js';

export class ProxyAuthRepository
  extends ProxyBaseRepository<ICurrentUser>
  implements IAuthRepository
{
  constructor(httpClient: ProxyHttpClient) {
    super(httpClient, '/api/auth');
  }

  async getCurrentUser(): Promise<ICurrentUser> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: ICurrentUser }>(
        '/api/auth/me',
      );
      return response.data;
    }, 'ProxyAuthRepository.getCurrentUser');
  }

  async getRoles(): Promise<IRole[]> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IRole[] }>(
        '/api/auth/roles',
      );
      return response.data;
    }, 'ProxyAuthRepository.getRoles');
  }

  async getRoleById(id: string): Promise<IRole | null> {
    return this.wrapAsync(async () => {
      try {
        const response = await this.httpClient.get<{ data: IRole }>(
          `/api/auth/roles/${id}`,
        );
        return response.data;
      } catch (err) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    }, 'ProxyAuthRepository.getRoleById');
  }

  async getPermissionTemplates(): Promise<IPermissionTemplate[]> {
    return this.wrapAsync(async () => {
      const response = await this.httpClient.get<{ data: IPermissionTemplate[] }>(
        '/api/auth/permission-templates',
      );
      return response.data;
    }, 'ProxyAuthRepository.getPermissionTemplates');
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    return this.wrapAsync(async () => {
      await this.httpClient.post<void>(
        `/api/auth/users/${userId}/roles`,
        { roleId },
      );
    }, 'ProxyAuthRepository.assignRole');
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    return this.wrapAsync(async () => {
      await this.httpClient.delete(
        `/api/auth/users/${userId}/roles/${roleId}`,
      );
    }, 'ProxyAuthRepository.removeRole');
  }
}
```

**Verification:**

```bash
pnpm --filter @hbc/data-access test \
  scorecard-repository.test.ts \
  pmp-repository.test.ts \
  auth-repository.test.ts

# Expected: 30+ tests pass
# Commits:
git commit -m "feat: implement ProxyScorecardRepository with project-scoped scorecards and versions"
git commit -m "feat: implement ProxyPmpRepository with project-scoped plans and signatures"
git commit -m "feat: implement ProxyAuthRepository with user/role/permission methods (non-CRUD)"
```

---

## Chunk 4: Factory Wiring and Integration (≈380 lines)

### Task 8: Create proxy adapter barrel and wire factory

**Files:**
- Modify: `packages/data-access/src/adapters/proxy/index.ts` — add exports for all proxy repositories
- Modify: `packages/data-access/src/factory.ts` — implement proxy factory functions

**Step 1: Update proxy adapter barrel:**

```typescript
// packages/data-access/src/adapters/proxy/index.ts

/**
 * Proxy adapters — Azure Functions proxy implementations for PWA (MSAL on-behalf-of).
 *
 * Each repository delegates HTTP calls to ProxyHttpClient, which handles:
 * - Bearer token injection from frontend context
 * - Request tracing (X-Request-Id)
 * - Error translation (HTTP status → domain errors)
 * - JSON marshaling
 *
 * Backend performs MSAL OBO internally; proxy adapter only sends Bearer tokens.
 */

export type { ProxyConfig } from './types.js';
export { DEFAULT_TIMEOUT_MS, DEFAULT_RETRY_COUNT } from './constants.js';
export { ProxyHttpClient } from './http-client.js';
export type { ProxyHttpClientOptions } from './http-client.js';
export { ProxyBaseRepository } from './proxy-base.js';
export { ProxyLeadRepository } from './lead-repository.js';
export { ProxyProjectRepository } from './project-repository.js';
export { ProxyEstimatingRepository } from './estimating-repository.js';
export { ProxyScheduleRepository } from './schedule-repository.js';
export { ProxyBuyoutRepository } from './buyout-repository.js';
export { ProxyComplianceRepository } from './compliance-repository.js';
export { ProxyContractRepository } from './contract-repository.js';
export { ProxyRiskRepository } from './risk-repository.js';
export { ProxyScorecardRepository } from './scorecard-repository.js';
export { ProxyPmpRepository } from './pmp-repository.js';
export { ProxyAuthRepository } from './auth-repository.js';
```

**Step 2: Wire factory.ts for proxy mode:**

The factory needs access to `baseUrl` and `getToken`. These come from:
- `baseUrl`: env var `PROXY_BASE_URL`
- `getToken`: a function passed to the factory (or resolved from global context)

Create a factory initialization function:

```typescript
// packages/data-access/src/factory.ts (excerpt - additions only)

import {
  ProxyHttpClient,
  ProxyLeadRepository,
  ProxyProjectRepository,
  ProxyEstimatingRepository,
  ProxyScheduleRepository,
  ProxyBuyoutRepository,
  ProxyComplianceRepository,
  ProxyContractRepository,
  ProxyRiskRepository,
  ProxyScorecardRepository,
  ProxyPmpRepository,
  ProxyAuthRepository,
} from './adapters/proxy/index.js';

/**
 * Token provider function signature for proxy adapter.
 * Called on each request to retrieve the current Bearer token.
 */
export type TokenProvider = () => Promise<string>;

/**
 * Global proxy factory context. Set via setProxyContext() before using proxy adapters.
 */
let proxyContext: {
  baseUrl: string;
  getToken: TokenProvider;
} | null = null;

/**
 * Initialize proxy adapter context.
 * Must be called before creating proxy repositories (e.g., at app startup).
 *
 * @param baseUrl - Azure Functions base URL (e.g., "https://functions.example.com")
 * @param getToken - Async function returning current Bearer token
 *
 * @example
 * ```ts
 * import { setProxyContext } from '@hbc/data-access';
 *
 * // At app startup (PWA main.ts or SPFx webpart init):
 * setProxyContext(
 *   process.env.PROXY_BASE_URL || 'https://localhost:7071',
 *   async () => {
 *     // Get token from MSAL or auth service
 *     const account = msalInstance.getActiveAccount();
 *     const response = await msalInstance.acquireTokenSilent({
 *       scopes: ['api://your-function-app/.default'],
 *       account,
 *     });
 *     return response.accessToken;
 *   },
 * );
 * ```
 */
export function setProxyContext(
  baseUrl: string,
  getToken: TokenProvider,
): void {
  proxyContext = { baseUrl, getToken };
}

/**
 * Get current proxy context. Throws if not initialized.
 */
function getProxyContext() {
  if (!proxyContext) {
    throw new Error(
      'Proxy adapter context not initialized. Call setProxyContext() at app startup.',
    );
  }
  return proxyContext;
}

/**
 * Create or retrieve the shared ProxyHttpClient instance.
 * Lazy initialization; reused across all repositories.
 */
let proxyHttpClientInstance: ProxyHttpClient | null = null;

function getProxyHttpClient(): ProxyHttpClient {
  if (!proxyHttpClientInstance) {
    const context = getProxyContext();
    proxyHttpClientInstance = new ProxyHttpClient({
      baseUrl: context.baseUrl,
      getToken: context.getToken,
    });
  }
  return proxyHttpClientInstance;
}

// Now update the existing factory functions:

export function createLeadRepository(mode?: AdapterMode): ILeadRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockLeadRepository();
    case 'proxy':
      return new ProxyLeadRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'LeadRepository');
  }
}

export function createScheduleRepository(
  mode?: AdapterMode,
): IScheduleRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScheduleRepository();
    case 'proxy':
      return new ProxyScheduleRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScheduleRepository');
  }
}

export function createBuyoutRepository(mode?: AdapterMode): IBuyoutRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockBuyoutRepository();
    case 'proxy':
      return new ProxyBuyoutRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'BuyoutRepository');
  }
}

export function createEstimatingRepository(
  mode?: AdapterMode,
): IEstimatingRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockEstimatingRepository();
    case 'proxy':
      return new ProxyEstimatingRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'EstimatingRepository');
  }
}

export function createComplianceRepository(
  mode?: AdapterMode,
): IComplianceRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockComplianceRepository();
    case 'proxy':
      return new ProxyComplianceRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ComplianceRepository');
  }
}

export function createContractRepository(
  mode?: AdapterMode,
): IContractRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockContractRepository();
    case 'proxy':
      return new ProxyContractRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ContractRepository');
  }
}

export function createRiskRepository(mode?: AdapterMode): IRiskRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockRiskRepository();
    case 'proxy':
      return new ProxyRiskRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'RiskRepository');
  }
}

export function createScorecardRepository(
  mode?: AdapterMode,
): IScorecardRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockScorecardRepository();
    case 'proxy':
      return new ProxyScorecardRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ScorecardRepository');
  }
}

export function createPmpRepository(mode?: AdapterMode): IPmpRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockPmpRepository();
    case 'proxy':
      return new ProxyPmpRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'PmpRepository');
  }
}

export function createProjectRepository(
  mode?: AdapterMode,
): IProjectRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockProjectRepository();
    case 'proxy':
      return new ProxyProjectRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'ProjectRepository');
  }
}

export function createAuthRepository(mode?: AdapterMode): IAuthRepository {
  const resolved = mode ?? resolveAdapterMode();
  switch (resolved) {
    case 'mock':
      return new MockAuthRepository();
    case 'proxy':
      return new ProxyAuthRepository(getProxyHttpClient());
    case 'sharepoint':
    case 'api':
      throw new AdapterNotImplementedError(resolved, 'AuthRepository');
  }
}
```

**Verification:**

```bash
# Type check factory wiring
pnpm --filter @hbc/data-access check-types

# Lint
pnpm --filter @hbc/data-access lint

# Expected: no errors
# Commit: git commit -m "feat: wire proxy repositories into factory, export ProxyHttpClient"
```

---

### Task 9: Integration test — proxy adapter end-to-end

**Files:**
- Create: `packages/data-access/src/adapters/proxy/proxy-integration.test.ts`

**Test:**

```typescript
// packages/data-access/src/adapters/proxy/proxy-integration.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ILead, IActiveProject } from '@hbc/models';
import {
  setProxyContext,
  createLeadRepository,
  createProjectRepository,
  resolveAdapterMode,
} from '../../factory.js';

describe('Proxy Adapter Integration', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    // Initialize proxy context
    setProxyContext(
      'https://api.example.com',
      async () => 'test-jwt-token',
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('createLeadRepository with proxy mode', () => {
    it('should create ProxyLeadRepository when mode is proxy', async () => {
      const mockLead: ILead = {
        id: 1,
        title: 'Test Lead',
        stage: 'prospecting',
        clientName: 'Acme Corp',
        estimatedValue: 50000,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: [mockLead], total: 1, page: 1, pageSize: 20 }),
      });

      const repo = createLeadRepository('proxy');
      const result = await repo.getAll({ page: 1, pageSize: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test Lead');

      // Verify HTTP request details
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/leads');
      expect(init.headers['Authorization']).toBe('Bearer test-jwt-token');
      expect(init.method).toBe('GET');
    });

    it('should reuse single ProxyHttpClient instance across repositories', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: [], total: 0, page: 1, pageSize: 20 }),
      });

      const leadRepo = createLeadRepository('proxy');
      const projectRepo = createProjectRepository('proxy');

      await leadRepo.getAll();
      await projectRepo.getProjects();

      // Both calls should use same HTTP client (evidenced by sequential fetch calls)
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const [firstUrl] = mockFetch.mock.calls[0];
      const [secondUrl] = mockFetch.mock.calls[1];
      expect(firstUrl).toContain('/api/leads');
      expect(secondUrl).toContain('/api/projects');
    });

    it('should handle authentication token refresh', async () => {
      let tokenCallCount = 0;
      setProxyContext('https://api.example.com', async () => {
        tokenCallCount++;
        return `token-${tokenCallCount}`;
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: [], total: 0, page: 1, pageSize: 20 }),
      });

      const repo = createLeadRepository('proxy');
      await repo.getAll();
      await repo.getAll();

      // Each request should call getToken
      expect(tokenCallCount).toBe(2);
      const [, firstInit] = mockFetch.mock.calls[0];
      const [, secondInit] = mockFetch.mock.calls[1];
      expect(firstInit.headers['Authorization']).toBe('Bearer token-1');
      expect(secondInit.headers['Authorization']).toBe('Bearer token-2');
    });

    it('should map paginated responses correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          data: [
            { id: 1, title: 'Lead 1', stage: 'prospecting', clientName: 'Client 1', estimatedValue: 10000, createdAt: '', updatedAt: '' },
            { id: 2, title: 'Lead 2', stage: 'qualified', clientName: 'Client 2', estimatedValue: 20000, createdAt: '', updatedAt: '' },
          ],
          total: 100,
          page: 3,
          pageSize: 25,
        }),
      });

      const repo = createLeadRepository('proxy');
      const result = await repo.getAll({ page: 3, pageSize: 25 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(100);
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(25);
    });

    it('should require setProxyContext before creating proxy repos', () => {
      // Unstub to reset factory state
      vi.unstubAllGlobals();

      // Create new factory context without setProxyContext
      expect(() => {
        createLeadRepository('proxy');
      }).toThrow('Proxy adapter context not initialized');
    });
  });

  describe('error propagation', () => {
    it('should propagate 404 errors from backend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Not found' }),
      });

      const repo = createLeadRepository('proxy');
      const result = await repo.getById(999);

      // getById should return null on 404
      expect(result).toBeNull();
    });

    it('should propagate 500 errors as HbcDataAccessError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Database error' }),
      });

      const repo = createLeadRepository('proxy');
      await expect(repo.getAll()).rejects.toThrow();
    });
  });
});
```

**Verification:**

```bash
# Run integration tests
pnpm --filter @hbc/data-access test proxy-integration.test.ts

# Expected: All 8+ tests pass
# Commit: git commit -m "feat: add integration tests for proxy adapter factory wiring"
```

---

### Task 10: Run full test suite and clean up stubs

**Steps:**

1. **Run package tests:**

```bash
# Full data-access test suite
pnpm --filter @hbc/data-access test

# Expected output:
# PASS packages/data-access/src/adapters/proxy/http-client.test.ts (14 tests)
# PASS packages/data-access/src/adapters/proxy/proxy-base.test.ts (7 tests)
# PASS packages/data-access/src/adapters/proxy/lead-repository.test.ts (13 tests)
# PASS packages/data-access/src/adapters/proxy/project-repository.test.ts (13 tests)
# ... (remaining 6 repositories)
# PASS packages/data-access/src/adapters/proxy/proxy-integration.test.ts (8 tests)
# ✓ All tests pass (100+ total)
```

2. **Type check:**

```bash
pnpm --filter @hbc/data-access check-types

# Expected: no errors
```

3. **Lint:**

```bash
pnpm --filter @hbc/data-access lint

# Expected: no errors
```

4. **Verify stubs are removed:**

All `AdapterNotImplementedError` throws for proxy mode should now be replaced with concrete implementations. The factory functions should construct real proxy repositories.

```bash
# Check for remaining stubs
grep -r "AdapterNotImplementedError.*proxy" packages/data-access/src/factory.ts

# Expected output: no matches (all proxy entries replaced)
```

5. **Final commit:**

```bash
git commit -m "feat: complete proxy adapter implementation - all 11 repositories wired and tested

- ProxyHttpClient: Bearer auth, error translation, request tracing
- ProxyBaseRepository: shared path building and query marshaling
- 11 domain repositories: Lead, Project, Estimating, Schedule, Buyout,
  Compliance, Contract, Risk, Scorecard, PMP, Auth
- Factory integration: setProxyContext() initialization, lazy HttpClient singleton
- 100+ tests covering domain-specific methods, pagination, error handling
- Integration tests verifying end-to-end factory wiring"
```

**Final verification command:**

```bash
# Run entire data-access package validation
pnpm --filter @hbc/data-access test && \
pnpm --filter @hbc/data-access check-types && \
pnpm --filter @hbc/data-access lint

# Expected: all checks pass, ~100 tests, 0 type errors, 0 lint errors
```

---

## Summary

This plan delivers a production-ready proxy adapter across **10 sequential tasks**, organized into **4 focused chunks**:

- **Chunk 1:** HTTP client + base repository (~450 lines)
- **Chunk 2:** Lead + Project repositories (~550 lines)
- **Chunk 3:** Remaining 9 domain repositories (~700 lines + commit statements)
- **Chunk 4:** Factory wiring + integration tests (~380 lines)

**Key properties:**
- **TDD discipline:** Each task writes failing tests first, then implementation.
- **No external HTTP libraries:** Uses native `fetch` API only.
- **Zero-dependency auth:** Bearer tokens passed from frontend; backend performs MSAL OBO.
- **Full error translation:** HTTP status codes → domain errors.
- **Checkpoint commits:** After each task.
- **100+ test cases:** Unit, integration, error path coverage.
- **Domain-specific contracts:** Each repository implements its actual port interface — only Lead follows a generic CRUD+search pattern; others use domain-specific method names, project-scoped queries, and multi-entity contracts.
- **Exact TypeScript examples:** Developer can copy-paste and verify.

**Implementation is ready for a developer with zero HB Intel knowledge to execute end-to-end.**
