/**
 * Wave 99 / Prompt 05C — Project Readiness unified lifecycle section.
 *
 * Renders three `PccDashboardCard` direct children that surface
 * supplemental unified-lifecycle context (lifecycle timeline,
 * project memory, related records / traceability) inside the
 * Project Readiness Center surface. The section consumes the Wave 99
 * / Prompt 05A hook `useUnifiedLifecycleReadModel` independently of
 * the five existing Project Readiness region hooks
 * (`useProjectReadinessReadModel`, `useLifecycleReadinessReadModel`,
 * `usePermitInspectionControlCenterReadModel`,
 * `useResponsibilityMatrixReadModel`,
 * `useConstraintsLogReadModel`). Loading / error transitions are
 * **localized to the three new cards only** — they never gate or
 * delay the existing region groups (non-gating contract per
 * `feedback_subsection_integration_non_gating`).
 *
 * Returns a `Fragment` of three cards so each card stays a direct
 * DOM child of the surrounding `<PccBentoGrid>` (the bento direct-
 * child invariant). Body content for each card comes from three
 * 04C presentational components — they handle envelope-level
 * `source-unavailable` / `backend-unavailable` / `unauthorized` /
 * etc. via their own internal `PccPreviewState`, so this file only
 * branches on the hook-level `loading` / `error` / `ready`.
 *
 * 05C deliberately omits `ProjectLensSwitcher`,
 * `WarrantyTracePreview`, `ClosedProjectReferencePreview`, and
 * `UnifiedProjectSearchPreview` — Project Readiness already has its
 * own gate / blocker / lens / evidence concepts via its eight
 * readiness regions and nine lifecycle-readiness regions; adding
 * those four would duplicate or overload affordances already
 * present.
 */

import { Fragment, type FC } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import {
  LifecycleTimelinePreview,
  ProjectMemoryPanel,
  RelatedRecordsPanel,
  useUnifiedLifecycleReadModel,
  type IPccUnifiedLifecycleReadModelClient,
  type IUseUnifiedLifecycleReadModelState,
} from '../unifiedLifecycle/index.js';

export interface IPccProjectReadinessUnifiedLifecycleSectionProps {
  readonly client: IPccUnifiedLifecycleReadModelClient;
  readonly projectId: PccProjectId;
  readonly viewerPersona?: PccPersona;
}

export const PccProjectReadinessUnifiedLifecycleSection: FC<
  IPccProjectReadinessUnifiedLifecycleSectionProps
> = ({ client, projectId, viewerPersona }) => {
  const state = useUnifiedLifecycleReadModel(client, projectId, viewerPersona);
  return (
    <Fragment>
      <PccDashboardCard
        footprint="wide"
        eyebrow="Project lifecycle"
        title="Lifecycle Timeline"
      >
        {renderLifecycleTimeline(state)}
      </PccDashboardCard>
      <PccDashboardCard
        footprint="standard"
        eyebrow="Project memory"
        title="Project Memory"
      >
        {renderProjectMemory(state)}
      </PccDashboardCard>
      <PccDashboardCard
        footprint="standard"
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
