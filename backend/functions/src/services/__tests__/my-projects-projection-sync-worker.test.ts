import { describe, expect, it } from 'vitest';
import {
  handleProjectionSyncMessage,
  type IProjectionDeltaStateAdvancer,
  type IProjectionDeltaStateReader,
  type IProjectionLeaseAcquirer,
  type IProjectionSyncWorkerDeps,
} from '../my-projects-projection/delta/projection-sync-worker.js';
import type {
  IDeltaDrainOutcome,
  IProjectionGraphDeltaClient,
  IInitialDeltaLinkOutcome,
} from '../my-projects-projection/delta/projection-graph-delta-client.js';
import type {
  IProjectionSliceRecomputeService,
  IRecomputeOutcome,
} from '../my-projects-projection/delta/projection-slice-recompute-service.js';
import { DeltaStateConcurrencyError } from '../my-projects-projection/state/delta-state-repository.js';
import type { IProjectionDeltaStateEntity } from '../my-projects-projection/projection-state-entities.js';
import type { SourceListKind } from '../my-projects-projection/projection-types.js';
import type { ILogger } from '../../utils/logger.js';

const NOW = new Date('2026-05-17T12:00:00.000Z');

const VALID_MESSAGE = {
  schemaVersion: 'v1' as const,
  messageType: 'my-projects-projection-sync' as const,
  sourceListKind: 'Projects' as SourceListKind,
  receivedAtUtc: '2026-05-17T12:00:00.000Z',
  debounceBucketUtc: '2026-05-17T12:00:00.000Z',
  notificationBatchId: 'batch-1',
  correlationId: 'corr-1',
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

interface FakeStateOutcome {
  readonly entity: IProjectionDeltaStateEntity | null;
  readonly etag: string;
}

function makeStateRepo(opts: { initial: FakeStateOutcome | null }): {
  repo: IProjectionDeltaStateReader & IProjectionDeltaStateAdvancer;
  advanceCalls: Array<{
    deltaLink: string;
    expectedEtag: string;
    changedCount: number;
    deletedCount: number;
    batchId: string;
  }>;
  markFailureCalls: Array<{ failureCode: string; expectedEtag: string }>;
  markNeedsResyncCalls: Array<{ failureCode: string; expectedEtag: string }>;
  throwOnAdvance?: Error | DeltaStateConcurrencyError;
} {
  const advanceCalls: Array<{
    deltaLink: string;
    expectedEtag: string;
    changedCount: number;
    deletedCount: number;
    batchId: string;
  }> = [];
  const markFailureCalls: Array<{ failureCode: string; expectedEtag: string }> = [];
  const markNeedsResyncCalls: Array<{ failureCode: string; expectedEtag: string }> = [];
  const ref: { throwOnAdvance?: Error } = {};
  const repo: IProjectionDeltaStateReader & IProjectionDeltaStateAdvancer = {
    async getWithEtag() {
      if (opts.initial === null || opts.initial.entity === null) return null;
      return { entity: opts.initial.entity, etag: opts.initial.etag };
    },
    async advanceCheckpoint(args) {
      advanceCalls.push({
        deltaLink: args.deltaLink,
        expectedEtag: args.expectedEtag,
        changedCount: args.changedCount,
        deletedCount: args.deletedCount,
        batchId: args.batchId,
      });
      if (ref.throwOnAdvance) throw ref.throwOnAdvance;
    },
    async markFailure(args) {
      markFailureCalls.push({ failureCode: args.failureCode, expectedEtag: args.expectedEtag });
    },
    async markNeedsResync(args) {
      markNeedsResyncCalls.push({ failureCode: args.failureCode, expectedEtag: args.expectedEtag });
    },
  };
  return { repo, advanceCalls, markFailureCalls, markNeedsResyncCalls, ...ref };
}

function makeLeaseRepo(
  acquireOutcome:
    | { acquired: true; expiresAtUtc: string }
    | { acquired: false; reason: 'active'; currentOwner: string; expiresAtUtc: string }
    | { acquired: false; reason: 'race-conflict' } = {
    acquired: true,
    expiresAtUtc: '2026-05-17T12:10:00.000Z',
  },
): {
  repo: IProjectionLeaseAcquirer;
  acquireCalls: Array<{ rowKey: string; leaseOwner: string }>;
  releaseCalls: Array<{ rowKey: string; leaseOwner: string }>;
} {
  const acquireCalls: Array<{ rowKey: string; leaseOwner: string }> = [];
  const releaseCalls: Array<{ rowKey: string; leaseOwner: string }> = [];
  const repo: IProjectionLeaseAcquirer = {
    async tryAcquire(args) {
      acquireCalls.push({ rowKey: args.rowKey, leaseOwner: args.leaseOwner });
      return acquireOutcome;
    },
    async release(args) {
      releaseCalls.push({ rowKey: args.rowKey, leaseOwner: args.leaseOwner });
      return { released: true };
    },
  };
  return { repo, acquireCalls, releaseCalls };
}

function makeDeltaClient(
  opts: {
    drain?: IDeltaDrainOutcome;
    initial?: IInitialDeltaLinkOutcome;
  } = {},
): IProjectionGraphDeltaClient {
  return {
    async acquireInitialDeltaLink() {
      return opts.initial ?? { ok: true, deltaLink: 'https://graph/delta?token=NEW' };
    },
    async drainDelta() {
      return (
        opts.drain ?? {
          ok: true,
          result: {
            changedItems: [{ id: '1' }, { id: '2' }],
            deletedItemIds: ['3'],
            finalDeltaLink: 'https://graph/delta?token=NEXT',
            pageCount: 1,
          },
        }
      );
    },
  };
}

function makeRecompute(outcome?: IRecomputeOutcome): IProjectionSliceRecomputeService {
  return {
    async recompute() {
      return (
        outcome ?? {
          ok: true,
          counts: {
            helperRowsInserted: 1,
            helperRowsUpdated: 2,
            helperRowsReactivated: 0,
            helperRowsDeactivated: 1,
            helperRowsPurged: 0,
          },
        }
      );
    },
  };
}

function makeHealthyState(): FakeStateOutcome {
  return {
    entity: {
      partitionKey: 'MyProjectsProjection',
      rowKey: 'DeltaState:Projects',
      SourceListKind: 'Projects',
      DeltaLink: 'https://graph/delta?token=CURRENT',
      NeedsResync: false,
    },
    etag: 'W/"etag-1"',
  };
}

function makeDeps(overrides: Partial<IProjectionSyncWorkerDeps> = {}): IProjectionSyncWorkerDeps {
  const { logger } = makeLogger();
  return {
    deltaStateRepository: makeStateRepo({ initial: makeHealthyState() }).repo,
    leaseRepository: makeLeaseRepo().repo,
    deltaClient: makeDeltaClient(),
    recomputeService: makeRecompute(),
    logger,
    now: () => NOW,
    leaseOwner: 'worker-1',
    syncLeaseMinutes: 10,
    maxDeltaPagesPerRun: 100,
    runIdProvider: () => 'run-xyz',
    ...overrides,
  };
}

describe('handleProjectionSyncMessage — input validation', () => {
  it('returns rejected-malformed without acquiring a lease', async () => {
    const lease = makeLeaseRepo();
    const { logger, events } = makeLogger();
    const outcome = await handleProjectionSyncMessage(
      { not: 'a message' },
      {
        ...makeDeps({ logger }),
        leaseRepository: lease.repo,
      },
    );
    expect(outcome.status).toBe('rejected-malformed');
    expect(lease.acquireCalls).toHaveLength(0);
    const received = events.find(
      (entry) => entry.name === 'myProjectsProjection.worker.message.received',
    );
    expect(received?.properties.failureCode).toBe('invalid-message');
  });
});

describe('handleProjectionSyncMessage — lease contention', () => {
  it('returns lease-skipped when another worker holds the lease', async () => {
    const lease = makeLeaseRepo({
      acquired: false,
      reason: 'active',
      currentOwner: 'worker-2',
      expiresAtUtc: '2026-05-17T12:05:00.000Z',
    });
    const { logger, events } = makeLogger();
    const state = makeStateRepo({ initial: makeHealthyState() });
    const delta = makeDeltaClient();
    const outcome = await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      leaseRepository: lease.repo,
      deltaStateRepository: state.repo,
      deltaClient: delta,
    });
    expect(outcome.status).toBe('lease-skipped');
    expect(state.advanceCalls).toHaveLength(0);
    const skipEvent = events.find(
      (entry) => entry.name === 'myProjectsProjection.worker.lease.skipped',
    );
    expect(skipEvent?.properties).toMatchObject({ reason: 'active', currentOwner: 'worker-2' });
  });
});

