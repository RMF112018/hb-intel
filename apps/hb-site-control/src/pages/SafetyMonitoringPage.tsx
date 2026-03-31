/**
 * SafetyMonitoringPage — Real-time safety incident tracking.
 * Foundation Plan Phase 6 — Blueprint §2i.
 * Uses useSignalR hook for mock real-time updates.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  Text,
  Badge,
  tokens,
  HbcStatusBadge,
  HbcChart,
  WorkspacePageShell,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
} from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import { useSignalR } from '../hooks/useSignalR.js';
import type { SignalREvent } from '../hooks/useSignalR.js';

const useStyles = makeStyles({
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingTop: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: `${HBC_SPACE_SM}px`,
    backgroundColor: 'var(--colorNeutralBackground1)',
    boxShadow: 'var(--shadow2)',
  },
  connectionDot: {
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: '50%',
  },
  connectionDotConnected: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
  },
  connectionDotDisconnected: {
    backgroundColor: tokens.colorPaletteRedBackground3,
  },
  lastEvent: {
    color: 'var(--colorNeutralForeground3)',
    marginLeft: 'auto',
  },
  eventList: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
  },
  eventCard: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: `${HBC_SPACE_SM}px`,
    backgroundColor: 'var(--colorNeutralBackground1)',
    boxShadow: 'var(--shadow2)',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
  },
  eventContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    flex: 1,
  },
  eventMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  chartSection: {
    marginTop: `${HBC_SPACE_MD}px`,
  },
  liveEventsHeading: {
    marginTop: `${HBC_SPACE_MD}px`,
  },
  emptyState: {
    color: 'var(--colorNeutralForeground3)',
    padding: `${HBC_SPACE_MD}px`,
  },
  eventTimestamp: {
    color: 'var(--colorNeutralForeground3)',
    whiteSpace: 'nowrap',
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
      itemStyle: { color: tokens.colorBrandBackground },
      areaStyle: { color: tokens.colorBrandBackground2 },
    },
    {
      name: 'Resolved',
      type: 'line' as const,
      smooth: true,
      data: [2, 4, 3, 6, 5, 1, 4],
      itemStyle: { color: tokens.colorPaletteGreenBackground3 },
      areaStyle: { color: tokens.colorPaletteGreenBackground1 },
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
          className={`${styles.connectionDot} ${isConnected ? styles.connectionDotConnected : styles.connectionDotDisconnected}`}
        />
        <Text size={300} weight="medium">
          {isConnected ? 'Connected — Live Updates' : 'Connecting...'}
        </Text>
        {lastEvent && (
          <Text size={200} className={styles.lastEvent}>
            Last event: {formatTime(lastEvent.timestamp)}
          </Text>
        )}
      </div>

      <div className={styles.chartSection}>
        <Text as="h2" size={500} weight="semibold">Weekly Trend</Text>
        <HbcChart option={TREND_CHART_OPTION} height="250px" />
      </div>

      <Text as="h2" size={500} weight="semibold" className={styles.liveEventsHeading}>
        Live Events ({events.length})
      </Text>
      <div className={styles.eventList}>
        {events.length === 0 && (
          <Text size={300} className={styles.emptyState}>
            Waiting for events...
          </Text>
        )}
        {events.slice(0, 20).map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventContent}>
              <div className={styles.eventMeta}>
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
            <Text size={200} className={styles.eventTimestamp}>
              {formatTime(event.timestamp)}
            </Text>
          </div>
        ))}
      </div>
    </WorkspacePageShell>
  );
}
