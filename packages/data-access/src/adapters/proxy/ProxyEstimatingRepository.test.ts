import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { ProxyEstimatingRepository } from './ProxyEstimatingRepository.js';

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
  return new ProxyHttpClient({ baseUrl: 'https://api.test.com', accessToken: 'test-token', timeout: 5000, readRetryPolicy: NO_RETRY, writeRetryPolicy: NO_RETRY });
}

function lastFetchUrl(): string {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
}

function lastFetchInit(): RequestInit {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
}

afterEach(() => { vi.restoreAllMocks(); });

describe('ProxyEstimatingRepository — Trackers', () => {
  it('getAllTrackers uses /api/estimating/trackers path', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.getAllTrackers({ page: 2 });
    expect(lastFetchUrl()).toContain('/api/estimating/trackers');
    expect(lastFetchUrl()).toContain('page=2');
    expect(result.items).toEqual([]);
  });

  it('getAllTrackers parses paged envelope', async () => {
    const trackerData = { id: 1, projectId: 'proj-1', bidNumber: 'BID-001', status: 'pending', dueDate: '2026-04-01', createdAt: '2026-03-19T00:00:00Z', updatedAt: '2026-03-19T00:00:00Z' };
    mockFetch({ jsonBody: { items: [trackerData], total: 1, page: 1, pageSize: 25 } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.getAllTrackers();
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(trackerData);
    expect(result.total).toBe(1);
  });

  it('getTrackerById returns tracker on 200', async () => {
    const trackerData = { id: 42, projectId: 'proj-1', bidNumber: 'BID-042', status: 'completed', dueDate: '2026-04-01', createdAt: '2026-03-19T00:00:00Z', updatedAt: '2026-03-19T00:00:00Z' };
    mockFetch({ jsonBody: { data: trackerData } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.getTrackerById(42);
    expect(lastFetchUrl()).toContain('/api/estimating/trackers/42');
    expect(result).toEqual(trackerData);
  });

  it('getTrackerById returns null on 404', async () => {
    mockFetch({ status: 404, jsonBody: { message: 'Not found', code: 'NOT_FOUND' } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.getTrackerById(999);
    expect(result).toBeNull();
  });

  it('createTracker sends POST to /api/estimating/trackers', async () => {
    const trackerData = { projectId: 'proj-1', bidNumber: 'BID-NEW', status: 'pending', dueDate: '2026-05-01' };
    const responseData = { id: 100, ...trackerData, createdAt: '2026-03-19T00:00:00Z', updatedAt: '2026-03-19T00:00:00Z' };
    mockFetch({ jsonBody: { data: responseData } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.createTracker(trackerData);
    expect(lastFetchUrl()).toContain('/api/estimating/trackers');
    expect(lastFetchInit().method).toBe('POST');
    expect(result).toEqual(responseData);
  });

  it('updateTracker sends PUT to /api/estimating/trackers/{id}', async () => {
    const responseData = { id: 42, projectId: 'proj-1', bidNumber: 'BID-042', status: 'in-progress', dueDate: '2026-04-01', createdAt: '2026-03-19T00:00:00Z', updatedAt: '2026-03-19T12:00:00Z' };
    mockFetch({ jsonBody: { data: responseData } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.updateTracker(42, { status: 'in-progress' });
    expect(lastFetchUrl()).toContain('/api/estimating/trackers/42');
    expect(lastFetchInit().method).toBe('PUT');
    expect(result).toEqual(responseData);
  });

  it('deleteTracker sends DELETE to /api/estimating/trackers/{id}', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyEstimatingRepository(createClient());
    await expect(repo.deleteTracker(42)).resolves.toBeUndefined();
    expect(lastFetchUrl()).toContain('/api/estimating/trackers/42');
    expect(lastFetchInit().method).toBe('DELETE');
  });
});

describe('ProxyEstimatingRepository — Kickoffs', () => {
  it('getKickoff uses /api/estimating/kickoffs/{projectId} path', async () => {
    const kickoffData = { id: 10, projectId: 'proj-1', kickoffDate: '2026-04-05', attendees: ['Alice', 'Bob'], notes: 'Initial kickoff', createdAt: '2026-03-20T00:00:00Z' };
    mockFetch({ jsonBody: { data: kickoffData } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.getKickoff('proj-1');
    expect(lastFetchUrl()).toContain('/api/estimating/kickoffs/proj-1');
    expect(result).toEqual(kickoffData);
  });

  it('getKickoff returns null on 404', async () => {
    mockFetch({ status: 404, jsonBody: { message: 'Not found', code: 'NOT_FOUND' } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.getKickoff('nonexistent-proj');
    expect(result).toBeNull();
  });

  it('createKickoff sends POST to /api/estimating/kickoffs', async () => {
    const kickoffInput = { projectId: 'proj-2', kickoffDate: '2026-05-10', attendees: ['Charlie', 'Diana'], notes: 'Project kickoff meeting' };
    const responseData = { id: 20, ...kickoffInput, createdAt: '2026-03-21T00:00:00Z' };
    mockFetch({ jsonBody: { data: responseData } });
    const repo = new ProxyEstimatingRepository(createClient());
    const result = await repo.createKickoff(kickoffInput);
    expect(lastFetchUrl()).toContain('/api/estimating/kickoffs');
    expect(lastFetchInit().method).toBe('POST');
    expect(result).toEqual(responseData);
  });
});

describe('ProxyEstimatingRepository — Error handling', () => {
  it('getTrackerById propagates non-404 errors', async () => {
    mockFetch({ status: 500, jsonBody: { message: 'Server error', code: 'SERVER_ERROR' } });
    const repo = new ProxyEstimatingRepository(createClient());
    try {
      await repo.getTrackerById(42);
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('SERVER_ERROR');
    }
  });

  it('getKickoff propagates non-404 errors', async () => {
    mockFetch({ status: 500, jsonBody: { message: 'Server error', code: 'SERVER_ERROR' } });
    const repo = new ProxyEstimatingRepository(createClient());
    try {
      await repo.getKickoff('proj-1');
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('SERVER_ERROR');
    }
  });

  it('createTracker propagates validation errors', async () => {
    mockFetch({ status: 400, jsonBody: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: [{ field: 'bidNumber', message: 'Required' }] } });
    const repo = new ProxyEstimatingRepository(createClient());
    try {
      await repo.createTracker({ projectId: 'proj-1', bidNumber: '', status: 'pending', dueDate: '2026-05-01' });
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('VALIDATION_ERROR');
    }
  });
});