describe('handleProjectionSyncMessage — no baseline / state-flag resync', () => {
  it('returns resync-required-no-baseline when state is absent', async () => {
    const state = makeStateRepo({ initial: null });
    const lease = makeLeaseRepo();
    const { logger, events } = makeLogger();
    const outcome = await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      deltaStateRepository: state.repo,
      leaseRepository: lease.repo,
    });
    expect(outcome.status).toBe('resync-required-no-baseline');
    expect(lease.releaseCalls).toHaveLength(1);
    expect(
      events.some((entry) => entry.name === 'myProjectsProjection.worker.delta.resyncRequired'),
    ).toBe(true);
  });

  it('returns resync-required-state-flag when NeedsResync=true', async () => {
    const state = makeStateRepo({
      initial: {
        entity: { ...makeHealthyState().entity!, NeedsResync: true },
        etag: 'W/"etag-1"',
      },
    });
    const { logger, events } = makeLogger();
    const outcome = await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      deltaStateRepository: state.repo,
    });
    expect(outcome.status).toBe('resync-required-state-flag');
    const resyncEvent = events.find(
      (entry) => entry.name === 'myProjectsProjection.worker.delta.resyncRequired',
    );
    expect(resyncEvent?.properties.reason).toBe('state-flag');
  });
});

