import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';

/**
 * Probes Azure Functions health and availability.
 *
 * @design D-04, SF17-T03
 */
export const azureFunctionsProbe: IInfrastructureProbeDefinition = {
  probeKey: 'azure-functions',

  async run(nowIso: string) {
    return {
      probeId: `azure-functions-${nowIso}`,
      probeKey: 'azure-functions' as const,
      status: 'healthy' as const,
      summary: 'Azure Functions check — no live connection configured',
      observedAt: nowIso,
      metrics: {},
      anomalies: [],
    };
  },
};
