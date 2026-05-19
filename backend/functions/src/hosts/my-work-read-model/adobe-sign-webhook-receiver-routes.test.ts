import { describe, expect, it, vi } from 'vitest';
import type { HttpRequest, InvocationContext } from '@azure/functions';

import type {
  AdobeSignCacheQueueEnqueuerComposition,
  IAdobeSignCacheQueueEnqueuer,
} from '../../services/adobe-sign-cache/queue-enqueuer.js';
import { createInMemoryAdobeSignCacheQueueEnqueuer } from '../../services/adobe-sign-cache/queue-enqueuer.js';
import type {
  AdobeSignWebhookEventDedupeRepositoryComposition,
} from '../../services/adobe-sign-cache/webhook-event-dedupe-repository.js';
import type {
  AdobeSignWebhookSubscriptionRow,
  IAdobeSignWebhookSubscriptionRegistryRepository,
} from '../../services/adobe-sign-cache/repositories/webhook-subscription-registry-repository.js';
import type { AdobeSignWebhookLocalProcessingState } from '../../services/adobe-sign-cache/cache-list-descriptors.js';
import {
  ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER,
  createAdobeSignWebhookReceiverGetHandler,
  createAdobeSignWebhookReceiverPostHandler,
  type AdobeSignWebhookReceiverRouteDeps,
} from './adobe-sign-webhook-receiver-routes.js';

const FIXED_NOW = new Date('2026-05-19T12:00:00.000Z');
const FIXED_UUID = '00000000-0000-4000-8000-000000000001';
const CLIENT_ID = 'adobe-client-id-fixture';
const RECEIVER_KEY = 'rcv-abcdef0123456789';
const SUBSCRIPTION_ACTOR_KEY = 'tenant-1::oid-avery';
const REQUEST_ID = 'req-fixture-1';

const RAW_BODY_AGREEMENT_SIGNED = JSON.stringify({
  event: 'AGREEMENT_ACTION_COMPLETED',
  eventId: 'evt-1',
  eventDate: '2026-05-19T12:00:00.000Z',
  agreement: { id: 'agr-1', status: 'OUT_FOR_SIGNATURE', name: 'Agreement 1' },
});

const RAW_BODY_AGREEMENT_NO_AGREEMENT_ID = JSON.stringify({
  event: 'AGREEMENT_STATUS_CHANGE',
  eventId: 'evt-2',
  // No `agreement.id`
});

const RAW_BODY_UNSUPPORTED = JSON.stringify({
  event: 'WIDGET_AVAILABLE',
  eventId: 'evt-w-1',
});

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

function makeRequest(opts: {
  method: 'GET' | 'POST';
  receiverKey?: string;
  clientIdHeader?: string;
  body?: string;
}): HttpRequest {
  const headers = new Map<string, string>();
  if (opts.clientIdHeader !== undefined) {
    headers.set(ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER, opts.clientIdHeader);
    headers.set(ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER.toLowerCase(), opts.clientIdHeader);
  }
  headers.set('x-request-id', REQUEST_ID);
  return {
    method: opts.method,
    url: `https://example.com/api/adobe-sign/webhooks/notifications/${opts.receiverKey ?? RECEIVER_KEY}`,
    params: { receiverKey: opts.receiverKey ?? RECEIVER_KEY },
    headers: {
      get: (name: string) => headers.get(name) ?? headers.get(name.toLowerCase()) ?? null,
    } as unknown as HttpRequest['headers'],
    text: async () => opts.body ?? '',
  } as unknown as HttpRequest;
}

function makeSubscriptionRow(
  override: Partial<AdobeSignWebhookSubscriptionRow> = {},
): AdobeSignWebhookSubscriptionRow {
  return {
    listItemId: 1,
    subscriptionKey: RECEIVER_KEY,
    adobeActorKey: SUBSCRIPTION_ACTOR_KEY,
    userPrincipalNameNormalized: 'avery@hbc.test',
    adobeWebhookId: 'adobe-wh-1',
    webhookScope: 'USER',
    resourceFamily: 'AGREEMENT',
    webhookUrl: 'https://example.com/webhook/rcv',
    remoteState: 'Active',
    localProcessingState: 'Active',
    isManagedByHbIntel: true,
    cacheSchemaVersion: 1,
    ...override,
  };
}

