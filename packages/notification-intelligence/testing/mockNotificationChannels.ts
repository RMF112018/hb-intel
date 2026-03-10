import type { NotificationChannel } from '../src/types';

/** All valid notification channels for test assertions */
export const mockNotificationChannels: readonly NotificationChannel[] = ['push', 'email', 'in-app', 'digest-email'] as const;
