import type { FC } from 'react';
import { PCC_MVP_SURFACES, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../layout/PccDashboardCard';
import { PccPreviewState } from '../ui/PccPreviewState';
import { PccProjectHome } from '../surfaces/projectHome/PccProjectHome';

export interface PccSurfaceRouterProps {
  activeSurfaceId: PccMvpSurfaceId;
}

/**
 * Renders the active surface inside `<PccBentoGrid>`.
 *
 * - `project-home` → full Project Home bento dashboard (10 cards as direct
 *   children of the bento grid via a React fragment).
 * - All other MVP surfaces → single full-width preview-only card with the
 *   surface's display name and description from `PCC_MVP_SURFACES`.
 *
 * The Prompt 03 corrective bento invariant and the Prompt 04 single
 * active-surface-panel invariant continue to hold: only one element in
 * the rendered tree carries `data-pcc-active-surface-panel`, equal to the
 * active surface id.
 */
export const PccSurfaceRouter: FC<PccSurfaceRouterProps> = ({ activeSurfaceId }) => {
  if (activeSurfaceId === 'project-home') {
    return <PccProjectHome />;
  }

  const surface = PCC_MVP_SURFACES[activeSurfaceId];
  return (
    <PccDashboardCard
      key={activeSurfaceId}
      footprint="full"
      eyebrow="MVP Surface"
      title={surface.displayName}
      dataActiveSurfacePanel={activeSurfaceId}
    >
      <PccPreviewState
        state="unavailable-fixture"
        title={surface.displayName}
        description={surface.description}
      />
    </PccDashboardCard>
  );
};

export default PccSurfaceRouter;
