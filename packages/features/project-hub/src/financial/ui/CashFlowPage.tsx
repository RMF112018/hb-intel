/**
 * CashFlowPage — actual-and-forecast financial timing workspace.
 * Distinguishes evidence-backed actuals from projected months.
 */
import type { ReactNode } from 'react';
import { MultiColumnLayout } from '@hbc/ui-kit';
import { useCashFlowSurface } from '../hooks/useCashFlowSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';
import { CashFlowHeader } from './CashFlowHeader.js';
import { CashFlowKpiBand } from './CashFlowKpiBand.js';
import { CashFlowMonthlyGrid } from './CashFlowMonthlyGrid.js';
import { CashFlowTrendPanel } from './CashFlowTrendPanel.js';
import { CashFlowEvidenceRail } from './CashFlowEvidenceRail.js';

export interface CashFlowPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack: () => void;
}

export function CashFlowPage({ projectId, viewerRole, complexityTier, onBack }: CashFlowPageProps): ReactNode {
  const data = useCashFlowSurface({ viewerRole, complexityTier });
  return (
    <>
      <CashFlowHeader surfaceState={data.surfaceState} canEdit={data.canEditForecasts} hasUnsavedChanges={data.hasUnsavedChanges} onBack={onBack} />
      <CashFlowKpiBand kpis={data.kpis} />
      <MultiColumnLayout
        testId="cash-flow-layout"
        config={{ right: { width: 320, hideOnTablet: true, hideOnMobile: true } }}
        centerSlot={
          <>
            <CashFlowMonthlyGrid months={data.months} selectedMonthId={data.selectedMonthId} onSelectMonth={data.selectMonth} />
            <CashFlowTrendPanel trendPoints={data.trendPoints} peakCashRequirement={data.peakCashRequirement} />
          </>
        }
        rightSlot={<CashFlowEvidenceRail arSummary={data.arSummary} manualCorrections={data.manualCorrections} />}
      />
    </>
  );
}
