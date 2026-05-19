import { describe, expect, it } from 'vitest';
import {
  ProjectionSubscriptionManager,
  type IProjectionSubscriptionLifecycleConfig,
  type IProjectionSubscriptionManagerDeps,
  type IProjectionSubscriptionStateRepositoryLike,
} from '../my-projects-projection/subscriptions/projection-subscription-manager.js';
import type {
  IProjectionGraphCreateOutcome,
  IProjectionGraphDeleteOutcome,
  IProjectionGraphGetOutcome,
  IProjectionGraphRenewOutcome,
  IProjectionGraphSubscriptionClient,
} from '../my-projects-projection/subscriptions/projection-graph-subscription-client.js';
import type {
  IProjectionSourceListLocator,
  IProjectionSourceListLocation,
} from '../my-projects-projection/subscriptions/projection-source-list-locator.js';
import type {
  IProjectionSubscriptionEntity,
  ProjectionSubscriptionStatus,
} from '../my-projects-projection/projection-state-entities.js';
import type { SourceListKind } from '../my-projects-projection/projection-types.js';
import type { ILogger } from '../../utils/logger.js';

const CLIENT_STATE = 'secret-do-not-log';
const NOTIFICATION_URL = 'https://func/api/webhooks/my-projects-projection/graph';

const BASE_CONFIG: IProjectionSubscriptionLifecycleConfig = {
  notificationUrl: NOTIFICATION_URL,
  clientStateSecret: CLIENT_STATE,
  expirationDays: 27,
  renewThresholdDays: 7,
  changeType: 'updated',
};

interface CapturedEvent {
  readonly name: string;
  readonly properties: Record<string, unknown>;
}

