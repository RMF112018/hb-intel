import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';

/**
 * Probes Azure Cognitive Search service health and index status.
 *
 * **Phase 12 status: explicit non-goal.**
 *
 * Requires an Azure Search service endpoint and API key configuration.
 * The current repo does not use Azure Search directly — search-like
 * behavior is served through SharePoint list queries and Graph API.
 * Until Azure Search is adopted as an infrastructure dependency,
 * this probe has no live target to check.
 *
 * Returns 'unknown' to distinguish from actively-verified 'healthy'.
 *
 * @design D-04, SF17-T03
 * @deferred Phase 13+ — requires Azure Search infrastructure adoption
 */
export const searchProbe: IInfrastructureProbeDefinition = {
  probeKey: 'azure-search',

  async run(nowIso: string) {
    return {
      probeId: `azure-search-${nowIso}`,
      probeKey: 'azure-search' as const,
      status: 'unknown' as const,
      summary: 'Azure Search probe deferred — no live connection configured (P12-06)',
      observedAt: nowIso,
      metrics: {},
      anomalies: [],
    };
  },
};
