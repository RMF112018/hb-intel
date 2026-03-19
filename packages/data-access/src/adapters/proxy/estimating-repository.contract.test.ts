/**
 * E1 Task 5: Contract tests for ProxyEstimatingRepository.
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server, ESTIMATING_TRACKER_FIXTURES } from '../../test-utils/index.js';
import { ProxyEstimatingRepository } from './ProxyEstimatingRepository.js';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { EstimatingTrackerSchema } from '@hbc/models';

const API_BASE = 'http://localhost:7071';

function createRepo(): ProxyEstimatingRepository {
  const client = new ProxyHttpClient({
    baseUrl: API_BASE,
    accessToken: 'test-token',
    timeout: 5000,
    readRetryPolicy: { maxAttempts: 1, initialDelayMs: 0, backoffFactor: 1, maxDelayMs: 0, jitterFactor: 0, maxTotalDurationMs: 0, retryableErrors: new Set<string>() },
    writeRetryPolicy: { maxAttempts: 1, initialDelayMs: 0, backoffFactor: 1, maxDelayMs: 0, jitterFactor: 0, maxTotalDurationMs: 0, retryableErrors: new Set<string>() },
  });
  return new ProxyEstimatingRepository(client);
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('E1 Task 5: ProxyEstimatingRepository Contract Tests', () => {
  it('getAllTrackers returns IPagedResult with items conforming to EstimatingTrackerSchema', async () => {
    const repo = createRepo();
    const result = await repo.getAllTrackers();

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBe(ESTIMATING_TRACKER_FIXTURES.length);
    for (const tracker of result.items) {
      expect(EstimatingTrackerSchema.safeParse(tracker).success).toBe(true);
    }
  });

  it('getTrackerById returns IEstimatingTracker conforming to schema', async () => {
    const repo = createRepo();
    const tracker = await repo.getTrackerById(1);

    expect(tracker).not.toBeNull();
    expect(tracker!.id).toBe(1);
    expect(EstimatingTrackerSchema.safeParse(tracker).success).toBe(true);
  });

  it('getTrackerById returns null for unknown ID (404)', async () => {
    const repo = createRepo();
    const tracker = await repo.getTrackerById(999);
    expect(tracker).toBeNull();
  });

  it('createTracker returns tracker with server-assigned ID', async () => {
    const repo = createRepo();
    const created = await repo.createTracker({
      projectId: '660e8400-e29b-41d4-a716-446655440001',
      bidNumber: 'BID-CT-001',
      status: 'Draft',
      dueDate: '2026-06-01T00:00:00Z',
    });

    expect(created).toHaveProperty('id');
    expect(created.bidNumber).toBe('BID-CT-001');
  });

  it('deleteTracker completes without error (204)', async () => {
    const repo = createRepo();
    await expect(repo.deleteTracker(1)).resolves.toBeUndefined();
  });
});
