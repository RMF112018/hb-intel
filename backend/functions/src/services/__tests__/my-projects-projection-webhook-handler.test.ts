import type { HttpRequest } from '@azure/functions';
import { describe, expect, it } from 'vitest';
import {
  handleProjectionGraphWebhook,
  type IProjectionSubscriptionStateLister,
  type IProjectionWebhookHandlerDeps,
} from '../my-projects-projection/webhook/projection-webhook-handler.js';
import type {
  IProjectionSyncMessageSendOutcome,
  IProjectionSyncMessageSender,
} from '../my-projects-projection/webhook/projection-sync-message-sender.js';
import type { IProjectionSubscriptionEntity } from '../my-projects-projection/projection-state-entities.js';
import type { ILogger } from '../../utils/logger.js';
import type { IMyProjectsProjectionSyncMessage } from '../my-projects-projection/projection-message-contract.js';

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

function makeRequest(opts: {
  query?: Record<string, string>;
  bodyJson?: unknown;
  bodyText?: string;
}): HttpRequest {
  const query = new Map<string, string>(Object.entries(opts.query ?? {}));
  return {
    query: {
      get: (key: string) => query.get(key) ?? null,
    },
    async json() {
      if (opts.bodyText !== undefined) {
        return JSON.parse(opts.bodyText);
      }
      if (opts.bodyJson !== undefined) {
        return opts.bodyJson;
      }
      throw new Error('No body configured');
    },
  } as unknown as HttpRequest;
}

interface CapturedEvent {
  readonly name: string;
  readonly properties: Record<string, unknown>;
}

function makeCapturingLogger(): { logger: ILogger; events: CapturedEvent[] } {
  const events: CapturedEvent[] = [];
  const noop = () => {};
  const logger: ILogger = {
    info: noop,
    warn: noop,
    error: noop,
    trackEvent: (name, properties) => {
      events.push({ name, properties });
    },
    trackMetric: noop,
  };
  return { logger, events };
}

function makeSenderRecording(
  opts: {
    outcomesBySourceKind?: Record<string, IProjectionSyncMessageSendOutcome>;
  } = {},
): {
  sender: IProjectionSyncMessageSender;
  sent: IMyProjectsProjectionSyncMessage[];
} {
  const sent: IMyProjectsProjectionSyncMessage[] = [];
  const sender: IProjectionSyncMessageSender = {
    sendSyncMessage: async (message) => {
      sent.push(message);
      const planned = opts.outcomesBySourceKind?.[message.sourceListKind];
      if (planned) return planned;
      return {
        acknowledged: true,
        messageId: `my-projects-projection:${message.sourceListKind}:${message.debounceBucketUtc}`,
      };
    },
    close: async () => {},
  };
  return { sender, sent };
}

function makeRepo(
  state: readonly IProjectionSubscriptionEntity[],
): IProjectionSubscriptionStateLister {
  return { list: async () => [...state] };
}

function makeDeps(overrides: Partial<IProjectionWebhookHandlerDeps> = {}): {
  deps: IProjectionWebhookHandlerDeps;
  events: CapturedEvent[];
  sent: IMyProjectsProjectionSyncMessage[];
} {
  const { logger, events } = makeCapturingLogger();
  const { sender, sent } = makeSenderRecording();
  const NOW = new Date('2026-05-17T14:32:47.512Z');
  let batchCounter = 0;
  const base: IProjectionWebhookHandlerDeps = {
    subscriptionStateRepository: makeRepo(SUBSCRIPTIONS),
    messageSender: sender,
    clientStateSecret: CLIENT_STATE_SECRET,
    debounceWindowSeconds: 60,
    now: () => NOW,
    correlationIdProvider: () => 'corr-fixed',
    logger,
    notificationBatchIdProvider: () => `batch-${++batchCounter}`,
  };
  return {
    deps: { ...base, ...overrides },
    events,
    sent,
  };
}

