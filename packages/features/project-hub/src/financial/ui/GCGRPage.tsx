/**
 * GCGRPage — GC/GR Forecast editing workspace.
 *
 * Route: /project-hub/:projectId/financial/gcgr
 * Governance: Version-scoped line editing, variance analysis.
 * Stage 2 — T04 types pending (IGCGRLine).
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcKpiCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useGCGRSurface } from '../hooks/useGCGRSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${HBC_SPACE_MD}px`, borderBottom: '1px solid var(--colorNeutralStroke1)' },
  kpiBand: { display: 'flex', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_MD}px`, borderBottom: '1px solid var(--colorNeutralStroke2)' },
  grid: { padding: `${HBC_SPACE_MD}px` },
  lineRow: { display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 120px 80px', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px 0`, borderBottom: '1px solid var(--colorNeutralStroke2)', alignItems: 'center' },
  headerRow: { fontWeight: 600, borderBottom: '2px solid var(--colorNeutralStroke1)' },
  overBudget: { color: HBC_STATUS_COLORS.error },
  underBudget: { color: HBC_STATUS_COLORS.success },
});

export interface GCGRPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function GCGRPage({ viewerRole, complexityTier, onBack }: GCGRPageProps): ReactNode {
  const styles = useStyles();
  const data = useGCGRSurface({ viewerRole, complexityTier });

  return (
    <>
      <div className={styles.header} data-testid="gcgr-header">
        <div>
          <Text size={400} weight="semibold">GC/GR Forecast</Text>
          <HbcStatusBadge variant={data.isEditable ? 'info' : 'neutral'} label={data.isEditable ? 'Editable (Working)' : 'Read-Only'} size="small" />
        </div>
        {onBack && <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>}
      </div>

      <div className={styles.kpiBand} data-testid="gcgr-kpi-band">
        <HbcKpiCard label="Total Budget" value={formatCurrency(data.summary.totalBudget)} />
        <HbcKpiCard label="Total Forecast" value={formatCurrency(data.summary.totalForecast)} />
        <HbcKpiCard label="Total Variance" value={formatCurrency(data.summary.totalVariance)} trend={{ direction: data.summary.totalVariance > 0 ? 'up' : 'down', label: data.summary.totalVariance > 0 ? 'Over' : 'Under' }} />
        <HbcKpiCard label="Over Budget" value={`${data.summary.overBudgetCount} of ${data.summary.lineCount}`} />
      </div>

      <div className={styles.grid} data-testid="gcgr-grid">
        <div className={`${styles.lineRow} ${styles.headerRow}`}>
          <Text size={200}>Division</Text>
          <Text size={200}>Description</Text>
          <Text size={200}>Budget</Text>
          <Text size={200}>Forecast</Text>
          <Text size={200}>Variance</Text>
          <Text size={200}>%</Text>
        </div>
        {data.lines.map((line) => (
          <div key={line.id} className={styles.lineRow} data-testid={`gcgr-line-${line.id}`}>
            <Text size={200} weight="semibold">{line.division}</Text>
            <Text size={200}>{line.description}</Text>
            <Text size={200}>{formatCurrency(line.budgetAmount)}</Text>
            <Text size={200}>{formatCurrency(line.forecastAmount)}</Text>
            <Text size={200} className={line.isOverBudget ? styles.overBudget : styles.underBudget}>
              {formatCurrency(line.varianceAmount)}
            </Text>
            <Text size={200} className={line.isOverBudget ? styles.overBudget : styles.underBudget}>
              {line.variancePercent > 0 ? '+' : ''}{line.variancePercent.toFixed(1)}%
            </Text>
          </div>
        ))}
      </div>
    </>
  );
}
