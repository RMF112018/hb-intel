/**
 * useNotificationBadge — SF10-T05
 *
 * Returns the Immediate-tier unread count for the header badge.
 * Polls every 60 seconds for real-time updates (D-03).
 *
 * Badge count is Immediate-only — not total unread — to avoid the
 * "notification fatigue irony" of a badge that counts noise.
 */

import { useQuery } from '@tanstack/react-query';
import { NotificationApi } from '../api/NotificationApi';
import { notificationKeys } from './queryKeys';

const BADGE_POLL_INTERVAL_MS = 60_000; // 60 seconds

export function useNotificationBadge() {
  const query = useQuery({
    queryKey: notificationKeys.badge(),
    queryFn: () =>
      NotificationApi.getCenter({
        tier: 'immediate',
        unreadOnly: true,
        pageSize: 1, // We only need the count; items themselves are loaded by useNotificationCenter
      }),
    refetchInterval: BADGE_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false, // Pause polling when tab is not focused
    staleTime: 30_000, // 30 seconds
  });

  const immediateUnreadCount = query.data?.immediateUnreadCount ?? 0;

  return {
    immediateUnreadCount,
    hasImmediateUnread: immediateUnreadCount > 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}
