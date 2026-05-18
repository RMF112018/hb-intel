import { describe, expect, it } from 'vitest';
import type { HttpRequest, HttpResponseInit } from '@azure/functions';

import {
  STATUS_DEFAULT_LIMIT,
  STATUS_MAX_LIMIT,
  buildRebuildRequest,
  handleProjectionRebuild,
  handleProjectionSeed,
  handleProjectionStatus,
  toResponseShape,
  type IProjectionAdminRebuildHandlerDeps,
} from '../my-projects-projection/admin/projection-admin-rebuild-handler.js';
import type { ISeedRunResult } from '../my-projects-projection/engine/projection-seed-service.js';

function makeRequest(body: unknown, url = 'http://test/admin'): HttpRequest {
  return {
    url,
    async json() {
      return body;
    },
  } as unknown as HttpRequest;
}

function makeStatusRequest(query: Record<string, string>): HttpRequest {
  const params = new URLSearchParams(query).toString();
  return {
    url: `http://test/admin/my-projects-projection/status?${params}`,
    async json() {
      return {};
    },
  } as unknown as HttpRequest;
}

interface IFakeSeedServiceCall {
  request: unknown;
  runId: string;
  projectionBatchId: string;
  leaseOwner: string;
  rebuildLeaseTtlMinutes: number;
}

function makeDeps(args: {
  result: ISeedRunResult;
  recordCall: (call: IFakeSeedServiceCall) => void;
}): IProjectionAdminRebuildHandlerDeps {
  return {
    seedService: {
      async runSeedOrRebuild(call) {
        args.recordCall(call);
        return args.result;
      },
    },
    runRepository: {
      async listRecent() {
        return [];
      },
    } as unknown as IProjectionAdminRebuildHandlerDeps['runRepository'],
    rebuildLeaseTtlMinutes: 30,
    runIdProvider: () => 'run-test',
    projectionBatchIdProvider: () => 'batch-test',
    leaseOwnerProvider: () => 'tester',
  };
}

const SUCCESS_RESULT: ISeedRunResult = {
  runId: 'run-test',
  runType: 'manual-rebuild',
  status: 'succeeded',
  startedAtUtc: '2026-05-18T13:00:00.000Z',
  completedAtUtc: '2026-05-18T13:00:00.500Z',
  dryRun: false,
  counts: {
    expectedRows: 5,
    helperRowsInserted: 3,
    helperRowsUpdated: 1,
    helperRowsReactivated: 0,
    helperRowsDeactivated: 1,
    helperRowsUnchanged: 0,
  },
};

describe('buildRebuildRequest', () => {
  it('returns an HttpResponseInit for source-rebuild without sourceListKind', () => {
    const result = buildRebuildRequest({ rebuildKind: 'source-rebuild' }, 'full-rebuild');
    expect((result as HttpResponseInit).status).toBe(400);
  });

  it('returns a typed request for a valid source-rebuild body', () => {
    const result = buildRebuildRequest(
      { rebuildKind: 'source-rebuild', sourceListKind: 'Projects', dryRun: true },
      'full-rebuild',
    );
    expect(result).toEqual({
      rebuildKind: 'source-rebuild',
      sourceListKind: 'Projects',
      dryRun: true,
    });
  });

  it('rejects an unknown rebuildKind', () => {
    const result = buildRebuildRequest({ rebuildKind: 'invalid' as never }, 'full-rebuild');
    expect((result as HttpResponseInit).status).toBe(400);
  });
});

describe('handleProjectionSeed', () => {
  it('dispatches a seed request to the seed service and returns 200 with run shape', async () => {
    const calls: IFakeSeedServiceCall[] = [];
    const deps = makeDeps({
      result: { ...SUCCESS_RESULT, runType: 'seed' },
      recordCall: (c) => calls.push(c),
    });
    const response = await handleProjectionSeed(makeRequest({ notes: 'sprint-13' }), deps);
    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].request).toMatchObject({ rebuildKind: 'seed', notes: 'sprint-13' });
    const body = JSON.parse(response.body as string);
    expect(body.runType).toBe('seed');
    expect(body.counts.helperRowsInserted).toBe(3);
  });

  it('returns 500 when the seed service returns status=failed', async () => {
    const deps = makeDeps({
      result: {
        ...SUCCESS_RESULT,
        status: 'failed',
        failureCode: 'rebuild-failed',
        sanitizedReason: 'simulated',
      },
      recordCall: () => undefined,
    });
    const response = await handleProjectionSeed(makeRequest({}), deps);
    expect(response.status).toBe(500);
    const body = JSON.parse(response.body as string);
    expect(body.failureCode).toBe('rebuild-failed');
  });
});

