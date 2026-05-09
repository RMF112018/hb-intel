import { Fragment, type FC } from 'react';
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
 *   - shell `<main role="tabpanel">` carries the
 *     `data-pcc-active-surface-panel="project-home"` marker; no in-grid
 *     compatibility card is required (Wave 15A wave-b9 Prompt 4B-01 moved
 *     project-home into SURFACES_WITH_SHELL_ONLY_PANEL after the duplicate
 *     `PccProjectIntelligenceCard` header was removed);
 *   - every card is a direct child of `[data-pcc-bento-grid]`;
 *   - each card receives a non-zero `data-pcc-column-span` via the bento
 *     context.
 *
 * First-scan composition order surfaces the highest-frequency operational
 * signals (priority actions → pending decisions → readiness → documents →
 * health → setup gaps) before reference and history content.
 */
export const PccProjectHome: FC<PccProjectHomeProps> = ({ readModelClient }) => {
  if (readModelClient) {
    return <PccProjectHomeReadModelContent client={readModelClient} />;
  }
  return (
    <Fragment>
      <PccPriorityActionsCard />
      <PccApprovalsCheckpointsCard />
      <PccProjectReadinessCard />
      <PccDocumentControlCard />
      <PccSiteHealthSummaryCard />
      <PccMissingConfigurationsCard />
      <PccExternalSystemsCard />
      <PccTeamSnapshotCard />
      <PccRecentActivityCard />
    </Fragment>
  );
};

export default PccProjectHome;
