/**
 * BuyoutRiskPanel — R4: selected line detail with savings/disposition and forecast implications.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BuyoutLineDetail } from '../hooks/useBuyoutSurface.js';

const STATUS_COLORS: Record<string, string> = {
  NotStarted: HBC_STATUS_COLORS.neutral, LoiPending: HBC_STATUS_COLORS.info, LoiExecuted: HBC_STATUS_COLORS.info,
  ContractPending: HBC_STATUS_COLORS.warning, ContractExecuted: HBC_STATUS_COLORS.success, Complete: HBC_STATUS_COLORS.completed, Void: HBC_STATUS_COLORS.neutral,
};

function formatCurrency(val: number | null): string {
  if (val === null) return '—';
  return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
}

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_MD}px`, overflow: 'auto' },
  layerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${HBC_SPACE_SM}px`, padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px` },
  layerItem: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_XS}px`, padding: `${HBC_SPACE_SM}px`, borderRadius: '4px', border: '1px solid var(--colorNeutralStroke2)' },
  layerLabel: { fontSize: '10px', fontWeight: 600, color: 'var(--colorNeutralForeground3)', textTransform: 'uppercase' as const },
  layerValue: { fontSize: '18px', fontWeight: 700, color: 'var(--colorNeutralForeground1)' },
  statusBadge: { display: 'inline-flex', padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--colorNeutralBackground1)' },
  impactList: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_XS}px`, paddingLeft: `${HBC_SPACE_SM}px`, paddingBottom: `${HBC_SPACE_SM}px` },
  savingsSection: { borderLeft: `3px solid ${HBC_STATUS_COLORS.warning}`, paddingLeft: `${HBC_SPACE_SM}px` },
  provenanceLabel: { color: 'var(--colorNeutralForeground3)', fontStyle: 'italic' },
  emptyState: { color: 'var(--colorNeutralForeground3)', padding: `${HBC_SPACE_MD}px`, textAlign: 'center' as const },
});

export interface BuyoutRiskPanelProps { readonly detail: BuyoutLineDetail | null; }

export function BuyoutRiskPanel({ detail }: BuyoutRiskPanelProps): ReactNode {
  const styles = useStyles();
  if (!detail) return (
    <div data-testid="buyout-risk-panel" className={styles.root}>
      <Text size={200} className={styles.emptyState}>Select a buyout line to see status, savings, and forecast implications</Text>
    </div>
  );
  return (
    <div data-testid="buyout-risk-panel" className={styles.root}>
      <Card size="small">
        <CardHeader header={<Text weight="semibold" size={200}>{detail.divisionCode} — {detail.divisionDescription}</Text>} description={<Text size={200}>{detail.subcontractorVendorName}</Text>} />
        <div className={styles.layerGrid}>
          <div className={styles.layerItem}><span className={styles.layerLabel}>Budget</span><span className={styles.layerValue}>{formatCurrency(detail.originalBudget)}</span></div>
          <div className={styles.layerItem}><span className={styles.layerLabel}>Contract</span><span className={styles.layerValue}>{formatCurrency(detail.contractAmount)}</span></div>
          <div className={styles.layerItem}><span className={styles.layerLabel}>Over/Under</span><span className={styles.layerValue} style={{ color: detail.overUnder !== null && detail.overUnder > 0 ? HBC_STATUS_COLORS.critical : detail.overUnder !== null && detail.overUnder < 0 ? HBC_STATUS_COLORS.success : undefined }}>{formatCurrency(detail.overUnder)}</span></div>
          <div className={styles.layerItem}><span className={styles.layerLabel}>Status</span><span className={styles.statusBadge} style={{ backgroundColor: STATUS_COLORS[detail.status] }}>{detail.status.replace(/([A-Z])/g, ' $1').trim()}</span></div>
        </div>
      </Card>
      {detail.savingsAmount > 0 && (
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Savings — {formatCurrency(detail.savingsAmount)}</Text>} />
          <div className={styles.savingsSection}>
            <Text size={200}>Disposition: {detail.savingsDisposition.replace(/([A-Z])/g, ' $1').trim()}</Text>
            {detail.savingsDestinations.length > 0 && detail.savingsDestinations.map((d, i) => (
              <Text key={i} size={200}>• {d.destination}: {formatCurrency(d.amount)}</Text>
            ))}
          </div>
        </Card>
      )}
      {detail.forecastImplications.length > 0 && (
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Forecast Implications</Text>} />
          <div className={styles.impactList}>{detail.forecastImplications.map((imp, i) => (<Text key={i} size={200}>• {imp}</Text>))}</div>
        </Card>
      )}
      {detail.notes && <Text size={200} className={styles.provenanceLabel}>{detail.notes}</Text>}
      {detail.lastEditedBy && <Text size={100} className={styles.provenanceLabel}>Last edited by {detail.lastEditedBy}</Text>}
    </div>
  );
}
