/**
 * Health status reported by infrastructure probes.
 *
 * @design D-04
 */
export type ProbeHealthStatus = 'healthy' | 'degraded' | 'error' | 'unknown';
