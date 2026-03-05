/**
 * SafetyMonitoringPage — Real-time safety incident tracking.
 * Foundation Plan Phase 6 — Blueprint §2i.
 * Uses useSignalR hook for mock real-time updates.
 */
import type { ReactNode } from 'react';
import { Text, Card, CardHeader, Badge } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HbcStatusBadge, HbcChart, WorkspacePageShell } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import { useSignalR } from '../hooks/useSignalR.js';
import type { SignalREvent } from '../hooks/useSignalR.js';

const useStyles = makeStyles({
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '16px',
    paddingRight: '16px',
    borderRadius: '8px',
    backgroundColor: 'var(--colorNeutralBackground1)',
    boxShadow: 'var(--shadow2)',
  },
  connectionDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  eventList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  eventCard: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '16px',
    paddingRight: '16px',
    borderRadius: '8px',
    backgroundColor: 'var(--colorNeutralBackground1)',
    boxShadow: 'var(--shadow2)',
    gap: '12px',
  },
  chartSection: {
    marginTop: '16px',
  },
});

const SEVERITY_VARIANT: Record<SignalREvent['severity'], StatusVariant> = {
  critical: 'critical',
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const EVENT_TYPE_LABELS: Record<SignalREvent['type'], string> = {
  'incident-reported': 'Incident',
  'inspection-complete': 'Inspection',
  'alert-cleared': 'Resolved',
  'status-update': 'Update',
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const TREND_CHART_OPTION = {
  tooltip: { trigger: 'axis' as const },
  xAxis: {
    type: 'category' as const,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: { type: 'value' as const, name: 'Incidents' },
  series: [
    {
      name: 'Incidents',
      type: 'line' as const,
      smooth: true,
      data: [3, 5, 2, 8, 4, 1, 6],
      itemStyle: { color: '#004B87' },
      areaStyle: { color: 'rgba(0, 75, 135, 0.1)' },
    },
    {
      name: 'Resolved',
      type: 'line' as const,
      smooth: true,
      data: [2, 4, 3, 6, 5, 1, 4],
      itemStyle: { color: '#107C10' },
      areaStyle: { color: 'rgba(16, 124, 16, 0.1)' },
    },
  ],
  legend: { data: ['Incidents', 'Resolved'], bottom: 0 },
  grid: { left: 50, right: 20, top: 20, bottom: 40 },
};

export function SafetyMonitoringPage(): ReactNode {
  const styles = useStyles();
  const { events, isConnected, lastEvent } = useSignalR(5000);

  return (
    <WorkspacePageShell layout="dashboard" title="Safety Monitoring">
      <div className={styles.statusBar}>
        <div
          className={styles.connectionDot}
          style={{ backgroundColor: isConnected ? '#107C10' : '#D13438' }}
        />
        <Text size={300} weight="medium">
          {isConnected ? 'Connected — Live Updates' : 'Connecting...'}
        </Text>
        {lastEvent && (
          <Text size={200} style={{ color: 'var(--colorNeutralForeground3)', marginLeft: 'auto' }}>
            Last event: {formatTime(lastEvent.timestamp)}
          </Text>
        )}
      </div>

      <div className={styles.chartSection}>
        <Text as="h2" size={500} weight="semibold">Weekly Trend</Text>
        <HbcChart option={TREND_CHART_OPTION} height="250px" />
      </div>

      <Text as="h2" size={500} weight="semibold" style={{ marginTop: 16 }}>
        Live Events ({events.length})
      </Text>
      <div className={styles.eventList}>
        {events.length === 0 && (
          <Text size={300} style={{ color: 'var(--colorNeutralForeground3)', padding: 16 }}>
            Waiting for events...
          </Text>
        )}
        {events.slice(0, 20).map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge appearance="outline" size="small">
                  {EVENT_TYPE_LABELS[event.type]}
                </Badge>
                <HbcStatusBadge
                  variant={SEVERITY_VARIANT[event.severity]}
                  label={event.severity}
                  size="small"
                />
              </div>
              <Text size={300}>{event.message}</Text>
            </div>
            <Text size={200} style={{ color: 'var(--colorNeutralForeground3)', whiteSpace: 'nowrap' }}>
              {formatTime(event.timestamp)}
            </Text>
          </div>
        ))}
      </div>
    </WorkspacePageShell>
  );
}
