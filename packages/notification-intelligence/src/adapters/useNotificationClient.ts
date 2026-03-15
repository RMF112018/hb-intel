/**
 * useNotificationClient — compatibility adapter for @hbc/step-wizard
 *
 * Provides an imperative registerEvent() interface that wraps
 * NotificationApi.send() for step-wizard overdue notifications.
 */
import { useMemo } from 'react';
import { NotificationApi } from '../api/NotificationApi';

export interface INotificationClientEvent {
  tier: string;
  type: string;
  moduleKey: string;
  assigneeUserId?: string;
}

export interface INotificationClient {
  registerEvent(event: INotificationClientEvent): void;
}

export function useNotificationClient(): INotificationClient {
  return useMemo(
    () => ({
      registerEvent(event: INotificationClientEvent): void {
        if (!event.assigneeUserId) return; // No recipient — skip silently

        void NotificationApi.send({
          eventType: event.type,
          sourceModule: event.moduleKey.split(':')[0] ?? 'unknown',
          sourceRecordType: 'step-wizard',
          sourceRecordId: event.moduleKey,
          recipientUserId: event.assigneeUserId,
          title: `Step overdue: ${event.type}`,
          body: `A step in ${event.moduleKey} is past its due date.`,
          actionUrl: '',
        }).catch(() => {
          // Never throw — notification failure must not break the wizard
        });
      },
    }),
    [],
  );
}
