/**
 * Wave 13 Prompt 13E — Project Home Procore snapshot card.
 *
 * Display-only direct child of `<PccBentoGrid>` (rendered as a Fragment
 * sibling of the other Project Home cards). Renders the canonical
 * Procore degraded-state ID (`unmapped` | `stale` | `permission-denied`
 * | `tool-disabled` | `rate-limited` | `partial-sync` |
 * `backend-unavailable`), the project's Procore mapping summary, and a
 * top derived signal or curated summary. No live runtime, no external
 * link, no enabled mutation.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { IPccProcoreSurfaceViewModel } from '../../viewModels/procoreSurfaceAdapter';
import type { PccCardState } from './shared';

export interface PccProjectHomeProcoreSnapshotCardProps {
  readonly state?: PccCardState;
  readonly snapshot?: IPccProcoreSurfaceViewModel;
}

const MAPPING_STATE_LABELS: Readonly<Record<string, string>> = {
  unmapped: 'Unmapped',
  'mapping-proposed': 'Mapping proposed',
  'mapping-confirmed': 'Mapping confirmed',
  'mapping-stale': 'Mapping stale',
  'mapping-conflict': 'Mapping conflict',
  'mapping-archived': 'Mapping archived',
};

const DEGRADED_LABELS: Readonly<Record<string, string>> = {
  unmapped: 'Project mapping not yet confirmed',
  stale: 'Mapping or sync data is stale',
  'permission-denied': 'Procore permission denied for one or more tools',
  'tool-disabled': 'A required Procore tool is disabled',
  'rate-limited': 'Procore is currently rate-limited',
  'partial-sync': 'Some subject areas are not fully synced',
  'backend-unavailable': 'Procore backend is unavailable',
};

export const PccProjectHomeProcoreSnapshotCard: FC<PccProjectHomeProcoreSnapshotCardProps> = ({
  state = 'preview',
  snapshot,
}) => {
  const degradedStateId = snapshot?.degradedStateId ?? null;
  const headlineLabel =
    degradedStateId === null ? 'Procore data layer healthy' : DEGRADED_LABELS[degradedStateId];

  return (
    <PccDashboardCard
      footprint="standard"
      tier="tier3"
      region="deferred"
      eyebrow="Procore"
      title="Procore snapshot"
    >
      <div
        data-pcc-card-id="procore-snapshot"
        data-pcc-procore-degraded-state={degradedStateId ?? 'available'}
        data-pcc-procore-mapping-state={snapshot?.mappingSummary.state ?? 'unmapped'}
      >
        {state !== 'preview' || !snapshot ? (
          <PccPreviewState state={state === 'preview' ? 'preview' : state} />
        ) : (
          <>
            <div>
              <PccStatusPill tone={snapshot.pillTone} filled>
                {snapshot.degradedStateId ?? 'available'}
              </PccStatusPill>
            </div>
            <p>{headlineLabel}</p>
            <ul>
              <li>
                Mapping:{' '}
                {MAPPING_STATE_LABELS[snapshot.mappingSummary.state] ??
                  snapshot.mappingSummary.state}
              </li>
              <li>Mapping freshness: {snapshot.mappingSummary.freshnessBand}</li>
              <li>
                Subject areas: {snapshot.syncRollup.availableCount}/{snapshot.syncRollup.entryCount}{' '}
                available
                {snapshot.syncRollup.degradedCount > 0
                  ? ` · ${snapshot.syncRollup.degradedCount} degraded`
                  : ''}
              </li>
              {snapshot.priorityActionCandidates.length > 0 ? (
                <li>Priority signals: {snapshot.priorityActionCandidates.length}</li>
              ) : null}
            </ul>
            {snapshot.topCuratedSummary ? <p>{snapshot.topCuratedSummary.summaryText}</p> : null}
          </>
        )}
      </div>
    </PccDashboardCard>
  );
};

export default PccProjectHomeProcoreSnapshotCard;
