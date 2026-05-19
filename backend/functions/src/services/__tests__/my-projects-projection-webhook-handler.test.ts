import type { HttpRequest } from '@azure/functions';
import { describe, expect, it } from 'vitest';
import {
  handleProjectionGraphWebhook,
  type IProjectionSubscriptionStateLister,
  type IProjectionWebhookHandlerDeps,
} from '../my-projects-projection/webhook/projection-webhook-handler.js';
import type { IProjectionSubscriptionEntity } from '../my-projects-projection/projection-state-entities.js';
import type { ILogger } from '../../utils/logger.js';

const CLIENT_STATE_SECRET = 'shared-secret-do-not-log';

const SUBSCRIPTIONS: IProjectionSubscriptionEntity[] = [
  {
    partitionKey: 'MyProjectsProjection',
    rowKey: 'Subscription:Projects',
    SourceListKind: 'Projects',
    SourceSiteId: 'site',
    SourceListId: 'list-projects',
    SubscriptionId: 'sub-projects',
    Status: 'healthy',
  },
  {
    partitionKey: 'MyProjectsProjection',
    rowKey: 'Subscription:LegacyRegistry',
    SourceListKind: 'LegacyRegistry',
    SourceSiteId: 'site',
    SourceListId: 'list-legacy',
    SubscriptionId: 'sub-legacy',
    Status: 'healthy',
  },
];

function makeRequest(opts: { query?: Record<string, string>; bodyJson?: unknown; bodyText?: string }): HttpRequest {
  const query = new Map<string, string>(Object.entries(opts.query ?? {}));
  return {
    query: { get: (key: string) => query.get(key) ?? null },
    async json() {
      if (opts.bodyText !== undefined) return JSON.parse(opts.bodyText);
      if (opts.bodyJson !== undefined) return opts.bodyJson;
      throw new Error('No body configured');
    },
  } as unknown as HttpRequest;
}

function makeRepo(state: readonly IProjectionSubscriptionEntity[]): IProjectionSubscriptionStateLister {
  return { list: async () => [...state] };
}

function makeDeps(overrides: Partial<IProjectionWebhookHandlerDeps> = {}) {
  const events: Array<{ name: string; properties: Record<string, unknown> }> = [];
  const upserts: Array<Record<string, unknown>> = [];
  const noop = () => {};
  const logger: ILogger = {
    info: noop,
    warn: noop,
    error: noop,
    trackEvent: (name, properties) => events.push({ name, properties }),
    trackMetric: noop,
  };
  const NOW = new Date('2026-05-17T14:32:47.512Z');
  let batchCounter = 0;
  const base: IProjectionWebhookHandlerDeps = {
    subscriptionStateRepository: makeRepo(SUBSCRIPTIONS),
    pendingWorkRepository: {
      upsertDebounced: async (args) => {
        upserts.push(args as unknown as Record<string, unknown>);
      },
    },
    clientStateSecret: CLIENT_STATE_SECRET,
    debounceWindowSeconds: 60,
    now: () => NOW,
    correlationIdProvider: () => 'corr-fixed',
    logger,
    notificationBatchIdProvider: () => `batch-${++batchCounter}`,
  };
  return { deps: { ...base, ...overrides }, events, upserts };
}

describe('handleProjectionGraphWebhook', () => {
  it('returns 200 text/plain for validation token', async () => {
    const { deps } = makeDeps();
    const request = makeRequest({ query: { validationToken: 'foo%20bar' } });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(200);
    expect(response.body).toBe('foo bar');
  });

  it('returns 400 for invalid payload shape', async () => {
    const { deps } = makeDeps();
    const request = makeRequest({ bodyJson: { not: 'value' } });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(400);
  });

  it('upserts one pending work row for one known source notification', async () => {
    const { deps, upserts } = makeDeps();
    const request = makeRequest({
      bodyJson: {
        value: [
          {
            subscriptionId: 'sub-projects',
            clientState: CLIENT_STATE_SECRET,
            resource: '/sites/site/lists/list-projects',
            changeType: 'updated',
          },
        ],
      },
    });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(202);
    expect(upserts).toHaveLength(1);
    expect(upserts[0]).toMatchObject({
      sourceListKind: 'Projects',
      workKey: 'my-projects-projection:Projects:2026-05-17T14:32:00.000Z',
      notificationBatchId: 'batch-1',
    });
  });

  it('does not upsert when clientState mismatches', async () => {
    const { deps, upserts } = makeDeps();
    const request = makeRequest({
      bodyJson: { value: [{ subscriptionId: 'sub-projects', clientState: 'wrong-secret' }] },
    });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(200);
    expect(upserts).toHaveLength(0);
  });
});
