/**
 * My Projects projection — operator/admin subscription reconcile endpoint.
 *
 *   POST /api/admin/my-projects-projection/subscriptions/reconcile
 *
 * Body shapes (see `projection-subscription-admin-handler.ts`):
 *   { command: 'reconcile' }                                         — ensure both source kinds
 *   { command: 'reconcile-source', sourceListKind: 'Projects' | 'LegacyRegistry' }
 *   { command: 'force-reset',      sourceListKind: 'Projects' | 'LegacyRegistry' }
 *   { command: 'get-status' }                                        — read-only diagnostics
 *
 * Guard chain: `withAuth` → `requireDelegatedScope(access_as_user)` → `requireAdmin`.
 */

import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import { randomUUID } from 'node:crypto';
import { withAuth, type AuthContext } from '../../middleware/auth.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { getProjectionConfig } from '../../services/my-projects-projection/projection-config.js';
import { ProjectionSubscriptionStateRepository } from '../../services/my-projects-projection/state/subscription-state-repository.js';
import { GraphListClient } from '../../services/legacy-fallback/graph-list-client.js';
import {
  ProjectionSubscriptionManager,
  createProjectionGraphSubscriptionClient,
  createProjectionSourceListLocator,
  handleProjectionSubscriptionAdmin,
  type IGraphSiteListResolver,
  type IProjectionGraphSubscriptionClient,
  type IProjectionSourceListLocator,
} from '../../services/my-projects-projection/subscriptions/index.js';
import { createLogger } from '../../utils/logger.js';

let cachedGraphClient: IProjectionGraphSubscriptionClient | null = null;
let cachedRepository: ProjectionSubscriptionStateRepository | null = null;
let cachedLocator: IProjectionSourceListLocator | null = null;

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

function buildRepository(): ProjectionSubscriptionStateRepository {
  if (cachedRepository !== null) return cachedRepository;
  cachedRepository = new ProjectionSubscriptionStateRepository();
  return cachedRepository;
}

app.http('myProjectsProjectionSubscriptionAdmin', {
  route: 'admin/my-projects-projection/subscriptions/reconcile',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: withAuth(
    withTelemetry(
      async (
        request: HttpRequest,
        context: InvocationContext,
        auth: AuthContext,
      ): Promise<HttpResponseInit> => {
        const requestId = extractOrGenerateRequestId(request);
        const scopeDenied = requireDelegatedScope(auth.claims, requestId);
        if (scopeDenied) return scopeDenied;
        const adminDenied = requireAdmin(auth.claims, requestId);
        if (adminDenied) return adminDenied;

        const logger = createLogger(context);
        const config = getProjectionConfig();
        const correlationId = randomUUID();
        const manager = new ProjectionSubscriptionManager({
          stateRepository: buildRepository(),
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

        return handleProjectionSubscriptionAdmin(request, {
          manager,
          correlationId: requestId,
        });
      },
      { domain: 'myProjectsProjection', operation: 'subscriptionsReconcile' },
    ),
  ),
});
