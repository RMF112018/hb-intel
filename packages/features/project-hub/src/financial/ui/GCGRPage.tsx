/**
 * GCGRPage — GC/GR Forecast editing workspace.
 *
 * Route: /project-hub/:projectId/financial/gcgr
 * Wave 3B.2: facade-wired with worksheet-aligned category grouping,
 * version-aware editability, and rollup visibility.
 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcKpiCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useGCGRSurface } from '../hooks/useGCGRSurface.js';
import { useFinancialRepository } from '../hooks/useFinancialRepository.js';
import { GCGRService } from '../services/GCGRService.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke1)',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  kpiBand: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
  },
  categorySection: {
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: `${HBC_SPACE_XS}px`,
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorBrandStroke1)',
  },
  grid: {
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
  },
  lineRow: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 120px 120px 120px 80px',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
    alignItems: 'center',
  },
  columnHeader: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 120px 120px 120px 80px',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    fontWeight: 600,
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke1)',
  },
  subtotalRow: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 120px 120px 120px 80px',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    fontWeight: 600,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
  overBudget: { color: HBC_STATUS_COLORS.error },
  underBudget: { color: HBC_STATUS_COLORS.success },
  editableCell: { backgroundColor: 'var(--colorBrandBackground2)', borderRadius: '2px' },
  derivedCell: { opacity: 0.8, fontStyle: 'italic' },
  immutableBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorNeutralBackground3)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
  },
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

export function GCGRPage({ projectId: _projectId, viewerRole, complexityTier, onBack }: GCGRPageProps): ReactNode {
  const styles = useStyles();
  const data = useGCGRSurface({ viewerRole, complexityTier });

  // Group lines by worksheet-aligned categories (GC, GR, Other)
  const repo = useFinancialRepository();
  const categoryGroups = useMemo(() => {
    const service = new GCGRService(repo);
    return service.groupByCategory(data.lines.map((l) => ({
      lineId: l.id,
      divisionCode: l.division,
      divisionDescription: l.description,
      budgetAmount: l.budgetAmount,
      forecastAmount: l.forecastAmount,
      varianceAmount: l.varianceAmount,
    })));
  }, [data.lines, repo]);

  return (
    <>
      {/* Header with version/period context */}
      <div className={styles.header} data-testid="gcgr-header">
        <div>
          <Text size={400} weight="semibold">GC/GR Forecast</Text>
          <div className={styles.headerMeta}>
            <HbcStatusBadge
              variant={data.isEditable ? 'info' : 'neutral'}
              label={data.isEditable ? 'Editable (Working)' : data.versionState === 'ConfirmedInternal' ? 'Confirmed — Immutable' : data.versionState === 'PublishedMonthly' ? 'Published — Immutable' : 'Read-Only'}
              size="small"
            />
            <Text size={200} style={{ opacity: 0.6 }}>{data.reportingMonth}</Text>
          </div>
        </div>
        {onBack && <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>}
      </div>

      {/* Immutable state banner */}
      {!data.isEditable && (
        <div className={styles.immutableBanner} data-testid="gcgr-immutable-banner">
          <HbcStatusBadge variant="neutral" label="This version is immutable — derive a new Working version to edit" size="small" />
        </div>
      )}

      {/* KPI Band */}
      <div className={styles.kpiBand} data-testid="gcgr-kpi-band">
        <HbcKpiCard label="Total Budget" value={formatCurrency(data.summary.totalBudget)} />
        <HbcKpiCard label="Total Forecast" value={formatCurrency(data.summary.totalForecast)} />
        <HbcKpiCard
          label="Total Variance"
          value={formatCurrency(data.summary.totalVariance)}
          trend={{ direction: data.summary.totalVariance > 0 ? 'up' : 'down', label: data.summary.totalVariance > 0 ? 'Over Budget' : 'Under Budget' }}
        />
        <HbcKpiCard label="Over Budget Lines" value={`${data.summary.overBudgetCount} of ${data.summary.lineCount}`} />
      </div>

      {/* Category-grouped line grid (worksheet-aligned) */}
      {categoryGroups.map((group) => (
        <div key={group.category} className={styles.categorySection} data-testid={`gcgr-category-${group.category}`}>
          <div className={styles.categoryHeader}>
            <Text size={300} weight="semibold">{group.label}</Text>
            <Text size={200} style={{ opacity: 0.6 }}>
              {group.lines.length} division{group.lines.length !== 1 ? 's' : ''}
            </Text>
          </div>

          <div className={styles.grid}>
            {/* Column headers */}
            <div className={styles.columnHeader}>
              <Text size={200}>Div</Text>
              <Text size={200}>Description</Text>
              <Text size={200}>Budget</Text>
              <Text size={200}>Forecast {data.isEditable && '✎'}</Text>
              <Text size={200}>Variance</Text>
              <Text size={200}>%</Text>
            </div>

            {/* Data rows */}
            {group.lines.map((line) => (
              <div key={line.lineId} className={styles.lineRow} data-testid={`gcgr-line-${line.lineId}`}>
                <Text size={200} weight="semibold">{line.divisionCode}</Text>
                <Text size={200}>{line.divisionDescription}</Text>
                <Text size={200} className={styles.derivedCell}>{formatCurrency(line.budgetAmount)}</Text>
                <Text size={200} className={data.isEditable ? styles.editableCell : styles.derivedCell}>
                  {formatCurrency(line.forecastAmount)}
                </Text>
                <Text size={200} className={line.varianceAmount > 0 ? styles.overBudget : styles.underBudget}>
                  {formatCurrency(line.varianceAmount)}
                </Text>
                <Text size={200} className={line.varianceAmount > 0 ? styles.overBudget : styles.underBudget}>
                  {line.budgetAmount !== 0 ? `${((line.varianceAmount / line.budgetAmount) * 100) > 0 ? '+' : ''}${((line.varianceAmount / line.budgetAmount) * 100).toFixed(1)}%` : '—'}
                </Text>
              </div>
            ))}

            {/* Subtotal row */}
            <div className={styles.subtotalRow} data-testid={`gcgr-subtotal-${group.category}`}>
              <Text size={200}></Text>
              <Text size={200} weight="semibold">{group.label} Subtotal</Text>
              <Text size={200}>{formatCurrency(group.subtotalBudget)}</Text>
              <Text size={200}>{formatCurrency(group.subtotalForecast)}</Text>
              <Text size={200} className={group.subtotalVariance > 0 ? styles.overBudget : styles.underBudget}>
                {formatCurrency(group.subtotalVariance)}
              </Text>
              <Text size={200}></Text>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
