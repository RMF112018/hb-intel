/**
 * BudgetFreshnessBanner — R2: source/freshness/reconciliation trust layer.
 */
import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { BudgetFreshnessState } from '../hooks/useBudgetSurface.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
  item: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px` },
  dot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  label: { color: 'var(--colorNeutralForeground3)' },
  warningItem: { color: HBC_STATUS_COLORS.warning, fontWeight: 600 },
});

export interface BudgetFreshnessBannerProps { readonly freshness: BudgetFreshnessState; }

export function BudgetFreshnessBanner({ freshness }: BudgetFreshnessBannerProps): ReactNode {
  const styles = useStyles();
  return (
    <div data-testid="budget-freshness-banner" className={styles.root}>
      <div className={styles.item}>
        <span className={styles.dot} style={{ backgroundColor: freshness.sourceNewer ? HBC_STATUS_COLORS.warning : HBC_STATUS_COLORS.success }} />
        <Text size={100} className={styles.label}>{freshness.sourceNewerLabel}</Text>
      </div>
      <div className={styles.item}>
        <span className={styles.dot} style={{ backgroundColor: freshness.forecastStale ? HBC_STATUS_COLORS.warning : HBC_STATUS_COLORS.success }} />
        <Text size={100} className={styles.label}>{freshness.staleLabel}</Text>
      </div>
      {freshness.reconciliationIssues > 0 && (
        <div className={styles.item}>
          <span className={styles.dot} style={{ backgroundColor: HBC_STATUS_COLORS.warning }} />
          <Text size={100} className={mergeClasses(styles.label, styles.warningItem)}>{freshness.reconciliationLabel}</Text>
        </div>
      )}
    </div>
  );
}
