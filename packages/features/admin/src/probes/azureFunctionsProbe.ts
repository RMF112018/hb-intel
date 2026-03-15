import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';
import type { IInfrastructureProbeResult } from '../types/IInfrastructureProbeResult.js';

/**
 * Configuration for probe network access.
 * @design G6-T06
 */
export interface ProbeConnectionConfig {
  readonly baseUrl: string;
  readonly getToken: () => Promise<string>;
}

/**
 * Creates a configured Azure Functions probe that checks the health endpoint.
 *
 * @design D-04, SF17-T03, G6-T06
 */
export function createAzureFunctionsProbe(
  config: ProbeConnectionConfig,
): IInfrastructureProbeDefinition {
  return {
    probeKey: 'azure-functions',

    async run(nowIso: string) {
      try {
        const token = await config.getToken();
        const start = Date.now();
        const res = await fetch(`${config.baseUrl}/api/health`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const responseTimeMs = Date.now() - start;

        if (res.ok) {
          return {
            probeId: `azure-functions-${nowIso}`,
            probeKey: 'azure-functions' as const,
            status: 'healthy' as const,
            summary: `Azure Functions responding (${res.status})`,
            observedAt: nowIso,
            metrics: { statusCode: res.status, responseTimeMs },
            anomalies: [],
          };
        }

        return {
          probeId: `azure-functions-${nowIso}`,
          probeKey: 'azure-functions' as const,
          status: 'degraded' as const,
          summary: `Azure Functions returned HTTP ${res.status}`,
          observedAt: nowIso,
          metrics: { statusCode: res.status, responseTimeMs },
          anomalies: [`HTTP ${res.status}`],
        };
      } catch (err) {
        const result: IInfrastructureProbeResult = {
          probeId: `azure-functions-${nowIso}`,
          probeKey: 'azure-functions',
          status: 'error',
          summary: `Azure Functions unreachable: ${err instanceof Error ? err.message : 'unknown'}`,
          observedAt: nowIso,
          metrics: {},
          anomalies: ['Connection failed'],
        };
        return result;
      }
    },
  };
}

/** Unconfigured stub preserved for backward compatibility. */
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
