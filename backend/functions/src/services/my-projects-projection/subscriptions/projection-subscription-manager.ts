/**
 * My Projects projection — Graph subscription lifecycle manager.
 *
 * Orchestrates create/renew/reset across the two source-list subscriptions,
 * persists state via the configured subscription-state repository
 * (SharePoint `Subscription State` list in active MVP composition), and emits
 * closed-set telemetry events per `08_Telemetry…§2.2`.
 *
 * Per-source flow inside `ensureSubscription`:
 *
 *   read state
 *     → if missing / failed / no SubscriptionId  → CREATE path
 *     → else if (remainingDays < threshold)      → RENEW path
 *     → else                                     → no-op (healthy)
 *
 * `ensureAllSubscriptions` iterates both source kinds independently —
 * one failure on Projects does not skip LegacyRegistry.
 *
 * `forceResetSubscription` is operator-triggered (admin endpoint): best-effort
 * delete of the existing subscription (404/410 swallowed) followed by a
 * fresh create.
 *
 * Live POST `/subscriptions` is blocked by tenant policy until `Sites.Read.All`
 * Application consent is granted (Runbook 03). The manager passes the Graph
 * call through anyway and surfaces the 403 as a sanitized failure code —
 * the operator runbook is the gating layer, not the manager.
 */

import { SOURCE_LIST_KINDS, type SourceListKind } from '../projection-types.js';
import type { ILogger } from '../../../utils/logger.js';
import type {
  IProjectionSubscriptionEntity,
  ProjectionSubscriptionStatus,
} from '../projection-state-entities.js';
import type {
  IProjectionGraphCreateOutcome,
  IProjectionGraphRenewOutcome,
  IProjectionGraphSubscriptionClient,
  IProjectionSubscriptionRecord,
} from './projection-graph-subscription-client.js';
import type { IProjectionSourceListLocator } from './projection-source-list-locator.js';

export interface IProjectionSubscriptionStateReader {
  get(sourceListKind: SourceListKind): Promise<IProjectionSubscriptionEntity | null>;
  list(): Promise<IProjectionSubscriptionEntity[]>;
}

export interface IProjectionSubscriptionStateWriter {
  recordSuccessfulCreate(args: {
    sourceListKind: SourceListKind;
    sourceSiteId: string;
    sourceListId: string;
    subscriptionId: string;
    resource: string;
    notificationUrl: string;
    expirationDateTimeUtc: string;
    atUtc: string;
  }): Promise<void>;
  recordSuccessfulRenewal(args: {
    sourceListKind: SourceListKind;
    expirationDateTimeUtc: string;
    atUtc: string;
  }): Promise<void>;
  recordFailure(args: {
    sourceListKind: SourceListKind;
    failureCode: string;
    atUtc: string;
    status?: ProjectionSubscriptionStatus;
  }): Promise<void>;
}

export type IProjectionSubscriptionStateRepositoryLike = IProjectionSubscriptionStateReader &
  IProjectionSubscriptionStateWriter;

export interface IProjectionSubscriptionLifecycleConfig {
  readonly notificationUrl: string;
  readonly clientStateSecret: string;
  readonly expirationDays: number;
  readonly renewThresholdDays: number;
  readonly changeType: 'updated' | 'created' | 'deleted' | 'updated,deleted' | string;
}

export interface IProjectionSubscriptionManagerDeps {
  readonly stateRepository: IProjectionSubscriptionStateRepositoryLike;
  readonly graphClient: IProjectionGraphSubscriptionClient;
  readonly locator: IProjectionSourceListLocator;
  readonly config: IProjectionSubscriptionLifecycleConfig;
  readonly logger: ILogger;
  readonly now: () => Date;
  readonly correlationIdProvider: () => string;
}

export type IEnsureSubscriptionOutcome =
  | {
      readonly action: 'created';
      readonly sourceListKind: SourceListKind;
      readonly subscriptionId: string;
      readonly expirationDateTimeUtc: string;
    }
  | {
      readonly action: 'renewed';
      readonly sourceListKind: SourceListKind;
      readonly subscriptionId: string;
      readonly expirationDateTimeUtc: string;
    }
  | {
      readonly action: 'healthy';
      readonly sourceListKind: SourceListKind;
      readonly subscriptionId: string;
      readonly expirationDateTimeUtc: string;
      readonly remainingDays: number;
    }
  | {
      readonly action: 'create-failed';
      readonly sourceListKind: SourceListKind;
      readonly failureCode: string;
    }
  | {
      readonly action: 'renew-failed';
      readonly sourceListKind: SourceListKind;
      readonly failureCode: string;
    }
  | {
      readonly action: 'locate-failed';
      readonly sourceListKind: SourceListKind;
      readonly failureCode: 'locate-failed';
      readonly sanitizedReason: string;
    };

