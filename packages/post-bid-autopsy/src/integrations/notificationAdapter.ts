import type { IAutopsyEscalationEvent, IAutopsyNotificationPayload, IAutopsyRecordSnapshot } from '../types/index.js';
import {
  createAutopsyIntegrationDedupeKey,
  createAutopsyPublishEnvelope,
  createAutopsyReasonCodes,
  isAutopsyPublishEligible,
} from './helpers.js';

export interface IAutopsyNotificationProjection {
  readonly dedupeKey: string;
  readonly type:
    | 'trigger'
    | 'overdue-escalation'
    | 'disagreement-escalation'
    | 'publication-reminder'
    | 'revalidation-reminder';
  readonly recipientUserId: string;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
  readonly publishEnvelope: ReturnType<typeof createAutopsyPublishEnvelope>;
}

const mapRuntimeNotification = (
  record: IAutopsyRecordSnapshot,
  notification: IAutopsyNotificationPayload
): IAutopsyNotificationProjection => ({
  dedupeKey: createAutopsyIntegrationDedupeKey('notification', record.autopsy.autopsyId, notification.notificationId),
  type:
    notification.type === 'autopsy-created'
      ? 'trigger'
      : notification.type === 'autopsy-overdue'
        ? 'overdue-escalation'
        : 'disagreement-escalation',
  recipientUserId: notification.recipientUserId,
  title: notification.title,
  body: notification.message,
  createdAt: notification.createdAt,
  publishEnvelope: createAutopsyPublishEnvelope(record),
});

const mapEscalationEvent = (
  record: IAutopsyRecordSnapshot,
  event: IAutopsyEscalationEvent
): IAutopsyNotificationProjection => ({
  dedupeKey: createAutopsyIntegrationDedupeKey('notification-escalation', record.autopsy.autopsyId, event.escalationId),
  type: event.eventType === 'overdue' ? 'overdue-escalation' : 'disagreement-escalation',
  recipientUserId: event.target.userId,
  title: event.eventType === 'overdue' ? 'Autopsy overdue escalation' : 'Autopsy disagreement escalation',
  body: `${event.reason} (${createAutopsyReasonCodes(record).join(', ') || 'no-reason-codes'})`,
  createdAt: event.createdAt,
  publishEnvelope: createAutopsyPublishEnvelope(record),
});

export const projectAutopsyToNotificationPayloads = (
  record: IAutopsyRecordSnapshot
): readonly IAutopsyNotificationProjection[] => {
  const runtimeNotifications = record.notifications.map((notification) =>
    mapRuntimeNotification(record, notification)
  );
  const escalationNotifications = record.escalationEvents.map((event) => mapEscalationEvent(record, event));

  const reminderNotifications: IAutopsyNotificationProjection[] = [];

  if (isAutopsyPublishEligible(record)) {
    reminderNotifications.push({
      dedupeKey: createAutopsyIntegrationDedupeKey(
        'notification-publication-reminder',
        record.autopsy.autopsyId,
        record.autopsy.status
      ),
      type: 'publication-reminder',
      recipientUserId: record.assignments.primaryAuthor.userId,
      title: 'Publication-ready autopsy',
      body: `Autopsy ${record.autopsy.autopsyId} is ready for downstream publication.`,
      createdAt: record.auditTrail.at(-1)?.occurredAt ?? record.sla.startedAt,
      publishEnvelope: createAutopsyPublishEnvelope(record),
    });
  }

  if (record.autopsy.status === 'published' && record.autopsy.telemetry.staleIntelligenceRate !== null) {
    reminderNotifications.push({
      dedupeKey: createAutopsyIntegrationDedupeKey(
        'notification-revalidation-reminder',
        record.autopsy.autopsyId,
        'stale'
      ),
      type: 'revalidation-reminder',
      recipientUserId: record.assignments.chiefEstimator.userId,
      title: 'Revalidation required',
      body: `Published autopsy ${record.autopsy.autopsyId} requires revalidation before reinsertion.`,
      createdAt: record.auditTrail.at(-1)?.occurredAt ?? record.sla.startedAt,
      publishEnvelope: createAutopsyPublishEnvelope(record),
    });
  }

  return Object.freeze([...runtimeNotifications, ...escalationNotifications, ...reminderNotifications]);
};
