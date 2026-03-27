/**
 * CashFlowMonthlyGrid — R3: actual+forecast monthly sequence.
 * Actual months read-only, forecast months editable (when canEdit).
 * Deficit months highlighted.
 */
import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { CashFlowMonthRow } from '../hooks/useCashFlowSurface.js';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_MD}px`, overflow: 'auto', flex: 1 },
  headerRow: { display: 'grid', gridTemplateColumns: '80px 90px 90px 90px 100px 60px 50px', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px`, backgroundColor: 'var(--colorNeutralBackground3)', borderRadius: '4px', fontWeight: 600, fontSize: '11px', color: 'var(--colorNeutralForeground3)' },
  monthRow: { display: 'grid', gridTemplateColumns: '80px 90px 90px 90px 100px 60px 50px', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px`, borderBottom: '1px solid var(--colorNeutralStroke2)', cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '150ms', ':hover': { backgroundColor: 'var(--colorNeutralBackground3)' }, ':focus-visible': { outlineWidth: '2px', outlineStyle: 'solid', outlineColor: 'var(--colorBrandStroke1)', outlineOffset: '-2px' } },
  monthSelected: { backgroundColor: 'var(--colorNeutralBackground3)', borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: 'var(--colorBrandStroke1)' },
  actualRow: { borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: HBC_STATUS_COLORS.success },
  forecastRow: { borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: HBC_STATUS_COLORS.info },
  deficitRow: { backgroundColor: HBC_STATUS_COLORS.critical + '08' },
  cellMono: { fontFamily: 'monospace', fontSize: '13px', textAlign: 'right' as const },
  cellText: { fontSize: '13px' },
  typeTag: { fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '3px' },
  typeActual: { backgroundColor: HBC_STATUS_COLORS.success + '20', color: HBC_STATUS_COLORS.success },
  typeForecast: { backgroundColor: HBC_STATUS_COLORS.info + '20', color: HBC_STATUS_COLORS.info },
  deficitValue: { color: HBC_STATUS_COLORS.critical },
});

function formatCurrency(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
  return `${val < 0 ? '-' : ''}$${abs.toLocaleString()}`;
}

export interface CashFlowMonthlyGridProps {
  readonly months: readonly CashFlowMonthRow[];
  readonly selectedMonthId: string | null;
  readonly onSelectMonth: (monthId: string | null) => void;
}

export function CashFlowMonthlyGrid({ months, selectedMonthId, onSelectMonth }: CashFlowMonthlyGridProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="cash-flow-monthly-grid" className={styles.root}>
      <div className={styles.headerRow}>
        <span>Month</span><span>Inflows</span><span>Outflows</span><span>Net</span><span>Cumulative</span><span>Conf.</span><span>Type</span>
      </div>
      {months.map((month) => (
        <div key={month.id} className={mergeClasses(styles.monthRow, selectedMonthId === month.id && styles.monthSelected, month.recordType === 'actual' ? styles.actualRow : styles.forecastRow, month.isDeficit && styles.deficitRow)} data-testid={`cash-flow-month-${month.id}`} role="button" tabIndex={0} aria-pressed={selectedMonthId === month.id} onClick={() => onSelectMonth(selectedMonthId === month.id ? null : month.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectMonth(selectedMonthId === month.id ? null : month.id); }}>
          <span className={styles.cellText}>{month.calendarDate}</span>
          <span className={styles.cellMono}>{formatCurrency(month.inflows)}</span>
          <span className={styles.cellMono}>{formatCurrency(month.outflows)}</span>
          <span className={mergeClasses(styles.cellMono, month.netCashFlow < 0 && styles.deficitValue)}>{formatCurrency(month.netCashFlow)}</span>
          <span className={mergeClasses(styles.cellMono, month.cumulativeCashFlow < 0 && styles.deficitValue)}>{formatCurrency(month.cumulativeCashFlow)}</span>
          <span className={styles.cellText}>{month.confidenceScore != null ? `${month.confidenceScore}%` : month.forecastAccuracy != null ? `${month.forecastAccuracy}%` : '—'}</span>
          <span className={mergeClasses(styles.typeTag, month.recordType === 'actual' ? styles.typeActual : styles.typeForecast)}>{month.recordType === 'actual' ? 'ACT' : 'FCT'}</span>
        </div>
      ))}
    </div>
  );
}
