/**
 * BudgetLinesGrid — R3: budget lines data table with 3-layer visual distinction.
 */
import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BudgetLineRow } from '../hooks/useBudgetSurface.js';

const LAYER_COLORS: Record<string, string> = {
  source: HBC_STATUS_COLORS.info,
  snapshot: HBC_STATUS_COLORS.neutral,
  working: HBC_STATUS_COLORS.success,
};

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_MD}px`, overflow: 'auto', flex: 1 },
  headerRow: { display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 100px 100px 100px 40px', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px`, backgroundColor: 'var(--colorNeutralBackground3)', borderRadius: '4px', fontWeight: 600, fontSize: '11px', color: 'var(--colorNeutralForeground3)' },
  lineRow: { display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 100px 100px 100px 40px', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px`, borderBottom: '1px solid var(--colorNeutralStroke2)', cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '150ms', ':hover': { backgroundColor: 'var(--colorNeutralBackground3)' }, ':focus-visible': { outlineWidth: '2px', outlineStyle: 'solid', outlineColor: 'var(--colorBrandStroke1)', outlineOffset: '-2px' } },
  lineSelected: { backgroundColor: 'var(--colorNeutralBackground3)', borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: 'var(--colorBrandStroke1)' },
  cellMono: { fontFamily: 'monospace', fontSize: '13px', textAlign: 'right' as const },
  cellText: { fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  layerDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, alignSelf: 'center' },
  flagIcon: { color: HBC_STATUS_COLORS.warning, fontWeight: 700, fontSize: '14px' },
  overUnderNeg: { color: HBC_STATUS_COLORS.critical },
  overUnderPos: { color: HBC_STATUS_COLORS.success },
});

function formatCurrency(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
  return `${val < 0 ? '-' : ''}$${abs.toLocaleString()}`;
}

export interface BudgetLinesGridProps {
  readonly lines: readonly BudgetLineRow[];
  readonly selectedLineId: string | null;
  readonly onSelectLine: (lineId: string | null) => void;
}

export function BudgetLinesGrid({ lines, selectedLineId, onSelectLine }: BudgetLinesGridProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="budget-lines-grid" className={styles.root}>
      <div className={styles.headerRow}>
        <span>Cost Code</span><span>Description</span><span>Revised Budget</span><span>Actual / CTD</span><span>FTC</span><span>EAC</span><span>Over/Under</span><span></span>
      </div>
      {lines.map((line) => (
        <div key={line.id} className={mergeClasses(styles.lineRow, selectedLineId === line.id && styles.lineSelected)} data-testid={`budget-line-${line.id}`} role="button" tabIndex={0} aria-pressed={selectedLineId === line.id} onClick={() => onSelectLine(selectedLineId === line.id ? null : line.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectLine(selectedLineId === line.id ? null : line.id); }}>
          <span className={styles.cellText}>{line.costCode}</span>
          <span className={styles.cellText}>{line.costDescription}</span>
          <span className={styles.cellMono}>{formatCurrency(line.revisedBudget)}</span>
          <span className={styles.cellMono}>{formatCurrency(line.actualCostToDate)}</span>
          <span className={styles.cellMono}>{formatCurrency(line.forecastToComplete)}</span>
          <span className={styles.cellMono}>{formatCurrency(line.estimatedCostAtCompletion)}</span>
          <span className={mergeClasses(styles.cellMono, line.projectedOverUnder < 0 && styles.overUnderNeg, line.projectedOverUnder > 0 && styles.overUnderPos)}>{formatCurrency(line.projectedOverUnder)}</span>
          <span>{line.hasReconciliationFlag && <span className={styles.flagIcon}>!</span>}{line.isStale && <span className={styles.flagIcon}>~</span>}</span>
        </div>
      ))}
    </div>
  );
}