function makeRegistry(
  subscription: AdobeSignWebhookSubscriptionRow | null,
): IAdobeSignWebhookSubscriptionRegistryRepository {
  return {
    findByAdobeActorKey: vi.fn(async () => null),
    findBySubscriptionKey: vi.fn(async () => subscription),
    upsert: vi.fn(async () => ({ listItemId: 1 })),
    softDeactivate: vi.fn(async () => ({ deactivated: false })),
  };
}

interface FakeDedupeRepository {
  tryReserve: ReturnType<typeof vi.fn>;
  findActive: ReturnType<typeof vi.fn>;
  deleteExpired: ReturnType<typeof vi.fn>;
}

function makeDedupeComposition(
  outcome: 'reserved' | 'duplicate' | 'throw' | 'configuration-required',
): {
  composition: AdobeSignWebhookEventDedupeRepositoryComposition;
  repo?: FakeDedupeRepository;
} {
  if (outcome === 'configuration-required') {
    return {
      composition: {
        status: 'configuration-required',
        reason: 'table-name-not-configured',
      },
    };
  }
  const repo: FakeDedupeRepository = {
    tryReserve: vi.fn(async () => {
      if (outcome === 'throw') throw new Error('table unreachable');
      return outcome;
    }),
    findActive: vi.fn(async () => null),
    deleteExpired: vi.fn(async () => ({ deleted: 0 })),
  };
  return {
    composition: {
      status: 'ready',
      repository: repo as unknown as AdobeSignWebhookEventDedupeRepositoryComposition extends {
        repository: infer T;
      }
        ? T
        : never,
      tableName: 'AdobeSignWebhookEventDedupe',
      retentionDays: 14,
    },
    repo,
  };
}

function makeEnqueuerComposition(opts: {
  status: 'ready' | 'configuration-required';
  enqueuer?: IAdobeSignCacheQueueEnqueuer;
  throws?: boolean;
}): {
  composition: AdobeSignCacheQueueEnqueuerComposition;
  enqueuer: IAdobeSignCacheQueueEnqueuer & { items?: readonly unknown[] };
} {
  if (opts.status === 'configuration-required') {
    return {
      composition: { status: 'configuration-required', reason: 'queue-endpoint-not-configured' },
      enqueuer: createInMemoryAdobeSignCacheQueueEnqueuer(),
    };
  }
  const enqueuer =
    opts.enqueuer ??
    (opts.throws
      ? ({
          enqueue: vi.fn(async () => {
            throw new Error('storage unreachable');
          }),
          health: vi.fn(async () => ({ ready: false })),
        } as IAdobeSignCacheQueueEnqueuer)
      : createInMemoryAdobeSignCacheQueueEnqueuer({
          now: () => FIXED_NOW,
          randomUUID: () => FIXED_UUID,
        }));
  return {
    composition: {
      status: 'ready',
      enqueuer,
      queueName: 'adobe-sign-cache-work-items',
      queueEndpoint: 'https://stub.queue.core.windows.net/',
    },
    enqueuer: enqueuer as IAdobeSignCacheQueueEnqueuer & { items?: readonly unknown[] },
  };
}

interface LogEvent {
  readonly name: string;
  readonly properties: Record<string, unknown>;
}

function spyLogger(): {
  ctx: InvocationContext;
  events: LogEvent[];
} {
  const events: LogEvent[] = [];
  // The createLogger factory wraps `context.log`. We intercept by
  // replacing `context.log` with a fn that parses the JSON envelope it
  // would emit. The envelope format is `{ level, name, ...properties }`.
  const log = (envelope?: string): void => {
    if (typeof envelope !== 'string') return;
    try {
      const parsed = JSON.parse(envelope) as Record<string, unknown>;
      if (typeof parsed.name === 'string') {
        const { level: _level, _telemetryType: _t, name, ...properties } = parsed as Record<
          string,
          unknown
        > & { name: string };
        void _level;
        void _t;
        events.push({ name, properties });
      }
    } catch {
      /* ignore */
    }
  };
  const ctx = {
    invocationId: 'inv-1',
    log,
    error: () => undefined,
    warn: () => undefined,
    info: () => undefined,
    debug: () => undefined,
    trace: () => undefined,
  } as unknown as InvocationContext;
  return { ctx, events };
}

