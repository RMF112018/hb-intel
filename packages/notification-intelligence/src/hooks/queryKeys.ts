import type { INotificationCenterFilter } from '../types/INotification';

export const notificationKeys = {
  all: ['notifications'] as const,
  center: (filter: INotificationCenterFilter) =>
    ['notifications', 'center', filter] as const,
  badge: () => ['notifications', 'badge'] as const,
  preferences: () => ['notifications', 'preferences'] as const,
} as const;
