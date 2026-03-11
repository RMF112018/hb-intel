import type { IProbeSnapshot } from '../types/IProbeSnapshot.js';

/**
 * API client for infrastructure probe snapshot retrieval.
 *
 * @design D-04, SF17-T03
 */
export class InfrastructureProbeApi {
  async getLatestSnapshot(): Promise<IProbeSnapshot | null> {
    return null;
  }

  async listSnapshots(_range?: {
    from: string;
    to: string;
  }): Promise<IProbeSnapshot[]> {
    return [];
  }

  async runNow(): Promise<IProbeSnapshot> {
    return {
      snapshotId: `on-demand-${new Date().toISOString()}`,
      capturedAt: new Date().toISOString(),
      results: [],
    };
  }
}
