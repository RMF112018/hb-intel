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
 *
 * Phase 06 Prompt 02 — the nine-card operational spine renders first in
 * the canonical Phase 06 order (Priority Actions, Site Health Summary,
 * Document Control Center, Project Readiness, Approvals & Checkpoints,
 * Missing Configurations, External Platforms, Team Snapshot, Recent
 * Activity). Lifecycle / Ask HBI / Procore Snapshot / Project Memory /
 * Project Lens / Related Records render after the spine via
 * `PccProjectHomeUnifiedLifecycleSection` (Lifecycle Timeline →
 * Ask HBI + Procore Snapshot inside `renderAfterTimeline` → Project
 * Memory → Project Lens → Related Records).
 */

import type { FC } from 'react';
import { SAMPLE_PROJECT_PROFILE, type PccModuleId } from '@hbc/models/pcc';
import { PccAnalyticsCard } from '../../analytics';
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
import {
  PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES,
  PROJECT_HOME_ANALYTICS_VIEW_MODELS,
} from './projectHomeAnalytics';
import {
  PROJECT_HOME_OPERATIONAL_GATEWAYS,
  PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES,
} from './projectHomeChoreography';
import { useProjectHomeReadModel } from './useProjectHomeReadModel';
import type { IPccProjectHomeReadModelClient } from './projectHomeViewModel';

interface PccProjectHomeReadModelContentProps {
  readonly client: IPccProjectHomeReadModelClient;
  readonly onSelectModule?: (id: PccModuleId) => void;
}

export const PccProjectHomeReadModelContent: FC<PccProjectHomeReadModelContentProps> = ({
  client,
  onSelectModule,
}) => {
  const { viewModel } = useProjectHomeReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);

  return (
    <>
      <PccPriorityActionsCard
        state={viewModel?.priorityActions.state ?? 'preview'}
        actions={viewModel?.priorityActions.data}
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.priorityActions}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.priorityActions}
        onSelectModule={onSelectModule}
      />
      <PccSiteHealthSummaryCard
        state={viewModel?.siteHealth.state ?? 'preview'}
        summary={viewModel?.siteHealth.data}
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.siteHealthSummary}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.siteHealthSummary}
        onSelectModule={onSelectModule}
      />
      <PccDocumentControlCard
        state={viewModel?.documentControl.state ?? 'preview'}
        sources={viewModel?.documentControl.data}
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.documentControl}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.documentControl}
        onSelectModule={onSelectModule}
      />
      <PccAnalyticsCard
        viewModel={PROJECT_HOME_ANALYTICS_VIEW_MODELS.actionExposureMix}
        footprint="standard"
        tier="tier2"
        region="operational"
        spanOverrides={PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES.actionExposureMix}
      />
      <PccAnalyticsCard
        viewModel={PROJECT_HOME_ANALYTICS_VIEW_MODELS.projectHealthTrend}
        footprint="standard"
        tier="tier2"
        region="operational"
        spanOverrides={PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES.projectHealthTrend}
      />
      <PccProjectReadinessCard
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.projectReadiness}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.projectReadiness}
        onSelectModule={onSelectModule}
      />
      <PccApprovalsCheckpointsCard
        viewModel={viewModel?.approvalsCard}
        spanOverrides={PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES.approvalsCheckpoints}
        gateway={PROJECT_HOME_OPERATIONAL_GATEWAYS.approvalsCheckpoints}
        onSelectModule={onSelectModule}
      />
      <PccAnalyticsCard
        viewModel={PROJECT_HOME_ANALYTICS_VIEW_MODELS.readinessApprovalRollup}
        footprint="standard"
        tier="tier2"
        region="operational"
        spanOverrides={PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES.readinessApprovalRollup}
      />
      <PccMissingConfigurationsCard
        state={viewModel?.missingConfigurations.state ?? 'preview'}
        missingConfigurations={viewModel?.missingConfigurations.data}
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
          </>
        }
      />
    </>
  );
};

export default PccProjectHomeReadModelContent;
