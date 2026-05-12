import { Fragment, type FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccDocumentControlStateCard } from './PccDocumentControlStateCard';
import { PccDocumentControlReadModelContent } from './PccDocumentControlReadModelContent';
import { PccDocumentControlExplorerShell } from './PccDocumentControlExplorerShell';
import { type IPccDocumentsReadModelClient } from './documentControlViewModel';

/**
 * Phase 08 wave-b13 Prompt 10C — Document Control surface entry point.
 *
 * Read-model client supplied  → `PccDocumentControlReadModelContent` owns
 *   preview / loading / error branching.
 * No client supplied          → render the source-unavailable state card
 *   + a single full-width Document Control Explorer card. The legacy
 *   lane / permissions / reviews composition has moved off the ready
 *   path; legacy components remain on disk for Prompt 10F reconciliation.
 *
 * Shell-owned active-panel posture is preserved: this surface emits no
 * `data-pcc-active-surface-panel` marker; the shell `<main role="tabpanel">`
 * remains the sole carrier.
 */
export interface PccDocumentsSurfaceProps {
  readonly readModelClient?: IPccDocumentsReadModelClient;
}

export const PccDocumentsSurface: FC<PccDocumentsSurfaceProps> = ({ readModelClient }) => {
  if (readModelClient) {
    return <PccDocumentControlReadModelContent client={readModelClient} />;
  }
  return (
    <Fragment>
      <PccDocumentControlStateCard readModelStatus="preview" sourceStatus="source-unavailable" />
      <PccDashboardCard
        footprint="full"
        tier="tier1"
        region="operational"
        title="Document Control Explorer"
        headingLevel={2}
      >
        <PccDocumentControlExplorerShell />
      </PccDashboardCard>
    </Fragment>
  );
};

export default PccDocumentsSurface;
