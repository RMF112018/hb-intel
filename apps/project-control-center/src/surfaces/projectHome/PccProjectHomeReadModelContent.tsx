/**
 * Project Home opt-in child (Phase 3 / Wave 4 / Prompt 05).
 *
 * Rendered by `PccProjectHome` only when an explicit
 * `IPccProjectHomeReadModelClient` is supplied via mount config. Calls
 * `useProjectHomeReadModel` unconditionally inside this child, so the
 * hook rule against conditional invocation is preserved.
 *
 * During the initial loading microtask, the view model is `undefined`
 * and each card defaults to its fixture fallback at `state="preview"`,
 * matching the Wave 2 visual baseline. After the microtask resolves,
 * cards re-render with envelope-derived state and data.
 */

import type { FC } from 'react';
import { SAMPLE_PROJECT_PROFILE } from '@hbc/models/pcc';
import { PccApprovalsCheckpointsCard } from './PccApprovalsCheckpointsCard';
import { PccDocumentControlCard } from './PccDocumentControlCard';
import { PccExternalSystemsCard } from './PccExternalSystemsCard';
import { PccMissingConfigurationsCard } from './PccMissingConfigurationsCard';
import { PccPriorityActionsCard } from './PccPriorityActionsCard';
import { PccProjectIntelligenceCard } from './PccProjectIntelligenceCard';
import { PccProjectReadinessCard } from './PccProjectReadinessCard';
import { PccProjectHomeUnifiedLifecycleSection } from './PccProjectHomeUnifiedLifecycleSection';
import { PccRecentActivityCard } from './PccRecentActivityCard';
import { PccSiteHealthSummaryCard } from './PccSiteHealthSummaryCard';
import { PccTeamSnapshotCard } from './PccTeamSnapshotCard';
import { useProjectHomeReadModel } from './useProjectHomeReadModel';
import type { IPccProjectHomeReadModelClient } from './projectHomeViewModel';

interface PccProjectHomeReadModelContentProps {
  readonly client: IPccProjectHomeReadModelClient;
}

export const PccProjectHomeReadModelContent: FC<PccProjectHomeReadModelContentProps> = ({
  client,
}) => {
  const { viewModel } = useProjectHomeReadModel(
    client,
    SAMPLE_PROJECT_PROFILE.projectId,
  );

  return (
    <>
      <PccProjectIntelligenceCard
        state={viewModel?.intelligence.state ?? 'preview'}
        profile={viewModel?.intelligence.data}
      />
      <PccPriorityActionsCard
        state={viewModel?.priorityActions.state ?? 'preview'}
        actions={viewModel?.priorityActions.data}
      />
      <PccSiteHealthSummaryCard
        state={viewModel?.siteHealth.state ?? 'preview'}
        summary={viewModel?.siteHealth.data}
      />
      <PccDocumentControlCard
        state={viewModel?.documentControl.state ?? 'preview'}
        sources={viewModel?.documentControl.data}
      />
      <PccProjectReadinessCard />
      <PccApprovalsCheckpointsCard />
      <PccExternalSystemsCard />
      <PccTeamSnapshotCard />
      <PccMissingConfigurationsCard
        state={viewModel?.missingConfigurations.state ?? 'preview'}
        missingConfigurations={viewModel?.missingConfigurations.data}
      />
      <PccRecentActivityCard />
      <PccProjectHomeUnifiedLifecycleSection
        client={client}
        projectId={SAMPLE_PROJECT_PROFILE.projectId}
      />
    </>
  );
};

export default PccProjectHomeReadModelContent;
