import type { FC } from 'react';
import { PCC_MVP_SURFACES, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../layout/PccDashboardCard';
import { PccPreviewState } from '../ui/PccPreviewState';

export interface PccSurfaceRouterProps {
  activeSurfaceId: PccMvpSurfaceId;
}

/**
 * Renders the active surface panel as a single full-width
 * `PccDashboardCard`. Returns the card directly (no wrapper element) so
 * it remains a direct child of `[data-pcc-bento-grid]` and the
 * Prompt-03-corrective bento integration invariant continues to hold.
 *
 * Wave 2 / Prompt 04 scope: every surface renders the same shape — a
 * preview-only card whose visible copy is the surface's display name and
 * description from `@hbc/models/pcc`. Per-surface content lands in
 * subsequent prompts.
 */
export const PccSurfaceRouter: FC<PccSurfaceRouterProps> = ({ activeSurfaceId }) => {
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
