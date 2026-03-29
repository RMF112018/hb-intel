/**
 * BudgetPage — Budget Import working surface.
 *
 * Route: /project-hub/:projectId/financial/budget
 * Wave 3C.2: facade-wired with import posture, reconciliation
 * condition visibility, and CSV-informed review workflow.
 */
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { MultiColumnLayout, Text, HbcStatusBadge, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
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
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: 'var(--colorBrandBackground2)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorBrandStroke1)',
  },
  reconciliationBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: HBC_STATUS_COLORS.warning + '22',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_STATUS_COLORS.warning,
  },
  reconciliationText: {
    color: HBC_STATUS_COLORS.warning,
  },
  importPostureBand: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
});

export interface BudgetPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack: () => void;
}

export function BudgetPage({ projectId: _projectId, viewerRole, complexityTier, onBack }: BudgetPageProps): ReactNode {
  const styles = useStyles();
  const data = useBudgetSurface({ viewerRole, complexityTier });

  return (
    <>
      <BudgetSnapshotHeader snapshot={data.snapshot} onBack={onBack} />
      <BudgetFreshnessBanner freshness={data.freshness} />

      {/* Import posture band — shows line count, stale count, import blocked status */}
      <div className={styles.importPostureBand} data-testid="budget-import-posture">
        <HbcStatusBadge
          variant={data.reconciliationItems.some((r) => r.actionable) ? 'warning' : 'success'}
          label={`${data.lines.length} budget lines`}
          size="small"
        />
        {data.reconciliationItems.some((r) => r.actionable) && (
          <HbcStatusBadge
            variant="warning"
            label={`${data.reconciliationItems.filter((r) => r.actionable).length} pending reconciliation`}
            size="small"
          />
        )}
        <Text size={100} style={{ opacity: 0.6 }}>
          Source: Procore CSV import
        </Text>
      </div>

      {data.hasUnsavedChanges && (
        <div className={styles.unsavedBanner} data-testid="budget-unsaved-banner">
          <Text size={200} weight="semibold">{data.dirtyLines.size} unsaved FTC change{data.dirtyLines.size > 1 ? 's' : ''}</Text>
        </div>
      )}

      {data.reconciliationItems.length > 0 && data.reconciliationItems.some((r) => r.actionable) && (
        <div className={styles.reconciliationBanner} data-testid="budget-reconciliation-banner">
          <Text size={200} weight="semibold" className={styles.reconciliationText}>
            {data.reconciliationItems.filter((r) => r.actionable).length} reconciliation condition{data.reconciliationItems.filter((r) => r.actionable).length > 1 ? 's' : ''} require PM resolution — confirmation blocked until resolved
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
