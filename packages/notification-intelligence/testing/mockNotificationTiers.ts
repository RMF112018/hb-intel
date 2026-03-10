import type { NotificationTier } from '../src/types';

/** All valid notification tiers for test assertions */
export const mockNotificationTiers: readonly NotificationTier[] = ['immediate', 'watch', 'digest'] as const;
