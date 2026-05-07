import { Fragment, type FC } from 'react';
import { SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS, SAMPLE_PRIORITY_ACTIONS } from '@hbc/models/pcc';
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
import { buildProjectCommandSummary } from './projectCommandSummary';
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
 *   - every card is a direct child of `[data-pcc-bento-grid]`;
 *   - each card receives a non-zero `data-pcc-column-span` via the bento
 *     context.
 *
 * First-scan composition order surfaces the highest-frequency operational
 * signals (priority actions → setup gaps → operational health → pending
 * decisions → readiness) before reference and history content.
 */
export const PccProjectHome: FC<PccProjectHomeProps> = ({ readModelClient }) => {
  if (readModelClient) {
    return <PccProjectHomeReadModelContent client={readModelClient} />;
  }
  const fixtureCommandSummary = buildProjectCommandSummary({
    priorityActions: SAMPLE_PRIORITY_ACTIONS,
    missingConfigurations: SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
    sourceMode: 'fixture',
  });
  return (
    <Fragment>
      <PccProjectIntelligenceCard commandSummary={fixtureCommandSummary} />
      <PccPriorityActionsCard />
      <PccMissingConfigurationsCard />
      <PccSiteHealthSummaryCard />
      <PccApprovalsCheckpointsCard />
      <PccProjectReadinessCard />
      <PccDocumentControlCard />
      <PccExternalSystemsCard />
      <PccTeamSnapshotCard />
      <PccRecentActivityCard />
    </Fragment>
  );
};

export default PccProjectHome;
