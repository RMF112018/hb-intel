/**
 * BudgetSnapshotHeader — R1: snapshot identity, source, lock, freshness, actions.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BudgetSnapshotInfo } from '../hooks/useBudgetSurface.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  infoGroup: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, flex: 1, minWidth: '200px', flexWrap: 'wrap' },
  sourceBadge: { display: 'inline-flex', padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, backgroundColor: HBC_STATUS_COLORS.info, color: 'var(--colorNeutralBackground1)' },
  metaLabel: { color: 'var(--colorNeutralForeground3)' },
  actionsGroup: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, flexWrap: 'wrap' },
});

export interface BudgetSnapshotHeaderProps {
  readonly snapshot: BudgetSnapshotInfo;
  readonly onBack: () => void;
  readonly onRefresh?: () => void;
}

export function BudgetSnapshotHeader({ snapshot, onBack, onRefresh }: BudgetSnapshotHeaderProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="budget-snapshot-header" className={styles.root}>
      <div className={styles.infoGroup}>
        <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>
        <Text weight="semibold" size={400}>Budget</Text>
        <span className={styles.sourceBadge}>{snapshot.sourceSystem}</span>
        <Text size={200} className={styles.metaLabel}>{snapshot.lineCount} lines · Locked {new Date(snapshot.lockTimestamp).toLocaleDateString()}</Text>
        <Text size={200} className={styles.metaLabel}>Batch: {snapshot.importBatchId}</Text>
      </div>
      <div className={styles.actionsGroup}>
        {snapshot.isRefreshAvailable && onRefresh ? (
          <HbcButton variant="primary" onClick={onRefresh}>Refresh Snapshot</HbcButton>
        ) : (
          <Text size={200} className={styles.metaLabel}>{snapshot.refreshBlockReason ?? 'Refresh not available'}</Text>
        )}
      </div>
    </div>
  );
}