function makeDeps(
  override: Partial<{
    expectedClientId: string | undefined;
    subscription: AdobeSignWebhookSubscriptionRow | null;
    dedupeOutcome: 'reserved' | 'duplicate' | 'throw' | 'configuration-required';
    enqueuerStatus: 'ready' | 'configuration-required';
    enqueuerThrows: boolean;
  }> = {},
): {
  deps: AdobeSignWebhookReceiverRouteDeps;
  registry: IAdobeSignWebhookSubscriptionRegistryRepository;
  dedupe?: FakeDedupeRepository;
  enqueuer: IAdobeSignCacheQueueEnqueuer & { items?: readonly unknown[] };
} {
  const registry = makeRegistry(
    override.subscription === undefined ? makeSubscriptionRow() : override.subscription,
  );
  const dedupeResult = makeDedupeComposition(override.dedupeOutcome ?? 'reserved');
  const enqueuerResult = makeEnqueuerComposition({
    status: override.enqueuerStatus ?? 'ready',
    throws: override.enqueuerThrows ?? false,
  });
  const expectedClientIdResolved = Object.prototype.hasOwnProperty.call(override, 'expectedClientId')
    ? override.expectedClientId
    : CLIENT_ID;
  const deps: AdobeSignWebhookReceiverRouteDeps = {
    resolveExpectedClientId: () => expectedClientIdResolved,
    resolveSubscriptionRegistry: () => registry,
    resolveDedupeComposition: () => dedupeResult.composition,
    resolveEnqueuerComposition: () => enqueuerResult.composition,
    now: () => FIXED_NOW,
    randomUUID: () => FIXED_UUID,
  };
  return { deps, registry, dedupe: dedupeResult.repo, enqueuer: enqueuerResult.enqueuer };
}

// ─── GET verification ─────────────────────────────────────────────────────

describe('GET verification handler', () => {
  it('returns 200 + X-ADOBESIGN-CLIENTID echo on valid client-ID and well-formed receiverKey', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverGetHandler(deps);
    const response = await handler(
      makeRequest({ method: 'GET', clientIdHeader: CLIENT_ID }),
      makeContext(),
    );
    expect(response.status).toBe(200);
    expect((response.headers as Record<string, string>)[ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER]).toBe(
      CLIENT_ID,
    );
  });

  it('returns 401 (no echo) when client-ID header is missing', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverGetHandler(deps);
    const response = await handler(makeRequest({ method: 'GET' }), makeContext());
    expect(response.status).toBe(401);
    expect((response.headers as Record<string, string> | undefined)?.[ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER]).toBeUndefined();
  });

  it('returns 401 (no echo) when client-ID header mismatches', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverGetHandler(deps);
    const response = await handler(
      makeRequest({ method: 'GET', clientIdHeader: 'wrong-id' }),
      makeContext(),
    );
    expect(response.status).toBe(401);
  });

  it('returns 400 (no echo) for malformed receiverKey', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverGetHandler(deps);
    const response = await handler(
      makeRequest({ method: 'GET', clientIdHeader: CLIENT_ID, receiverKey: '!!' }),
      makeContext(),
    );
    expect(response.status).toBe(400);
  });

  it('returns 503 when ADOBE_SIGN_OAUTH_CLIENT_ID is unset', async () => {
    const { deps } = makeDeps({ expectedClientId: undefined });
    const handler = createAdobeSignWebhookReceiverGetHandler(deps);
    const response = await handler(
      makeRequest({ method: 'GET', clientIdHeader: CLIENT_ID }),
      makeContext(),
    );
    expect(response.status).toBe(503);
  });

  it('emits verification.received then verification.accepted on happy path', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverGetHandler(deps);
    const { ctx, events } = spyLogger();
    await handler(makeRequest({ method: 'GET', clientIdHeader: CLIENT_ID }), ctx);
    expect(events.some((e) => e.name === 'adobeSign.webhook.verification.received')).toBe(true);
    expect(events.some((e) => e.name === 'adobeSign.webhook.verification.accepted')).toBe(true);
  });

  it('emits verification.rejected on invalid client-ID', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverGetHandler(deps);
    const { ctx, events } = spyLogger();
    await handler(makeRequest({ method: 'GET', clientIdHeader: 'wrong' }), ctx);
    const rejection = events.find((e) => e.name === 'adobeSign.webhook.verification.rejected');
    expect(rejection?.properties.reason).toBe('client-id-mismatch');
  });
});

// ─── POST happy path ──────────────────────────────────────────────────────

