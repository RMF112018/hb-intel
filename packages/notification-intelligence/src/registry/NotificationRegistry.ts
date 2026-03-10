// Placeholder stub — populated by T03
import type { INotificationRegistration } from '../types';

/** Singleton notification event type registry */
export const NotificationRegistry = {
  register(_registrations: readonly INotificationRegistration[]): void {
    // T03 implementation
  },
  getAll(): readonly INotificationRegistration[] {
    return [];
  },
  getByEventType(_eventType: string): INotificationRegistration | undefined {
    return undefined;
  },
};
