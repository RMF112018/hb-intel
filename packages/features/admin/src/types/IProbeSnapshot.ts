import type { IInfrastructureProbeResult } from './IInfrastructureProbeResult.js';

/**
 * A point-in-time snapshot containing all probe results.
 *
 * @design D-04
 */
export interface IProbeSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: string;
  readonly results: readonly IInfrastructureProbeResult[];
}
