import { useQuery } from '@tanstack/react-query';
import type { IBicMyItemsResult, IBicRegisteredItem } from '../types/IBicNextMove';
import {
  BIC_AGGREGATION_MODE,
  BIC_STALE_TIME_MY_ITEMS_MS,
} from '../constants/manifest';
import { executeBicFanOut, executeServerAggregation } from '../registry/BicModuleRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseBicMyItemsOptions {
  /** Azure AD user object ID of the authenticated user */
  userId: string;
  /**
   * Filter results to a specific module key, e.g. 'bd-scorecard'.
   * When absent, returns items from all registered modules.
   */
  moduleKey?: string;
  /**
   * Filter results to a specific urgency tier.
   * When absent, returns items of all urgency tiers.
   */
  urgencyTier?: 'immediate' | 'watch' | 'upcoming';
  /**
   * Polling interval override in milliseconds (D-07).
   * Pass BIC_REFETCH_INTERVAL_IMMEDIATE_MS (45_000) for My Work Feed rows
   * that display 'immediate'-tier items and require near-real-time freshness.
   * When absent, standard 3-minute staleness applies.
   */
  refetchInterval?: number | false;
  /**
   * When false, hook does not execute. Useful for authenticated-only surfaces.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Returns all actionable items across registered modules where the given user
 * is the current BIC owner.
 *
 * Aggregation: client-side fan-out via Promise.allSettled (BIC_AGGREGATION_MODE = 'client').
 * Failed modules are reported in result.failedModules — they do not fail the hook.
 *
 * Stale time: 3 minutes + refetch on window focus (D-07).
 * For 'immediate'-tier feeds, pass refetchInterval: BIC_REFETCH_INTERVAL_IMMEDIATE_MS.
 *
 * See docs/how-to/developer/bic-server-aggregation-migration.md for future
 * migration to server-side aggregation (BIC_AGGREGATION_MODE = 'server').
 *
 * @example — My Work Feed usage
 * const { items, failedModules, isLoading } = useBicMyItems({
 *   userId: authenticatedUser.id,
 *   refetchInterval: BIC_REFETCH_INTERVAL_IMMEDIATE_MS,
 * });
 *
 * @example — Project Canvas widget (project-scoped)
 * const { items } = useBicMyItems({
 *   userId: authenticatedUser.id,
 *   moduleKey: 'project-hub-constraints',
 * });
 */
export function useBicMyItems(options: UseBicMyItemsOptions): IBicMyItemsResult {
  const {
    userId,
    moduleKey,
    urgencyTier,
    refetchInterval = false,
    enabled = true,
  } = options;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['bic-my-items', userId, moduleKey ?? 'all', urgencyTier ?? 'all'],
    queryFn: async () => {
      // Route through BIC_AGGREGATION_MODE flag (D-06)
      /* c8 ignore next 3 -- server aggregation not yet implemented; env var required */
      if (BIC_AGGREGATION_MODE === 'server') {
        return executeServerAggregation(userId);
      }
      return executeBicFanOut(userId);
    },
    staleTime: BIC_STALE_TIME_MY_ITEMS_MS,
    refetchOnWindowFocus: true,
    refetchInterval,
    enabled: enabled && !!userId,
  });

  // Apply client-side filters (moduleKey, urgencyTier)
  const rawItems: IBicRegisteredItem[] = data?.items ?? [];
  const failedModules: string[] = data?.failedModules ?? [];

  const items = rawItems.filter((item) => {
    if (moduleKey && item.moduleKey !== moduleKey) return false;
    if (urgencyTier && item.state.urgencyTier !== urgencyTier) return false;
    return true;
  });

  return {
    items,
    failedModules,
    isLoading,
    isError,
    refetch,
  };
}
