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
import type { IPccProjectReadinessReadModelClient } from '../surfaces/projectReadiness/projectReadinessViewModel';
import type { IPccPermitInspectionControlCenterReadModelClient } from '../surfaces/projectReadiness/permitInspectionControlCenterViewModel';
import type { IPccResponsibilityMatrixReadModelClient } from '../surfaces/responsibilityMatrix/responsibilityMatrixViewModel';
import type { IPccConstraintsLogReadModelClient } from '../surfaces/constraintsLog/constraintsLogViewModel';
import type { IPccBuyoutLogReadModelClient } from '../surfaces/buyoutLog/buyoutLogViewModel';
import type { IPccApprovalsReadModelClient } from '../surfaces/approvals/approvalsViewModel';

/**
 * Combined narrow read-model client surface for the router. Lists the
 * methods consumed by surfaces that opt into the read-model seam (Project
 * Home, Team & Access, Documents, Project Readiness — the latter also
 * hosts Wave 9 Lifecycle, Wave 10 Permit & Inspection, Wave 11
 * Responsibility Matrix, Wave 12 Constraints Log, and Wave 13 Buyout Log
 * regions — and the Wave 14 Approvals / Checkpoints surface). The full
 * `IPccReadModelClient` returned by `createPccReadModelClient` flows in
 * via TypeScript structural typing.
 */
export interface IPccSurfaceRouterReadModelClient
  extends
    IPccProjectHomeReadModelClient,
    IPccTeamAccessReadModelClient,
    IPccDocumentsReadModelClient,
    IPccProjectReadinessReadModelClient,
    IPccPermitInspectionControlCenterReadModelClient,
    IPccResponsibilityMatrixReadModelClient,
    IPccConstraintsLogReadModelClient,
    IPccBuyoutLogReadModelClient,
    IPccApprovalsReadModelClient {}

export interface PccSurfaceRouterProps {
  activeSurfaceId: PccMvpSurfaceId;
  /**
   * Opt-in read-model client. Threaded to surfaces that consume
   * envelope-driven read-models. Other surfaces remain fixture/preview
   * driven.
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
      return <PccProjectReadinessSurface readModelClient={readModelClient} />;
    case 'approvals':
      return <PccApprovalsSurface readModelClient={readModelClient} />;
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
