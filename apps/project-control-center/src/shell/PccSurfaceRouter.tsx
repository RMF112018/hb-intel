import type { FC } from 'react';
import { PCC_MVP_SURFACES, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../layout/PccDashboardCard';
import { PccPreviewState } from '../ui/PccPreviewState';
import { PccProjectHome } from '../surfaces/projectHome/PccProjectHome';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import { PccSiteHealthSurface } from '../surfaces/siteHealth/PccSiteHealthSurface';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';
import { PccControlCenterSettingsSurface } from '../surfaces/controlCenterSettings/PccControlCenterSettingsSurface';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import type { IPccProjectHomeReadModelClient } from '../surfaces/projectHome/projectHomeViewModel';
import type { IPccTeamAccessReadModelClient } from '../surfaces/teamAccess/useTeamAccessReadModel';
import type { IPccDocumentsReadModelClient } from '../surfaces/documents/documentControlViewModel';

/**
 * Combined narrow read-model client surface for the router. Lists only
 * the methods consumed by Project Home, Team & Access, and Documents;
 * the full `IPccReadModelClient` returned by `createPccReadModelClient`
 * flows in via TypeScript structural typing.
 */
export interface IPccSurfaceRouterReadModelClient
  extends IPccProjectHomeReadModelClient,
    IPccTeamAccessReadModelClient,
    IPccDocumentsReadModelClient {}

export interface PccSurfaceRouterProps {
  activeSurfaceId: PccMvpSurfaceId;
  /**
   * Wave 4 / Prompt 05 + Wave 6 / Prompt 06 — opt-in read-model client.
   * Threaded to exactly two surfaces: Project Home and Team & Access.
   * Other surfaces remain fixture/preview-driven.
   */
  readModelClient?: IPccSurfaceRouterReadModelClient;
}

/**
 * Renders the active surface inside `<PccBentoGrid>`.
 *
 * - `project-home` → full Project Home bento dashboard (10 cards as direct
 *   children of the bento grid via a React fragment).
 * - `team-and-access` → Team & Access surface; receives the read-model
 *   client when provided so the seam round-trip is exercised.
 * - Prompt 06/07 preview surfaces route to dedicated fragment surfaces.
 * - Any remaining fallback surface ids route to a single full-width
 *   preview-only card with metadata from `PCC_MVP_SURFACES`.
 *
 * The Prompt 03 corrective bento invariant and the Prompt 04 single
 * active-surface-panel invariant continue to hold: only one element in
 * the rendered tree carries `data-pcc-active-surface-panel`, equal to the
 * active surface id.
 */
export const PccSurfaceRouter: FC<PccSurfaceRouterProps> = ({
  activeSurfaceId,
  readModelClient,
}) => {
  switch (activeSurfaceId) {
    case 'project-home':
      return <PccProjectHome readModelClient={readModelClient} />;
    case 'team-and-access':
      return <PccTeamAccessSurface readModelClient={readModelClient} />;
    case 'documents':
      return <PccDocumentsSurface readModelClient={readModelClient} />;
    case 'project-readiness':
      return <PccProjectReadinessSurface />;
    case 'approvals':
      return <PccApprovalsSurface />;
    case 'external-systems':
      return <PccExternalSystemsSurface />;
    case 'control-center-settings':
      return <PccControlCenterSettingsSurface />;
    case 'site-health':
      return <PccSiteHealthSurface />;
    default:
      break;
  }

  const surface = PCC_MVP_SURFACES[activeSurfaceId as PccMvpSurfaceId];
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
