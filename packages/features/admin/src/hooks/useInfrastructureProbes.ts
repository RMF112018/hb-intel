import type { UseInfrastructureProbesResult } from '../types/UseInfrastructureProbesResult.js';

/**
 * Hook for accessing infrastructure probe snapshots.
 *
 * @placeholder SF17-T02 contract — implementation in SF17-T04
 */
export function useInfrastructureProbes(): UseInfrastructureProbesResult {
  return {
    latestSnapshot: null,
    probeStatusMap: new Map(),
    refresh: async () => {},
    lastRunAt: null,
    isLoading: false,
    error: null,
  };
}
