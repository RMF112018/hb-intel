import { Fragment, type FC } from 'react';
import type { PccModuleId } from '@hbc/models/pcc';
import { PccPriorityActionsCard } from './PccPriorityActionsCard';
import { PccSiteHealthSummaryCard } from './PccSiteHealthSummaryCard';
import { PccDocumentControlCard } from './PccDocumentControlCard';
import { PccProjectReadinessCard } from './PccProjectReadinessCard';
import { PccApprovalsCheckpointsCard } from './PccApprovalsCheckpointsCard';
import { PccMissingConfigurationsCard } from './PccMissingConfigurationsCard';
import { PccExternalSystemsCard } from './PccExternalSystemsCard';
import { PccTeamSnapshotCard } from './PccTeamSnapshotCard';
import { PccRecentActivityCard } from './PccRecentActivityCard';
import { PccProjectHomeReadModelContent } from './PccProjectHomeReadModelContent';
import {
  PROJECT_HOME_OPERATIONAL_GATEWAYS,
  PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES,
} from './projectHomeChoreography';
import type { IPccProjectHomeReadModelClient } from './projectHomeViewModel';

interface PccProjectHomeProps {
  /**
   * Wave 4 / Prompt 05 — when supplied, Project Home consumes envelopes
   * through the read-model seam via `PccProjectHomeReadModelContent`.
   * When omitted, the Wave 2 fixture-only render path is used unchanged.
   */
  readonly readModelClient?: IPccProjectHomeReadModelClient;
  /**
   * Phase 06 Prompt 02 — `shell.selectModule` callback threaded from
   * `PccApp -> PccSurfaceRouter -> PccProjectHome -> card.action ->
   * PccProjectHomeGatewayAction`. Fires when an enabled gateway button is
   * clicked. Optional so isolated fixture rendering still works.
   */
  readonly onSelectModule?: (id: PccModuleId) => void;
}

/**
 * Project Home dashboard. Returns a fragment of `PccDashboardCard` children
 * so each card remains a direct DOM child of the surrounding
 * `<PccBentoGrid>` (provided by `PccShell`). Invariants preserved across
 * both render paths:
 *
 *   - shell `<main role="tabpanel">` carries the
 *     `data-pcc-active-surface-panel="project-home"` marker; no in-grid
 *     compatibility card is required (Wave 15A wave-b9 Prompt 4B-01 moved
 *     project-home into SURFACES_WITH_SHELL_ONLY_PANEL after the duplicate
 *     `PccProjectIntelligenceCard` header was removed);
 *   - every card is a direct child of `[data-pcc-bento-grid]`;
 *   - each card receives a non-zero `data-pcc-column-span` via the bento
 *     context.
 *
 * Phase 06 Prompt 02 — both render paths begin with the canonical nine-card
 * operational spine (Priority Actions, Site Health Summary, Document Control
 * Center, Project Readiness, Approvals & Checkpoints, Missing Configurations,
 * External Platforms, Team Snapshot, Recent Activity) and apply the approved
 * span override matrix at 12-column / 10-column modes. The read-model path
 * additionally renders Lifecycle / Ask HBI / Procore / Memory / Lens /
 * Related Records below the spine, owned by `PccProjectHomeReadModelContent`.
 */
export const PccProjectHome: FC<PccProjectHomeProps> = ({ readModelClient, onSelectModule }) => {
  if (readModelClient) {
    return (
      <PccProjectHomeReadModelContent client={readModelClient} onSelectModule={onSelectModule} />
    );
  }
  return (
    <Fragment>
      <PccPriorityActionsCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.priorityActions}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.priorityActions}
        onSelectModule={onSelectModule}
      />
      <PccSiteHealthSummaryCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.siteHealthSummary}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.siteHealthSummary}
        onSelectModule={onSelectModule}
      />
      <PccDocumentControlCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.documentControl}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.documentControl}
        onSelectModule={onSelectModule}
      />
      <PccProjectReadinessCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.projectReadiness}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.projectReadiness}
        onSelectModule={onSelectModule}
      />
      <PccApprovalsCheckpointsCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.approvalsCheckpoints}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.approvalsCheckpoints}
        onSelectModule={onSelectModule}
      />
      <PccMissingConfigurationsCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.missingConfigurations}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.missingConfigurations}
        onSelectModule={onSelectModule}
      />
      <PccExternalSystemsCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.externalPlatforms}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.externalPlatforms}
        onSelectModule={onSelectModule}
      />
      <PccTeamSnapshotCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.teamSnapshot}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.teamSnapshot}
        onSelectModule={onSelectModule}
      />
      <PccRecentActivityCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.recentActivity}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.recentActivity}
        onSelectModule={onSelectModule}
      />
    </Fragment>
  );
};

export default PccProjectHome;
