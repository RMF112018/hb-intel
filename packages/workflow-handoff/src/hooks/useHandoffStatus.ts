import { useQuery } from '@tanstack/react-query';
import { HandoffApi } from '../api/HandoffApi';
import type { IUseHandoffStatusResult } from '../types/IWorkflowHandoff';
import {
  HANDOFF_STATUS_STALE_TIME_MS,
  HANDOFF_STATUS_REFETCH_INTERVAL_MS,
} from '../constants/handoffDefaults';
import { handoffQueryKeys } from './handoffQueryKeys';

/**
 * Tracks the status of a specific outbound handoff package.
 *
 * Primary consumers:
 * - `HbcHandoffStatusBadge` — renders current status on the source record
 * - Sender detail views — shows "Awaiting Acknowledgment" status with recipient info
 *
 * Active polling: when status is `sent` or `received`, refetches every 30 seconds
 * to surface acknowledgment or rejection promptly. Polling stops when the package
 * reaches a terminal state (`acknowledged` or `rejected`).
 *
 * @param handoffId - The handoff package ID; null to skip the query
 */
export function useHandoffStatus<TSource = unknown, TDest = unknown>(
  handoffId: string | null
): IUseHandoffStatusResult<TSource, TDest> {
  const isTerminal = (status: string | null) =>
    status === 'acknowledged' || status === 'rejected';

  const query = useQuery({
    queryKey: handoffQueryKeys.package(handoffId ?? ''),
    queryFn: () => HandoffApi.get<TSource, TDest>(handoffId!),
    staleTime: HANDOFF_STATUS_STALE_TIME_MS,
    enabled: handoffId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status ?? null;
      // Poll actively when waiting for recipient action; stop when terminal (D-02)
      if (!isTerminal(status) && (status === 'sent' || status === 'received')) {
        return HANDOFF_STATUS_REFETCH_INTERVAL_MS;
      }
      return false;
    },
  });

  return {
    package: query.data ?? null,
    status: query.data?.status ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
