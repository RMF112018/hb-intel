import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';

/**
 * Probes notification delivery pipeline health.
 *
 * **Phase 12 status: explicit non-goal.**
 *
 * Requires a notification system health endpoint. The current notification
 * path is Teams webhook (fire-and-forget) with no health API, and email
 * relay is console-logged only. A meaningful notification probe would
 * require a delivery tracking service or webhook validation endpoint
 * that does not yet exist.
 *
 * Returns 'unknown' to distinguish from actively-verified 'healthy'.
 *
 * @design D-04, SF17-T03
 * @deferred Phase 13+ — requires notification delivery tracking service
 */
export const notificationProbe: IInfrastructureProbeDefinition = {
  probeKey: 'notification-system',

  async run(nowIso: string) {
    return {
      probeId: `notification-system-${nowIso}`,
      probeKey: 'notification-system' as const,
      status: 'unknown' as const,
      summary: 'Notification probe deferred — no health endpoint configured (P12-06)',
      observedAt: nowIso,
      metrics: {},
      anomalies: [],
    };
  },
};
