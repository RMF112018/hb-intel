import type { AlertSeverity } from '../types/AlertSeverity.js';
import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { ProbeHealthStatus } from '../types/ProbeHealthStatus.js';
import type { StatusVariant } from '@hbc/ui-kit';
import { PROBE_STALENESS_MS } from '../constants/index.js';

// Re-export for backward compatibility with consumers importing from helpers
export { PROBE_STALENESS_MS };

/**
 * Map probe health status to HbcStatusBadge variant.
 *
 * @design SF17-T06
 */
export function probeStatusToVariant(status: ProbeHealthStatus): StatusVariant {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'error':
      return 'error';
    case 'unknown':
      return 'neutral';
  }
}

/**
 * Map alert severity to HbcStatusBadge variant.
 *
 * @design SF17-T05
 */
export function severityToVariant(severity: AlertSeverity): StatusVariant {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
  }
}

/**
 * Numeric sort order for severity (lower = more severe).
 *
 * @design SF17-T05
 */
export function severityOrder(severity: AlertSeverity): number {
  switch (severity) {
    case 'critical':
      return 0;
    case 'high':
      return 1;
    case 'medium':
      return 2;
    case 'low':
      return 3;
  }
}

export interface SeverityGroup {
  readonly severity: AlertSeverity;
  readonly alerts: readonly IAdminAlert[];
}

/**
 * Group alerts by severity, sorted critical → high → medium → low.
 *
 * @design SF17-T05
 */
export function groupAlertsBySeverity(
  alerts: readonly IAdminAlert[],
): SeverityGroup[] {
  const groups = new Map<AlertSeverity, IAdminAlert[]>();

  for (const alert of alerts) {
    const existing = groups.get(alert.severity);
    if (existing) {
      existing.push(alert);
    } else {
      groups.set(alert.severity, [alert]);
    }
  }

  return Array.from(groups.entries())
    .map(([severity, groupAlerts]) => ({ severity, alerts: groupAlerts }))
    .sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;

/**
 * Format an ISO timestamp as a relative time string (e.g. "2h ago").
 *
 * @design SF17-T05
 */
export function formatAlertTimestamp(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();

  if (diff < 0) {
    return 'just now';
  }
  if (diff < MINUTES) {
    const secs = Math.floor(diff / SECONDS);
    return secs <= 1 ? 'just now' : `${secs}s ago`;
  }
  if (diff < HOURS) {
    const mins = Math.floor(diff / MINUTES);
    return `${mins}m ago`;
  }
  if (diff < DAYS) {
    const hrs = Math.floor(diff / HOURS);
    return `${hrs}h ago`;
  }
  const days = Math.floor(diff / DAYS);
  return `${days}d ago`;
}
