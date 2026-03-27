/**
 * BuyoutExposureBand — R2: dollar-weighted completion, open exposure, pending, watchlist.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BuyoutExposureKpi } from '../hooks/useBuyoutSurface.js';

const SEVERITY_COLORS: Record<string, string> = { healthy: HBC_STATUS_COLORS.success, watch: HBC_STATUS_COLORS.warning, 'at-risk': HBC_STATUS_COLORS.atRisk, critical: HBC_STATUS_COLORS.critical, neutral: HBC_STATUS_COLORS.neutral };

const useStyles = makeStyles({
  root: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: `${HBC_SPACE_SM}px`, padding: `0 ${HBC_SPACE_MD}px ${HBC_SPACE_MD}px` },
  metricValue: { fontSize: '22px', fontWeight: 700, lineHeight: 1.2, color: 'var(--colorNeutralForeground1)' },
  severityDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, display: 'inline-block', marginRight: '6px' },
  cardBody: { padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px` },
});

export interface BuyoutExposureBandProps { readonly kpis: readonly BuyoutExposureKpi[]; }

export function BuyoutExposureBand({ kpis }: BuyoutExposureBandProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="buyout-exposure-band" className={styles.root}>
      {kpis.map((kpi) => (
        <Card key={kpi.id} size="small">
          <CardHeader header={<Text weight="semibold" size={200}>{kpi.label}</Text>} />
          <div className={styles.cardBody}>
            <span className={styles.severityDot} style={{ backgroundColor: SEVERITY_COLORS[kpi.severity] }} />
            <span className={styles.metricValue}>{kpi.value}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