function makeLogger(): { logger: ILogger; events: CapturedEvent[] } {
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

function makeLocator(
  opts: {
    byKind?: Partial<Record<SourceListKind, IProjectionSourceListLocation>>;
    throwOnKind?: SourceListKind;
  } = {},
): IProjectionSourceListLocator {
  const defaults: Record<SourceListKind, IProjectionSourceListLocation> = {
    Projects: { siteId: 'site-1', listId: 'list-projects', listTitle: 'Projects' },
    LegacyRegistry: {
      siteId: 'site-1',
      listId: 'list-legacy',
      listTitle: 'Legacy Project Fallback Registry',
    },
  };
  return {
    async resolve(kind) {
      if (opts.throwOnKind === kind)
        throw new Error('Bearer eyJlocatorFailedabcdefghijklmnopqrstuvwx');
      return opts.byKind?.[kind] ?? defaults[kind];
    },
    async resolveResourcePath(kind) {
      const loc = opts.byKind?.[kind] ?? defaults[kind];
      return `sites/${loc.siteId}/lists/${loc.listId}`;
    },
  };
}

function makeRepository(
  seed: Partial<Record<SourceListKind, IProjectionSubscriptionEntity>> = {},
): {
  repo: IProjectionSubscriptionStateRepositoryLike;
  state: Map<SourceListKind, IProjectionSubscriptionEntity>;
  recordedFailures: Array<{
    sourceListKind: SourceListKind;
    failureCode: string;
    status?: ProjectionSubscriptionStatus;
  }>;
  recordedCreates: Array<{
    sourceListKind: SourceListKind;
    subscriptionId: string;
    expirationDateTimeUtc: string;
  }>;
  recordedRenewals: Array<{ sourceListKind: SourceListKind; expirationDateTimeUtc: string }>;
} {
  const state = new Map<SourceListKind, IProjectionSubscriptionEntity>();
  for (const [kind, entity] of Object.entries(seed) as Array<
    [SourceListKind, IProjectionSubscriptionEntity]
  >) {
    if (entity) state.set(kind, entity);
  }
  const recordedFailures: Array<{
    sourceListKind: SourceListKind;
    failureCode: string;
    status?: ProjectionSubscriptionStatus;
  }> = [];
  const recordedCreates: Array<{
    sourceListKind: SourceListKind;
    subscriptionId: string;
    expirationDateTimeUtc: string;
  }> = [];
  const recordedRenewals: Array<{ sourceListKind: SourceListKind; expirationDateTimeUtc: string }> =
    [];
  const repo: IProjectionSubscriptionStateRepositoryLike = {
    async get(kind) {
      return state.get(kind) ?? null;
    },
    async list() {
      return [...state.values()];
    },
    async recordSuccessfulCreate(args) {
      const entity: IProjectionSubscriptionEntity = {
        partitionKey: 'MyProjectsProjection',
        rowKey: `Subscription:${args.sourceListKind}` as `Subscription:${SourceListKind}`,
        SourceListKind: args.sourceListKind,
        SourceSiteId: args.sourceSiteId,
        SourceListId: args.sourceListId,
        SubscriptionId: args.subscriptionId,
        Resource: args.resource,
        NotificationUrl: args.notificationUrl,
        ExpirationDateTimeUtc: args.expirationDateTimeUtc,
        Status: 'healthy',
        LastCreateAttemptUtc: args.atUtc,
        LastRenewalSuccessUtc: args.atUtc,
      };
      state.set(args.sourceListKind, entity);
      recordedCreates.push({
        sourceListKind: args.sourceListKind,
        subscriptionId: args.subscriptionId,
        expirationDateTimeUtc: args.expirationDateTimeUtc,
      });
    },
    async recordSuccessfulRenewal(args) {
      const existing = state.get(args.sourceListKind);
      if (existing) {
        state.set(args.sourceListKind, {
          ...existing,
          Status: 'healthy',
          ExpirationDateTimeUtc: args.expirationDateTimeUtc,
          LastRenewalAttemptUtc: args.atUtc,
          LastRenewalSuccessUtc: args.atUtc,
          LastFailureCode: undefined,
          LastFailureAtUtc: undefined,
        });
      }
      recordedRenewals.push({
        sourceListKind: args.sourceListKind,
        expirationDateTimeUtc: args.expirationDateTimeUtc,
      });
    },
    async recordFailure(args) {
      const existing = state.get(args.sourceListKind);
      const next: IProjectionSubscriptionEntity = {
        ...(existing ?? {
          partitionKey: 'MyProjectsProjection',
          rowKey: `Subscription:${args.sourceListKind}` as `Subscription:${SourceListKind}`,
          SourceListKind: args.sourceListKind,
          SourceSiteId: '',
          SourceListId: '',
        }),
        Status: args.status ?? 'failed',
        LastFailureCode: args.failureCode,
        LastFailureAtUtc: args.atUtc,
        LastRenewalAttemptUtc: args.atUtc,
      };
      state.set(args.sourceListKind, next);
      recordedFailures.push({
        sourceListKind: args.sourceListKind,
        failureCode: args.failureCode,
        status: args.status,
      });
    },
  };
  return { repo, state, recordedFailures, recordedCreates, recordedRenewals };
}

interface ClientPlannedOutcomes {
  create?: IProjectionGraphCreateOutcome;
  renew?: IProjectionGraphRenewOutcome;
  delete?: IProjectionGraphDeleteOutcome;
  get?: IProjectionGraphGetOutcome;
}

function makeGraphClient(plan: ClientPlannedOutcomes = {}): {
  client: IProjectionGraphSubscriptionClient;
  createCalls: Array<{ resource: string; clientState: string; expirationDateTimeUtc: string }>;
  renewCalls: Array<{ subscriptionId: string; expirationDateTimeUtc: string }>;
  deleteCalls: string[];
} {
  const createCalls: Array<{
    resource: string;
    clientState: string;
    expirationDateTimeUtc: string;
  }> = [];
  const renewCalls: Array<{ subscriptionId: string; expirationDateTimeUtc: string }> = [];
  const deleteCalls: string[] = [];
  const client: IProjectionGraphSubscriptionClient = {
    async createSubscription(args) {
      createCalls.push({
        resource: args.resource,
        clientState: args.clientState,
        expirationDateTimeUtc: args.expirationDateTimeUtc,
      });
      return (
        plan.create ?? {
          ok: true,
          subscription: {
            subscriptionId: `sub-${createCalls.length}`,
            resource: args.resource,
            notificationUrl: args.notificationUrl,
            expirationDateTimeUtc: args.expirationDateTimeUtc,
            changeType: args.changeType,
          },
        }
      );
    },
    async renewSubscription(args) {
      renewCalls.push({
        subscriptionId: args.subscriptionId,
        expirationDateTimeUtc: args.expirationDateTimeUtc,
      });
      return (
        plan.renew ?? {
          ok: true,
          subscription: {
            subscriptionId: args.subscriptionId,
            resource: 'sites/site-1/lists/list-projects',
            expirationDateTimeUtc: args.expirationDateTimeUtc,
          },
        }
      );
    },
    async deleteSubscription(args) {
      deleteCalls.push(args.subscriptionId);
      return plan.delete ?? { ok: true };
    },
    async getSubscription() {
      return (
        plan.get ?? {
          ok: false,
          failureCode: 'graph-404-not-found',
        }
      );
    },
  };
  return { client, createCalls, renewCalls, deleteCalls };
}

function makeDeps(
  overrides: Partial<IProjectionSubscriptionManagerDeps> = {},
  now: Date = new Date('2026-05-17T12:00:00.000Z'),
): IProjectionSubscriptionManagerDeps & { events: CapturedEvent[] } {
  const { logger, events } = makeLogger();
  const repo = makeRepository().repo;
  const client = makeGraphClient().client;
  const locator = makeLocator();
  const deps: IProjectionSubscriptionManagerDeps & { events: CapturedEvent[] } = {
    stateRepository: repo,
    graphClient: client,
    locator,
    config: BASE_CONFIG,
    logger,
    now: () => now,
    correlationIdProvider: () => 'corr-test',
    events,
    ...overrides,
  };
  return deps;
}

describe('ProjectionSubscriptionManager.ensureSubscription — cold create', () => {
  it('resolves location, POSTs to Graph, persists state, emits create.start/.success', async () => {
    const repoFixture = makeRepository();
    const clientFixture = makeGraphClient();
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureSubscription('Projects');
    expect(outcome.action).toBe('created');
    if (outcome.action === 'created') {
      expect(outcome.expirationDateTimeUtc).toBe('2026-06-13T12:00:00.000Z');
    }
    expect(clientFixture.createCalls).toHaveLength(1);
    expect(clientFixture.createCalls[0]).toMatchObject({
      resource: 'sites/site-1/lists/list-projects',
      clientState: CLIENT_STATE,
    });
    expect(repoFixture.recordedCreates).toHaveLength(1);
    const eventNames = events.map((entry) => entry.name);
    expect(eventNames).toContain('myProjectsProjection.subscription.create.start');
    expect(eventNames).toContain('myProjectsProjection.subscription.create.success');
  });

  it('emits create.failure + health.missing and persists failure on 403', async () => {
    const repoFixture = makeRepository();
    const clientFixture = makeGraphClient({
      create: {
        ok: false,
        failureCode: 'graph-403-forbidden',
        sanitizedReason: 'consent missing',
        status: 403,
      },
    });
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureSubscription('Projects');
    expect(outcome).toMatchObject({ action: 'create-failed', failureCode: 'graph-403-forbidden' });
    expect(repoFixture.recordedFailures).toEqual([
      expect.objectContaining({
        sourceListKind: 'Projects',
        failureCode: 'graph-403-forbidden',
        status: 'failed',
      }),
    ]);
    const eventNames = events.map((entry) => entry.name);
    expect(eventNames).toContain('myProjectsProjection.subscription.create.failure');
    expect(eventNames).toContain('myProjectsProjection.subscription.health.missing');
    expect(eventNames).not.toContain('myProjectsProjection.subscription.create.success');
  });

  it('records locate-failed when the locator throws', async () => {
    const repoFixture = makeRepository();
    const clientFixture = makeGraphClient();
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator({ throwOnKind: 'Projects' }),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureSubscription('Projects');
    expect(outcome.action).toBe('locate-failed');
    expect(clientFixture.createCalls).toHaveLength(0);
    expect(repoFixture.recordedFailures[0]?.failureCode).toBe('locate-failed');
    expect(
      events.some((entry) => entry.name === 'myProjectsProjection.subscription.health.missing'),
    ).toBe(true);
  });
});

describe('ProjectionSubscriptionManager.ensureSubscription — healthy + renewal paths', () => {
  it('no-ops when remainingDays exceeds the renew threshold', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-abc',
        ExpirationDateTimeUtc: '2026-06-10T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const clientFixture = makeGraphClient();
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureSubscription('Projects');
    expect(outcome.action).toBe('healthy');
    expect(clientFixture.createCalls).toHaveLength(0);
    expect(clientFixture.renewCalls).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it('renews when remainingDays falls below the threshold and emits health.nearingExpiry', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-abc',
        ExpirationDateTimeUtc: '2026-05-22T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const clientFixture = makeGraphClient();
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureSubscription('Projects');
    expect(outcome.action).toBe('renewed');
    expect(clientFixture.renewCalls).toHaveLength(1);
    expect(clientFixture.renewCalls[0].subscriptionId).toBe('sub-abc');
    expect(repoFixture.recordedRenewals).toHaveLength(1);
    const names = events.map((entry) => entry.name);
    expect(names).toContain('myProjectsProjection.subscription.health.nearingExpiry');
    expect(names).toContain('myProjectsProjection.subscription.renew.start');
    expect(names).toContain('myProjectsProjection.subscription.renew.success');
  });

  it('records renewal failure and emits renew.failure on 5xx', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-abc',
        ExpirationDateTimeUtc: '2026-05-22T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const clientFixture = makeGraphClient({
      renew: {
        ok: false,
        failureCode: 'graph-5xx',
        sanitizedReason: 'graph internal',
        status: 502,
      },
    });
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureSubscription('Projects');
    expect(outcome).toMatchObject({ action: 'renew-failed', failureCode: 'graph-5xx' });
    expect(repoFixture.recordedFailures[0]).toMatchObject({
      failureCode: 'graph-5xx',
      status: 'renewal-required',
    });
    expect(
      events.some((entry) => entry.name === 'myProjectsProjection.subscription.renew.failure'),
    ).toBe(true);
  });

  it('preserves explicit throttling classification on renew failures', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-abc',
        ExpirationDateTimeUtc: '2026-05-22T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const clientFixture = makeGraphClient({
      renew: {
        ok: false,
        failureCode: 'graph-429-throttled',
        sanitizedReason: 'throttled',
        status: 429,
      },
    });
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureSubscription('Projects');
    expect(outcome).toMatchObject({ action: 'renew-failed', failureCode: 'graph-429-throttled' });
    expect(repoFixture.recordedFailures[0]).toMatchObject({
      failureCode: 'graph-429-throttled',
      status: 'renewal-required',
    });
    const renewFailure = events.find(
      (entry) => entry.name === 'myProjectsProjection.subscription.renew.failure',
    );
    expect(renewFailure?.properties.failureCode).toBe('graph-429-throttled');
  });
});