export interface IEnsureAllSubscriptionsOutcome {
  readonly outcomes: ReadonlyArray<IEnsureSubscriptionOutcome>;
  readonly hasFailures: boolean;
}

export type IForceResetOutcome =
  | {
      readonly action: 'reset-created';
      readonly sourceListKind: SourceListKind;
      readonly subscriptionId: string;
      readonly expirationDateTimeUtc: string;
      readonly deletedPriorSubscriptionId?: string;
    }
  | {
      readonly action: 'reset-failed';
      readonly sourceListKind: SourceListKind;
      readonly failureCode: string;
    };

export interface IProjectionSubscriptionStatusSnapshot {
  readonly entities: ReadonlyArray<IProjectionSubscriptionEntity>;
  readonly remainingDaysByKind: Readonly<Partial<Record<SourceListKind, number>>>;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function remainingDays(expirationDateTimeUtc: string | undefined, now: Date): number | null {
  if (typeof expirationDateTimeUtc !== 'string' || expirationDateTimeUtc.length === 0) {
    return null;
  }
  const expirationMs = Date.parse(expirationDateTimeUtc);
  if (!Number.isFinite(expirationMs)) return null;
  return (expirationMs - now.getTime()) / MS_PER_DAY;
}

function computeExpirationDateTimeUtc(now: Date, expirationDays: number): string {
  if (!Number.isFinite(expirationDays) || expirationDays <= 0) {
    throw new RangeError(
      `ProjectionSubscriptionManager: expirationDays must be a positive finite number (got ${expirationDays}).`,
    );
  }
  return new Date(now.getTime() + expirationDays * MS_PER_DAY).toISOString();
}

export class ProjectionSubscriptionManager {
  private readonly deps: IProjectionSubscriptionManagerDeps;

  constructor(deps: IProjectionSubscriptionManagerDeps) {
    if (deps.config.expirationDays <= 0 || !Number.isFinite(deps.config.expirationDays)) {
      throw new RangeError(
        'ProjectionSubscriptionManager: config.expirationDays must be a positive finite number.',
      );
    }
    if (deps.config.renewThresholdDays < 0 || !Number.isFinite(deps.config.renewThresholdDays)) {
      throw new RangeError(
        'ProjectionSubscriptionManager: config.renewThresholdDays must be a non-negative finite number.',
      );
    }
    this.deps = deps;
  }

  async ensureSubscription(sourceListKind: SourceListKind): Promise<IEnsureSubscriptionOutcome> {
    const correlationId = this.deps.correlationIdProvider();
    const startMs = this.deps.now().getTime();
    let state: IProjectionSubscriptionEntity | null;
    try {
      state = await this.deps.stateRepository.get(sourceListKind);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.deps.logger.trackEvent('myProjectsProjection.subscription.create.failure', {
        correlationId,
        sourceListKind,
        failureCode: 'state-read-failed',
        sanitizedReason: message.slice(0, 240),
        durationMs: this.deps.now().getTime() - startMs,
      });
      return {
        action: 'create-failed',
        sourceListKind,
        failureCode: 'state-read-failed',
      };
    }

    if (
      state === null ||
      typeof state.SubscriptionId !== 'string' ||
      state.SubscriptionId.length === 0 ||
      state.Status === 'missing' ||
      state.Status === 'failed'
    ) {
      return this.performCreate(sourceListKind, correlationId, startMs);
    }

    const subscriptionId = state.SubscriptionId;
    const expirationDateTimeUtc = state.ExpirationDateTimeUtc;
    const remaining = remainingDays(expirationDateTimeUtc, this.deps.now());
    if (remaining === null || remaining < this.deps.config.renewThresholdDays) {
      this.deps.logger.trackEvent('myProjectsProjection.subscription.health.nearingExpiry', {
        correlationId,
        sourceListKind,
        subscriptionId,
        expirationDateTimeUtc,
        remainingDays: remaining,
      });
      return this.performRenew(sourceListKind, state, correlationId, startMs);
    }

    return {
      action: 'healthy',
      sourceListKind,
      subscriptionId,
      expirationDateTimeUtc: expirationDateTimeUtc as string,
      remainingDays: remaining,
    };
  }

