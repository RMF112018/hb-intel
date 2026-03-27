/**
 * BudgetPage — source-governed budget snapshot and FTC working surface.
 * State-aware, role-aware, complexity-aware.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { MultiColumnLayout, Text, HBC_SPACE_SM, HBC_SPACE_MD, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useBudgetSurface } from '../hooks/useBudgetSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';
import { BudgetSnapshotHeader } from './BudgetSnapshotHeader.js';
import { BudgetFreshnessBanner } from './BudgetFreshnessBanner.js';
import { BudgetLinesGrid } from './BudgetLinesGrid.js';
import { BudgetLineImpactPanel } from './BudgetLineImpactPanel.js';
import { BudgetImportPanel } from './BudgetImportPanel.js';

const useStyles = makeStyles({
  unsavedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorBrandBackground2)',
    borderBottom: '1px solid var(--colorBrandStroke1)',
  },
  reconciliationBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
    backgroundColor: HBC_STATUS_COLORS.warning + '22',
    borderBottom: `2px solid ${HBC_STATUS_COLORS.warning}`,
  },
  reconciliationText: {
    color: HBC_STATUS_COLORS.warning,
  },
});

export interface BudgetPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack: () => void;
}

export function BudgetPage({ projectId, viewerRole, complexityTier, onBack }: BudgetPageProps): ReactNode {
  const styles = useStyles();
  const data = useBudgetSurface({ viewerRole, complexityTier });

  return (
    <>
      <BudgetSnapshotHeader snapshot={data.snapshot} onBack={onBack} />
      <BudgetFreshnessBanner freshness={data.freshness} />

      {data.hasUnsavedChanges && (
        <div className={styles.unsavedBanner} data-testid="budget-unsaved-banner">
          <Text size={200} weight="semibold">{data.dirtyLines.size} unsaved FTC change{data.dirtyLines.size > 1 ? 's' : ''}</Text>
        </div>
      )}

      {data.reconciliationItems.length > 0 && data.reconciliationItems.some(r => r.actionable) && (
        <div className={styles.reconciliationBanner} data-testid="budget-reconciliation-banner">
          <Text size={200} weight="semibold" className={styles.reconciliationText}>
            {data.reconciliationItems.length} reconciliation issue{data.reconciliationItems.length > 1 ? 's' : ''} require PM resolution
          </Text>
        </div>
      )}

      <MultiColumnLayout
        testId="budget-layout"
        config={{ right: { width: 360, hideOnTablet: true, hideOnMobile: true } }}
        centerSlot={
          <BudgetLinesGrid
            lines={data.lines}
            selectedLineId={data.selectedLineId}
            onSelectLine={data.selectLine}
          />
        }
        rightSlot={
          <>
            <BudgetLineImpactPanel detail={data.selectedLineDetail} />
            <BudgetImportPanel importEvents={data.importEvents} freshness={data.freshness} />
          </>
        }
      />
    </>
  );
}
