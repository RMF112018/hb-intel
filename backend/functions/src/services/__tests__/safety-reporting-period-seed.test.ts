import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SharePointService } from '../sharepoint-service.js';
import { resolveSeedTokenService } from '../../../../../scripts/seed-safety-reporting-period.js';

function buildServiceWithRows(rows: ReadonlyArray<Record<string, unknown>>) {
  process.env.SHAREPOINT_TENANT_URL = 'https://hedrickbrotherscom.sharepoint.com';

  const service = new SharePointService({
    getToken: vi.fn(),
  } as any);

  const selectInvoker = vi.fn(async () => rows);
  const itemsAdd = vi.fn(async (item: Record<string, unknown>) => ({ data: { Id: 321, ...item } }));
  const list = {
    items: {
      select: vi.fn(() => selectInvoker),
      add: itemsAdd,
    },
  };

  (service as any).resolveSafetyProvisioningTargets = vi.fn(() => ({
    safetySiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/Safety',
    hbCentralSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
  }));
  (service as any).getSP = vi.fn(async () => ({
    web: {
      lists: {
        getByTitle: vi.fn(() => list),
      },
    },
  }));

  return { service, itemsAdd };
}

describe('ensureCurrentWeekSafetyReportingPeriod', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates the current-week record when none exists', async () => {
    const { service, itemsAdd } = buildServiceWithRows([]);

    const result = await service.ensureCurrentWeekSafetyReportingPeriod();

    expect(result.success).toBe(true);
    expect(result.outcome).toBe('created');
    expect(result.createdItemId).toBe(321);
    expect(itemsAdd).toHaveBeenCalledTimes(1);
    expect(itemsAdd).toHaveBeenCalledWith({
      Title: 'Week of 2026-04-20',
      WeekStartDate: '2026-04-20',
      WeekEndDate: '2026-04-24',
      PeriodLabel: 'Apr 20 – Apr 24, 2026',
      Status: 'open',
    });
  });

  it('skips creation when exactly one current-week match exists', async () => {
    const { service, itemsAdd } = buildServiceWithRows([
      {
        Id: 55,
        Title: 'Week of 2026-04-20',
        WeekStartDate: '2026-04-20T00:00:00Z',
      },
    ]);

    const result = await service.ensureCurrentWeekSafetyReportingPeriod();

    expect(result.success).toBe(true);
    expect(result.outcome).toBe('alreadyExisted');
    expect(itemsAdd).not.toHaveBeenCalled();
  });

  it('fails closed when multiple current-week duplicates exist', async () => {
    const { service, itemsAdd } = buildServiceWithRows([
      { Id: 101, Title: 'Week of 2026-04-20', WeekStartDate: '2026-04-20T00:00:00Z' },
      { Id: 102, Title: 'Week of 2026-04-20', WeekStartDate: '2026-04-20T00:00:00Z' },
    ]);

    const result = await service.ensureCurrentWeekSafetyReportingPeriod();

    expect(result.success).toBe(false);
    expect(result.outcome).toBe('duplicateDetected');
    expect(result.duplicateCount).toBe(2);
    expect(itemsAdd).not.toHaveBeenCalled();
  });

  it('creates only required fields and omits optional publish/notes fields', async () => {
    const { service, itemsAdd } = buildServiceWithRows([]);

    await service.ensureCurrentWeekSafetyReportingPeriod();
    const payload = itemsAdd.mock.calls[0]?.[0] as Record<string, unknown>;

    expect(payload).toBeDefined();
    expect(payload.PublishedAt).toBeUndefined();
    expect(payload.PublishedBy).toBeUndefined();
    expect(payload.Notes).toBeUndefined();
  });

  it('script token override returns static token service and bypasses DAC path', async () => {
    const tokenService = resolveSeedTokenService({
      SHAREPOINT_BEARER_TOKEN: 'seed-override-token',
    } as NodeJS.ProcessEnv);

    await expect(
      tokenService.getSharePointToken('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral'),
    ).resolves.toBe('seed-override-token');
    await expect(
      tokenService.acquireAppToken(['https://hedrickbrotherscom.sharepoint.com/.default']),
    ).resolves.toBe('seed-override-token');
  });
});
