import { describe, it, expect, vi, afterEach } from 'vitest';
import { LeadStage } from '@hbc/models';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { ProxyLeadRepository } from './ProxyLeadRepository.js';
import { NotFoundError } from '../../errors/index.js';

function mockFetch(response: { status?: number; jsonBody?: unknown }): void {
  const { jsonBody, status = 200 } = response;
  const resp = {
    ok: status < 400,
    status,
    json: vi.fn().mockResolvedValue(jsonBody ?? {}),
  } as unknown as Response;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp));
}

function createClient(): ProxyHttpClient {
  return new ProxyHttpClient({ baseUrl: 'https://api.test.com/api', accessToken: 'test-token', timeout: 5000 });
}

function lastFetchUrl(): string {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
}

afterEach(() => { vi.restoreAllMocks(); });

describe('ProxyLeadRepository', () => {
  it('getAll uses /leads path', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.getAll();
    expect(lastFetchUrl()).toContain('/leads');
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('getAll forwards pagination params', async () => {
    mockFetch({ jsonBody: { items: [], total: 100, page: 2, pageSize: 50 } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.getAll({ page: 2, pageSize: 50 });
    expect(lastFetchUrl()).toContain('page=2');
    expect(lastFetchUrl()).toContain('pageSize=50');
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(50);
  });

  it('getById returns a single lead', async () => {
    const lead = {
      id: 42,
      title: 'Airport Terminal Expansion',
      stage: LeadStage.Qualifying,
      clientName: 'City Airport Authority',
      estimatedValue: 2500000,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    };
    mockFetch({ jsonBody: { data: lead } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.getById(42);
    expect(lastFetchUrl()).toContain('/leads/42');
    expect(result).toEqual(lead);
  });

  it('getById returns null on 404', async () => {
    mockFetch({ status: 404, jsonBody: { message: 'Not found', code: 'NOT_FOUND' } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.getById(999);
    expect(result).toBeNull();
  });

  it('create posts to /leads and returns created lead', async () => {
    const created = {
      id: 100,
      title: 'New Lead',
      stage: LeadStage.Identified,
      clientName: 'Acme Corp',
      estimatedValue: 500000,
      createdAt: '2024-03-19T12:00:00Z',
      updatedAt: '2024-03-19T12:00:00Z',
    };
    mockFetch({ jsonBody: { data: created } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.create({
      title: 'New Lead',
      stage: LeadStage.Identified,
      clientName: 'Acme Corp',
      estimatedValue: 500000,
    });
    expect(lastFetchUrl()).toContain('/leads');
    expect(result).toEqual(created);
  });

  it('update puts to /leads/{id} and returns updated lead', async () => {
    const updated = {
      id: 42,
      title: 'Updated Title',
      stage: LeadStage.Bidding,
      clientName: 'City Airport Authority',
      estimatedValue: 3000000,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-03-19T14:30:00Z',
    };
    mockFetch({ jsonBody: { data: updated } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.update(42, { title: 'Updated Title', stage: LeadStage.Bidding, estimatedValue: 3000000 });
    expect(lastFetchUrl()).toContain('/leads/42');
    expect(result).toEqual(updated);
  });

  it('delete sends DELETE to /leads/{id}', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyLeadRepository(createClient());
    await expect(repo.delete(42)).resolves.toBeUndefined();
    expect(lastFetchUrl()).toContain('/leads/42');
  });

  it('search uses /leads/search with q param', async () => {
    mockFetch({ jsonBody: { items: [{ id: 42 }], total: 1, page: 1, pageSize: 25 } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.search('airport');
    expect(lastFetchUrl()).toContain('/leads/search');
    expect(lastFetchUrl()).toContain('q=airport');
    expect(result.items).toHaveLength(1);
  });

  it('search forwards pagination params alongside query', async () => {
    mockFetch({ jsonBody: { items: [], total: 5, page: 2, pageSize: 10 } });
    const repo = new ProxyLeadRepository(createClient());
    const result = await repo.search('terminal', { page: 2, pageSize: 10 });
    expect(lastFetchUrl()).toContain('/leads/search');
    expect(lastFetchUrl()).toContain('q=terminal');
    expect(lastFetchUrl()).toContain('page=2');
    expect(lastFetchUrl()).toContain('pageSize=10');
  });
});
