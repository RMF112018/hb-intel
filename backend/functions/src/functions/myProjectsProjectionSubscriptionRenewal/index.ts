/**
 * My Projects projection — daily Graph subscription renewal timer.
 *
 * Schedule defaults to `0 15 2 * * *` (02:15 UTC daily) per
 * `Environment_Settings_Matrix.md §3`. Iterates both source kinds and runs
 * `ensureSubscription` (create if missing, renew if within
 * `renewThresholdDays`, no-op when healthy).
 *
 * Live POST `/subscriptions` is operator-gated by `Sites.Read.All` admin
 * consent (Runbook 03). Until then, the timer can run safely: state lookups
 * succeed, Graph calls 403, and the manager classifies + persists the
 * failure as `graph-403-forbidden` for KQL operator review.
 */

import { app, type InvocationContext, type Timer } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import { getProjectionConfig } from '../../services/my-projects-projection/projection-config.js';
import { SharePointProjectionSubscriptionStateRepository } from '../../services/my-projects-projection/state/sharepoint-subscription-state-repository.js';
import { SharePointStateStore } from '../../services/my-projects-projection/state/sharepoint-state-store.js';
import { GraphListClient } from '../../services/legacy-fallback/graph-list-client.js';
import {
  ProjectionSubscriptionManager,
  createProjectionGraphSubscriptionClient,
  createProjectionSourceListLocator,
  type IGraphSiteListResolver,
  type IProjectionGraphSubscriptionClient,
  type IProjectionSourceListLocator,
} from '../../services/my-projects-projection/subscriptions/index.js';
import { createLogger } from '../../utils/logger.js';

const DEFAULT_SCHEDULE = '0 15 2 * * *';
const TIMER_SCHEDULE =
  process.env.HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE ?? DEFAULT_SCHEDULE;

let cachedGraphClient: IProjectionGraphSubscriptionClient | null = null;
let cachedRepository: SharePointProjectionSubscriptionStateRepository | null = null;
let cachedLocator: IProjectionSourceListLocator | null = null;
let cachedStore: SharePointStateStore | null = null;

function buildLocator(sourceSiteUrl: string): IProjectionSourceListLocator {
  if (cachedLocator !== null) return cachedLocator;
  const graphListClient = new GraphListClient(sourceSiteUrl);
  const resolver: IGraphSiteListResolver = {
    async resolveSiteId() {
      return graphListClient.resolveSiteId();
    },
    async resolveListId(_siteId, listTitle) {
      return graphListClient.resolveListId(listTitle);
    },
  };
  const config = getProjectionConfig();
  cachedLocator = createProjectionSourceListLocator({
    resolver,
    config: {
      sourceSiteUrl: config.sites.sourceSiteUrl,
      projectsListTitle: config.sites.projectsListTitle,
      legacyRegistryListTitle: config.sites.legacyRegistryListTitle,
    },
  });
  return cachedLocator;
}

function buildGraphClient(): IProjectionGraphSubscriptionClient {
  if (cachedGraphClient !== null) return cachedGraphClient;
  cachedGraphClient = createProjectionGraphSubscriptionClient();
  return cachedGraphClient;
}

function buildStore(registrySiteUrl: string): SharePointStateStore {
  if (cachedStore !== null) return cachedStore;
  cachedStore = new SharePointStateStore(registrySiteUrl);
  return cachedStore;
}

function buildRepository(registrySiteUrl: string): SharePointProjectionSubscriptionStateRepository {
  if (cachedRepository !== null) return cachedRepository;
  cachedRepository = new SharePointProjectionSubscriptionStateRepository(buildStore(registrySiteUrl));
  return cachedRepository;
}

app.timer('myProjectsProjectionSubscriptionRenewal', {
  schedule: TIMER_SCHEDULE,
  runOnStartup: false,
  handler: async (_timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const correlationId = randomUUID();
    const config = getProjectionConfig();
    logger.info('my-projects-projection.subscription-renewal.timer.entry', {
      correlationId,
      invocationId: context.invocationId,
      schedule: TIMER_SCHEDULE,
      enabled: config.enablement.enabled,
      renewalTimerEnabled: config.subscriptions.renewalTimerEnabled,
    });
    if (!config.enablement.enabled || !config.subscriptions.renewalTimerEnabled) {
      logger.info('my-projects-projection.subscription-renewal.timer.skipped', {
        correlationId,
        reason: !config.enablement.enabled ? 'projection-disabled' : 'renewal-timer-disabled',
      });
      return;
    }

    const manager = new ProjectionSubscriptionManager({
      stateRepository: buildRepository(config.sites.registrySiteUrl),
      graphClient: buildGraphClient(),
      locator: buildLocator(config.sites.sourceSiteUrl),
      config: {
        notificationUrl: config.webhook.notificationUrl,
        clientStateSecret: config.webhook.clientState,
        expirationDays: config.subscriptions.expirationDays,
        renewThresholdDays: config.subscriptions.renewThresholdDays,
        changeType: 'updated',
      },
      logger,
      now: () => new Date(),
      correlationIdProvider: () => correlationId,
    });

    try {
      const outcome = await manager.ensureAllSubscriptions();
      logger.info('my-projects-projection.subscription-renewal.timer.completed', {
        correlationId,
        hasFailures: outcome.hasFailures,
        outcomes: outcome.outcomes.map((entry) => ({
          sourceListKind: entry.sourceListKind,
          action: entry.action,
        })),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('my-projects-projection.subscription-renewal.timer.failed', {
        correlationId,
        sanitizedReason: message.slice(0, 240),
      });
      throw err;
    }
  },
});
