/**
 * E1 Task 5: Contract tests for ProxyProjectRepository.
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server, PROJECT_FIXTURES, PORTFOLIO_SUMMARY_FIXTURE } from '../../test-utils/index.js';
import { ProxyProjectRepository } from './ProxyProjectRepository.js';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { ActiveProjectSchema, PortfolioSummarySchema } from '@hbc/models';

const API_BASE = 'http://localhost:7071/api';

function createRepo(): ProxyProjectRepository {
  const client = new ProxyHttpClient({
    baseUrl: API_BASE,
    accessToken: 'test-token',
    timeout: 5000,
    readRetryPolicy: { maxAttempts: 1, initialDelayMs: 0, backoffFactor: 1, maxDelayMs: 0, jitterFactor: 0, maxTotalDurationMs: 0, retryableErrors: new Set<string>() },
    writeRetryPolicy: { maxAttempts: 1, initialDelayMs: 0, backoffFactor: 1, maxDelayMs: 0, jitterFactor: 0, maxTotalDurationMs: 0, retryableErrors: new Set<string>() },
  });
  return new ProxyProjectRepository(client);
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('E1 Task 5: ProxyProjectRepository Contract Tests', () => {
  it('getProjects returns IPagedResult with items conforming to ActiveProjectSchema', async () => {
    const repo = createRepo();
    const result = await repo.getProjects();

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBe(PROJECT_FIXTURES.length);
    for (const project of result.items) {
      expect(ActiveProjectSchema.safeParse(project).success).toBe(true);
    }
  });

  it('getProjectById returns IActiveProject conforming to schema', async () => {
    const repo = createRepo();
    const id = PROJECT_FIXTURES[0].id;
    const project = await repo.getProjectById(id);

    expect(project).not.toBeNull();
    expect(project!.id).toBe(id);
    expect(ActiveProjectSchema.safeParse(project).success).toBe(true);
  });

  it('getProjectById returns null for unknown ID (404)', async () => {
    const repo = createRepo();
    const project = await repo.getProjectById('nonexistent-uuid');
    expect(project).toBeNull();
  });

  it('getPortfolioSummary returns IPortfolioSummary conforming to schema', async () => {
    const repo = createRepo();
    const summary = await repo.getPortfolioSummary();

    expect(summary.totalProjects).toBe(PORTFOLIO_SUMMARY_FIXTURE.totalProjects);
    expect(PortfolioSummarySchema.safeParse(summary).success).toBe(true);
  });

  it('createProject returns IActiveProject with server-assigned ID', async () => {
    const repo = createRepo();
    const created = await repo.createProject({
      name: 'Contract Test Project',
      number: 'PRJ-CT001',
      status: 'Active',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z',
    });

    expect(created).toHaveProperty('id');
    expect(created.name).toBe('Contract Test Project');
  });

  it('deleteProject completes without error (204)', async () => {
    const repo = createRepo();
    const id = PROJECT_FIXTURES[0].id;
    await expect(repo.deleteProject(id)).resolves.toBeUndefined();
  });
});