describe('handleProjectionGraphWebhook — validation token branch', () => {
  it('returns 200 text/plain with the URL-decoded token and emits request+success events', async () => {
    const { deps, events } = makeDeps();
    const request = makeRequest({ query: { validationToken: 'foo%20bar' } });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(200);
    expect(response.headers).toMatchObject({ 'Content-Type': 'text/plain; charset=utf-8' });
    expect(response.body).toBe('foo bar');
    const eventNames = events.map((entry) => entry.name);
    expect(eventNames).toEqual([
      'myProjectsProjection.notification.validation.request',
      'myProjectsProjection.notification.validation.success',
    ]);
  });
});

describe('handleProjectionGraphWebhook — invalid input branch', () => {
  it('returns 400 when the body is not JSON', async () => {
    const { deps } = makeDeps();
    const request = {
      query: { get: () => null },
      json: async () => {
        throw new Error('not json');
      },
    } as unknown as HttpRequest;
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(400);
  });

  it('returns 400 when the body has no value array', async () => {
    const { deps } = makeDeps();
    const request = makeRequest({ bodyJson: { not: 'a notification batch' } });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(400);
  });
});

describe('handleProjectionGraphWebhook — notification branch', () => {
  it('accepts an empty batch with 202 and zero enqueues', async () => {
    const { deps, events, sent } = makeDeps();
    const request = makeRequest({ bodyJson: { value: [] } });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(202);
    expect(sent).toHaveLength(0);
    expect(
      events.some((e) => e.name === 'myProjectsProjection.notification.payload.received'),
    ).toBe(true);
    expect(events.some((e) => e.name.startsWith('myProjectsProjection.notification.queue.'))).toBe(
      false,
    );
  });

  it('enqueues exactly one message for a single Projects notification', async () => {
    const { deps, events, sent } = makeDeps();
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
    expect(sent).toHaveLength(1);
    expect(sent[0].sourceListKind).toBe('Projects');
    expect(sent[0].debounceBucketUtc).toBe('2026-05-17T14:32:00.000Z');
    expect(sent[0].notificationBatchId).toBe('batch-1');
    expect(sent[0].subscriptionId).toBe('sub-projects');
    expect(sent[0].notificationCount).toBe(1);
    expect(sent[0].correlationId).toBe('corr-fixed');
    const acceptedEvent = events.find(
      (e) => e.name === 'myProjectsProjection.notification.queue.accepted',
    );
    expect(acceptedEvent?.properties).toMatchObject({
      sourceListKind: 'Projects',
      queueMessageId: 'my-projects-projection:Projects:2026-05-17T14:32:00.000Z',
    });
  });

  it('enqueues one message per source kind for a multi-source batch', async () => {
    const { deps, events, sent } = makeDeps();
    const request = makeRequest({
      bodyJson: {
        value: [
          { subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET },
          { subscriptionId: 'sub-legacy', clientState: CLIENT_STATE_SECRET },
          { subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET },
        ],
      },
    });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(202);
    expect(sent).toHaveLength(2);
    expect(sent.map((m) => m.sourceListKind).sort()).toEqual(['LegacyRegistry', 'Projects']);
    const projectsMessage = sent.find((m) => m.sourceListKind === 'Projects');
    expect(projectsMessage?.notificationCount).toBe(2);
    const acceptedEvents = events.filter(
      (e) => e.name === 'myProjectsProjection.notification.queue.accepted',
    );
    expect(acceptedEvents).toHaveLength(2);
  });

  it('rejects the entire batch with 200 OK empty body when any clientState mismatches', async () => {
    const { deps, events, sent } = makeDeps();
    const request = makeRequest({
      bodyJson: {
        value: [
          { subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET },
          { subscriptionId: 'sub-legacy', clientState: 'wrong-secret' },
        ],
      },
    });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(200);
    expect(response.body).toBe('');
    expect(sent).toHaveLength(0);
    expect(
      events.some((e) => e.name === 'myProjectsProjection.notification.clientState.invalid'),
    ).toBe(true);
    expect(events.some((e) => e.name.startsWith('myProjectsProjection.notification.queue.'))).toBe(
      false,
    );
  });

  it('counts unknown subscriptions in payload.received but does not enqueue for them', async () => {
    const { deps, events, sent } = makeDeps();
    const request = makeRequest({
      bodyJson: {
        value: [{ subscriptionId: 'sub-not-known', clientState: CLIENT_STATE_SECRET }],
      },
    });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(202);
    expect(sent).toHaveLength(0);
    const received = events.find(
      (e) => e.name === 'myProjectsProjection.notification.payload.received',
    );
    expect(received?.properties).toMatchObject({
      notificationCount: 1,
      sourceListKinds: [],
    });
    expect(
      (received?.properties as { rejectedReasonCounts?: Record<string, number> })
        ?.rejectedReasonCounts,
    ).toEqual({ 'unknown-subscription': 1 });
  });

  it('returns 503 when a send fails and emits queue.failed', async () => {
    const sender = makeSenderRecording({
      outcomesBySourceKind: {
        Projects: {
          acknowledged: false,
          failureCode: 'send-failed',
          sanitizedReason: 'amqp timeout',
        },
      },
    });
    const { deps, events } = makeDeps({ messageSender: sender.sender });
    const request = makeRequest({
      bodyJson: {
        value: [{ subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET }],
      },
    });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(503);
    const failedEvents = events.filter(
      (e) => e.name === 'myProjectsProjection.notification.queue.failed',
    );
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0].properties).toMatchObject({
      sourceListKind: 'Projects',
      failureCode: 'send-failed',
    });
  });

  it('returns 503 on partial multi-send failure (one kind succeeds, one fails)', async () => {
    const sender = makeSenderRecording({
      outcomesBySourceKind: {
        LegacyRegistry: {
          acknowledged: false,
          failureCode: 'send-failed',
          sanitizedReason: 'transient',
        },
      },
    });
    const { deps, events } = makeDeps({ messageSender: sender.sender });
    const request = makeRequest({
      bodyJson: {
        value: [
          { subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET },
          { subscriptionId: 'sub-legacy', clientState: CLIENT_STATE_SECRET },
        ],
      },
    });
    const response = await handleProjectionGraphWebhook(request, deps);
    expect(response.status).toBe(503);
    expect(sender.sent).toHaveLength(2);
    const failedEvents = events.filter(
      (e) => e.name === 'myProjectsProjection.notification.queue.failed',
    );
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0].properties).toMatchObject({ sourceListKind: 'LegacyRegistry' });
  });

  it('emits duplicate.bucketed when the sender flags duplicateDetected', async () => {
    const sender = makeSenderRecording({
      outcomesBySourceKind: {
        Projects: {
          acknowledged: true,
          messageId: 'my-projects-projection:Projects:2026-05-17T14:32:00.000Z',
          duplicateDetected: true,
        },
      },
    });
    const { deps, events } = makeDeps({ messageSender: sender.sender });
    const request = makeRequest({
      bodyJson: {
        value: [{ subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET }],
      },
    });
    await handleProjectionGraphWebhook(request, deps);
    expect(
      events.some((e) => e.name === 'myProjectsProjection.notification.duplicate.bucketed'),
    ).toBe(true);
  });

  it('emits a single payload.received event and never logs the raw clientState', async () => {
    const { deps, events } = makeDeps();
    const request = makeRequest({
      bodyJson: {
        value: [{ subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET }],
      },
    });
    await handleProjectionGraphWebhook(request, deps);
    const receivedEvents = events.filter(
      (e) => e.name === 'myProjectsProjection.notification.payload.received',
    );
    expect(receivedEvents).toHaveLength(1);
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain(CLIENT_STATE_SECRET);
  });

  it('produces deterministic queueMessageId for repeated calls in the same debounce bucket', async () => {
    const { deps: deps1, sent: sent1 } = makeDeps();
    const { deps: deps2, sent: sent2 } = makeDeps();
    const requestA = makeRequest({
      bodyJson: { value: [{ subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET }] },
    });
    const requestB = makeRequest({
      bodyJson: { value: [{ subscriptionId: 'sub-projects', clientState: CLIENT_STATE_SECRET }] },
    });
    await handleProjectionGraphWebhook(requestA, deps1);
    await handleProjectionGraphWebhook(requestB, deps2);
    expect(sent1[0].debounceBucketUtc).toBe(sent2[0].debounceBucketUtc);
  });
});
