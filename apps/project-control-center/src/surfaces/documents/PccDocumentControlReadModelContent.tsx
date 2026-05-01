/**
 * Wave 7 / Prompt 03B — Document Control read-model content.
 *
 * Rendered by `PccDocumentsSurface` when an explicit
 * `IPccDocumentsReadModelClient` is supplied. Calls
 * `useDocumentControlReadModel` unconditionally so the rule against
 * conditional hook invocation is preserved. Always renders header card
 * + three lane cards as a Fragment so each remains a direct child of
 * `[data-pcc-bento-grid]`.
 */

import { Fragment, type FC } from 'react';
import { SAMPLE_PROJECT_PROFILE } from '@hbc/models/pcc';
import { PccDocumentsHeaderCard } from './PccDocumentsHeaderCard';
import { PccDocumentControlLaneCard } from './PccDocumentControlLaneCard';
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

  return (
    <Fragment>
      <PccDocumentsHeaderCard
        readModelStatus={status}
        sourceStatus={result.sourceStatus}
      />
      {WAVE7_LANE_ORDER.map((laneId) => (
        <PccDocumentControlLaneCard
          key={laneId}
          laneViewModel={laneViewModel(result, laneId)}
        />
      ))}
    </Fragment>
  );
};

export default PccDocumentControlReadModelContent;
