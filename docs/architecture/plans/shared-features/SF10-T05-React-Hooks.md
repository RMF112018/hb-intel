# SF10-T05 — React Hooks: `@hbc/notification-intelligence`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-02 (tier model), D-03 (Immediate-only badge count), D-06 (preferences digest schedule)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T04 (API layer; hooks wrap API calls with TanStack Query)

> **Doc Classification:** Canonical Normative Plan — SF10-T05 hooks task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement three React hooks using TanStack Query v5: `useNotificationCenter` (paginated center items with tier filtering), `useNotificationBadge` (Immediate unread count with polling), and `useNotificationPreferences` (user preferences get/update). Each hook wraps the corresponding API method and exposes loading/error state.

---

## 3-Line Plan

1. Implement `useNotificationCenter` with `useInfiniteQuery` for pagination and tier filtering; expose `markRead`, `dismiss`, and `markAllRead` mutations.
2. Implement `useNotificationBadge` with `useQuery` polling every 60 seconds for Immediate unread count.
3. Implement `useNotificationPreferences` with `useQuery` + `useMutation`; expose `updatePreferences` with optimistic update.

---

## Query Key Convention

```typescript
// Stable query key factory — all notification queries use this namespace
export const notificationKeys = {
  all: ['notifications'] as const,
  center: (filter: INotificationCenterFilter) => ['notifications', 'center', filter] as const,
  badge: () => ['notifications', 'badge'] as const,
  preferences: () => ['notifications', 'preferences'] as const,
} as const;
```

---

## `src/hooks/useNotificationCenter.ts`

```typescript
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
  type InfiniteData,
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
```

---

## `src/hooks/useNotificationBadge.ts`

```typescript
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
```

---

## `src/hooks/useNotificationPreferences.ts`

```typescript
/**
 * useNotificationPreferences — SF10-T05
 *
 * Get and update notification preferences for the current user.
 * Uses optimistic update on save to avoid latency on preference toggle.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { PreferencesApi } from '../api/PreferencesApi';
import type { INotificationPreferences } from '../types/INotification';
import { notificationKeys } from './queryKeys';

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: PreferencesApi.getPreferences,
    staleTime: 5 * 60_000, // 5 minutes — preferences change infrequently
  });

  const updateMutation = useMutation({
    mutationFn: PreferencesApi.updatePreferences,
    onMutate: async (updates) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.preferences(),
      });
      const previous = queryClient.getQueryData<INotificationPreferences>(
        notificationKeys.preferences()
      );
      // Optimistic update
      if (previous) {
        queryClient.setQueryData(notificationKeys.preferences(), {
          ...previous,
          ...updates,
          tierOverrides: {
            ...previous.tierOverrides,
            ...updates.tierOverrides,
          },
        });
      }
      return { previous };
    },
    onError: (_err, _updates, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.preferences(),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
```

---

## `src/hooks/queryKeys.ts` (shared key factory)

```typescript
import type { INotificationCenterFilter } from '../types/INotification';

export const notificationKeys = {
  all: ['notifications'] as const,
  center: (filter: INotificationCenterFilter) =>
    ['notifications', 'center', filter] as const,
  badge: () => ['notifications', 'badge'] as const,
  preferences: () => ['notifications', 'preferences'] as const,
} as const;
```

Add `queryKeys.ts` to `src/hooks/index.ts`:

```typescript
// src/hooks/index.ts (update)
export { useNotificationCenter } from './useNotificationCenter';
export { useNotificationPreferences } from './useNotificationPreferences';
export { useNotificationBadge } from './useNotificationBadge';
export { notificationKeys } from './queryKeys';
```

---

## Verification Commands

```bash
# Type-check all hooks
pnpm --filter @hbc/notification-intelligence check-types

# Run hook unit tests (written in T09)
pnpm --filter @hbc/notification-intelligence test

# Confirm all three hooks are exported from the package barrel
node -e "
const pkg = require('./packages/notification-intelligence/dist/index.js');
['useNotificationCenter','useNotificationBadge','useNotificationPreferences']
  .forEach(k => console.log(k + ':', typeof pkg[k]));
"
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T05 not yet started.
Next: SF10-T06 (Core Components — HbcNotificationCenter + HbcNotificationBadge)
-->
