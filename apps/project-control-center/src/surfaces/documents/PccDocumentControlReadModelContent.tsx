/**
 * Wave 7 / Prompt 03B — Document Control read-model content.
 *
 * Rendered by `PccDocumentsSurface` when an explicit
 * `IPccDocumentsReadModelClient` is supplied. Calls
 * `useDocumentControlReadModel` unconditionally so the rule against
 * conditional hook invocation is preserved.
 *
 * Wave 15A wave-b9 Prompt 4B-09 — dispatch restructured into four
 * branches after the duplicate `PccDocumentsHeaderCard` was removed
 * and replaced by `PccDocumentControlStateCard` (state-aware seam):
 *
 *   status === 'loading'                          → 1 state card only
 *   status === 'error'                            → 1 state card only
 *   status === 'preview' && available             → 5 operational cards (no state card, no header)
 *   status === 'preview' && backend-unavailable   → state card + 5 operational cards (6 total)
 *   status === 'preview' && source-unavailable    → state card + 5 operational cards (6 total)
 *   status === 'preview' && other degraded source → 5 operational cards (no state card; lanes self-render per-lane degraded shells)
 *
 * Each card remains a direct child of `[data-pcc-bento-grid]`.
 */

import { Fragment, type FC } from 'react';
import { SAMPLE_PROJECT_PROFILE } from '@hbc/models/pcc';
import {
  PccDocumentControlStateCard,
  resolveDocumentControlStateKind,
} from './PccDocumentControlStateCard';
import { PccDocumentControlLaneCard } from './PccDocumentControlLaneCard';
import { PccDocumentControlPermissionsCard } from './PccDocumentControlPermissionsCard';
import { PccDocumentControlReviewsCard } from './PccDocumentControlReviewsCard';
import {
  WAVE7_LANE_ORDER,
  WAVE7_LANE_TITLES,
  WAVE7_LANE_DESCRIPTIONS,
  MY_PROJECT_FILES_WARNING_TEXT,
  type DocumentControlWave7LaneId,
  type IPccDocumentControlLaneViewModel,
} from './documentControlViewModel';
import {
  useDocumentControlReadModel,
  type IUseDocumentControlReadModelResult,
} from './useDocumentControlReadModel';
import type { IPccDocumentsReadModelClient } from './documentControlViewModel';

export interface PccDocumentControlReadModelContentProps {
  readonly client: IPccDocumentsReadModelClient;
}

function fallbackLane(laneId: DocumentControlWave7LaneId): IPccDocumentControlLaneViewModel {
  return {
    laneId,
    title: WAVE7_LANE_TITLES[laneId],
    description: WAVE7_LANE_DESCRIPTIONS[laneId],
    entries: [],
    health: [],
    warningText: laneId === 'my-project-files' ? MY_PROJECT_FILES_WARNING_TEXT : undefined,
  };
}

function laneViewModel(
  result: IUseDocumentControlReadModelResult,
  laneId: DocumentControlWave7LaneId,
): IPccDocumentControlLaneViewModel {
  if (result.status === 'preview' && result.viewModel) {
    return result.viewModel.lanes[laneId];
  }
  return fallbackLane(laneId);
}

export const PccDocumentControlReadModelContent: FC<PccDocumentControlReadModelContentProps> = ({
  client,
}) => {
  const result = useDocumentControlReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);
  const status: 'loading' | 'preview' | 'error' = result.status;

  // Loading and error branches replace the entire bento composition with
  // the single state card (matches the Approvals 4B-05 / Site Health
  // 4B-08 single-card degraded pattern).
  if (status === 'loading' || status === 'error') {
    return <PccDocumentControlStateCard readModelStatus={status} />;
  }

  // status === 'preview' — render the operational composition. The
  // state card is prepended only for the source statuses that the
  // prior `PccDocumentsHeaderCard.cueFor()` resolved to a non-default
  // cue (loading / error are handled above; backend-unavailable and
  // source-unavailable produce non-default cues; other degraded
  // statuses fall through to the default cue and therefore did not
  // previously surface a state-level message — those branches keep
  // that behavior here).
  const stateKind = resolveDocumentControlStateKind(status, result.sourceStatus);
  return (
    <Fragment>
      {stateKind !== null && (
        <PccDocumentControlStateCard readModelStatus={status} sourceStatus={result.sourceStatus} />
      )}
      {WAVE7_LANE_ORDER.map((laneId) => (
        <PccDocumentControlLaneCard key={laneId} laneViewModel={laneViewModel(result, laneId)} />
      ))}
      <PccDocumentControlPermissionsCard viewModel={result.viewModel} />
      <PccDocumentControlReviewsCard viewModel={result.viewModel} />
    </Fragment>
  );
};

export default PccDocumentControlReadModelContent;
