import type { UseAdminAlertsResult } from '../types/UseAdminAlertsResult.js';

/**
 * Hook for accessing admin alerts from the monitoring layer.
 *
 * @placeholder SF17-T02 contract — implementation in SF17-T04
 */
export function useAdminAlerts(): UseAdminAlertsResult {
  return {
    alerts: [],
    filteredAlerts: () => [],
    badge: { criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, totalCount: 0 },
    acknowledge: async () => {},
    refresh: async () => {},
    isLoading: false,
    error: null,
  };
}
