/**
 * PersonalAnalyticsCard — P2-D1 §6: available to all roles.
 * Displays personal work KPIs from useMyWorkCounts().
 *
 * UIF-008: Responsive 4→2→1 KPI grid matching DashboardLayout pattern.
 * Click-to-filter on each card scopes the work item feed.
 * Semantic status ramp colors on top borders per UIF-007.
 * Value typography: heading1 (1.5rem/700) via HbcKpiCard default.
 * Background: surface-1 (colorNeutralBackground1) via HbcKpiCard default.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcKpiCard,
  HBC_BREAKPOINT_CONTENT_MEDIUM,
  HBC_BREAKPOINT_MOBILE,
  HBC_SPACE_MD,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
} from '@hbc/ui-kit';
import { useMyWorkCounts } from '@hbc/my-work-feed';

// UIF-008: Responsive KPI grid matching DashboardLayout.kpiGrid pattern.
const useStyles = makeStyles({
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(4, 1fr)',
    [`@media (max-width: ${HBC_BREAKPOINT_CONTENT_MEDIUM}px)`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
    },
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

  if (isLoading) return <span>Loading...</span>;

  return (
    <div className={styles.kpiGrid}>
      <HbcKpiCard
        label="Total Items"
        value={counts?.totalCount ?? 0}
        isActive={activeFilter === null || activeFilter === undefined}
        onClick={() => onFilterChange?.('total')}
      />
      <HbcKpiCard
        label="Action Now"
        value={counts?.nowCount ?? 0}
        color={HBC_STATUS_RAMP_RED[50]}
        isActive={activeFilter === 'action-now'}
        onClick={() => onFilterChange?.('action-now')}
      />
      <HbcKpiCard
        label="Blocked"
        value={counts?.blockedCount ?? 0}
        color={HBC_STATUS_RAMP_RED[50]}
        isActive={activeFilter === 'blocked'}
        onClick={() => onFilterChange?.('blocked')}
      />
      <HbcKpiCard
        label="Unread"
        value={counts?.unreadCount ?? 0}
        color={HBC_STATUS_RAMP_AMBER[50]}
        isActive={activeFilter === 'unread'}
        onClick={() => onFilterChange?.('unread')}
      />
    </div>
  );
}
