/**
 * Wave 13 Prompt 13E — Site Health Procore sync & repair posture card.
 *
 * Direct child of the Site Health Fragment. Display-only summary of the
 * Procore data-layer sync posture for the project: canonical
 * degraded-state ID, per-subject-area rollup, and the top curated
 * summary (when present). No repair runner, no live SDK, no fetch.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { IPccProcoreSurfaceViewModel } from '../../viewModels/procoreSurfaceAdapter';

export interface PccSiteHealthProcoreSyncRepairCardProps {
  readonly viewModel?: IPccProcoreSurfaceViewModel;
}

export const PccSiteHealthProcoreSyncRepairCard: FC<PccSiteHealthProcoreSyncRepairCardProps> = ({
  viewModel,
}) => {
  const degradedStateId = viewModel?.degradedStateId ?? null;
  return (
    <PccDashboardCard footprint="standard" eyebrow="Procore" title="Procore sync & repair posture">
      <div
        data-pcc-card-id="procore-sync-repair"
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
              <li>
                Subject areas: {viewModel.syncRollup.availableCount}/
                {viewModel.syncRollup.entryCount} available
                {viewModel.syncRollup.degradedCount > 0
                  ? ` · ${viewModel.syncRollup.degradedCount} degraded`
                  : ''}
              </li>
              {viewModel.syncRollup.degradedSourceStates.length > 0 ? (
                <li>Degraded sources: {viewModel.syncRollup.degradedSourceStates.join(', ')}</li>
              ) : null}
            </ul>
            {viewModel.topCuratedSummary ? <p>{viewModel.topCuratedSummary.summaryText}</p> : null}
          </>
        )}
      </div>
    </PccDashboardCard>
  );
};

export default PccSiteHealthProcoreSyncRepairCard;
