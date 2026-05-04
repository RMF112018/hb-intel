/**
 * Wave 13 Prompt 13E — Project Readiness Procore source-confidence
 * region card.
 *
 * Direct child of the Project Readiness Fragment so it remains a direct
 * `<PccBentoGrid>` child. Renders source-confidence (mapping freshness +
 * subject-area rollup) and any readiness-impact-category Procore signals.
 * Display-only; no enabled mutation, no Procore link, no fetch.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { IPccProcoreSurfaceViewModel } from '../../viewModels/procoreSurfaceAdapter';

export interface PccProjectReadinessProcoreSourceConfidenceCardProps {
  readonly viewModel?: IPccProcoreSurfaceViewModel;
}

export const PccProjectReadinessProcoreSourceConfidenceCard: FC<
  PccProjectReadinessProcoreSourceConfidenceCardProps
> = ({ viewModel }) => {
  const degradedStateId = viewModel?.degradedStateId ?? null;
  return (
    <PccDashboardCard footprint="standard" eyebrow="Procore" title="Procore source confidence">
      <div
        data-pcc-readiness-region="procore-source-confidence"
        data-pcc-card-id="procore-source-confidence"
        data-pcc-procore-degraded-state={degradedStateId ?? 'available'}
      >
        {!viewModel ? (
          <PccPreviewState state="preview" />
        ) : viewModel.cardState !== 'preview' ? (
          <PccPreviewState state={viewModel.cardState} />
        ) : (
          <>
            <div>
              <PccStatusPill tone={viewModel.pillTone} filled>
                {viewModel.degradedStateId ?? 'available'}
              </PccStatusPill>
            </div>
            <ul>
              <li>Mapping freshness: {viewModel.mappingSummary.freshnessBand}</li>
              <li>
                Subject areas: {viewModel.syncRollup.availableCount}/
                {viewModel.syncRollup.entryCount} available
                {viewModel.syncRollup.degradedCount > 0
                  ? ` · ${viewModel.syncRollup.degradedCount} degraded`
                  : ''}
              </li>
              {viewModel.readinessImpactSignals.length > 0 ? (
                <li>Readiness-impact signals: {viewModel.readinessImpactSignals.length}</li>
              ) : null}
            </ul>
            {viewModel.readinessImpactSignals.length > 0 ? (
              <p>{viewModel.readinessImpactSignals[0]!.summary}</p>
            ) : null}
          </>
        )}
      </div>
    </PccDashboardCard>
  );
};

export default PccProjectReadinessProcoreSourceConfidenceCard;
