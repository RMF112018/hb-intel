/**
 * My Projects projection — Microsoft Graph webhook handler (pure).
 *
 * Three branches:
 *
 *   1. Validation token handshake: Graph appends `?validationToken=<opaque>`
 *      during subscription create/renew. Return 200 text/plain with the
 *      URL-decoded token, no JSON wrapping (per Microsoft Graph spec).
 *
 *   2. Notification: parse `value[]`, verify `clientState` exactly, classify
 *      each notification to a SourceListKind via the subscription state
 *      snapshot, build one debounced sync-message per kind, and send to
 *      Service Bus. Return 202 on success, 503 if ANY send fails (so Graph
 *      retries).
 *
 *   3. Forged notification (clientState mismatch): 200 OK with empty body
 *      and a `clientState.invalid` telemetry event. Do NOT enqueue. Do NOT
 *      retry-storm. (4xx would cause Graph to back off and eventually
 *      deactivate the subscription; 5xx would retry-storm; 200 is the
 *      documented "accepted but did nothing" posture for forged input.)
 *
 * The webhook does NO projection logic. The Service Bus queue worker
 * (Prompt 06) does all source-list reads + projection writes.
 */

import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { ILogger } from '../../../utils/logger.js';
import { errorResponse, successResponse } from '../../../utils/response-helpers.js';
import {
  buildProjectionSyncMessageId,
  computeDebounceBucketUtc,
  isProjectionSyncMessage,
  type IMyProjectsProjectionSyncMessage,
} from '../projection-message-contract.js';
import type { IProjectionSubscriptionEntity } from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';
import {
  groupNotificationsBySourceKind,
  type IParsedNotification,
} from './projection-webhook-classifier.js';
import type { IProjectionSyncMessageSender } from './projection-sync-message-sender.js';

export interface IProjectionSubscriptionStateLister {
  list(): Promise<IProjectionSubscriptionEntity[]>;
}

