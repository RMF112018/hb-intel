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
