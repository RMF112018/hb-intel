/**
 * useNotificationCenter — SF10-T05
 *
 * Paginated notification center items with tier filtering.
 * Uses TanStack Query v5 useInfiniteQuery for cursor-based pagination.
 *
 * @param filter Optional filter: tier, unreadOnly, pageSize
 */

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { NotificationApi } from '../api/NotificationApi';
import type {
  INotificationCenterFilter,
  INotificationCenterResult,
  NotificationTier,
} from '../types/INotification';
import { notificationKeys } from './queryKeys';

export function useNotificationCenter(
  filter: Omit<INotificationCenterFilter, 'cursor'> = {}
) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: notificationKeys.center(filter),
    queryFn: ({ pageParam }) =>
      NotificationApi.getCenter({ ...filter, cursor: pageParam ?? undefined }),
    getNextPageParam: (lastPage: INotificationCenterResult) =>
      lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
  });

  const markReadMutation = useMutation({
    mutationFn: NotificationApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: NotificationApi.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: (tier: NotificationTier | 'all') =>
      NotificationApi.markAllRead(tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // Flatten pages into a single items array
  const items =
    query.data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = query.data?.pages[0]?.totalCount ?? 0;
  const immediateUnreadCount =
    query.data?.pages[0]?.immediateUnreadCount ?? 0;

  return {
    items,
    totalCount,
    immediateUnreadCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    markRead: markReadMutation.mutate,
    dismiss: dismissMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
}
