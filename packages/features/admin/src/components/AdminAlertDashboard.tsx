import { type FC, useState, useMemo, useCallback } from 'react';
import { HbcStatusBadge, HbcSpinner, HbcBanner, HbcButton } from '@hbc/ui-kit';
import type { AlertSeverity } from '../types/AlertSeverity.js';
import type { AlertCategory } from '../types/AlertCategory.js';
import { useAdminAlerts } from '../hooks/useAdminAlerts.js';
import {
  severityToVariant,
  groupAlertsBySeverity,
  formatAlertTimestamp,
} from './helpers.js';

type SeverityFilterValue = AlertSeverity | 'all';
type AcknowledgedFilterValue = 'all' | 'unacknowledged' | 'acknowledged';

export interface AdminAlertDashboardProps {
  readonly initialSeverity?: SeverityFilterValue;
}

const SEVERITY_OPTIONS: { value: SeverityFilterValue; label: string }[] = [
  { value: 'all', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CATEGORY_OPTIONS: { value: AlertCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'provisioning-failure', label: 'Provisioning Failure' },
  { value: 'permission-anomaly', label: 'Permission Anomaly' },
  { value: 'stuck-workflow', label: 'Stuck Workflow' },
  { value: 'overdue-provisioning-task', label: 'Overdue Task' },
  { value: 'upcoming-expiration', label: 'Upcoming Expiration' },
  { value: 'stale-record', label: 'Stale Record' },
];

const ACK_OPTIONS: { value: AcknowledgedFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unacknowledged', label: 'Unacknowledged' },
  { value: 'acknowledged', label: 'Acknowledged' },
];

/**
 * Dashboard for viewing and managing admin alerts with filtering and acknowledgment.
 *
 * @design D-02, D-03, SF17-T05
 */
export const AdminAlertDashboard: FC<AdminAlertDashboardProps> = ({
  initialSeverity = 'all',
}) => {
  const { alerts, isLoading, error, acknowledge } = useAdminAlerts();

  const [severityFilter, setSeverityFilter] = useState<SeverityFilterValue>(initialSeverity);
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | 'all'>('all');
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<AcknowledgedFilterValue>('all');

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    if (severityFilter !== 'all') {
      result = result.filter((a) => a.severity === severityFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter);
    }
    if (acknowledgedFilter === 'acknowledged') {
      result = result.filter((a) => a.acknowledgedAt != null);
    } else if (acknowledgedFilter === 'unacknowledged') {
      result = result.filter((a) => a.acknowledgedAt == null);
    }

    return result;
  }, [alerts, severityFilter, categoryFilter, acknowledgedFilter]);

  const groupedAlerts = useMemo(
    () => groupAlertsBySeverity(filteredAlerts),
    [filteredAlerts],
  );

  const handleAcknowledge = useCallback(
    async (alertId: string) => {
      await acknowledge(alertId);
    },
    [acknowledge],
  );

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading alerts">
        <HbcSpinner label="Loading alerts…" />
      </div>
    );
  }

  if (error) {
    return (
      <HbcBanner variant="error">
        Failed to load alerts: {error.message}
      </HbcBanner>
    );
  }

  return (
    <div aria-label="Admin alert dashboard">
      <div role="toolbar" aria-label="Alert filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          Severity
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as SeverityFilterValue)}
            aria-label="Filter by severity"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as AlertCategory | 'all')}
            aria-label="Filter by category"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            value={acknowledgedFilter}
            onChange={(e) => setAcknowledgedFilter(e.target.value as AcknowledgedFilterValue)}
            aria-label="Filter by acknowledgment status"
          >
            {ACK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      {groupedAlerts.length === 0 ? (
        <p>No alerts match the current filters.</p>
      ) : (
        <div role="list" aria-label="Alert groups">
          {groupedAlerts.map((group) => (
            <div key={group.severity} role="listitem">
              <h3>
                <HbcStatusBadge
                  variant={severityToVariant(group.severity)}
                  label={`${group.severity} (${group.alerts.length})`}
                />
              </h3>
              <table role="table" aria-label={`${group.severity} severity alerts`}>
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Affected Entity</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.alerts.map((alert) => (
                    <tr key={alert.alertId} tabIndex={0} aria-label={`Alert: ${alert.title}`}>
                      <td>
                        <HbcStatusBadge
                          variant={severityToVariant(alert.severity)}
                          label={alert.severity}
                        />
                      </td>
                      <td>{alert.category}</td>
                      <td>{alert.title}</td>
                      <td>{alert.description}</td>
                      <td>{`${alert.affectedEntityType}: ${alert.affectedEntityId}`}</td>
                      <td>{formatAlertTimestamp(alert.occurredAt)}</td>
                      <td style={{ display: 'flex', gap: '0.25rem' }}>
                        {alert.ctaHref && (
                          <a href={alert.ctaHref} aria-label={alert.ctaLabel ?? 'View details'}>
                            {alert.ctaLabel ?? 'View'}
                          </a>
                        )}
                        {!alert.acknowledgedAt && (
                          <HbcButton
                            variant="secondary"
                            size="sm"
                            onClick={() => void handleAcknowledge(alert.alertId)}
                            aria-label={`Acknowledge alert: ${alert.title}`}
                          >
                            Acknowledge
                          </HbcButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
