/**
 * E1 Task 4: Contract tests for ProxyLeadRepository.
 *
 * Validates that the proxy adapter correctly parses MSW-served responses
 * and produces outputs conforming to Zod contract schemas.
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, LEAD_FIXTURES, makePagedResponse } from '../../test-utils/index.js';
import { ProxyLeadRepository } from './ProxyLeadRepository.js';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { LeadSchema } from '@hbc/models';
import { LeadStage } from '@hbc/models';

const API_BASE = 'http://localhost:7071/api';

function createRepo(): ProxyLeadRepository {
  const client = new ProxyHttpClient({
    baseUrl: API_BASE,
    accessToken: 'test-token',
    timeout: 5000,
    readRetryPolicy: { maxAttempts: 1, initialDelayMs: 0, backoffFactor: 1, maxDelayMs: 0, jitterFactor: 0, maxTotalDurationMs: 0, retryableErrors: new Set<string>() },
    writeRetryPolicy: { maxAttempts: 1, initialDelayMs: 0, backoffFactor: 1, maxDelayMs: 0, jitterFactor: 0, maxTotalDurationMs: 0, retryableErrors: new Set<string>() },
  });
  return new ProxyLeadRepository(client);
}

// Add search handler that the base MSW handlers don't include
const searchHandler = http.get(`${API_BASE}/leads/search`, ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
  const lower = q.toLowerCase();
  const filtered = LEAD_FIXTURES.filter(
    (l) => l.title.toLowerCase().includes(lower) || l.clientName.toLowerCase().includes(lower),
  );
  return HttpResponse.json(makePagedResponse(filtered, page, pageSize));
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  server.use(searchHandler);
});
afterEach(() => {
  server.resetHandlers();
  server.use(searchHandler);
});
afterAll(() => server.close());

describe('E1 Task 4: ProxyLeadRepository Contract Tests', () => {
  it('getAll returns IPagedResult with items conforming to LeadSchema', async () => {
    const repo = createRepo();
    const result = await repo.getAll();

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBe(LEAD_FIXTURES.length);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBeGreaterThan(0);

    for (const lead of result.items) {
      const parsed = LeadSchema.safeParse(lead);
      expect(parsed.success).toBe(true);
    }
  });

  it('getAll respects pagination params', async () => {
    const repo = createRepo();
    const result = await repo.getAll({ page: 1, pageSize: 2 });

    expect(result.items.length).toBeLessThanOrEqual(2);
    expect(result.pageSize).toBe(2);
  });

  it('getById returns a single ILead conforming to LeadSchema', async () => {
    const repo = createRepo();
    const lead = await repo.getById(1);

    expect(lead).not.toBeNull();
    expect(lead!.id).toBe(1);
    const parsed = LeadSchema.safeParse(lead);
    expect(parsed.success).toBe(true);
  });

  it('getById returns null for unknown ID (404)', async () => {
    const repo = createRepo();
    const lead = await repo.getById(999);

    expect(lead).toBeNull();
  });

  it('create returns ILead with server-assigned ID conforming to LeadSchema', async () => {
    const repo = createRepo();
    const created = await repo.create({
      title: 'Contract Test Lead',
      stage: LeadStage.Identified,
      clientName: 'Test Client',
      estimatedValue: 100000,
    });

    expect(created).toHaveProperty('id');
    expect(created.title).toBe('Contract Test Lead');
    const parsed = LeadSchema.safeParse(created);
    expect(parsed.success).toBe(true);
  });

  it('update returns updated ILead conforming to LeadSchema', async () => {
    const repo = createRepo();
    const updated = await repo.update(1, { title: 'Updated Title' });

    expect(updated.id).toBe(1);
    expect(updated.title).toBe('Updated Title');
    const parsed = LeadSchema.safeParse(updated);
    expect(parsed.success).toBe(true);
  });

  it('delete completes without error (204)', async () => {
    const repo = createRepo();
    await expect(repo.delete(1)).resolves.toBeUndefined();
  });

  it('search returns filtered IPagedResult with items conforming to LeadSchema', async () => {
    const repo = createRepo();
    const result = await repo.search('highway');

    expect(result.items.length).toBe(1);
    expect(result.items[0].title).toContain('Highway');
    const parsed = LeadSchema.safeParse(result.items[0]);
    expect(parsed.success).toBe(true);
  });
});
