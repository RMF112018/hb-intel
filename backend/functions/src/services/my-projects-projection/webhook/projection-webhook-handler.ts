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

export interface IProjectionSubscriptionStateLister {
  list(): Promise<IProjectionSubscriptionEntity[]>;
}

export interface IProjectionWebhookHandlerDeps {
  readonly subscriptionStateRepository: IProjectionSubscriptionStateLister;
  readonly pendingWorkRepository: {
    upsertDebounced(args: {
      workKey: string;
      sourceListKind: SourceListKind;
      debounceBucketUtc: string;
      notificationBatchId: string;
      subscriptionId?: string | null;
      correlationId?: string | null;
      nowUtc: string;
    }): Promise<void>;
  };
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
  if (typeof fromQuery === 'string' && fromQuery.length > 0) return fromQuery;
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
    deps.logger.trackEvent('myProjectsProjection.notification.validation.request', { correlationId });
    const decoded = decodeURIComponent(validationToken);
    deps.logger.trackEvent('myProjectsProjection.notification.validation.success', {
      correlationId,
      durationMs: deps.now().getTime() - startMs,
    });
    return { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: decoded };
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
    return successResponse({ accepted: true, sourceListKinds: [] as SourceListKind[], notificationBatchIds: [] as string[] }, 202);
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
  const grouped = groupNotificationsBySourceKind({ notifications, subscriptionState });

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
    return successResponse({ accepted: true, sourceListKinds, notificationBatchIds: [] as string[] }, 202);
  }

  const receivedAtUtc = deps.now().toISOString();
  const debounceBucketUtc = computeDebounceBucketUtc(deps.now(), deps.debounceWindowSeconds);
  const batchIds: string[] = [];
  const upsertFailures: SourceListKind[] = [];

  for (const [sourceListKind, kindNotifications] of grouped.accepted) {
    const notificationBatchId = deps.notificationBatchIdProvider?.() ?? randomUUID();
    batchIds.push(notificationBatchId);
    const firstSubscriptionId =
      typeof kindNotifications[0]?.subscriptionId === 'string' ? kindNotifications[0].subscriptionId : null;
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
      throw new Error('handleProjectionGraphWebhook: constructed sync message failed structural validation.');
    }
    const workKey = buildProjectionSyncMessageId(sourceListKind, debounceBucketUtc);
    try {
      await deps.pendingWorkRepository.upsertDebounced({
        workKey,
        sourceListKind,
        debounceBucketUtc,
        notificationBatchId,
        subscriptionId: firstSubscriptionId,
        correlationId,
        nowUtc: receivedAtUtc,
      });

      deps.logger.trackEvent('myProjectsProjection.notification.queue.accepted', {
        correlationId,
        sourceListKind,
        subscriptionId: firstSubscriptionId,
        debounceBucketUtc,
        queueMessageId: workKey,
        notificationBatchId,
        notificationCount: kindNotifications.length,
      });
      if (kindNotifications.length > 1) {
        deps.logger.trackEvent('myProjectsProjection.notification.duplicate.bucketed', {
          correlationId,
          sourceListKind,
          debounceBucketUtc,
          queueMessageId: workKey,
        });
      }
    } catch (err: unknown) {
      upsertFailures.push(sourceListKind);
      deps.logger.trackEvent('myProjectsProjection.notification.queue.failed', {
        correlationId,
        sourceListKind,
        debounceBucketUtc,
        queueMessageId: workKey,
        notificationBatchId,
        failureCode: 'pending-work-upsert-failed',
        sanitizedReason: err instanceof Error ? err.message.slice(0, 240) : String(err).slice(0, 240),
      });
    }
  }

  if (upsertFailures.length > 0) {
    return errorResponse(
      503,
      'QUEUE_SEND_FAILED',
      'One or more projection sync messages could not be enqueued.',
      correlationId,
      { failedSourceListKinds: upsertFailures },
    );
  }

  return successResponse({ accepted: true, sourceListKinds, notificationBatchIds: batchIds, debounceBucketUtc }, 202);
}
