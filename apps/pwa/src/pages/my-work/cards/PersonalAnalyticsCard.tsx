/**
 * PersonalAnalyticsCard — P2-D1 §6: available to all roles.
 * Displays personal work KPIs from useMyWorkCounts().
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { HbcCard, HbcKpiCard } from '@hbc/ui-kit';
import { useMyWorkCounts } from '@hbc/my-work-feed';

const useStyles = makeStyles({
  root: { gridColumn: 'span 6' },
  kpiRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
});

export function PersonalAnalyticsCard(): ReactNode {
  const styles = useStyles();
  const { counts, isLoading } = useMyWorkCounts();

  return (
    <div className={styles.root}>
      <HbcCard weight="standard" header={<span>Personal Analytics</span>}>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <div className={styles.kpiRow}>
            <HbcKpiCard label="Total Items" value={counts?.totalCount ?? 0} />
            <HbcKpiCard label="Action Now" value={counts?.nowCount ?? 0} color="var(--colorPaletteRedForeground1)" />
            <HbcKpiCard label="Blocked" value={counts?.blockedCount ?? 0} color="var(--colorPaletteYellowForeground1)" />
            <HbcKpiCard label="Unread" value={counts?.unreadCount ?? 0} />
          </div>
        )}
      </HbcCard>
    </div>
  );
}