describe('ProjectionSubscriptionManager.ensureAllSubscriptions', () => {
  it('aggregates Projects + LegacyRegistry outcomes independently', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-abc',
        ExpirationDateTimeUtc: '2026-06-10T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const clientFixture = makeGraphClient();
    const { logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureAllSubscriptions();
    const actions = outcome.outcomes.map((entry) => entry.action).sort();
    expect(actions).toEqual(['created', 'healthy']);
    expect(outcome.hasFailures).toBe(false);
  });

  it('reports hasFailures=true when one kind fails but the other succeeds', async () => {
    const repoFixture = makeRepository();
    // First create call succeeds (Projects), second fails (LegacyRegistry)
    let callIndex = 0;
    const clientFixture = makeGraphClient();
    clientFixture.client.createSubscription = async (args) => {
      callIndex += 1;
      clientFixture.createCalls.push({
        resource: args.resource,
        clientState: args.clientState,
        expirationDateTimeUtc: args.expirationDateTimeUtc,
      });
      if (callIndex === 1) {
        return {
          ok: true,
          subscription: {
            subscriptionId: 'sub-1',
            resource: args.resource,
            expirationDateTimeUtc: args.expirationDateTimeUtc,
          },
        };
      }
      return {
        ok: false,
        failureCode: 'graph-403-forbidden',
        sanitizedReason: 'consent missing',
        status: 403,
      };
    };
    const { logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.ensureAllSubscriptions();
    expect(outcome.hasFailures).toBe(true);
    const byKind = Object.fromEntries(
      outcome.outcomes.map((entry) => [entry.sourceListKind, entry.action]),
    );
    expect(byKind).toEqual({ Projects: 'created', LegacyRegistry: 'create-failed' });
  });
});

describe('ProjectionSubscriptionManager.forceResetSubscription', () => {
  it('deletes existing subscription then creates fresh', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-old',
        ExpirationDateTimeUtc: '2026-06-10T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const clientFixture = makeGraphClient();
    const { logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.forceResetSubscription('Projects');
    expect(outcome.action).toBe('reset-created');
    expect(clientFixture.deleteCalls).toEqual(['sub-old']);
    expect(clientFixture.createCalls).toHaveLength(1);
    if (outcome.action === 'reset-created') {
      expect(outcome.deletedPriorSubscriptionId).toBe('sub-old');
    }
  });

  it('swallows benign 404 on delete and still performs the create', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-gone',
        ExpirationDateTimeUtc: '2026-06-10T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const clientFixture = makeGraphClient({
      delete: { ok: false, failureCode: 'graph-404-not-found' },
    });
    const { logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const outcome = await manager.forceResetSubscription('Projects');
    expect(outcome.action).toBe('reset-created');
    expect(clientFixture.createCalls).toHaveLength(1);
  });
});