describe('POST notification handler — happy path', () => {
  it('returns 202 + echo and enqueues a WebhookAgreementRefresh with refreshScope=AgreementTargeted', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const response = await handler(
      makeRequest({
        method: 'POST',
        clientIdHeader: CLIENT_ID,
        body: RAW_BODY_AGREEMENT_SIGNED,
      }),
      makeContext(),
    );
    expect(response.status).toBe(202);
    expect((response.headers as Record<string, string>)[ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER]).toBe(
      CLIENT_ID,
    );
    const items = (enqueuer as { items?: readonly Record<string, unknown>[] }).items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      workItemType: 'WebhookAgreementRefresh',
      refreshScope: 'AgreementTargeted',
      requestedBy: 'webhook',
      subscriptionKey: RECEIVER_KEY,
      adobeActorKey: SUBSCRIPTION_ACTOR_KEY,
      providerEventId: 'evt-1',
      providerEventType: 'AGREEMENT_ACTION_COMPLETED',
      agreementId: 'agr-1',
    });
  });

  it('emits notification.received → notification.accepted → workItem.enqueued in order', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    await handler(
      makeRequest({
        method: 'POST',
        clientIdHeader: CLIENT_ID,
        body: RAW_BODY_AGREEMENT_SIGNED,
      }),
      ctx,
    );
    const names = events.map((e) => e.name);
    expect(names).toContain('adobeSign.webhook.notification.received');
    expect(names).toContain('adobeSign.webhook.notification.accepted');
    expect(names).toContain('adobeSign.webhook.workItem.enqueued');
    expect(names.indexOf('adobeSign.webhook.notification.received')).toBeLessThan(
      names.indexOf('adobeSign.webhook.notification.accepted'),
    );
    expect(names.indexOf('adobeSign.webhook.notification.accepted')).toBeLessThan(
      names.indexOf('adobeSign.webhook.workItem.enqueued'),
    );
  });

  it('reserves a dedupe row with subscriptionKey partition + providerEventId rowKey on valid event', async () => {
    const { deps, dedupe } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    await handler(
      makeRequest({
        method: 'POST',
        clientIdHeader: CLIENT_ID,
        body: RAW_BODY_AGREEMENT_SIGNED,
      }),
      makeContext(),
    );
    expect(dedupe?.tryReserve).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionKey: RECEIVER_KEY,
        dedupeKey: 'evt-1',
        providerEventType: 'AGREEMENT_ACTION_COMPLETED',
        agreementId: 'agr-1',
        ttlDays: 14,
      }),
    );
  });
});

// ─── POST failure / acknowledge-without-enqueue ───────────────────────────