describe('handleProjectionRebuild', () => {
  it("rejects rebuildKind='seed' on /rebuild with 400", async () => {
    const deps = makeDeps({ result: SUCCESS_RESULT, recordCall: () => undefined });
    const response = await handleProjectionRebuild(makeRequest({ rebuildKind: 'seed' }), deps);
    expect(response.status).toBe(400);
  });

  it('routes a full-rebuild body to the seed service with default rebuildKind=full-rebuild', async () => {
    const calls: IFakeSeedServiceCall[] = [];
    const deps = makeDeps({ result: SUCCESS_RESULT, recordCall: (c) => calls.push(c) });
    const response = await handleProjectionRebuild(makeRequest({ dryRun: true }), deps);
    expect(response.status).toBe(200);
    expect(calls[0].request).toMatchObject({ rebuildKind: 'full-rebuild', dryRun: true });
  });

  it('routes a valid source-rebuild body to the seed service', async () => {
    const calls: IFakeSeedServiceCall[] = [];
    const deps = makeDeps({ result: SUCCESS_RESULT, recordCall: (c) => calls.push(c) });
    const response = await handleProjectionRebuild(
      makeRequest({ rebuildKind: 'source-rebuild', sourceListKind: 'LegacyRegistry' }),
      deps,
    );
    expect(response.status).toBe(200);
    expect(calls[0].request).toMatchObject({
      rebuildKind: 'source-rebuild',
      sourceListKind: 'LegacyRegistry',
    });
  });
});

describe('handleProjectionStatus', () => {
  it('rejects an invalid runType query parameter', async () => {
    const response = await handleProjectionStatus(makeStatusRequest({ runType: 'bogus' }), {
      runRepository: {
        async listRecent() {
          return [];
        },
      } as unknown as IProjectionAdminRebuildHandlerDeps['runRepository'],
    });
    expect(response.status).toBe(400);
  });

  it('rejects an invalid sourceListKind query parameter', async () => {
    const response = await handleProjectionStatus(
      makeStatusRequest({ sourceListKind: 'Mystery' }),
      {
        runRepository: {
          async listRecent() {
            return [];
          },
        } as unknown as IProjectionAdminRebuildHandlerDeps['runRepository'],
      },
    );
    expect(response.status).toBe(400);
  });

  it('clamps limit to STATUS_MAX_LIMIT', async () => {
    let captured: { limit: number } | null = null;
    const response = await handleProjectionStatus(
      makeStatusRequest({ limit: String(STATUS_MAX_LIMIT * 10) }),
      {
        runRepository: {
          async listRecent(args) {
            captured = args;
            return [];
          },
        } as unknown as IProjectionAdminRebuildHandlerDeps['runRepository'],
      },
    );
    expect(response.status).toBe(200);
    expect(captured?.limit).toBe(STATUS_MAX_LIMIT);
  });

  it('uses STATUS_DEFAULT_LIMIT when limit is omitted', async () => {
    let captured: { limit: number } | null = null;
    await handleProjectionStatus(makeStatusRequest({}), {
      runRepository: {
        async listRecent(args) {
          captured = args;
          return [];
        },
      } as unknown as IProjectionAdminRebuildHandlerDeps['runRepository'],
    });
    expect(captured?.limit).toBe(STATUS_DEFAULT_LIMIT);
  });
});

describe('toResponseShape', () => {
  it('omits optional fields when absent', () => {
    const shape = toResponseShape({
      runId: 'r',
      runType: 'seed',
      status: 'succeeded',
      startedAtUtc: 't',
      dryRun: false,
      counts: {
        expectedRows: 0,
        helperRowsInserted: 0,
        helperRowsUpdated: 0,
        helperRowsReactivated: 0,
        helperRowsDeactivated: 0,
        helperRowsUnchanged: 0,
      },
    });
    expect(shape).not.toHaveProperty('completedAtUtc');
    expect(shape).not.toHaveProperty('sourceListKind');
    expect(shape).not.toHaveProperty('failureCode');
    expect(shape).not.toHaveProperty('sanitizedReason');
  });
});
