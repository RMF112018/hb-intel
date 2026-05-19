/**
 * My Projects projection — Microsoft Graph webhook entry.
 *
 * Anonymous public route at `POST /api/webhooks/my-projects-projection/graph`.
 * Security is enforced by:
 *   - Graph validation-token handshake (required for subscription create+renew),
 *   - exact `clientState` match against `HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE`.
 *
 * All business logic lives in
 * `services/my-projects-projection/webhook/projection-webhook-handler.ts`.
 * This file is plumbing only — env-derived deps, lazy module-scoped clients,
 * structured logger from invocation context, delegation to the pure handler.
 */

import { randomUUID } from 'node:crypto';
import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { getProjectionConfig } from '../../services/my-projects-projection/projection-config.js';
import { SharePointProjectionSubscriptionStateRepository } from '../../services/my-projects-projection/state/sharepoint-subscription-state-repository.js';
import { PendingWorkRepository } from '../../services/my-projects-projection/state/pending-work-repository.js';
import { SharePointStateStore } from '../../services/my-projects-projection/state/sharepoint-state-store.js';
import {
  handleProjectionGraphWebhook,
  type IProjectionWebhookHandlerDeps,
} from '../../services/my-projects-projection/webhook/index.js';
import { createLogger } from '../../utils/logger.js';

let cachedRepository: SharePointProjectionSubscriptionStateRepository | null = null;
let cachedPendingWorkRepository: PendingWorkRepository | null = null;
let cachedStore: SharePointStateStore | null = null;

function getStore(registrySiteUrl: string): SharePointStateStore {
  if (cachedStore === null) cachedStore = new SharePointStateStore(registrySiteUrl);
  return cachedStore;
}

function getRepository(registrySiteUrl: string): SharePointProjectionSubscriptionStateRepository {
  if (cachedRepository === null) {
    cachedRepository = new SharePointProjectionSubscriptionStateRepository(getStore(registrySiteUrl));
  }
  return cachedRepository;
}

function getPendingWorkRepository(registrySiteUrl: string): PendingWorkRepository {
  if (cachedPendingWorkRepository === null) {
    cachedPendingWorkRepository = new PendingWorkRepository(getStore(registrySiteUrl));
  }
  return cachedPendingWorkRepository;
}

app.http('myProjectsProjectionWebhook', {
  route: 'webhooks/my-projects-projection/graph',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const config = getProjectionConfig();
    const deps: IProjectionWebhookHandlerDeps = {
      subscriptionStateRepository: getRepository(config.sites.registrySiteUrl),
      pendingWorkRepository: getPendingWorkRepository(config.sites.registrySiteUrl),
      clientStateSecret: config.webhook.clientState,
      debounceWindowSeconds: config.queue.debounceWindowSeconds,
      now: () => new Date(),
      correlationIdProvider: () => extractOrGenerateRequestId(request),
      logger,
      notificationBatchIdProvider: () => randomUUID(),
    };
    return handleProjectionGraphWebhook(request, deps);
  },
});