describe('handleProjectionSyncMessage — happy path', () => {
  it('drains, recomputes, advances checkpoint, releases lease', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    const lease = makeLeaseRepo();
    const recompute = makeRecompute();
    const { logger, events } = makeLogger();
    const outcome = await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      deltaStateRepository: state.repo,
      leaseRepository: lease.repo,
      recomputeService: recompute,
    });
    expect(outcome.status).toBe('completed');
    expect(state.advanceCalls).toHaveLength(1);
    expect(state.advanceCalls[0]).toMatchObject({
      deltaLink: 'https://graph/delta?token=NEXT',
      expectedEtag: 'W/"etag-1"',
      changedCount: 2,
      deletedCount: 1,
      batchId: 'run-xyz',
    });
    expect(lease.releaseCalls).toHaveLength(1);
    const eventNames = events.map((entry) => entry.name);
    expect(eventNames).toContain('myProjectsProjection.worker.message.received');
    expect(eventNames).toContain('myProjectsProjection.worker.lease.acquired');
    expect(eventNames).toContain('myProjectsProjection.worker.delta.start');
    expect(eventNames).toContain('myProjectsProjection.worker.delta.success');
    expect(eventNames).toContain('myProjectsProjection.worker.projection.write.success');
    expect(eventNames).toContain('myProjectsProjection.worker.message.completed');
    expect(eventNames).not.toContain('myProjectsProjection.worker.delta.page');
  });

  it('emits worker.delta.page only when pageCount > 1', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    const lease = makeLeaseRepo();
    const delta = makeDeltaClient({
      drain: {
        ok: true,
        result: {
          changedItems: [{ id: 'a' }],
          deletedItemIds: [],
          finalDeltaLink: 'https://graph/delta?token=NEXT',
          pageCount: 3,
        },
      },
    });
    const { logger, events } = makeLogger();
    const outcome = await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      deltaStateRepository: state.repo,
      leaseRepository: lease.repo,
      deltaClient: delta,
    });
    expect(outcome.status).toBe('completed');
    expect(events.some((entry) => entry.name === 'myProjectsProjection.worker.delta.page')).toBe(
      true,
    );
  });
});

