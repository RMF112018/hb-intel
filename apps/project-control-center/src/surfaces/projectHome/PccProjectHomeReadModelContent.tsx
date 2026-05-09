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
import { PccProjectReadinessCard } from './PccProjectReadinessCard';
import { PccProjectHomeAskHbiSection } from './PccProjectHomeAskHbiSection';
import { PccProjectHomeProcoreSnapshotCard } from './PccProjectHomeProcoreSnapshotCard';
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
  const { viewModel } = useProjectHomeReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);

  return (
    <>
      <PccPriorityActionsCard
        state={viewModel?.priorityActions.state ?? 'preview'}
        actions={viewModel?.priorityActions.data}
      />
      <PccApprovalsCheckpointsCard viewModel={viewModel?.approvalsCard} />
      <PccProjectReadinessCard />
      <PccDocumentControlCard
        state={viewModel?.documentControl.state ?? 'preview'}
        sources={viewModel?.documentControl.data}
      />
      <PccSiteHealthSummaryCard
        state={viewModel?.siteHealth.state ?? 'preview'}
        summary={viewModel?.siteHealth.data}
      />
      <PccMissingConfigurationsCard
        state={viewModel?.missingConfigurations.state ?? 'preview'}
        missingConfigurations={viewModel?.missingConfigurations.data}
      />
      <PccProjectHomeUnifiedLifecycleSection
        client={client}
        projectId={SAMPLE_PROJECT_PROFILE.projectId}
        renderAfterTimeline={
          <>
            <PccProjectHomeAskHbiSection
              client={client}
              projectId={SAMPLE_PROJECT_PROFILE.projectId}
            />
            <PccProjectHomeProcoreSnapshotCard
              state={viewModel?.procoreSnapshot.state ?? 'preview'}
              snapshot={viewModel?.procoreSnapshot.data}
            />
            <PccExternalSystemsCard />
            <PccTeamSnapshotCard />
            <PccRecentActivityCard />
          </>
        }
      />
    </>
  );
};

export default PccProjectHomeReadModelContent;
