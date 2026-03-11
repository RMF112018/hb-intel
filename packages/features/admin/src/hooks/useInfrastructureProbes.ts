import { useCallback, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseInfrastructureProbesResult } from '../types/UseInfrastructureProbesResult.js';
import { InfrastructureProbeApi } from '../api/InfrastructureProbeApi.js';
import { INFRA_PROBES_QUERY_KEY } from '../constants/index.js';
import { buildProbeStatusMap } from './helpers.js';

const api = new InfrastructureProbeApi();

/**
 * Hook for accessing infrastructure probe snapshots.
 *
 * @design D-04, SF17-T04
 */
export function useInfrastructureProbes(): UseInfrastructureProbesResult {
  const queryClient = useQueryClient();
  const capturedAtRef = useRef<string | null>(null);

  const { data: latestSnapshot = null, isLoading, error } = useQuery({
    queryKey: [...INFRA_PROBES_QUERY_KEY],
    queryFn: async () => {
      const snapshot = await api.getLatestSnapshot();
      // Monotonic guard: skip stale snapshots
      if (
        snapshot &&
        capturedAtRef.current &&
        snapshot.capturedAt < capturedAtRef.current
      ) {
        return null;
      }
      if (snapshot) {
        capturedAtRef.current = snapshot.capturedAt;
      }
      return snapshot;
    },
  });

  const runNowMutation = useMutation({
    mutationFn: () => api.runNow(),
    onSuccess: (snapshot) => {
      if (snapshot) {
        capturedAtRef.current = snapshot.capturedAt;
      }
      void queryClient.invalidateQueries({ queryKey: [...INFRA_PROBES_QUERY_KEY] });
    },
  });

  const probeStatusMap = useMemo(
    () => buildProbeStatusMap(latestSnapshot?.results ?? []),
    [latestSnapshot],
  );

  const refresh = useCallback(async () => {
    await runNowMutation.mutateAsync();
  }, [runNowMutation]);

  const lastRunAt = latestSnapshot?.capturedAt ?? null;

  return {
    latestSnapshot,
    probeStatusMap,
    refresh,
    lastRunAt,
    isLoading,
    error: error as Error | null,
  };
}
