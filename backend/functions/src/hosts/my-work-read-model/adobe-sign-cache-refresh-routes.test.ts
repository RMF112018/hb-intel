import { describe, expect, it, vi } from 'vitest';
import type { HttpRequest, InvocationContext } from '@azure/functions';
import type { AuthContext } from '../../middleware/auth.js';
import type { IAdobeSignGrantRecord } from './read-models/adobe-sign/adobe-sign-grant-record.js';
import type {
  AdobeSignCacheQueueEnqueuerComposition,
  IAdobeSignCacheQueueEnqueuer,
} from '../../services/adobe-sign-cache/queue-enqueuer.js';
import { createInMemoryAdobeSignCacheQueueEnqueuer } from '../../services/adobe-sign-cache/queue-enqueuer.js';
import {
  createAdobeSignCacheRefreshHandler,
  type AdobeSignCacheRefreshRouteDeps,
} from './adobe-sign-cache-refresh-routes.js';

const FIXED_NOW = new Date('2026-05-19T12:00:00.000Z');
const FIXED_UUID = '00000000-0000-4000-8000-000000000001';
const TENANT_ID = 'tenant-1';
const ACTOR_KEY = `${TENANT_ID}::oid-avery`;
const REQUEST_ID = 'req-fixture-1';

interface FakeGrantStore {
  store: {
    findGrant: ReturnType<typeof vi.fn>;
    upsertGrant: ReturnType<typeof vi.fn>;
    markRevoked: ReturnType<typeof vi.fn>;
  };
}

function activeGrant(): IAdobeSignGrantRecord {
  return {
    actorTenantId: TENANT_ID,
    actorOid: 'oid-avery',
    actorKey: ACTOR_KEY,
    adobeApiAccessPoint: 'https://api.example.com/',
    adobeWebAccessPoint: 'https://web.example.com/',
    encryptedRefreshTokenRef: {
      storeKind: 'table',
      ref: 'opaque',
    } as unknown as IAdobeSignGrantRecord['encryptedRefreshTokenRef'],
    grantedScopes: ['agreement_read'],
    grantedAtUtc: '2026-05-18T00:00:00.000Z',
    state: 'active',
  };
}

function makeGrantStore(grant: IAdobeSignGrantRecord | null): FakeGrantStore {
  return {
    store: {
      findGrant: vi.fn(async () => grant),
      upsertGrant: vi.fn(),
      markRevoked: vi.fn(),
    },
  };
}

function makeContext(): InvocationContext {
  return {
    invocationId: 'inv-1',
    log: () => undefined,
    error: () => undefined,
    warn: () => undefined,
    info: () => undefined,
    debug: () => undefined,
    trace: () => undefined,
  } as unknown as InvocationContext;
}

function makeRequest(): HttpRequest {
  return {
    headers: { get: () => REQUEST_ID } as unknown as HttpRequest['headers'],
    method: 'POST',
    url: 'https://example.com/api/my-work/me/adobe-sign/cache/refresh',
    text: async () => '',
  } as unknown as HttpRequest;
}

function makeAuth(
  claims: Record<string, unknown> = {
    oid: 'oid-avery',
    upn: 'avery@hbc.test',
    displayName: 'Avery Operator',
    roles: [],
  },
): AuthContext {
  return { claims } as unknown as AuthContext;
}

function makeDeps(
  override: Partial<AdobeSignCacheRefreshRouteDeps> & {
    enqueuer?: IAdobeSignCacheQueueEnqueuer;
    enqueuerStatus?: 'ready' | 'configuration-required';
    enqueuerReason?: 'queue-endpoint-not-configured' | 'queue-name-not-configured';
    grantStore?: FakeGrantStore;
  } = {},
): {
  deps: AdobeSignCacheRefreshRouteDeps;
  enqueuer: IAdobeSignCacheQueueEnqueuer & { items?: readonly unknown[] };
} {
  const enqueuer =
    override.enqueuer ??
    createInMemoryAdobeSignCacheQueueEnqueuer({
      now: () => FIXED_NOW,
      randomUUID: () => FIXED_UUID,
    });
  const composition: AdobeSignCacheQueueEnqueuerComposition =
    override.enqueuerStatus === 'configuration-required'
      ? {
          status: 'configuration-required',
          reason: override.enqueuerReason ?? 'queue-endpoint-not-configured',
        }
      : {
          status: 'ready',
          enqueuer,
          queueName: 'adobe-sign-cache-work-items',
          queueEndpoint: 'https://stub.queue.core.windows.net/',
        };
  const grantStore = override.grantStore ?? makeGrantStore(activeGrant());
  const deps: AdobeSignCacheRefreshRouteDeps = {
    resolveTenantId: override.resolveTenantId ?? (() => TENANT_ID),
    resolveGrantStore:
      override.resolveGrantStore ??
      (() => ({ readiness: 'ready', store: grantStore.store } as ReturnType<
        AdobeSignCacheRefreshRouteDeps['resolveGrantStore']
      >)),
    resolveEnqueuer: override.resolveEnqueuer ?? (() => composition),
    now: override.now ?? (() => FIXED_NOW),
    randomUUID: override.randomUUID ?? (() => FIXED_UUID),
  };
  return { deps, enqueuer };
}

