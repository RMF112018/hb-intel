/**
 * BuyoutLinesGrid — R3: scope/package grid with status lifecycle badges.
 */
import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BuyoutLineRow } from '../hooks/useBuyoutSurface.js';

const STATUS_COLORS: Record<string, string> = {
  NotStarted: HBC_STATUS_COLORS.neutral, LoiPending: HBC_STATUS_COLORS.info, LoiExecuted: HBC_STATUS_COLORS.info,
  ContractPending: HBC_STATUS_COLORS.warning, ContractExecuted: HBC_STATUS_COLORS.success, Complete: HBC_STATUS_COLORS.completed, Void: HBC_STATUS_COLORS.neutral,
};

function formatCurrency(val: number | null): string {
  if (val === null) return '—';
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${val < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
  return `${val < 0 ? '-' : ''}$${abs.toLocaleString()}`;
}

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_MD}px`, overflow: 'auto', flex: 1 },
  headerRow: { display: 'grid', gridTemplateColumns: '50px 1fr 1fr 90px 90px 90px 80px', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px`, backgroundColor: 'var(--colorNeutralBackground3)', borderRadius: '4px', fontWeight: 600, fontSize: '11px', color: 'var(--colorNeutralForeground3)' },
  lineRow: { display: 'grid', gridTemplateColumns: '50px 1fr 1fr 90px 90px 90px 80px', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px`, borderBottom: '1px solid var(--colorNeutralStroke2)', cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '150ms', ':hover': { backgroundColor: 'var(--colorNeutralBackground3)' }, ':focus-visible': { outlineWidth: '2px', outlineStyle: 'solid', outlineColor: 'var(--colorBrandStroke1)', outlineOffset: '-2px' } },
  lineSelected: { backgroundColor: 'var(--colorNeutralBackground3)', borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: 'var(--colorBrandStroke1)' },
  cellMono: { fontFamily: 'monospace', fontSize: '13px', textAlign: 'right' as const },
  cellText: { fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  statusBadge: { display: 'inline-flex', padding: '1px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 600, color: 'var(--colorNeutralBackground1)' },
  overBudget: { color: HBC_STATUS_COLORS.critical },
  underBudget: { color: HBC_STATUS_COLORS.success },
  gateFlag: { color: HBC_STATUS_COLORS.warning, fontWeight: 700, fontSize: '14px' },
});

export interface BuyoutLinesGridProps {
  readonly lines: readonly BuyoutLineRow[];
  readonly selectedLineId: string | null;
  readonly onSelectLine: (lineId: string | null) => void;
}

export function BuyoutLinesGrid({ lines, selectedLineId, onSelectLine }: BuyoutLinesGridProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="buyout-lines-grid" className={styles.root}>
      <div className={styles.headerRow}>
        <span>Div</span><span>Scope</span><span>Subcontractor</span><span>Budget</span><span>Contract</span><span>Over/Under</span><span>Status</span>
      </div>
      {lines.map((line) => (
        <div key={line.id} className={mergeClasses(styles.lineRow, selectedLineId === line.id && styles.lineSelected)} data-testid={`buyout-line-${line.id}`} role="button" tabIndex={0} aria-pressed={selectedLineId === line.id} onClick={() => onSelectLine(selectedLineId === line.id ? null : line.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectLine(selectedLineId === line.id ? null : line.id); }}>
          <span className={styles.cellText}>{line.divisionCode}</span>
          <span className={styles.cellText}>{line.divisionDescription}</span>
          <span className={styles.cellText}>{line.subcontractorVendorName}</span>
          <span className={styles.cellMono}>{formatCurrency(line.originalBudget)}</span>
          <span className={styles.cellMono}>{formatCurrency(line.contractAmount)}</span>
          <span className={mergeClasses(styles.cellMono, line.overUnder !== null && line.overUnder > 0 && styles.overBudget, line.overUnder !== null && line.overUnder < 0 && styles.underBudget)}>{formatCurrency(line.overUnder)}</span>
          <span><span className={styles.statusBadge} style={{ backgroundColor: STATUS_COLORS[line.status] }}>{line.status.replace(/([A-Z])/g, ' $1').trim()}</span>{line.gateBlocked && <span className={styles.gateFlag}> !</span>}</span>
        </div>
      ))}
    </div>
  );
}
