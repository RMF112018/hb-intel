import type { NotificationTier } from '@hbc/notification-intelligence';
import type {
  IStrategicIntelligenceApprovalQueueItem,
  IStrategicIntelligenceEntry,
} from '@hbc/strategic-intelligence';

export interface IBdStrategicIntelligenceNotificationProjection {
  eventType: string;
  tier: NotificationTier;
  title: string;
  body: string;
  entryId?: string;
}

const hasOpenConflict = (entry: IStrategicIntelligenceEntry): boolean =>
  entry.conflicts.some((conflict) => conflict.resolutionStatus === 'open');

export const resolveStrategicIntelligenceNotifications = (
  entries: readonly IStrategicIntelligenceEntry[],
  queue: readonly IStrategicIntelligenceApprovalQueueItem[]
): IBdStrategicIntelligenceNotificationProjection[] => {
  const notifications: IBdStrategicIntelligenceNotificationProjection[] = [];

  for (const item of queue) {
    if (item.approvalStatus !== 'pending') {
      continue;
    }

    notifications.push({
      eventType: 'strategic-intelligence.pending-approval',
      tier: 'watch',
      title: 'Strategic intelligence entry pending approval',
      body: 'A submitted strategic intelligence entry is waiting for approver action.',
      entryId: item.entryId,
    });
  }

  for (const entry of entries) {
    if (entry.trust.isStale) {
      notifications.push({
        eventType: 'strategic-intelligence.review-due',
        tier: 'digest',
        title: 'Strategic intelligence review due',
        body: 'A strategic intelligence entry is marked stale and needs review.',
        entryId: entry.entryId,
      });
    }

    if (hasOpenConflict(entry)) {
      notifications.push({
        eventType: 'strategic-intelligence.conflict-escalation',
        tier: 'immediate',
        title: 'Open strategic intelligence conflict',
        body: 'A contradiction or supersession conflict is unresolved and requires attention.',
        entryId: entry.entryId,
      });
    }
  }

  return notifications;
};
