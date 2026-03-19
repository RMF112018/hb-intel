import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { ProxyProjectRepository } from './ProxyProjectRepository.js';

function mockFetch(response: { status?: number; jsonBody?: unknown }): void {
  const { jsonBody, status = 200 } = response;
  const resp = {
    ok: status < 400,
    status,
    json: vi.fn().mockResolvedValue(jsonBody ?? {}),
  } as unknown as Response;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp));
}

const NO_RETRY = { maxAttempts: 1, initialDelayMs: 0, backoffFactor: 1, maxDelayMs: 0, jitterFactor: 0, maxTotalDurationMs: 0, retryableErrors: new Set<string>() };

function createClient(): ProxyHttpClient {
  return new ProxyHttpClient({
    baseUrl: 'https://api.test.com/api',
    accessToken: 'test-token',
    timeout: 5000,
    readRetryPolicy: NO_RETRY,
    writeRetryPolicy: NO_RETRY,
  });
}

function lastFetchUrl(): string {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ProxyProjectRepository', () => {
  it('getProjects uses top-level /projects path', async () => {
    mockFetch({
      jsonBody: {
        items: [{ id: 'uuid-1', name: 'Project A', number: 'PRJ-001', status: 'active', startDate: '2024-01-01', endDate: '2024-12-31' }],
        total: 1,
        page: 1,
        pageSize: 25,
      },
    });
    const repo = new ProxyProjectRepository(createClient());
    const result = await repo.getProjects();
    expect(lastFetchUrl()).toContain('/projects');
    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe('uuid-1');
  });

  it('getProjects forwards pagination params', async () => {
    mockFetch({
      jsonBody: {
        items: [],
        total: 0,
        page: 2,
        pageSize: 10,
      },
    });
    const repo = new ProxyProjectRepository(createClient());
    await repo.getProjects({ page: 2, pageSize: 10 });
    expect(lastFetchUrl()).toContain('page=2');
    expect(lastFetchUrl()).toContain('pageSize=10');
  });

  it('getProjectById uses /projects/{id} path', async () => {
    mockFetch({
      jsonBody: {
        data: {
          id: 'uuid-123',
          name: 'Project B',
          number: 'PRJ-002',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
    });
    const repo = new ProxyProjectRepository(createClient());
    const result = await repo.getProjectById('uuid-123');
    expect(lastFetchUrl()).toContain('/projects/uuid-123');
    expect(result?.id).toBe('uuid-123');
  });

  it('getProjectById returns null on 404', async () => {
    mockFetch({
      status: 404,
      jsonBody: { message: 'Not found', code: 'NOT_FOUND' },
    });
    const repo = new ProxyProjectRepository(createClient());
    const result = await repo.getProjectById('uuid-missing');
    expect(result).toBeNull();
  });

  it('createProject posts to /projects with data', async () => {
    const projectData = {
      name: 'New Project',
      number: 'PRJ-003',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };
    mockFetch({
      jsonBody: {
        data: {
          id: 'uuid-456',
          ...projectData,
        },
      },
    });
    const repo = new ProxyProjectRepository(createClient());
    const result = await repo.createProject(projectData);
    expect(lastFetchUrl()).toContain('/projects');
    const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(result.id).toBe('uuid-456');
  });

  it('updateProject sends PUT to /projects/{id}', async () => {
    mockFetch({
      jsonBody: {
        data: {
          id: 'uuid-789',
          name: 'Updated Project',
          number: 'PRJ-002',
          status: 'closed',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
    });
    const repo = new ProxyProjectRepository(createClient());
    const result = await repo.updateProject('uuid-789', { status: 'closed' });
    expect(lastFetchUrl()).toContain('/projects/uuid-789');
    const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('PUT');
    expect(result.id).toBe('uuid-789');
  });

  it('deleteProject sends DELETE to /projects/{id}', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyProjectRepository(createClient());
    await expect(repo.deleteProject('uuid-delete')).resolves.toBeUndefined();
    expect(lastFetchUrl()).toContain('/projects/uuid-delete');
    const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('DELETE');
  });

  it('getPortfolioSummary uses /projects/summary endpoint', async () => {
    const summaryData = {
      totalProjects: 10,
      activeProjects: 8,
      totalContractValue: 500000,
      averagePercentComplete: 65,
    };
    mockFetch({
      jsonBody: { data: summaryData },
    });
    const repo = new ProxyProjectRepository(createClient());
    const result = await repo.getPortfolioSummary();
    expect(lastFetchUrl()).toContain('/projects/summary');
    expect(result.totalProjects).toBe(10);
    expect(result.activeProjects).toBe(8);
  });

  it('getProjectById validates id before network call', async () => {
    const repo = new ProxyProjectRepository(createClient());
    try {
      await repo.getProjectById('');
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('VALIDATION_ERROR');
    }
  });

  it('updateProject validates id before network call', async () => {
    const repo = new ProxyProjectRepository(createClient());
    try {
      await repo.updateProject('', { name: 'Test' });
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('VALIDATION_ERROR');
    }
  });

  it('deleteProject validates id before network call', async () => {
    const repo = new ProxyProjectRepository(createClient());
    try {
      await repo.deleteProject('');
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('VALIDATION_ERROR');
    }
  });
});
