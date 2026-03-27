/**
 * CashFlowKpiBand — R2: timing/exposure KPIs with watch flags.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { CashFlowKpi } from '../hooks/useCashFlowSurface.js';

const SEVERITY_COLORS: Record<string, string> = { healthy: HBC_STATUS_COLORS.success, watch: HBC_STATUS_COLORS.warning, 'at-risk': HBC_STATUS_COLORS.atRisk, critical: HBC_STATUS_COLORS.critical, neutral: HBC_STATUS_COLORS.neutral };
const TREND_ARROWS: Record<string, string> = { up: '\u2191', down: '\u2193', flat: '\u2192' };

const useStyles = makeStyles({
  root: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: `${HBC_SPACE_SM}px`, padding: `0 ${HBC_SPACE_MD}px ${HBC_SPACE_MD}px` },
  metricValue: { fontSize: '22px', fontWeight: 700, lineHeight: 1.2, color: 'var(--colorNeutralForeground1)' },
  trendRow: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, marginTop: '4px' },
  trendArrow: { fontSize: '14px', fontWeight: 700 },
  trendLabel: { color: 'var(--colorNeutralForeground3)' },
  severityDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  cardBody: { padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px` },
});

export interface CashFlowKpiBandProps { readonly kpis: readonly CashFlowKpi[]; }

export function CashFlowKpiBand({ kpis }: CashFlowKpiBandProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="cash-flow-kpi-band" className={styles.root}>
      {kpis.map((kpi) => (
        <Card key={kpi.id} size="small">
          <CardHeader header={<Text weight="semibold" size={200}>{kpi.label}</Text>} />
          <div className={styles.cardBody}>
            <span className={styles.metricValue}>{kpi.value}</span>
            <div className={styles.trendRow}>
              <span className={styles.severityDot} style={{ backgroundColor: SEVERITY_COLORS[kpi.severity] }} />
              <span className={styles.trendArrow} style={{ color: kpi.trend === 'down' ? HBC_STATUS_COLORS.critical : kpi.trend === 'up' ? HBC_STATUS_COLORS.success : HBC_STATUS_COLORS.neutral }}>{TREND_ARROWS[kpi.trend]}</span>
              <Text size={100} className={styles.trendLabel}>{kpi.trendLabel}</Text>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
