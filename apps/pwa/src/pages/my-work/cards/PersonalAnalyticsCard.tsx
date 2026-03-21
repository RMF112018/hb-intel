/**
 * PersonalAnalyticsCard — P2-D1 §6: available to all roles.
 * Displays personal work KPIs from useMyWorkCounts().
 *
 * UIF-008: Each KPI card is clickable. Clicking applies the corresponding
 * filter to the work item feed. Active state shows a blue border.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, HbcKpiCard, HBC_BREAKPOINT_MOBILE } from '@hbc/ui-kit';
import { useMyWorkCounts } from '@hbc/my-work-feed';

const useStyles = makeStyles({
  root: {
    gridColumn: 'span 6',
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: { gridColumn: 'span 1' },
  },
  kpiRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
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

  return (
    <div className={styles.root}>
      <HbcCard weight="primary" header={<span>Personal Analytics</span>}>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <div className={styles.kpiRow}>
            <HbcKpiCard
              label="Total Items"
              value={counts?.totalCount ?? 0}
              isActive={activeFilter === null || activeFilter === undefined}
              onClick={() => onFilterChange?.('total')}
            />
            <HbcKpiCard
              label="Action Now"
              value={counts?.nowCount ?? 0}
              color="var(--colorPaletteRedForeground1)"
              isActive={activeFilter === 'action-now'}
              onClick={() => onFilterChange?.('action-now')}
            />
            <HbcKpiCard
              label="Blocked"
              value={counts?.blockedCount ?? 0}
              color="var(--colorPaletteYellowForeground1)"
              isActive={activeFilter === 'blocked'}
              onClick={() => onFilterChange?.('blocked')}
            />
            <HbcKpiCard
              label="Unread"
              value={counts?.unreadCount ?? 0}
              isActive={activeFilter === 'unread'}
              onClick={() => onFilterChange?.('unread')}
            />
          </div>
        )}
      </HbcCard>
    </div>
  );
}
