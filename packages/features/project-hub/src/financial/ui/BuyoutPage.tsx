/**
 * BuyoutPage — hybrid procurement / financial interpretation workspace.
 */
import type { ReactNode } from 'react';
import { MultiColumnLayout } from '@hbc/ui-kit';
import { useBuyoutSurface } from '../hooks/useBuyoutSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';
import { BuyoutPostureHeader } from './BuyoutPostureHeader.js';
import { BuyoutExposureBand } from './BuyoutExposureBand.js';
import { BuyoutLinesGrid } from './BuyoutLinesGrid.js';
import { BuyoutRiskPanel } from './BuyoutRiskPanel.js';
import { BuyoutWorkflowRail } from './BuyoutWorkflowRail.js';

export interface BuyoutPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack: () => void;
}

export function BuyoutPage({ projectId, viewerRole, complexityTier, onBack }: BuyoutPageProps): ReactNode {
  const data = useBuyoutSurface({ viewerRole, complexityTier });
  return (
    <>
      <BuyoutPostureHeader surfaceState={data.surfaceState} percentComplete={data.percentComplete} canEdit={data.canEdit} onBack={onBack} />
      <BuyoutExposureBand kpis={data.kpis} />
      <MultiColumnLayout
        testId="buyout-layout"
        config={{ right: { width: 360, hideOnTablet: true, hideOnMobile: true } }}
        centerSlot={<BuyoutLinesGrid lines={data.lines} selectedLineId={data.selectedLineId} onSelectLine={data.selectLine} />}
        rightSlot={
          <>
            <BuyoutRiskPanel detail={data.selectedLineDetail} />
            <BuyoutWorkflowRail undispositionedSavings={data.undispositionedSavings} totalExposure={data.totalExposure} />
          </>
        }
      />
    </>
  );
}
