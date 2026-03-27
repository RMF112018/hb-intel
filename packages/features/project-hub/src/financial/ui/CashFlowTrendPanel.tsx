/**
 * CashFlowTrendPanel — R4: cumulative trend visualization.
 * Text-based trend display (chart component deferred to real data wiring).
 */
import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { CashFlowTrendPoint } from '../hooks/useCashFlowSurface.js';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px` },
  trendRow: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_XS}px 0`, borderBottom: '1px solid var(--colorNeutralStroke2)' },
  monthLabel: { width: '70px', fontSize: '12px', color: 'var(--colorNeutralForeground3)' },
  bar: { height: '12px', borderRadius: '2px', minWidth: '2px', transitionProperty: 'width', transitionDuration: '200ms' },
  barPositive: { backgroundColor: HBC_STATUS_COLORS.success },
  barNegative: { backgroundColor: HBC_STATUS_COLORS.critical },
  valueLabel: { fontSize: '11px', fontFamily: 'monospace', minWidth: '70px', textAlign: 'right' as const, color: 'var(--colorNeutralForeground1)' },
  deficitValue: { color: HBC_STATUS_COLORS.critical, fontWeight: 600 },
  typeIndicator: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
});

function formatCurrency(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
  return `${val < 0 ? '-' : ''}$${abs.toLocaleString()}`;
}

export interface CashFlowTrendPanelProps {
  readonly trendPoints: readonly CashFlowTrendPoint[];
  readonly peakCashRequirement: number;
}

export function CashFlowTrendPanel({ trendPoints, peakCashRequirement }: CashFlowTrendPanelProps): ReactNode {
  const styles = useStyles();
  const maxAbs = Math.max(...trendPoints.map((p) => Math.abs(p.cumulative)), 1);

  return (
    <Card size="small">
      <CardHeader
        header={<Text weight="semibold" size={200}>Cumulative Cash Flow Trend</Text>}
        description={<Text size={100} style={{ color: 'var(--colorNeutralForeground3)' }}>Peak requirement: {formatCurrency(peakCashRequirement)}</Text>}
      />
      <div className={styles.root}>
        {trendPoints.map((point) => {
          const barWidth = Math.max(2, (Math.abs(point.cumulative) / maxAbs) * 100);
          return (
            <div key={point.month} className={styles.trendRow}>
              <span className={styles.monthLabel}>{point.month}</span>
              <span className={styles.typeIndicator} style={{ backgroundColor: point.actual != null ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.info }} />
              <div style={{ flex: 1 }}>
                <div className={mergeClasses(styles.bar, point.cumulative >= 0 ? styles.barPositive : styles.barNegative)} style={{ width: `${barWidth}%` }} />
              </div>
              <span className={mergeClasses(styles.valueLabel, point.isDeficit && styles.deficitValue)}>{formatCurrency(point.cumulative)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