describe('createAdobeSignCacheRefreshHandler — happy path', () => {
  it('returns 202 with the locked accepted-response envelope', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignCacheRefreshHandler(deps);
    const response = await handler(makeRequest(), makeContext(), makeAuth());
    expect(response.status).toBe(202);
    expect(response.jsonBody).toEqual({
      data: {
        status: 'accepted',
        workItemType: 'ManualUserRefresh',
        correlationId: REQUEST_ID,
      },
    });
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(1);
  });

  it('enqueues a ManualUserRefresh work item with refreshScope=UserWide and requestedBy=user', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignCacheRefreshHandler(deps);
    await handler(makeRequest(), makeContext(), makeAuth());
    const items = (enqueuer as { items?: readonly { [k: string]: unknown }[] }).items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      workItemType: 'ManualUserRefresh',
      refreshScope: 'UserWide',
      requestedBy: 'user',
      adobeActorKey: ACTOR_KEY,
      correlationId: REQUEST_ID,
    });
  });
});

describe('createAdobeSignCacheRefreshHandler — failure mapping', () => {
  it('returns status=principal-unresolved when the actor cannot be normalized (missing oid)', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignCacheRefreshHandler(deps);
    const response = await handler(makeRequest(), makeContext(), makeAuth({ /* no oid */ }));
    expect(response.status).toBe(200);
    expect(response.jsonBody).toMatchObject({
      data: { status: 'principal-unresolved' },
    });
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
  });

  it('returns status=configuration-required when the grant store is not ready', async () => {
    const { deps, enqueuer } = makeDeps({
      resolveGrantStore: () =>
        ({
          readiness: 'configuration-required',
          reason: 'token-store-mode-pending',
        } as ReturnType<AdobeSignCacheRefreshRouteDeps['resolveGrantStore']>),
    });
    const handler = createAdobeSignCacheRefreshHandler(deps);
    const response = await handler(makeRequest(), makeContext(), makeAuth());
    expect(response.status).toBe(200);
    expect(response.jsonBody).toMatchObject({
      data: { status: 'configuration-required' },
    });
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
  });

  it('returns status=authorization-required when the actor has no active grant', async () => {
    const { deps, enqueuer } = makeDeps({ grantStore: makeGrantStore(null) });
    const handler = createAdobeSignCacheRefreshHandler(deps);
    const response = await handler(makeRequest(), makeContext(), makeAuth());
    expect(response.status).toBe(200);
    expect(response.jsonBody).toMatchObject({
      data: { status: 'authorization-required' },
    });
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
  });

  it('returns status=authorization-required when the grant is revoked', async () => {
    const grant = { ...activeGrant(), state: 'revoked' as const };
    const { deps } = makeDeps({ grantStore: makeGrantStore(grant) });
    const handler = createAdobeSignCacheRefreshHandler(deps);
    const response = await handler(makeRequest(), makeContext(), makeAuth());
    expect(response.status).toBe(200);
    expect(response.jsonBody).toMatchObject({
      data: { status: 'authorization-required' },
    });
  });

  it('returns status=configuration-required when the enqueuer is not configured', async () => {
    const { deps, enqueuer } = makeDeps({
      enqueuerStatus: 'configuration-required',
      enqueuerReason: 'queue-name-not-configured',
    });
    const handler = createAdobeSignCacheRefreshHandler(deps);
    const response = await handler(makeRequest(), makeContext(), makeAuth());
    expect(response.status).toBe(200);
    expect(response.jsonBody).toMatchObject({
      data: { status: 'configuration-required', reason: 'queue-name-not-configured' },
    });
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
  });

  it('returns 503 with status=source-unavailable when the enqueuer throws', async () => {
    const failingEnqueuer: IAdobeSignCacheQueueEnqueuer = {
      enqueue: vi.fn(async () => {
        throw new Error('storage unreachable');
      }),
      health: vi.fn(async () => ({ ready: false, reason: 'storage unreachable' })),
    };
    const { deps } = makeDeps({ enqueuer: failingEnqueuer });
    const handler = createAdobeSignCacheRefreshHandler(deps);
    const response = await handler(makeRequest(), makeContext(), makeAuth());
    expect(response.status).toBe(503);
    expect(response.jsonBody).toMatchObject({
      data: { status: 'source-unavailable' },
    });
  });
});