describe('handleProjectionSyncMessage — failure paths', () => {
  it('routes 410 to markNeedsResync, returns resync-required-410, does NOT advance', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    const lease = makeLeaseRepo();
    const delta = makeDeltaClient({
      drain: {
        ok: false,
        failureCode: 'graph-410-gone',
        sanitizedReason: 'resync required',
      },
    });
    const { logger, events } = makeLogger();
    const outcome = await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      deltaStateRepository: state.repo,
      leaseRepository: lease.repo,
      deltaClient: delta,
    });
    expect(outcome.status).toBe('resync-required-410');
    expect(state.markNeedsResyncCalls).toEqual([
      { failureCode: 'delta-token-expired-or-invalid', expectedEtag: 'W/"etag-1"' },
    ]);
    expect(state.advanceCalls).toHaveLength(0);
    expect(state.markFailureCalls).toHaveLength(0);
    expect(lease.releaseCalls).toHaveLength(1);
    const resyncEvent = events.find(
      (entry) => entry.name === 'myProjectsProjection.worker.delta.resyncRequired',
    );
    expect(resyncEvent?.properties.reason).toBe('410');
  });

  it('routes other delta failures to markFailure and rethrows for pending-work retry scheduling', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    const lease = makeLeaseRepo();
    const delta = makeDeltaClient({
      drain: {
        ok: false,
        failureCode: 'graph-5xx',
        sanitizedReason: 'graph internal',
      },
    });
    const { logger } = makeLogger();
    await expect(
      handleProjectionSyncMessage(VALID_MESSAGE, {
        ...makeDeps({ logger }),
        deltaStateRepository: state.repo,
        leaseRepository: lease.repo,
        deltaClient: delta,
      }),
    ).rejects.toThrow(/delta drain failed.*graph-5xx/);
    expect(state.markFailureCalls).toEqual([
      { failureCode: 'graph-5xx', expectedEtag: 'W/"etag-1"' },
    ]);
    expect(state.advanceCalls).toHaveLength(0);
    expect(lease.releaseCalls).toHaveLength(1);
  });

  it('rethrows on recompute failure and does NOT advance checkpoint', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    const lease = makeLeaseRepo();
    const recompute = makeRecompute({
      ok: false,
      failureCode: 'projection-write-failed',
      sanitizedReason: 'sharepoint 5xx',
    });
    const { logger, events } = makeLogger();
    await expect(
      handleProjectionSyncMessage(VALID_MESSAGE, {
        ...makeDeps({ logger }),
        deltaStateRepository: state.repo,
        leaseRepository: lease.repo,
        recomputeService: recompute,
      }),
    ).rejects.toThrow(/recompute failed.*projection-write-failed/);
    expect(state.advanceCalls).toHaveLength(0);
    expect(lease.releaseCalls).toHaveLength(1);
    expect(
      events.some((entry) => entry.name === 'myProjectsProjection.worker.projection.write.failure'),
    ).toBe(true);
  });

  it('treats DeltaStateConcurrencyError on advance as benign — completes cleanly', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    state.throwOnAdvance = new DeltaStateConcurrencyError('Projects', null);
    const lease = makeLeaseRepo();
    const { logger } = makeLogger();
    const outcome = await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      deltaStateRepository: state.repo,
      leaseRepository: lease.repo,
    });
    expect(outcome.status).toBe('completed');
    expect(lease.releaseCalls).toHaveLength(1);
  });

  it('releases lease even when an exception propagates', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    const lease = makeLeaseRepo();
    const delta: IProjectionGraphDeltaClient = {
      async acquireInitialDeltaLink() {
        throw new Error('unused');
      },
      async drainDelta() {
        throw new Error('unexpected explosion');
      },
    };
    const { logger } = makeLogger();
    await expect(
      handleProjectionSyncMessage(VALID_MESSAGE, {
        ...makeDeps({ logger }),
        deltaStateRepository: state.repo,
        leaseRepository: lease.repo,
        deltaClient: delta,
      }),
    ).rejects.toThrow(/explosion/);
    expect(lease.releaseCalls).toHaveLength(1);
  });
});

describe('handleProjectionSyncMessage — telemetry hygiene', () => {
  it('does not surface bearer-shaped or JWT-shaped substrings in any emitted event', async () => {
    const state = makeStateRepo({ initial: makeHealthyState() });
    const lease = makeLeaseRepo();
    const { logger, events } = makeLogger();
    await handleProjectionSyncMessage(VALID_MESSAGE, {
      ...makeDeps({ logger }),
      deltaStateRepository: state.repo,
      leaseRepository: lease.repo,
    });
    const serialized = JSON.stringify(events);
    expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._+/=-]+/);
    expect(serialized).not.toMatch(/eyJ[A-Za-z0-9._-]{20,}/);
  });
});
