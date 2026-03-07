/**
 * DashboardLayout — KPI grid + chart zone + data zone
 * PH4B.3 §Step 1 | Blueprint §1f, §2c
 * Traceability: D-PH4C-24, D-PH4C-25
 *
 * Responsive KPI grid: 4-col (>1200px) -> 2-col (768-1199px) -> 1-col (<768px)
 * Chart zone: full-width slot below KPI grid
 * Data zone: full-width children slot (flexGrow: 1)
 */
import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import { HBC_BREAKPOINT_CONTENT_MEDIUM, HBC_BREAKPOINT_MOBILE } from '../theme/breakpoints.js';
import { HbcKpiCard } from '../HbcKpiCard/index.js';
import type { DashboardLayoutProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flexGrow: 1,
  },
  kpiGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: 'repeat(4, 1fr)',
    paddingBottom: `${HBC_SPACE_LG}px`,
    // PH4C.12: medium and mobile transitions share canonical breakpoints used by shell/nav.
    [`@media (max-width: ${HBC_BREAKPOINT_CONTENT_MEDIUM}px)`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
    },
  },
  chartZone: {
    paddingBottom: `${HBC_SPACE_LG}px`,
  },
  dataZone: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
  },
});

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  kpiCards,
  chartContent,
  children,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.root} data-hbc-layout="dashboard">
      {/* KPI Grid */}
      {kpiCards && kpiCards.length > 0 && (
        <div className={styles.kpiGrid}>
          {kpiCards.map((card) => (
            <HbcKpiCard
              key={card.id}
              label={card.label}
              value={card.value}
              trend={
                card.trend
                  ? { direction: card.trend, label: card.trendValue ?? '' }
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Chart Zone */}
      {chartContent && (
        <div className={styles.chartZone}>{chartContent}</div>
      )}

      {/* Data Zone */}
      <div className={styles.dataZone}>{children}</div>
    </div>
  );
};
