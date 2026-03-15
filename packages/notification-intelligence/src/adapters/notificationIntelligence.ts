/**
 * notificationIntelligence — compatibility adapter for @hbc/bic-next-move
 *
 * Provides an imperative registerEvent() singleton that wraps
 * NotificationApi.send() for BIC transfer notifications.
 */
import { NotificationApi } from '../api/NotificationApi';

export interface IBicNotificationEvent {
  tier: string;
  type: string;
  itemKey: string;
  recipientUserId: string;
  title: string;
  body: string;
  href?: string;
}

export const notificationIntelligence = {
  registerEvent(event: IBicNotificationEvent): void {
    const [moduleKey] = event.itemKey.split('::');

    void NotificationApi.send({
      eventType: event.type,
      sourceModule: moduleKey ?? 'unknown',
      sourceRecordType: moduleKey ?? 'unknown',
      sourceRecordId: event.itemKey,
      recipientUserId: event.recipientUserId,
      title: event.title,
      body: event.body,
      actionUrl: event.href ?? '',
    }).catch(() => {
      // Never throw — notification failure must not break the workflow
    });
  },
} as const;
