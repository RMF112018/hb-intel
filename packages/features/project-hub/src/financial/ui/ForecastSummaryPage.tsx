/**
 * ForecastSummaryPage — working financial summary surface.
 *
 * Composes the 5-region Forecast Summary using @hbc/ui-kit primitives.
 * Route: in-page navigation from Financial Control Center (surfaceMode).
 */

import type { ReactNode } from 'react';
import { MultiColumnLayout } from '@hbc/ui-kit';

import { useForecastSummary } from '../hooks/useForecastSummary.js';
import { ForecastVersionHeader } from './ForecastVersionHeader.js';
import { ForecastKpiBand } from './ForecastKpiBand.js';
import { ForecastSummaryForm } from './ForecastSummaryForm.js';
import { ForecastDeltaPanel } from './ForecastDeltaPanel.js';
import { ForecastCommentaryRail } from './ForecastCommentaryRail.js';

export interface ForecastSummaryPageProps {
  readonly projectId: string;
  readonly onBack: () => void;
}

export function ForecastSummaryPage({
  projectId,
  onBack,
}: ForecastSummaryPageProps): ReactNode {
  const data = useForecastSummary();

  return (
    <>
      {/* R1 — Version Header */}
      <ForecastVersionHeader
        version={data.version}
        onBack={onBack}
      />

      {/* R2 — KPI Band */}
      <ForecastKpiBand kpis={data.kpis} />

      {/* R3–R5 — Multi-column: form + delta panel + commentary rail */}
      <MultiColumnLayout
        testId="forecast-summary-layout"
        config={{
          right: { width: 340, hideOnTablet: true, hideOnMobile: true },
        }}
        centerSlot={
          <ForecastSummaryForm
            sections={data.sections}
            isEditable={data.version.isEditable}
          />
        }
        rightSlot={
          <>
            <ForecastDeltaPanel
              deltas={data.priorComparison}
              compareTarget={data.version.compareTarget}
            />
            <ForecastCommentaryRail
              commentary={data.commentary}
              exposureItems={data.exposureItems}
            />
          </>
        }
      />
    </>
  );
}
