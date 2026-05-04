/**
 * Wave 13 Prompt 13E — External Systems Procore configuration & status
 * card.
 *
 * Direct child of the External Systems Fragment — sibling of the
 * existing tiles. Display-only. Renders the canonical Procore
 * degraded-state ID, mapping state, freshness band, owner role (when
 * present), and any remediation hint. The `configured` state is emitted
 * only when the project mapping is confirmed AND the chosen envelope
 * status is `available`.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { IPccProcoreSurfaceViewModel } from '../../viewModels/procoreSurfaceAdapter';

export interface PccExternalSystemsProcoreConfigurationStatusCardProps {
  readonly viewModel?: IPccProcoreSurfaceViewModel;
}

const REMEDIATION_HINT_LABELS: Readonly<Record<string, string>> = {
  'request-pm-confirmation': 'Request PM confirmation',
  'request-px-fallback-confirmation': 'Request PX fallback confirmation',
  'request-integration-admin-review': 'Request integration admin review',
  'reconfirm-mapping': 'Reconfirm mapping',
  'investigate-conflicting-procore-records': 'Investigate conflicting records',
  'archive-and-restart-mapping': 'Archive and restart mapping',
};

export const PccExternalSystemsProcoreConfigurationStatusCard: FC<
  PccExternalSystemsProcoreConfigurationStatusCardProps
> = ({ viewModel }) => {
  const degradedStateId = viewModel?.degradedStateId ?? null;
  const isConfigured =
    viewModel?.mappingSummary.state === 'mapping-confirmed' &&
    viewModel.mappingEnvelopeStatus === 'available' &&
    viewModel.syncEnvelopeStatus === 'available';
  const configurationState: 'configured' | 'missing' | 'unavailable-fixture' = !viewModel
    ? 'unavailable-fixture'
    : isConfigured
      ? 'configured'
      : 'missing';

  return (
    <PccDashboardCard footprint="standard" eyebrow="Procore" title="Procore configuration & status">
      <div
        data-pcc-card-id="procore-configuration-status"
        data-pcc-procore-degraded-state={degradedStateId ?? 'available'}
        data-pcc-procore-configuration-state={configurationState}
        data-pcc-procore-mapping-state={viewModel?.mappingSummary.state ?? 'unmapped'}
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
              <li>Mapping state: {viewModel.mappingSummary.state}</li>
              <li>Mapping freshness: {viewModel.mappingSummary.freshnessBand}</li>
              {viewModel.mappingSummary.ownerRole ? (
                <li>Owner role: {viewModel.mappingSummary.ownerRole}</li>
              ) : null}
              {viewModel.mappingSummary.remediationHint ? (
                <li>
                  Remediation:{' '}
                  {REMEDIATION_HINT_LABELS[viewModel.mappingSummary.remediationHint] ??
                    viewModel.mappingSummary.remediationHint}
                </li>
              ) : null}
            </ul>
          </>
        )}
      </div>
    </PccDashboardCard>
  );
};

export default PccExternalSystemsProcoreConfigurationStatusCard;
