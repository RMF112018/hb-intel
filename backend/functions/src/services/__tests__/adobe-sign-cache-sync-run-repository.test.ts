import { describe, expect, it } from 'vitest';
import type { GraphListClient } from '../legacy-fallback/graph-list-client.js';

import { createGraphAdobeSignCacheSyncRunRepository } from '../adobe-sign-cache/repositories/sync-run-repository.js';
import { MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE } from '../adobe-sign-cache/cache-list-descriptors.js';

interface FakeRow {
  id: number;
  fields: Record<string, unknown>;
}

function makeFakeGraph(): {
  graph: GraphListClient;
  rows: FakeRow[];
  calls: { method: string; args: unknown[] }[];
} {
  const rows: FakeRow[] = [];
  const calls: { method: string; args: unknown[] }[] = [];
  let nextId = 1;
  const fake = {
    addItem: async (listTitle: string, fields: Record<string, unknown>) => {
      calls.push({ method: 'addItem', args: [listTitle, fields] });
      const id = nextId++;
      rows.push({ id, fields: { ...fields } });
      return { id: String(id), fields };
    },
  };
  return { graph: fake as unknown as GraphListClient, rows, calls };
}

describe('AdobeSignCacheSyncRunRepository.append', () => {
  it('writes a row to MyDashboardAdobeSignSyncRuns with the canonical field shape', async () => {
    const { graph, rows, calls } = makeFakeGraph();
    const repo = createGraphAdobeSignCacheSyncRunRepository({ graph });
    const result = await repo.append({
      runId: 'run-1',
      correlationId: 'corr-1',
      workItemId: 'wi-1',
      runType: 'ManualRefresh',
      refreshScope: 'UserWide',
      adobeActorKey: 'actor-1',
      userPrincipalNameNormalized: 'user@example.com',
      startedUtc: '2026-05-19T12:00:00.000Z',
      completedUtc: '2026-05-19T12:00:05.000Z',
      outcome: 'Success',
      resultStage: 'completed',
      providerCallsMade: 3,
      sharePointReadsMade: 2,
      sharePointWritesMade: 1,
      rowsInserted: 0,
      rowsUpdated: 1,
      rowsSoftDeactivated: 0,
    });
    expect(result.listItemId).toBe(1);
    expect(rows).toHaveLength(1);
    expect(rows[0].fields.RunId).toBe('run-1');
    expect(rows[0].fields.RunType).toBe('ManualRefresh');
    expect(rows[0].fields.Outcome).toBe('Success');
    expect(rows[0].fields.RefreshScope).toBe('UserWide');
    expect(calls[0].args[0]).toBe(MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE);
  });

  it('defaults numeric counters to 0 when absent', async () => {
    const { graph, rows } = makeFakeGraph();
    const repo = createGraphAdobeSignCacheSyncRunRepository({ graph });
    await repo.append({
      runId: 'run-2',
      runType: 'WebhookRefresh',
      startedUtc: '2026-05-19T12:00:00.000Z',
      outcome: 'Success',
    });
    expect(rows[0].fields.ProviderCallsMade).toBe(0);
    expect(rows[0].fields.SharePointReadsMade).toBe(0);
    expect(rows[0].fields.SharePointWritesMade).toBe(0);
    expect(rows[0].fields.RowsInserted).toBe(0);
    expect(rows[0].fields.RowsUpdated).toBe(0);
    expect(rows[0].fields.RowsSoftDeactivated).toBe(0);
  });

  it('rejects an empty runId', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignCacheSyncRunRepository({ graph });
    await expect(
      repo.append({
        runId: '',
        runType: 'ManualRefresh',
        startedUtc: '2026-05-19T12:00:00.000Z',
        outcome: 'Success',
      }),
    ).rejects.toThrow(/runId/);
  });

  it('rejects an empty startedUtc', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignCacheSyncRunRepository({ graph });
    await expect(
      repo.append({
        runId: 'r',
        runType: 'ManualRefresh',
        startedUtc: '',
        outcome: 'Success',
      }),
    ).rejects.toThrow(/startedUtc/);
  });

  it('rejects an unknown runType / outcome / refreshScope', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignCacheSyncRunRepository({ graph });
    await expect(
      repo.append({
        runId: 'r',
        // @ts-expect-error — intentional runtime guard test
        runType: 'BogusRunType',
        startedUtc: '2026-05-19T12:00:00.000Z',
        outcome: 'Success',
      }),
    ).rejects.toThrow(/runType/);
    await expect(
      repo.append({
        runId: 'r',
        runType: 'ManualRefresh',
        startedUtc: '2026-05-19T12:00:00.000Z',
        // @ts-expect-error — intentional runtime guard test
        outcome: 'BogusOutcome',
      }),
    ).rejects.toThrow(/outcome/);
    await expect(
      repo.append({
        runId: 'r',
        runType: 'ManualRefresh',
        // @ts-expect-error — intentional runtime guard test
        refreshScope: 'GalaxyWide',
        startedUtc: '2026-05-19T12:00:00.000Z',
        outcome: 'Success',
      }),
    ).rejects.toThrow(/refreshScope/);
  });
});
