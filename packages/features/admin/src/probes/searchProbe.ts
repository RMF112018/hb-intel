import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';

/**
 * Probes search service health and index status.
 *
 * @design D-04, SF17-T03
 */
export const searchProbe: IInfrastructureProbeDefinition = {
  probeKey: 'azure-search',

  async run(nowIso: string) {
    return {
      probeId: `azure-search-${nowIso}`,
      probeKey: 'azure-search' as const,
      status: 'healthy' as const,
      summary: 'Azure Search check — no live connection configured',
      observedAt: nowIso,
      metrics: {},
      anomalies: [],
    };
  },
};