  async ensureAllSubscriptions(): Promise<IEnsureAllSubscriptionsOutcome> {
    const outcomes: IEnsureSubscriptionOutcome[] = [];
    for (const kind of SOURCE_LIST_KINDS) {
      outcomes.push(await this.ensureSubscription(kind));
    }
    const hasFailures = outcomes.some(
      (entry) =>
        entry.action === 'create-failed' ||
        entry.action === 'renew-failed' ||
        entry.action === 'locate-failed',
    );
    return { outcomes, hasFailures };
  }

  async forceResetSubscription(sourceListKind: SourceListKind): Promise<IForceResetOutcome> {
    const correlationId = this.deps.correlationIdProvider();
    const startMs = this.deps.now().getTime();
    let priorSubscriptionId: string | undefined;
    try {
      const state = await this.deps.stateRepository.get(sourceListKind);
      if (
        state !== null &&
        typeof state.SubscriptionId === 'string' &&
        state.SubscriptionId.length > 0
      ) {
        priorSubscriptionId = state.SubscriptionId;
        const deleteOutcome = await this.deps.graphClient.deleteSubscription({
          subscriptionId: state.SubscriptionId,
        });
        if (
          !deleteOutcome.ok &&
          deleteOutcome.failureCode !== 'graph-404-not-found' &&
          deleteOutcome.failureCode !== 'graph-410-gone'
        ) {
          this.deps.logger.trackEvent('myProjectsProjection.subscription.create.failure', {
            correlationId,
            sourceListKind,
            subscriptionId: state.SubscriptionId,
            failureCode: deleteOutcome.failureCode,
            sanitizedReason:
              'sanitizedReason' in deleteOutcome ? deleteOutcome.sanitizedReason : 'delete failed',
            durationMs: this.deps.now().getTime() - startMs,
          });
          return {
            action: 'reset-failed',
            sourceListKind,
            failureCode: deleteOutcome.failureCode,
          };
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.deps.logger.trackEvent('myProjectsProjection.subscription.create.failure', {
        correlationId,
        sourceListKind,
        failureCode: 'state-read-failed',
        sanitizedReason: message.slice(0, 240),
        durationMs: this.deps.now().getTime() - startMs,
      });
      return {
        action: 'reset-failed',
        sourceListKind,
        failureCode: 'state-read-failed',
      };
    }

    const createOutcome = await this.performCreate(sourceListKind, correlationId, startMs);
    if (createOutcome.action === 'created') {
      return {
        action: 'reset-created',
        sourceListKind,
        subscriptionId: createOutcome.subscriptionId,
        expirationDateTimeUtc: createOutcome.expirationDateTimeUtc,
        deletedPriorSubscriptionId: priorSubscriptionId,
      };
    }
    return {
      action: 'reset-failed',
      sourceListKind,
      failureCode: 'failureCode' in createOutcome ? createOutcome.failureCode : 'create-failed',
    };
  }

  async getStatus(): Promise<IProjectionSubscriptionStatusSnapshot> {
    const entities = await this.deps.stateRepository.list();
    const now = this.deps.now();
    const remainingDaysByKind: Partial<Record<SourceListKind, number>> = {};
    for (const entity of entities) {
      const days = remainingDays(entity.ExpirationDateTimeUtc, now);
      if (days !== null) {
        remainingDaysByKind[entity.SourceListKind] = days;
      }
    }
    return { entities, remainingDaysByKind };
  }

  private async performCreate(
    sourceListKind: SourceListKind,
    correlationId: string,
    startMs: number,
  ): Promise<IEnsureSubscriptionOutcome> {
    this.deps.logger.trackEvent('myProjectsProjection.subscription.create.start', {
      correlationId,
      sourceListKind,
    });

    let siteId: string;
    let listId: string;
    let resourcePath: string;
    try {
      const location = await this.deps.locator.resolve(sourceListKind);
      siteId = location.siteId;
      listId = location.listId;
      resourcePath = `sites/${siteId}/lists/${listId}`;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const sanitized = message.slice(0, 240);
      await this.deps.stateRepository.recordFailure({
        sourceListKind,
        failureCode: 'locate-failed',
        atUtc: this.deps.now().toISOString(),
        status: 'failed',
      });
      this.deps.logger.trackEvent('myProjectsProjection.subscription.create.failure', {
        correlationId,
        sourceListKind,
        failureCode: 'locate-failed',
        sanitizedReason: sanitized,
        durationMs: this.deps.now().getTime() - startMs,
      });
      this.deps.logger.trackEvent('myProjectsProjection.subscription.health.missing', {
        correlationId,
        sourceListKind,
        failureCode: 'locate-failed',
      });
      return {
        action: 'locate-failed',
        sourceListKind,
        failureCode: 'locate-failed',
        sanitizedReason: sanitized,
      };
    }

    const expirationDateTimeUtc = computeExpirationDateTimeUtc(
      this.deps.now(),
      this.deps.config.expirationDays,
    );
    const outcome: IProjectionGraphCreateOutcome = await this.deps.graphClient.createSubscription({
      resource: resourcePath,
      notificationUrl: this.deps.config.notificationUrl,
      clientState: this.deps.config.clientStateSecret,
      expirationDateTimeUtc,
      changeType: this.deps.config.changeType,
    });

    if (!outcome.ok) {
      await this.deps.stateRepository.recordFailure({
        sourceListKind,
        failureCode: outcome.failureCode,
        atUtc: this.deps.now().toISOString(),
        status: 'failed',
      });
      this.deps.logger.trackEvent('myProjectsProjection.subscription.create.failure', {
        correlationId,
        sourceListKind,
        failureCode: outcome.failureCode,
        sanitizedReason: outcome.sanitizedReason,
        durationMs: this.deps.now().getTime() - startMs,
      });
      this.deps.logger.trackEvent('myProjectsProjection.subscription.health.missing', {
        correlationId,
        sourceListKind,
        failureCode: outcome.failureCode,
      });
      return {
        action: 'create-failed',
        sourceListKind,
        failureCode: outcome.failureCode,
      };
    }

    await this.persistCreated(sourceListKind, siteId, listId, outcome.subscription);
    this.deps.logger.trackEvent('myProjectsProjection.subscription.create.success', {
      correlationId,
      sourceListKind,
      subscriptionId: outcome.subscription.subscriptionId,
      expirationDateTimeUtc: outcome.subscription.expirationDateTimeUtc,
      durationMs: this.deps.now().getTime() - startMs,
    });
    return {
      action: 'created',
      sourceListKind,
      subscriptionId: outcome.subscription.subscriptionId,
      expirationDateTimeUtc: outcome.subscription.expirationDateTimeUtc,
    };
  }

  private async performRenew(
    sourceListKind: SourceListKind,
    state: IProjectionSubscriptionEntity,
    correlationId: string,
    startMs: number,
  ): Promise<IEnsureSubscriptionOutcome> {
    const subscriptionId = state.SubscriptionId as string;
    this.deps.logger.trackEvent('myProjectsProjection.subscription.renew.start', {
      correlationId,
      sourceListKind,
      subscriptionId,
    });
    const expirationDateTimeUtc = computeExpirationDateTimeUtc(
      this.deps.now(),
      this.deps.config.expirationDays,
    );
    const outcome: IProjectionGraphRenewOutcome = await this.deps.graphClient.renewSubscription({
      subscriptionId,
      expirationDateTimeUtc,
    });
    if (!outcome.ok) {
      await this.deps.stateRepository.recordFailure({
        sourceListKind,
        failureCode: outcome.failureCode,
        atUtc: this.deps.now().toISOString(),
        status: 'renewal-required',
      });
      this.deps.logger.trackEvent('myProjectsProjection.subscription.renew.failure', {
        correlationId,
        sourceListKind,
        subscriptionId,
        failureCode: outcome.failureCode,
        sanitizedReason: outcome.sanitizedReason,
        durationMs: this.deps.now().getTime() - startMs,
      });
      return {
        action: 'renew-failed',
        sourceListKind,
        failureCode: outcome.failureCode,
      };
    }
    await this.deps.stateRepository.recordSuccessfulRenewal({
      sourceListKind,
      expirationDateTimeUtc: outcome.subscription.expirationDateTimeUtc,
      atUtc: this.deps.now().toISOString(),
    });
    this.deps.logger.trackEvent('myProjectsProjection.subscription.renew.success', {
      correlationId,
      sourceListKind,
      subscriptionId,
      expirationDateTimeUtc: outcome.subscription.expirationDateTimeUtc,
      durationMs: this.deps.now().getTime() - startMs,
    });
    return {
      action: 'renewed',
      sourceListKind,
      subscriptionId,
      expirationDateTimeUtc: outcome.subscription.expirationDateTimeUtc,
    };
  }

  private async persistCreated(
    sourceListKind: SourceListKind,
    siteId: string,
    listId: string,
    subscription: IProjectionSubscriptionRecord,
  ): Promise<void> {
    await this.deps.stateRepository.recordSuccessfulCreate({
      sourceListKind,
      sourceSiteId: siteId,
      sourceListId: listId,
      subscriptionId: subscription.subscriptionId,
      resource: subscription.resource,
      notificationUrl: subscription.notificationUrl ?? this.deps.config.notificationUrl,
      expirationDateTimeUtc: subscription.expirationDateTimeUtc,
      atUtc: this.deps.now().toISOString(),
    });
  }
}
