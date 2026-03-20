/**
 * useHubFeedRefresh — P2-B2 §7.2.
 * Invalidates all my-work TanStack Query entries so the feed refetches
 * on return from a domain surface, reflecting any mutations made there.
 */
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { myWorkKeys } from '@hbc/my-work-feed';
import { useCurrentUser } from '@hbc/auth';

export function useHubFeedRefresh() {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();

  const refreshFeed = useCallback(() => {
    if (!currentUser) return;
    void queryClient.invalidateQueries({
      queryKey: myWorkKeys.all(currentUser.id),
    });
  }, [queryClient, currentUser]);

  return { refreshFeed };
}
