import { useCallback, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@hbc/auth';
import type { UseAdminAlertsResult } from '../types/UseAdminAlertsResult.js';
import type { IAdminAlertBadge } from '../types/IAdminAlertBadge.js';
import type { AlertCategory } from '../types/AlertCategory.js';
import { AdminAlertsApi } from '../api/AdminAlertsApi.js';
import { ADMIN_ALERTS_POLL_MS, ADMIN_ALERTS_QUERY_KEY } from '../constants/index.js';
import { computeAlertBadge } from './helpers.js';

const api = new AdminAlertsApi();

/**
 * Hook for accessing admin alerts from the monitoring layer.
 *
 * @design D-02, D-03, D-07, SF17-T04
 */
export function useAdminAlerts(): UseAdminAlertsResult {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const prevBadgeRef = useRef<IAdminAlertBadge | undefined>(undefined);

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: [...ADMIN_ALERTS_QUERY_KEY],
    queryFn: () => api.listActive(),
    refetchInterval: ADMIN_ALERTS_POLL_MS,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) =>
      api.acknowledge(alertId, currentUser?.id ?? 'unknown'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...ADMIN_ALERTS_QUERY_KEY] });
    },
  });

  const filteredAlerts = useCallback(
    (category: AlertCategory) => alerts.filter((a) => a.category === category),
    [alerts],
  );

  const badge = useMemo(() => {
    const next = computeAlertBadge(alerts, prevBadgeRef.current);
    prevBadgeRef.current = next;
    return next;
  }, [alerts]);

  const acknowledge = useCallback(
    async (alertId: string) => {
      await acknowledgeMutation.mutateAsync(alertId);
    },
    [acknowledgeMutation],
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [...ADMIN_ALERTS_QUERY_KEY] });
  }, [queryClient]);

  return {
    alerts,
    filteredAlerts,
    badge,
    acknowledge,
    refresh,
    isLoading,
    error: error as Error | null,
  };
}
