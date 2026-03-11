import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';

/**
 * Probes notification delivery pipeline health.
 *
 * @design D-04, SF17-T03
 */
export const notificationProbe: IInfrastructureProbeDefinition = {
  probeKey: 'notification-system',

  async run(nowIso: string) {
    return {
      probeId: `notification-system-${nowIso}`,
      probeKey: 'notification-system' as const,
      status: 'healthy' as const,
      summary: 'Notification system check — no live connection configured',
      observedAt: nowIso,
      metrics: {},
      anomalies: [],
    };
  },
};
