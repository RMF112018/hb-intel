import type { ProbeHealthStatus } from './ProbeHealthStatus.js';

/**
 * Result from a single infrastructure probe execution.
 *
 * @design D-04
 */
export interface IInfrastructureProbeResult {
  readonly probeId: string;
  readonly probeKey:
    | 'sharepoint-infrastructure'
    | 'azure-functions'
    | 'azure-search'
    | 'notification-system'
    | 'module-record-health';
  readonly status: ProbeHealthStatus;
  readonly summary: string;
  readonly observedAt: string;
  readonly metrics: Record<string, number | string | boolean>;
  readonly anomalies: string[];
}
