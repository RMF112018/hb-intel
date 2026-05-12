import { Fragment, type FC } from 'react';
import { type PccModuleId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccDocumentControlStateCard } from './PccDocumentControlStateCard';
import { PccDocumentControlReadModelContent } from './PccDocumentControlReadModelContent';
import { PccDocumentControlExplorerShell } from './PccDocumentControlExplorerShell';
import { type IPccDocumentsReadModelClient } from './documentControlViewModel';

/**
 * Phase 08 wave-b13 Prompt 10D — Document Control surface entry point.
 *
 * Read-model client supplied  → `PccDocumentControlReadModelContent` owns
 *   preview / loading / error branching and forwards `activeModuleId`
 *   into the Explorer shell.
 * No client supplied          → render the source-unavailable state card
 *   + a single full-width Document Control Explorer card. `activeModuleId`
 *   is forwarded to the Explorer shell so module-focus mapping resolves
 *   even when no read-model client is present.
 *
 * Shell-owned active-panel posture is preserved: this surface emits no
 * `data-pcc-active-surface-panel` marker; the shell `<main role="tabpanel">`
 * remains the sole carrier.
 */
export interface PccDocumentsSurfaceProps {
  readonly readModelClient?: IPccDocumentsReadModelClient;
  /**
   * Optional active-module hint. Threaded through from `PccSurfaceRouter`
   * so the Explorer shell can resolve Document Control module ids to a
   * deterministic explorer focus (Prompt 10D `resolveExplorerFocusTarget`).
   */
  readonly activeModuleId?: PccModuleId;
}

export const PccDocumentsSurface: FC<PccDocumentsSurfaceProps> = ({
  readModelClient,
  activeModuleId,
}) => {
  if (readModelClient) {
    return (
      <PccDocumentControlReadModelContent
        client={readModelClient}
        activeModuleId={activeModuleId}
      />
    );
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
        <PccDocumentControlExplorerShell activeModuleId={activeModuleId} externalReferences={[]} />
      </PccDashboardCard>
    </Fragment>
  );
};

export default PccDocumentsSurface;
