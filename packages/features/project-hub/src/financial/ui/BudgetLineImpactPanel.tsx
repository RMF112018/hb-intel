/**
 * BudgetLineImpactPanel — R4: selected line detail with 3-layer visibility.
 * Shows source value, snapshot value, working FTC, computed EAC, downstream impacts.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Card, CardHeader, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BudgetLineDetail } from '../hooks/useBudgetSurface.js';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_MD}px`, overflow: 'auto' },
  layerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${HBC_SPACE_SM}px`, padding: `0 ${HBC_SPACE_SM}px ${HBC_SPACE_SM}px` },
  layerItem: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_XS}px`, padding: `${HBC_SPACE_SM}px`, borderRadius: '4px', border: '1px solid var(--colorNeutralStroke2)' },
  layerSource: { backgroundColor: HBC_STATUS_COLORS.info + '15' },
  layerSnapshot: { backgroundColor: 'var(--colorNeutralBackground3)' },
  layerWorking: { backgroundColor: HBC_STATUS_COLORS.success + '15' },
  layerLabel: { fontSize: '10px', fontWeight: 600, color: 'var(--colorNeutralForeground3)', textTransform: 'uppercase' as const },
  layerValue: { fontSize: '18px', fontWeight: 700, color: 'var(--colorNeutralForeground1)' },
  impactList: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_XS}px`, paddingLeft: `${HBC_SPACE_SM}px`, paddingBottom: `${HBC_SPACE_SM}px` },
  provenanceLabel: { color: 'var(--colorNeutralForeground3)', fontStyle: 'italic' },
  emptyState: { color: 'var(--colorNeutralForeground3)', padding: `${HBC_SPACE_MD}px`, textAlign: 'center' as const },
});

function formatCurrency(val: number): string {
  return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
}

export interface BudgetLineImpactPanelProps {
  readonly detail: BudgetLineDetail | null;
}

export function BudgetLineImpactPanel({ detail }: BudgetLineImpactPanelProps): ReactNode {
  const styles = useStyles();
  if (!detail) {
    return (
      <div data-testid="budget-line-impact-panel" className={styles.root}>
        <Text size={200} className={styles.emptyState}>Select a budget line to see source, snapshot, and working-state detail</Text>
      </div>
    );
  }
  return (
    <div data-testid="budget-line-impact-panel" className={styles.root}>
      <Card size="small">
        <CardHeader header={<Text weight="semibold" size={200}>{detail.costCode} — {detail.costDescription}</Text>} />
        <div className={styles.layerGrid}>
          <div className={`${styles.layerItem} ${styles.layerSource}`}><span className={styles.layerLabel}>Source</span><span className={styles.layerValue}>{formatCurrency(detail.sourceValue)}</span></div>
          <div className={`${styles.layerItem} ${styles.layerSnapshot}`}><span className={styles.layerLabel}>Snapshot</span><span className={styles.layerValue}>{formatCurrency(detail.snapshotValue)}</span></div>
          <div className={`${styles.layerItem} ${styles.layerWorking}`}><span className={styles.layerLabel}>Working FTC</span><span className={styles.layerValue}>{formatCurrency(detail.workingFTC)}</span></div>
        </div>
      </Card>
      <Card size="small">
        <CardHeader header={<Text weight="semibold" size={200}>Computed Values</Text>} />
        <div className={styles.layerGrid}>
          <div className={styles.layerItem}><span className={styles.layerLabel}>EAC</span><span className={styles.layerValue}>{formatCurrency(detail.computedEAC)}</span></div>
          <div className={styles.layerItem}><span className={styles.layerLabel}>Over/Under</span><span className={styles.layerValue}>{formatCurrency(detail.computedOverUnder)}</span></div>
          {detail.priorFTC != null && <div className={styles.layerItem}><span className={styles.layerLabel}>Prior FTC</span><span className={styles.layerValue}>{formatCurrency(detail.priorFTC)}</span></div>}
        </div>
      </Card>
      {detail.downstreamImpacts.length > 0 && (
        <Card size="small">
          <CardHeader header={<Text weight="semibold" size={200}>Downstream Impacts</Text>} />
          <div className={styles.impactList}>{detail.downstreamImpacts.map((impact, i) => (<Text key={i} size={200}>• {impact}</Text>))}</div>
        </Card>
      )}
      {detail.lastEditedBy && (
        <Text size={100} className={styles.provenanceLabel}>Last edited by {detail.lastEditedBy} on {new Date(detail.lastEditedAt!).toLocaleDateString()}</Text>
      )}
    </div>
  );
}
