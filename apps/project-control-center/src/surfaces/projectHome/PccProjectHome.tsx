import { Fragment, type FC } from 'react';
import { PccProjectIntelligenceCard } from './PccProjectIntelligenceCard';
import { PccPriorityActionsCard } from './PccPriorityActionsCard';
import { PccSiteHealthSummaryCard } from './PccSiteHealthSummaryCard';
import { PccDocumentControlCard } from './PccDocumentControlCard';
import { PccProjectReadinessCard } from './PccProjectReadinessCard';
import { PccApprovalsCheckpointsCard } from './PccApprovalsCheckpointsCard';
import { PccExternalSystemsCard } from './PccExternalSystemsCard';
import { PccTeamSnapshotCard } from './PccTeamSnapshotCard';
import { PccMissingConfigurationsCard } from './PccMissingConfigurationsCard';
import { PccRecentActivityCard } from './PccRecentActivityCard';
import { PccProjectHomeReadModelContent } from './PccProjectHomeReadModelContent';
import type { IPccProjectHomeReadModelClient } from './projectHomeViewModel';

interface PccProjectHomeProps {
  /**
   * Wave 4 / Prompt 05 — when supplied, Project Home consumes envelopes
   * through the read-model seam via `PccProjectHomeReadModelContent`.
   * When omitted, the Wave 2 fixture-only render path is used unchanged.
   */
  readonly readModelClient?: IPccProjectHomeReadModelClient;
}

/**
 * Project Home dashboard. Returns a fragment of `PccDashboardCard` children
 * so each card remains a direct DOM child of the surrounding
 * `<PccBentoGrid>` (provided by `PccShell`). Invariants preserved across
 * both render paths:
 *
 *   - exactly one `[data-pcc-active-surface-panel="project-home"]` exists,
 *     carried by the Project Intelligence card;
 *   - all 10 cards are direct children of `[data-pcc-bento-grid]`;
 *   - each card receives a non-zero `data-pcc-column-span` via the bento
 *     context.
 */
export const PccProjectHome: FC<PccProjectHomeProps> = ({ readModelClient }) => {
  if (readModelClient) {
    return <PccProjectHomeReadModelContent client={readModelClient} />;
  }
  return (
    <Fragment>
      <PccProjectIntelligenceCard />
      <PccPriorityActionsCard />
      <PccSiteHealthSummaryCard />
      <PccDocumentControlCard />
      <PccProjectReadinessCard />
      <PccApprovalsCheckpointsCard />
      <PccExternalSystemsCard />
      <PccTeamSnapshotCard />
      <PccMissingConfigurationsCard />
      <PccRecentActivityCard />
    </Fragment>
  );
};

export default PccProjectHome;