describe('POST notification handler — failure mapping', () => {
  it('returns 401 (no echo) when X-ADOBESIGN-CLIENTID is missing', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const response = await handler(
      makeRequest({ method: 'POST', body: RAW_BODY_AGREEMENT_SIGNED }),
      makeContext(),
    );
    expect(response.status).toBe(401);
    expect((response.headers as Record<string, string> | undefined)?.[ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER]).toBeUndefined();
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
  });

  it('returns 404 (no echo) when receiverKey not in registry', async () => {
    const { deps, enqueuer } = makeDeps({ subscription: null });
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: RAW_BODY_AGREEMENT_SIGNED }),
      ctx,
    );
    expect(response.status).toBe(404);
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
    const rejection = events.find((e) => e.name === 'adobeSign.webhook.notification.rejected');
    expect(rejection?.properties.reason).toBe('receiver-key-not-found');
  });

  it.each<['IgnoredAfterDisconnect' | 'RemoteDeactivationFailed' | 'Suspended' | 'Orphaned']>([
    ['IgnoredAfterDisconnect'],
    ['RemoteDeactivationFailed'],
    ['Suspended'],
    ['Orphaned'],
  ])('returns 200 + echo and emits .ignored for localProcessingState=%s', async (state) => {
    const { deps, enqueuer } = makeDeps({
      subscription: makeSubscriptionRow({
        localProcessingState: state as AdobeSignWebhookLocalProcessingState,
      }),
    });
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: RAW_BODY_AGREEMENT_SIGNED }),
      ctx,
    );
    expect(response.status).toBe(200);
    expect((response.headers as Record<string, string>)[ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER]).toBe(
      CLIENT_ID,
    );
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
    expect(events.some((e) => e.name === 'adobeSign.webhook.notification.ignored')).toBe(true);
  });

  it('returns 200 + echo with no enqueue when dedupe outcome is duplicate', async () => {
    const { deps, enqueuer } = makeDeps({ dedupeOutcome: 'duplicate' });
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: RAW_BODY_AGREEMENT_SIGNED }),
      ctx,
    );
    expect(response.status).toBe(200);
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
    expect(events.some((e) => e.name === 'adobeSign.webhook.notification.duplicate-suppressed')).toBe(
      true,
    );
  });

  it('returns 200 + echo with .rejected reason=parse-error on malformed JSON', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: '{not json' }),
      ctx,
    );
    expect(response.status).toBe(200);
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
    const rejection = events.find((e) => e.name === 'adobeSign.webhook.notification.rejected');
    expect(rejection?.properties.reason).toBe('parse-error');
  });

  it('returns 200 + echo with .rejected reason=unsupported-resource on non-AGREEMENT event', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: RAW_BODY_UNSUPPORTED }),
      ctx,
    );
    expect(response.status).toBe(200);
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
    const rejection = events.find((e) => e.name === 'adobeSign.webhook.notification.rejected');
    expect(rejection?.properties.reason).toBe('unsupported-resource');
  });

  it('enqueues with refreshScope=UserWide when agreementId is missing', async () => {
    const { deps, enqueuer } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const response = await handler(
      makeRequest({
        method: 'POST',
        clientIdHeader: CLIENT_ID,
        body: RAW_BODY_AGREEMENT_NO_AGREEMENT_ID,
      }),
      makeContext(),
    );
    expect(response.status).toBe(202);
    const items = (enqueuer as { items?: readonly Record<string, unknown>[] }).items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      workItemType: 'WebhookAgreementRefresh',
      refreshScope: 'UserWide',
      requestedBy: 'webhook',
    });
    expect(items[0]).not.toHaveProperty('agreementId');
  });

  it('returns 200 + echo when enqueuer composition is configuration-required (no enqueue)', async () => {
    const { deps, enqueuer } = makeDeps({ enqueuerStatus: 'configuration-required' });
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: RAW_BODY_AGREEMENT_SIGNED }),
      ctx,
    );
    expect(response.status).toBe(200);
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
    const failure = events.find((e) => e.name === 'adobeSign.webhook.workItem.enqueueFailed');
    expect(failure?.properties.reason).toBe('enqueuer-not-configured');
  });

  it('returns 200 + echo when enqueuer throws at enqueue time', async () => {
    const { deps } = makeDeps({ enqueuerThrows: true });
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: RAW_BODY_AGREEMENT_SIGNED }),
      ctx,
    );
    expect(response.status).toBe(200);
    const failure = events.find((e) => e.name === 'adobeSign.webhook.workItem.enqueueFailed');
    expect(failure?.properties.reason).toBe('enqueue-throw');
  });

  it('returns 200 + echo when dedupe composition is configuration-required (no enqueue)', async () => {
    const { deps, enqueuer } = makeDeps({ dedupeOutcome: 'configuration-required' });
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    const response = await handler(
      makeRequest({ method: 'POST', clientIdHeader: CLIENT_ID, body: RAW_BODY_AGREEMENT_SIGNED }),
      ctx,
    );
    expect(response.status).toBe(200);
    expect((enqueuer as { items?: readonly unknown[] }).items).toHaveLength(0);
    const failure = events.find((e) => e.name === 'adobeSign.webhook.workItem.enqueueFailed');
    expect(failure?.properties.reason).toBe('dedupe-not-configured');
  });
});

// ─── Sanitization assertions ──────────────────────────────────────────────

describe('POST notification handler — sanitization', () => {
  it('NEVER includes the raw body, client-ID value, agreementId value, or providerEventId value in any emitted event', async () => {
    const { deps } = makeDeps();
    const handler = createAdobeSignWebhookReceiverPostHandler(deps);
    const { ctx, events } = spyLogger();
    await handler(
      makeRequest({
        method: 'POST',
        clientIdHeader: CLIENT_ID,
        body: RAW_BODY_AGREEMENT_SIGNED,
      }),
      ctx,
    );
    // The raw body, client-ID, agreementId, and providerEventId values
    // are all distinctive strings; their presence anywhere in the
    // serialized telemetry payloads would be a sanitization breach.
    const serializedAll = JSON.stringify(events);
    expect(serializedAll).not.toContain(CLIENT_ID);
    expect(serializedAll).not.toContain(RAW_BODY_AGREEMENT_SIGNED);
    expect(serializedAll).not.toContain('agr-1');
    expect(serializedAll).not.toContain('evt-1');
  });
});
