import { Fragment, type FC } from 'react';
import { PccDocumentControlStateCard } from './PccDocumentControlStateCard';
import { PccDocumentControlLaneCard } from './PccDocumentControlLaneCard';
import { PccDocumentControlPermissionsCard } from './PccDocumentControlPermissionsCard';
import { PccDocumentControlReviewsCard } from './PccDocumentControlReviewsCard';
import { PccDocumentControlReadModelContent } from './PccDocumentControlReadModelContent';
import {
  WAVE7_LANE_ORDER,
  WAVE7_LANE_TITLES,
  WAVE7_LANE_DESCRIPTIONS,
  MY_PROJECT_FILES_WARNING_TEXT,
  type DocumentControlWave7LaneId,
  type IPccDocumentControlLaneViewModel,
  type IPccDocumentsReadModelClient,
} from './documentControlViewModel';

/**
 * Wave 7 / Prompt 03B — HB Document Control Center surface.
 *
 * Three-lane shell driven by the document-control read model:
 *
 *   1. Project Record — SharePoint project-site libraries (formal record)
 *   2. My Project Files — current user’s project working folder only
 *   3. External Systems — Procore / Document Crunch / Adobe Sign
 *      visibility and launch metadata only (no writeback / sync / mirror)
 *
 * When `readModelClient` is provided, the surface delegates to
 * `PccDocumentControlReadModelContent` which fetches the envelope and
 * builds a filtered view model. When omitted, the surface renders the
 * same three-lane shell with safe-empty content. Returns a Fragment so
 * each card stays a direct DOM child of `[data-pcc-bento-grid]`.
 *
 * Wave 15A wave-b9 Prompt 4B-09 — `PccDocumentsHeaderCard` was removed
 * (it was the duplicate page-title first card carrying the only
 * branch-spanning `dataActiveSurfacePanel="documents"` marker). The
 * non-ready state copies are now carried by `PccDocumentControlStateCard`
 * (state-aware seam, tier=state / region=state, no active-panel
 * marker). The no-client fallback path uses the state card with
 * `sourceStatus="source-unavailable"` to preserve the prior visible
 * "No document control sources are available for this project."
 * posture. Documents joined `SURFACES_WITH_SHELL_ONLY_PANEL`; the shell
 * `<main role="tabpanel">` is the sole semantic owner of the
 * active-panel marker.
 */
export interface PccDocumentsSurfaceProps {
  readonly readModelClient?: IPccDocumentsReadModelClient;
}

function safeEmptyLane(laneId: DocumentControlWave7LaneId): IPccDocumentControlLaneViewModel {
  return {
    laneId,
    title: WAVE7_LANE_TITLES[laneId],
    description: WAVE7_LANE_DESCRIPTIONS[laneId],
    entries: [],
    health: [],
    warningText: laneId === 'my-project-files' ? MY_PROJECT_FILES_WARNING_TEXT : undefined,
  };
}

export const PccDocumentsSurface: FC<PccDocumentsSurfaceProps> = ({ readModelClient }) => {
  if (readModelClient) {
    return <PccDocumentControlReadModelContent client={readModelClient} />;
  }
  return (
    <Fragment>
      <PccDocumentControlStateCard readModelStatus="preview" sourceStatus="source-unavailable" />
      {WAVE7_LANE_ORDER.map((laneId) => (
        <PccDocumentControlLaneCard key={laneId} laneViewModel={safeEmptyLane(laneId)} />
      ))}
      <PccDocumentControlPermissionsCard />
      <PccDocumentControlReviewsCard viewModel={undefined} />
    </Fragment>
  );
};

export default PccDocumentsSurface;
