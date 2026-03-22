/**
 * PersonalAnalyticsCard — P2-D1 §6: available to all roles.
 * Displays personal work KPIs from useMyWorkCounts().
 *
 * UIF-008: Responsive KPI grid with click-to-filter on each card.
 * UIF-039-addl: Explicit 3-column grid for secondary cards. Hero spans full width.
 * UIF-040-addl: Hero card includes a proportional breakdown bar showing the
 * composition of totalCount (Action Now + Blocked + Unread + Other).
 *
 * Semantic status ramp colors on top borders per UIF-007.
 * Value typography: heading1 (1.5rem/700) via HbcKpiCard default.
 * Background: surface-1 (colorNeutralBackground1) via HbcKpiCard default.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { tokens } from '@fluentui/react-components';
import {
  HbcKpiCard,
  HbcSpinner,
  HBC_SPACE_MD,
  HBC_BREAKPOINT_MOBILE,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_ACTION_GREEN,
  HBC_PRIMARY_BLUE,
} from '@hbc/ui-kit';
import { useMyWorkCounts } from '@hbc/my-work-feed';
import { ViewList, SparkleIcon, Cancel, Notifications } from '@hbc/ui-kit/icons';

const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(3, 1fr)',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
    },
  },
  // INS-006: Summary card gets distinct background + full width + no maxWidth cap.
  summaryCard: {
    backgroundColor: '#1E3A5F',
    maxWidth: 'none',
  },
  // UIF-040-addl: Proportional breakdown bar below the hero KPI value.
  breakdownWrap: {
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingBottom: '8px',
  },
  breakdownBar: {
    display: 'flex',
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground4,
  },
  breakdownLegend: {
    display: 'flex',
    gap: '12px',
    marginTop: '6px',
    fontSize: '0.625rem',
    fontWeight: '500',
    color: tokens.colorNeutralForeground3,
    flexWrap: 'wrap',
  },
  legendDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginRight: '3px',
    verticalAlign: 'middle',
  },
});

export interface PersonalAnalyticsCardProps {
  /** UIF-008: Currently active KPI filter key. */
  activeFilter?: string | null;
  /** UIF-008: Callback when a KPI card is clicked. */
  onFilterChange?: (filter: string) => void;
}

export function PersonalAnalyticsCard({
  activeFilter,
  onFilterChange,
}: PersonalAnalyticsCardProps): ReactNode {
  const styles = useStyles();
  const { counts, isLoading } = useMyWorkCounts();

  // Per-tile loading — WorkspacePageShell isLoading is page-level, not applicable here.
  // eslint-disable-next-line @hb-intel/hbc/no-direct-spinner
  if (isLoading) return <HbcSpinner size="sm" label="Loading insights" />;

  const total = counts?.totalCount ?? 0;
  const now = counts?.nowCount ?? 0;
  const blocked = counts?.blockedCount ?? 0;
  const unread = counts?.unreadCount ?? 0;
  const other = Math.max(0, total - now - blocked - unread);

  // UIF-040-addl: Segment widths as percentages of total.
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  const segments = [
    { label: 'Now', count: now, color: HBC_STATUS_ACTION_GREEN, pct: pct(now) },
    { label: 'Blocked', count: blocked, color: HBC_STATUS_RAMP_RED[50], pct: pct(blocked) },
    { label: 'Unread', count: unread, color: HBC_STATUS_RAMP_INFO[50], pct: pct(unread) },
    { label: 'Other', count: other, color: 'transparent', pct: pct(other) },
  ].filter((s) => s.count > 0);

  return (
    <div className={styles.kpiGrid}>
      {/* Hero card: full-width summary with proportional breakdown bar */}
      <div
        style={{
          gridColumn: '1 / -1',
          '--summary-bg': '#1E3A5F',
        } as React.CSSProperties}
      >
        <HbcKpiCard
          label="Total Items"
          value={total}
          subtitle="active work items"
          color={HBC_PRIMARY_BLUE}
          icon={<ViewList size="sm" />}
          ariaLabel={`Filter by Total Items: ${total} items`}
          isActive={activeFilter === null || activeFilter === undefined}
          onClick={() => onFilterChange?.('total')}
          className={styles.summaryCard}
        />
        {/* UIF-040-addl: Proportional breakdown bar */}
        {total > 0 && (
          <div className={styles.breakdownWrap}>
            <div
              className={styles.breakdownBar}
              role="img"
              aria-label={`Breakdown: ${now} action now, ${blocked} blocked, ${unread} unread, ${other} other`}
            >
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    width: `${seg.pct}%`,
                    backgroundColor: seg.color === 'transparent' ? undefined : seg.color,
                    minWidth: seg.count > 0 ? '2px' : 0,
                  }}
                />
              ))}
            </div>
            <div className={styles.breakdownLegend}>
              {segments.filter((s) => s.color !== 'transparent').map((seg) => (
                <span key={seg.label}>
                  <span className={styles.legendDot} style={{ backgroundColor: seg.color }} />
                  {seg.label} {seg.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Secondary KPI cards */}
      <HbcKpiCard
        label="Action Now"
        value={now}
        color={HBC_STATUS_ACTION_GREEN}
        icon={<SparkleIcon size="sm" />}
        trend={{ direction: 'flat', label: 'No change' }}
        ariaLabel={`Filter by Action Now: ${now} items`}
        isActive={activeFilter === 'action-now'}
        onClick={() => onFilterChange?.('action-now')}
      />
      <HbcKpiCard
        label="Blocked"
        value={blocked}
        color={HBC_STATUS_RAMP_RED[50]}
        icon={<Cancel size="sm" />}
        trend={{ direction: 'flat', label: 'No change' }}
        ariaLabel={`Filter by Blocked: ${blocked} items`}
        isActive={activeFilter === 'blocked'}
        onClick={() => onFilterChange?.('blocked')}
      />
      <HbcKpiCard
        label="Unread"
        value={unread}
        color={HBC_STATUS_RAMP_INFO[50]}
        icon={<Notifications size="sm" />}
        trend={{ direction: 'flat', label: 'No change' }}
        ariaLabel={`Filter by Unread: ${unread} items`}
        isActive={activeFilter === 'unread'}
        onClick={() => onFilterChange?.('unread')}
      />
    </div>
  );
}
