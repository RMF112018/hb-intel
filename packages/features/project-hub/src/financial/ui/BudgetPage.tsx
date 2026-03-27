/**
 * BudgetPage — source-governed budget snapshot and FTC working surface.
 * Composes R1–R5 via MultiColumnLayout.
 */
import type { ReactNode } from 'react';
import { MultiColumnLayout } from '@hbc/ui-kit';
import { useBudgetSurface } from '../hooks/useBudgetSurface.js';
import { BudgetSnapshotHeader } from './BudgetSnapshotHeader.js';
import { BudgetFreshnessBanner } from './BudgetFreshnessBanner.js';
import { BudgetLinesGrid } from './BudgetLinesGrid.js';
import { BudgetLineImpactPanel } from './BudgetLineImpactPanel.js';
import { BudgetImportPanel } from './BudgetImportPanel.js';

export interface BudgetPageProps {
  readonly projectId: string;
  readonly onBack: () => void;
}

export function BudgetPage({ projectId, onBack }: BudgetPageProps): ReactNode {
  const data = useBudgetSurface();
  return (
    <>
      <BudgetSnapshotHeader snapshot={data.snapshot} onBack={onBack} />
      <BudgetFreshnessBanner freshness={data.freshness} />
      <MultiColumnLayout
        testId="budget-layout"
        config={{ right: { width: 360, hideOnTablet: true, hideOnMobile: true } }}
        centerSlot={<BudgetLinesGrid lines={data.lines} selectedLineId={data.selectedLineId} onSelectLine={data.selectLine} />}
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