describe('ProjectionSubscriptionManager — secret hygiene', () => {
  it('never logs the clientState secret in any emitted event', async () => {
    const repoFixture = makeRepository();
    const clientFixture = makeGraphClient();
    const { events, logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: clientFixture.client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    await manager.ensureAllSubscriptions();
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain(CLIENT_STATE);
  });
});

describe('ProjectionSubscriptionManager.getStatus', () => {
  it('returns remainingDays per source kind', async () => {
    const repoFixture = makeRepository({
      Projects: {
        partitionKey: 'MyProjectsProjection',
        rowKey: 'Subscription:Projects',
        SourceListKind: 'Projects',
        SourceSiteId: 'site-1',
        SourceListId: 'list-projects',
        SubscriptionId: 'sub-abc',
        ExpirationDateTimeUtc: '2026-06-13T12:00:00.000Z',
        Status: 'healthy',
      },
    });
    const { logger } = makeLogger();
    const manager = new ProjectionSubscriptionManager({
      stateRepository: repoFixture.repo,
      graphClient: makeGraphClient().client,
      locator: makeLocator(),
      config: BASE_CONFIG,
      logger,
      now: () => new Date('2026-05-17T12:00:00.000Z'),
      correlationIdProvider: () => 'corr-1',
    });
    const status = await manager.getStatus();
    expect(status.entities).toHaveLength(1);
    expect(status.remainingDaysByKind.Projects).toBeCloseTo(27, 0);
  });
});

// Smoke: validate makeDeps default shape compiles
describe('manager constructor', () => {
  it('rejects non-positive expirationDays', () => {
    expect(
      () =>
        new ProjectionSubscriptionManager(
          makeDeps({ config: { ...BASE_CONFIG, expirationDays: 0 } }),
        ),
    ).toThrow(RangeError);
  });
});
