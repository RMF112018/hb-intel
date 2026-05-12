import type { FC } from 'react';
import { normalizePrimaryTabId, type PccModuleId, type PccPrimaryTabId } from '@hbc/models/pcc';
import { PccProjectHome } from '../surfaces/projectHome/PccProjectHome';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';
import { PccPrimaryDashboardSurface } from '../surfaces/phase05Dashboard/PccPrimaryDashboardSurface';
import type { IPccProjectHomeReadModelClient } from '../surfaces/projectHome/projectHomeViewModel';
import type { IPccTeamAccessReadModelClient } from '../surfaces/teamAccess/useTeamAccessReadModel';
import type { IPccDocumentsReadModelClient } from '../surfaces/documents/documentControlViewModel';
import type { IPccProjectReadinessReadModelClient } from '../surfaces/projectReadiness/projectReadinessViewModel';
import type { IPccPermitInspectionControlCenterReadModelClient } from '../surfaces/projectReadiness/permitInspectionControlCenterViewModel';
import type { IPccResponsibilityMatrixReadModelClient } from '../surfaces/responsibilityMatrix/responsibilityMatrixViewModel';
import type { IPccConstraintsLogReadModelClient } from '../surfaces/constraintsLog/constraintsLogViewModel';
import type { IPccBuyoutLogReadModelClient } from '../surfaces/buyoutLog/buyoutLogViewModel';
import type { IPccApprovalsReadModelClient } from '../surfaces/approvals/approvalsViewModel';
import type { IPccLaunchPadReadModelClient } from '../surfaces/externalSystems/launchPadViewModel';

/**
 * Combined narrow read-model client surface for the router. Lists the
 * methods consumed by surfaces that opt into the read-model seam (Project
 * Home, Team & Access, Documents, Project Readiness, Approvals, External
 * Systems Launch Pad). The full `IPccReadModelClient` returned by
 * `createPccReadModelClient` flows in via TypeScript structural typing.
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
    IPccApprovalsReadModelClient,
    IPccLaunchPadReadModelClient {}

export interface PccSurfaceRouterProps {
  activePrimaryTabId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  /**
   * Opt-in read-model client. Threaded to surfaces that consume
   * envelope-driven read-models. Other surfaces remain fixture/preview
   * driven.
   */
  readModelClient?: IPccSurfaceRouterReadModelClient;
  /**
   * Phase 06 Prompt 02 — `shell.selectModule` callback. Threaded only to
   * `PccProjectHome` for the Phase 06 card-level gateway wiring; other
   * surfaces are not yet integrated with this seam.
   */
  onSelectModule?: (id: PccModuleId) => void;
}

/**
 * Renders the active Phase 05 primary-tab dashboard inside `<PccBentoGrid>`.
 *
 * - `project-home` → existing `PccProjectHome` (10-card preview / read-model
 *   bento dashboard).
 * - `documents` → `PccDocumentsSurface` (Document Control Explorer
 *   single-card bento with root-level source rail and folder / category
 *   drill-down; receives optional `activeModuleId` for module-focus
 *   mapping via `resolveExplorerFocusTarget`).
 * - `core-tools`, `estimating-preconstruction`, `startup-closeout`,
 *   `project-controls`, `cost-time`, `systems-administration` → reusable
 *   `PccPrimaryDashboardSurface` (overview + module status + selected
 *   module context).
 * - Defensive fallback: any unknown primary tab id normalizes to
 *   `project-home` (`normalizePrimaryTabId`).
 *
 * Bento direct-child invariant: every routed surface returns a
 * `Fragment` of `PccDashboardCard` children so they become direct DOM
 * children of `[data-pcc-bento-grid]`. The shell `<main role="tabpanel">`
 * remains the sole semantic owner of `data-pcc-active-surface-panel`.
 */
export const PccSurfaceRouter: FC<PccSurfaceRouterProps> = ({
  activePrimaryTabId,
  activeModuleId,
  readModelClient,
  onSelectModule,
}) => {
  const tabId = normalizePrimaryTabId(activePrimaryTabId);
  switch (tabId) {
    case 'project-home':
      return <PccProjectHome readModelClient={readModelClient} onSelectModule={onSelectModule} />;
    case 'documents':
      return (
        <PccDocumentsSurface readModelClient={readModelClient} activeModuleId={activeModuleId} />
      );
    case 'core-tools':
    case 'estimating-preconstruction':
    case 'startup-closeout':
    case 'project-controls':
    case 'cost-time':
    case 'systems-administration':
      return (
        <PccPrimaryDashboardSurface activePrimaryTabId={tabId} activeModuleId={activeModuleId} />
      );
    default:
      return <PccProjectHome readModelClient={readModelClient} onSelectModule={onSelectModule} />;
  }
};

export default PccSurfaceRouter;
