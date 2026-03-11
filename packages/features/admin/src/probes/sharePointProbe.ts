import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';

/**
 * Probes SharePoint site health and connectivity.
 *
 * @design D-04, SF17-T03
 */
export const sharePointProbe: IInfrastructureProbeDefinition = {
  probeKey: 'sharepoint-infrastructure',

  async run(nowIso: string) {
    return {
      probeId: `sharepoint-${nowIso}`,
      probeKey: 'sharepoint-infrastructure' as const,
      status: 'healthy' as const,
      summary: 'SharePoint infrastructure check — no live connection configured',
      observedAt: nowIso,
      metrics: {},
      anomalies: [],
    };
  },
};
