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
import { ProjectionSubscriptionStateRepository } from '../../services/my-projects-projection/state/subscription-state-repository.js';
import {
  createProjectionSyncMessageSender,
  handleProjectionGraphWebhook,
  type IProjectionSyncMessageSender,
  type IProjectionWebhookHandlerDeps,
} from '../../services/my-projects-projection/webhook/index.js';
import { createLogger } from '../../utils/logger.js';

let cachedRepository: ProjectionSubscriptionStateRepository | null = null;
let cachedSender: IProjectionSyncMessageSender | null = null;

function getRepository(): ProjectionSubscriptionStateRepository {
  if (cachedRepository === null) {
    cachedRepository = new ProjectionSubscriptionStateRepository();
  }
  return cachedRepository;
}

function getSender(fqdn: string, queueName: string): IProjectionSyncMessageSender {
  if (cachedSender === null) {
    cachedSender = createProjectionSyncMessageSender({ fqdn, queueName });
  }
  return cachedSender;
}

app.http('myProjectsProjectionWebhook', {
  route: 'webhooks/my-projects-projection/graph',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const config = getProjectionConfig();
    const deps: IProjectionWebhookHandlerDeps = {
      subscriptionStateRepository: getRepository(),
      messageSender: getSender(config.queue.serviceBusFqdn, config.queue.queueName),
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
