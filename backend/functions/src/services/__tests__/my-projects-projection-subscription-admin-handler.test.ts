import type { HttpRequest } from '@azure/functions';
import { describe, expect, it } from 'vitest';
import {
  handleProjectionSubscriptionAdmin,
  type IProjectionSubscriptionAdminDeps,
} from '../my-projects-projection/subscriptions/projection-subscription-admin-handler.js';
import type {
  IEnsureAllSubscriptionsOutcome,
  IEnsureSubscriptionOutcome,
  IForceResetOutcome,
  IProjectionSubscriptionStatusSnapshot,
  ProjectionSubscriptionManager,
} from '../my-projects-projection/subscriptions/projection-subscription-manager.js';

function makeRequest(bodyJson: unknown): HttpRequest {
  return {
    async json() {
      if (bodyJson === '__INVALID_JSON__') throw new Error('parse failed');
      return bodyJson;
    },
  } as unknown as HttpRequest;
}

function makeManagerStub(
  opts: {
    ensureAll?: IEnsureAllSubscriptionsOutcome;
    ensureOne?: IEnsureSubscriptionOutcome;
    forceReset?: IForceResetOutcome;
    status?: IProjectionSubscriptionStatusSnapshot;
  } = {},
): {
  manager: ProjectionSubscriptionManager;
  calls: { ensureAll: number; ensureOne: number; forceReset: number; getStatus: number };
} {
  const calls = { ensureAll: 0, ensureOne: 0, forceReset: 0, getStatus: 0 };
  const stub: unknown = {
    async ensureAllSubscriptions() {
      calls.ensureAll += 1;
      return (
        opts.ensureAll ?? {
          outcomes: [
            {
              action: 'created',
              sourceListKind: 'Projects',
              subscriptionId: 'sub-1',
              expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
            },
            {
              action: 'healthy',
              sourceListKind: 'LegacyRegistry',
              subscriptionId: 'sub-2',
              expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
              remainingDays: 27,
            },
          ],
          hasFailures: false,
        }
      );
    },
    async ensureSubscription(_kind: unknown) {
      calls.ensureOne += 1;
      return (
        opts.ensureOne ?? {
          action: 'healthy',
          sourceListKind: 'Projects',
          subscriptionId: 'sub-1',
          expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
          remainingDays: 27,
        }
      );
    },
    async forceResetSubscription(_kind: unknown) {
      calls.forceReset += 1;
      return (
        opts.forceReset ?? {
          action: 'reset-created',
          sourceListKind: 'Projects',
          subscriptionId: 'sub-1',
          expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
        }
      );
    },
    async getStatus() {
      calls.getStatus += 1;
      return opts.status ?? { entities: [], remainingDaysByKind: {} };
    },
  };
  return { manager: stub as ProjectionSubscriptionManager, calls };
}

function makeDeps(stubOpts: Parameters<typeof makeManagerStub>[0] = {}): {
  deps: IProjectionSubscriptionAdminDeps;
  calls: { ensureAll: number; ensureOne: number; forceReset: number; getStatus: number };
} {
  const { manager, calls } = makeManagerStub(stubOpts);
  return {
    deps: { manager, correlationId: 'corr-test' },
    calls,
  };
}

describe('handleProjectionSubscriptionAdmin — routing', () => {
  it('routes reconcile to ensureAllSubscriptions', async () => {
    const { deps, calls } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'reconcile' }),
      deps,
    );
    expect(response.status).toBe(200);
    expect(calls.ensureAll).toBe(1);
  });

  it('returns 207 when reconcile reports failures', async () => {
    const { deps } = makeDeps({
      ensureAll: {
        outcomes: [
          {
            action: 'create-failed',
            sourceListKind: 'Projects',
            failureCode: 'graph-403-forbidden',
          },
        ],
        hasFailures: true,
      },
    });
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'reconcile' }),
      deps,
    );
    expect(response.status).toBe(207);
  });

  it('routes reconcile-source to ensureSubscription for the named kind', async () => {
    const { deps, calls } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'reconcile-source', sourceListKind: 'LegacyRegistry' }),
      deps,
    );
    expect(response.status).toBe(200);
    expect(calls.ensureOne).toBe(1);
  });

  it('returns 207 when reconcile-source is a failure action', async () => {
    const { deps } = makeDeps({
      ensureOne: {
        action: 'create-failed',
        sourceListKind: 'Projects',
        failureCode: 'graph-403-forbidden',
      },
    });
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'reconcile-source', sourceListKind: 'Projects' }),
      deps,
    );
    expect(response.status).toBe(207);
  });

  it('routes force-reset to forceResetSubscription', async () => {
    const { deps, calls } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'force-reset', sourceListKind: 'Projects' }),
      deps,
    );
    expect(response.status).toBe(200);
    expect(calls.forceReset).toBe(1);
  });

  it('routes get-status to getStatus', async () => {
    const { deps, calls } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'get-status' }),
      deps,
    );
    expect(response.status).toBe(200);
    expect(calls.getStatus).toBe(1);
  });
});

describe('handleProjectionSubscriptionAdmin — validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const { deps } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(makeRequest('__INVALID_JSON__'), deps);
    expect(response.status).toBe(400);
  });

  it('returns 400 on unknown command', async () => {
    const { deps } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'nope' }),
      deps,
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when reconcile-source is missing sourceListKind', async () => {
    const { deps } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'reconcile-source' }),
      deps,
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when force-reset has an invalid sourceListKind value', async () => {
    const { deps } = makeDeps();
    const response = await handleProjectionSubscriptionAdmin(
      makeRequest({ command: 'force-reset', sourceListKind: 'nope' }),
      deps,
    );
    expect(response.status).toBe(400);
  });
});
