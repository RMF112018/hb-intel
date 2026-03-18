import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { ProxyScheduleRepository } from './ProxyScheduleRepository.js';
import { ProxyBuyoutRepository } from './ProxyBuyoutRepository.js';
import { ProxyComplianceRepository } from './ProxyComplianceRepository.js';
import { ProxyContractRepository } from './ProxyContractRepository.js';
import { ProxyRiskRepository } from './ProxyRiskRepository.js';
import { ProxyScorecardRepository } from './ProxyScorecardRepository.js';
import { ProxyPmpRepository } from './ProxyPmpRepository.js';
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

describe('ProxyScheduleRepository', () => {
  it('getActivities uses D6 nested path', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyScheduleRepository(createClient());
    const result = await repo.getActivities('proj-123', { page: 2 });
    expect(lastFetchUrl()).toContain('/projects/proj-123/schedules');
    expect(lastFetchUrl()).toContain('page=2');
    expect(result.items).toEqual([]);
  });

  it('getActivityById returns null on 404', async () => {
    mockFetch({ status: 404, jsonBody: { message: 'Not found', code: 'NOT_FOUND' } });
    const repo = new ProxyScheduleRepository(createClient());
    const result = await repo.getActivityById(999);
    expect(result).toBeNull();
  });

  it('getMetrics uses D6 nested aggregate path', async () => {
    mockFetch({ jsonBody: { data: { totalActivities: 10 } } });
    const repo = new ProxyScheduleRepository(createClient());
    await repo.getMetrics('proj-123');
    expect(lastFetchUrl()).toContain('/projects/proj-123/schedules/metrics');
  });
});

describe('ProxyBuyoutRepository', () => {
  it('getEntries uses D6 nested path with plural domain', async () => {
    mockFetch({ jsonBody: { items: [{ id: 1 }], total: 1, page: 1, pageSize: 25 } });
    const repo = new ProxyBuyoutRepository(createClient());
    await repo.getEntries('proj-456');
    expect(lastFetchUrl()).toContain('/projects/proj-456/buyouts');
  });

  it('getSummary uses aggregate sub-path', async () => {
    mockFetch({ jsonBody: { data: { totalCost: 100 } } });
    const repo = new ProxyBuyoutRepository(createClient());
    await repo.getSummary('proj-456');
    expect(lastFetchUrl()).toContain('/projects/proj-456/buyouts/summary');
  });
});

describe('ProxyComplianceRepository', () => {
  it('getEntries uses compliance domain path', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyComplianceRepository(createClient());
    await repo.getEntries('proj-789');
    expect(lastFetchUrl()).toContain('/projects/proj-789/compliance');
  });
});

describe('ProxyContractRepository', () => {
  it('getContracts uses D6 nested path', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyContractRepository(createClient());
    await repo.getContracts('proj-abc');
    expect(lastFetchUrl()).toContain('/projects/proj-abc/contracts');
  });

  it('getApprovals uses sub-resource path', async () => {
    mockFetch({ jsonBody: { data: [{ id: 1 }] } });
    const repo = new ProxyContractRepository(createClient());
    await repo.getApprovals(42);
    expect(lastFetchUrl()).toContain('/contracts/42/approvals');
  });
});

describe('ProxyRiskRepository', () => {
  it('getItems uses plural risks domain', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyRiskRepository(createClient());
    await repo.getItems('proj-def');
    expect(lastFetchUrl()).toContain('/projects/proj-def/risks');
  });

  it('getManagement uses aggregate sub-path', async () => {
    mockFetch({ jsonBody: { data: { overallRating: 'medium' } } });
    const repo = new ProxyRiskRepository(createClient());
    await repo.getManagement('proj-def');
    expect(lastFetchUrl()).toContain('/projects/proj-def/risks/management');
  });
});

describe('ProxyScorecardRepository', () => {
  it('getScorecards uses plural scorecards domain', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyScorecardRepository(createClient());
    await repo.getScorecards('proj-ghi');
    expect(lastFetchUrl()).toContain('/projects/proj-ghi/scorecards');
  });

  it('getVersions uses sub-resource path', async () => {
    mockFetch({ jsonBody: { data: [] } });
    const repo = new ProxyScorecardRepository(createClient());
    await repo.getVersions(42);
    expect(lastFetchUrl()).toContain('/scorecards/42/versions');
  });
});

describe('ProxyPmpRepository', () => {
  it('getPlans uses pmp domain path', async () => {
    mockFetch({ jsonBody: { items: [], total: 0, page: 1, pageSize: 25 } });
    const repo = new ProxyPmpRepository(createClient());
    await repo.getPlans('proj-jkl');
    expect(lastFetchUrl()).toContain('/projects/proj-jkl/pmp');
  });

  it('getSignatures uses sub-resource path', async () => {
    mockFetch({ jsonBody: { data: [] } });
    const repo = new ProxyPmpRepository(createClient());
    await repo.getSignatures(10);
    expect(lastFetchUrl()).toContain('/pmp/10/signatures');
  });

  it('deletePlan sends DELETE and resolves', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyPmpRepository(createClient());
    await expect(repo.deletePlan(5)).resolves.toBeUndefined();
  });

  it('updatePlan sends PUT with data', async () => {
    mockFetch({ jsonBody: { data: { id: 5, title: 'Updated' } } });
    const repo = new ProxyPmpRepository(createClient());
    const result = await repo.updatePlan(5, { title: 'Updated' } as never);
    expect(result).toEqual({ id: 5, title: 'Updated' });
    const init = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('PUT');
  });
});

describe('Error handling across all repositories', () => {
  it('propagates 401 as UNAUTHORIZED', async () => {
    mockFetch({ status: 401, jsonBody: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
    const repo = new ProxyScheduleRepository(createClient());
    try {
      await repo.getActivities('proj-123');
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('UNAUTHORIZED');
    }
  });

  it('validates ID before network call', async () => {
    const repo = new ProxyBuyoutRepository(createClient());
    try {
      await repo.getEntryById(NaN);
      expect.fail('should throw');
    } catch (err) {
      expect((err as { code: string }).code).toBe('VALIDATION_ERROR');
    }
  });
});
