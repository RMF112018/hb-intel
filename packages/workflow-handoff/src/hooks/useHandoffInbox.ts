import { useQuery } from '@tanstack/react-query';
import { HandoffApi } from '../api/HandoffApi';
import type { IUseHandoffInboxResult } from '../types/IWorkflowHandoff';
import { HANDOFF_INBOX_STALE_TIME_MS } from '../constants/handoffDefaults';
import { handoffQueryKeys } from './handoffQueryKeys';

/**
 * Returns all pending handoff packages for the current user (as recipient).
 *
 * Primary consumers:
 * - My Work Feed (PH9b §A) — surfaces pending handoffs as high-priority items
 * - Navigation badges — shows pending handoff count in the app shell
 * - HbcHandoffReceiver — loaded when user opens a specific handoff from the inbox
 *
 * Returns only `sent` and `received` status packages (active inbox only).
 *
 * @param enabled - Set false when user is not authenticated or context is not ready
 */
export function useHandoffInbox<TSource = unknown, TDest = unknown>(
  enabled = true
): IUseHandoffInboxResult<TSource, TDest> {
  const query = useQuery({
    queryKey: handoffQueryKeys.inbox(),
    queryFn: () => HandoffApi.inbox<TSource, TDest>(),
    staleTime: HANDOFF_INBOX_STALE_TIME_MS,
    enabled,
  });

  const pending = query.data ?? [];

  return {
    pending,
    pendingCount: pending.length,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
