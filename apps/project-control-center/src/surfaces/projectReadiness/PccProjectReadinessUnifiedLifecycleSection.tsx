/**
 * Wave 99 / Prompt 05C — Project Readiness unified lifecycle section.
 *
 * Wave 15A B5 / Prompt 01 update: this component is now presentational.
 * Its parent (`PccProjectReadinessSurface` `ReadModelContent`) calls
 * `useUnifiedLifecycleReadModel` directly so hook acquisition stays
 * unconditional even when the section is not rendered (the surface's
 * default command view does not render this section). The component
 * receives the hook's existing return state
 * (`IUseUnifiedLifecycleReadModelState`) as a prop and branches on it
 * exactly as before.
 *
 * Renders three `PccDashboardCard` direct children (lifecycle
 * timeline, project memory, related records / traceability) so each
 * card stays a direct DOM child of `<PccBentoGrid>` (the bento
 * direct-child invariant). Loading / error transitions are
 * **localized to the three cards only** — they never gate or delay
 * the existing region groups (non-gating contract per
 * `feedback_subsection_integration_non_gating`).
 */

import { Fragment, type FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import {
  LifecycleTimelinePreview,
  ProjectMemoryPanel,
  RelatedRecordsPanel,
  type IUseUnifiedLifecycleReadModelState,
} from '../unifiedLifecycle/index.js';

export interface IPccProjectReadinessUnifiedLifecycleSectionProps {
  readonly state: IUseUnifiedLifecycleReadModelState;
}

export const PccProjectReadinessUnifiedLifecycleSection: FC<
  IPccProjectReadinessUnifiedLifecycleSectionProps
> = ({ state }) => {
  return (
    <Fragment>
      <PccDashboardCard
        footprint="wide"
        tier="tier2"
        region="detail"
        eyebrow="Project lifecycle"
        title="Lifecycle Timeline"
      >
        {renderLifecycleTimeline(state)}
      </PccDashboardCard>
      <PccDashboardCard
        footprint="standard"
        tier="tier3"
        region="reference"
        eyebrow="Project memory"
        title="Project Memory"
      >
        {renderProjectMemory(state)}
      </PccDashboardCard>
      <PccDashboardCard
        footprint="standard"
        tier="tier3"
        region="reference"
        eyebrow="Traceability"
        title="Related Records"
      >
        {renderRelatedRecords(state)}
      </PccDashboardCard>
    </Fragment>
  );
};

function renderLifecycleTimeline(state: IUseUnifiedLifecycleReadModelState) {
  if (state.status === 'loading') return <PccPreviewState state="loading" />;
  if (state.status === 'error') return <PccPreviewState state="error" />;
  return <LifecycleTimelinePreview viewModel={state.viewModel.lifecycleTimeline} />;
}

function renderProjectMemory(state: IUseUnifiedLifecycleReadModelState) {
  if (state.status === 'loading') return <PccPreviewState state="loading" />;
  if (state.status === 'error') return <PccPreviewState state="error" />;
  return <ProjectMemoryPanel viewModel={state.viewModel.projectMemory} />;
}

function renderRelatedRecords(state: IUseUnifiedLifecycleReadModelState) {
  if (state.status === 'loading') return <PccPreviewState state="loading" />;
  if (state.status === 'error') return <PccPreviewState state="error" />;
  return <RelatedRecordsPanel viewModel={state.viewModel.projectTraceability} />;
}

export default PccProjectReadinessUnifiedLifecycleSection;