export interface IProjectionWebhookHandlerDeps {
  readonly subscriptionStateRepository: IProjectionSubscriptionStateLister;
  readonly messageSender: IProjectionSyncMessageSender;
  readonly clientStateSecret: string;
  readonly debounceWindowSeconds: number;
  readonly now: () => Date;
  readonly correlationIdProvider: () => string;
  readonly logger: ILogger;
  readonly notificationBatchIdProvider?: () => string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractValidationToken(request: HttpRequest): string | null {
  const fromQuery = request.query.get('validationToken');
  if (typeof fromQuery === 'string' && fromQuery.length > 0) {
    return fromQuery;
  }
  return null;
}

function readNotifications(body: unknown): IParsedNotification[] | null {
  if (!isPlainObject(body)) return null;
  const rawValue = body.value;
  if (!Array.isArray(rawValue)) return null;
  const out: IParsedNotification[] = [];
  for (const raw of rawValue) {
    if (!isPlainObject(raw)) continue;
    out.push({
      subscriptionId: typeof raw.subscriptionId === 'string' ? raw.subscriptionId : null,
      clientState: typeof raw.clientState === 'string' ? raw.clientState : null,
      resource: typeof raw.resource === 'string' ? raw.resource : null,
      changeType: typeof raw.changeType === 'string' ? raw.changeType : null,
    });
  }
  return out;
}

export async function handleProjectionGraphWebhook(
  request: HttpRequest,
  deps: IProjectionWebhookHandlerDeps,
): Promise<HttpResponseInit> {
  const correlationId = deps.correlationIdProvider();
  const startMs = deps.now().getTime();

  const validationToken = extractValidationToken(request);
  if (validationToken !== null) {
    deps.logger.trackEvent('myProjectsProjection.notification.validation.request', {
      correlationId,
    });
    const decoded = decodeURIComponent(validationToken);
    deps.logger.trackEvent('myProjectsProjection.notification.validation.success', {
      correlationId,
      durationMs: deps.now().getTime() - startMs,
    });
    return {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: decoded,
    };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', correlationId);
  }

  const notifications = readNotifications(body);
  if (notifications === null) {
    return errorResponse(
      400,
      'VALIDATION_ERROR',
      'Notification body must include a `value` array.',
      correlationId,
    );
  }

  if (notifications.length === 0) {
    deps.logger.trackEvent('myProjectsProjection.notification.payload.received', {
      correlationId,
      notificationCount: 0,
      sourceListKinds: [] as SourceListKind[],
    });
    return successResponse(
      {
        accepted: true,
        sourceListKinds: [] as SourceListKind[],
        notificationBatchIds: [] as string[],
      },
      202,
    );
  }

  const anyClientStateMismatch = notifications.some(
    (n) => typeof n.clientState !== 'string' || n.clientState !== deps.clientStateSecret,
  );
  if (anyClientStateMismatch) {
    deps.logger.trackEvent('myProjectsProjection.notification.clientState.invalid', {
      correlationId,
      notificationCount: notifications.length,
    });
    return { status: 200, headers: {}, body: '' };
  }

  const subscriptionState = await deps.subscriptionStateRepository.list();
  const grouped = groupNotificationsBySourceKind({
    notifications,
    subscriptionState,
  });

  const sourceListKinds = [...grouped.accepted.keys()].sort();
  const rejectedReasonCounts = grouped.rejected.reduce<Record<string, number>>((acc, entry) => {
    const key = entry.outcome.reason;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  deps.logger.trackEvent('myProjectsProjection.notification.payload.received', {
    correlationId,
    notificationCount: notifications.length,
    sourceListKinds,
    rejectedReasonCounts,
  });

  if (grouped.accepted.size === 0) {
    return successResponse(
      {
        accepted: true,
        sourceListKinds,
        notificationBatchIds: [] as string[],
      },
      202,
    );
  }

  const receivedAtUtc = deps.now().toISOString();
  const debounceBucketUtc = computeDebounceBucketUtc(deps.now(), deps.debounceWindowSeconds);
  const batchIds: string[] = [];
  const sendFailures: Array<{
    sourceListKind: SourceListKind;
    failureCode: string;
    sanitizedReason: string;
  }> = [];

  for (const [sourceListKind, kindNotifications] of grouped.accepted) {
    const notificationBatchId = deps.notificationBatchIdProvider?.() ?? randomUUID();
    batchIds.push(notificationBatchId);
    const firstSubscriptionId =
      typeof kindNotifications[0]?.subscriptionId === 'string'
        ? kindNotifications[0].subscriptionId
        : null;
    const message: IMyProjectsProjectionSyncMessage = {
      schemaVersion: 'v1',
      messageType: 'my-projects-projection-sync',
      sourceListKind,
      receivedAtUtc,
      debounceBucketUtc,
      notificationBatchId,
      subscriptionId: firstSubscriptionId,
      notificationCount: kindNotifications.length,
      correlationId,
    };
    if (!isProjectionSyncMessage(message)) {
      throw new Error(
        'handleProjectionGraphWebhook: constructed sync message failed structural validation.',
      );
    }
    const queueMessageId = buildProjectionSyncMessageId(sourceListKind, debounceBucketUtc);
    const outcome = await deps.messageSender.sendSyncMessage(message);
    if (outcome.acknowledged) {
      deps.logger.trackEvent('myProjectsProjection.notification.queue.accepted', {
        correlationId,
        sourceListKind,
        subscriptionId: firstSubscriptionId,
        debounceBucketUtc,
        queueMessageId: outcome.messageId,
        notificationBatchId,
        notificationCount: kindNotifications.length,
      });
      if (outcome.duplicateDetected === true) {
        deps.logger.trackEvent('myProjectsProjection.notification.duplicate.bucketed', {
          correlationId,
          sourceListKind,
          debounceBucketUtc,
          queueMessageId: outcome.messageId,
        });
      }
    } else {
      sendFailures.push({
        sourceListKind,
        failureCode: outcome.failureCode,
        sanitizedReason: outcome.sanitizedReason,
      });
      deps.logger.trackEvent('myProjectsProjection.notification.queue.failed', {
        correlationId,
        sourceListKind,
        subscriptionId: firstSubscriptionId,
        debounceBucketUtc,
        queueMessageId,
        notificationBatchId,
        failureCode: outcome.failureCode,
        sanitizedReason: outcome.sanitizedReason,
      });
    }
  }

  if (sendFailures.length > 0) {
    return errorResponse(
      503,
      'QUEUE_SEND_FAILED',
      'One or more projection sync messages could not be enqueued.',
      correlationId,
      {
        failedSourceListKinds: sendFailures.map((entry) => entry.sourceListKind),
        failureCodes: sendFailures.map((entry) => entry.failureCode),
      },
    );
  }

  return successResponse(
    {
      accepted: true,
      sourceListKinds,
      notificationBatchIds: batchIds,
      debounceBucketUtc,
    },
    202,
  );
}
