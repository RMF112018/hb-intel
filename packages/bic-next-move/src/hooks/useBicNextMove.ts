import { useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { IBicNextMoveConfig, IBicNextMoveState, IBicOwner } from '../types/IBicNextMove';
import { computeUrgencyTier, computeIsOverdue } from '../constants/urgencyThresholds';
import { BIC_STALE_TIME_SINGLE_ITEM_MS } from '../constants/manifest';
import { recordBicTransfer } from '../transfer/recordBicTransfer';

// ─────────────────────────────────────────────────────────────────────────────
// Pure state resolver (also exported for module queryFn use in T03)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves a complete IBicNextMoveState from a config + item snapshot.
 * Pure function — no side effects. Safe to call in queryFn implementations.
 *
 * Rules applied:
 * - D-01: urgency tier computed via computeUrgencyTier with per-config threshold overrides
 * - D-04: null currentOwner forces urgencyTier to 'immediate'
 * - D-08: transferHistory resolved from optional config.resolveTransferHistory
 */
export function resolveFullBicState<T>(
  item: T,
  config: IBicNextMoveConfig<T>
): IBicNextMoveState {
  const currentOwner = config.resolveCurrentOwner(item);
  const dueDate = config.resolveDueDate(item);
  const isBlocked = config.resolveIsBlocked(item);
  const transferHistory = config.resolveTransferHistory
    ? config.resolveTransferHistory(item)
    : [];

  // D-01: Compute urgency with per-config threshold overrides
  let urgencyTier = computeUrgencyTier(dueDate, config.urgencyThresholds);

  // D-04: Null owner always forces 'immediate' urgency regardless of due date
  if (currentOwner === null) {
    urgencyTier = 'immediate';
  }

  return {
    currentOwner,
    expectedAction: config.resolveExpectedAction(item),
    dueDate,
    isOverdue: computeIsOverdue(dueDate),
    isBlocked,
    blockedReason: isBlocked ? config.resolveBlockedReason(item) : null,
    previousOwner: config.resolvePreviousOwner(item),
    nextOwner: config.resolveNextOwner(item),
    escalationOwner: config.resolveEscalationOwner(item),
    transferHistory,
    urgencyTier,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseBicNextMoveOptions {
  /**
   * Unique key for this item instance, e.g. "bd-scorecard::a1b2c3".
   * Used as the TanStack Query cache key and as the deduplication key for transfers.
   */
  itemKey: string;
  /**
   * When true, hook performs background refetches on the standard stale schedule.
   * Set to false for items that are not currently visible to the user.
   * @default true
   */
  enabled?: boolean;
}

export interface UseBicNextMoveResult {
  state: IBicNextMoveState | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Resolves and caches BIC state for a single item. Performs hook-level ownership
 * diff detection — fires recordBicTransfer() when currentOwner changes (D-03).
 *
 * Stale time: 60 seconds (BIC_STALE_TIME_SINGLE_ITEM_MS) (D-07).
 *
 * @example
 * const { state } = useBicNextMove(scorecard, scorecardBicConfig, {
 *   itemKey: `bd-scorecard::${scorecard.id}`,
 * });
 */
export function useBicNextMove<T>(
  item: T,
  config: IBicNextMoveConfig<T>,
  options: UseBicNextMoveOptions
): UseBicNextMoveResult {
  const { itemKey, enabled = true } = options;

  // Resolve state synchronously in query function — no async needed since
  // resolution runs entirely from cached item data (no additional API calls).
  const { data: state, isLoading, isError } = useQuery({
    queryKey: ['bic-next-move', itemKey],
    queryFn: () => resolveFullBicState(item, config),
    staleTime: BIC_STALE_TIME_SINGLE_ITEM_MS,
    enabled,
    // Re-resolve whenever item reference changes (upstream query invalidation)
    // by using item as part of the query key is intentionally avoided —
    // instead, the upstream module invalidates this query when it refreshes its data.
  });

  // ── D-03: Hook-level transfer diff detection ──────────────────────────────
  const previousOwnerRef = useRef<IBicOwner | null | undefined>(undefined);

  useEffect(() => {
    if (!state) return;

    const previousUserId = previousOwnerRef.current?.userId ?? null;
    const currentUserId = state.currentOwner?.userId ?? null;

    // Skip on first mount (undefined → first value is not a transfer)
    if (previousOwnerRef.current === undefined) {
      previousOwnerRef.current = state.currentOwner;
      return;
    }

    // Only fire if userId actually changed
    if (previousUserId !== currentUserId) {
      recordBicTransfer({
        itemKey,
        fromOwner: previousOwnerRef.current,
        toOwner: state.currentOwner,
        action: state.expectedAction,
      });
    }

    previousOwnerRef.current = state.currentOwner;
  }, [state?.currentOwner?.userId, itemKey]);
  // Note: state?.currentOwner?.userId is the precise dep — avoids firing on
  // unrelated state changes (dueDate updates, blockedReason changes, etc.)

  return { state, isLoading, isError };
}
