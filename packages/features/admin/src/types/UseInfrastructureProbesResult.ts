import type { IProbeSnapshot } from './IProbeSnapshot.js';
import type { ProbeHealthStatus } from './ProbeHealthStatus.js';

/**
 * Return type for the useInfrastructureProbes hook.
 *
 * @design D-04
 */
export interface UseInfrastructureProbesResult {
  readonly latestSnapshot: IProbeSnapshot | null;
  readonly probeStatusMap: ReadonlyMap<string, ProbeHealthStatus>;
  readonly refresh: () => Promise<void>;
  readonly lastRunAt: string | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}
