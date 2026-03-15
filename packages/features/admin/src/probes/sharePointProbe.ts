import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';
import type { IInfrastructureProbeResult } from '../types/IInfrastructureProbeResult.js';
import type { ProbeConnectionConfig } from './azureFunctionsProbe.js';

/**
 * Creates a configured SharePoint probe that checks site connectivity
 * by calling a lightweight backend endpoint.
 *
 * @design D-04, SF17-T03, G6-T06
 */
export function createSharePointProbe(
  config: ProbeConnectionConfig,
): IInfrastructureProbeDefinition {
  return {
    probeKey: 'sharepoint-infrastructure',

    async run(nowIso: string) {
      try {
        const token = await config.getToken();
        const start = Date.now();
        // Use the project-setup-requests endpoint as a lightweight connectivity check
        const res = await fetch(`${config.baseUrl}/api/project-setup-requests?state=Submitted`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const responseTimeMs = Date.now() - start;

        if (res.ok) {
          return {
            probeId: `sharepoint-${nowIso}`,
            probeKey: 'sharepoint-infrastructure' as const,
            status: 'healthy' as const,
            summary: `SharePoint connectivity verified (${res.status})`,
            observedAt: nowIso,
            metrics: { statusCode: res.status, responseTimeMs },
            anomalies: [],
          };
        }

        return {
          probeId: `sharepoint-${nowIso}`,
          probeKey: 'sharepoint-infrastructure' as const,
          status: 'degraded' as const,
          summary: `SharePoint returned HTTP ${res.status}`,
          observedAt: nowIso,
          metrics: { statusCode: res.status, responseTimeMs },
          anomalies: [`HTTP ${res.status}`],
        };
      } catch (err) {
        const result: IInfrastructureProbeResult = {
          probeId: `sharepoint-${nowIso}`,
          probeKey: 'sharepoint-infrastructure',
          status: 'error',
          summary: `SharePoint unreachable: ${err instanceof Error ? err.message : 'unknown'}`,
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
