/**
 * Wave 99 / Prompt 05B — Project Home unified lifecycle section.
 *
 * Renders four `PccDashboardCard` direct children that surface
 * unified-lifecycle preview content (lifecycle timeline, project
 * memory, project lens, related records) inside Project Home. The
 * section consumes the Wave 99 / Prompt 05A hook
 * `useUnifiedLifecycleReadModel` independently of
 * `useProjectHomeReadModel`; the two hooks resolve on independent
 * microtasks and the section's loading/error state is contained
 * inside its own four cards. The existing ten Project Home cards
 * never depend on this section's hook state.
 *
 * Returns a `Fragment` of cards so each card stays a direct DOM
 * child of the surrounding `<PccBentoGrid>` (the bento direct-child
 * invariant). Body content for each card comes from the four 04C
 * presentational components — they handle envelope-level
 * source-unavailable / backend-unavailable / unauthorized / etc.
 * via their own internal `PccPreviewState` branching, so this file
 * only branches on the hook-level `loading` / `error` / `ready`.
 *
 * Lens stays preview-only (no active lens local state). Unified
 * search is intentionally NOT included on Project Home in 05B.
 */

import { Fragment, type FC } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import {
  LifecycleTimelinePreview,
  ProjectLensSwitcher,
  ProjectMemoryPanel,
  RelatedRecordsPanel,
  useUnifiedLifecycleReadModel,
  type IPccUnifiedLifecycleReadModelClient,
  type IUseUnifiedLifecycleReadModelState,
} from '../unifiedLifecycle/index.js';

export interface IPccProjectHomeUnifiedLifecycleSectionProps {
  readonly client: IPccUnifiedLifecycleReadModelClient;
  readonly projectId: PccProjectId;
  readonly viewerPersona?: PccPersona;
}

export const PccProjectHomeUnifiedLifecycleSection: FC<
  IPccProjectHomeUnifiedLifecycleSectionProps
> = ({ client, projectId, viewerPersona }) => {
  const state = useUnifiedLifecycleReadModel(client, projectId, viewerPersona);
  return (
    <Fragment>
      <PccDashboardCard
        footprint="detail"
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
        footprint="rail"
        tier="tier3"
        region="rail"
        eyebrow="Lenses"
        title="Project Lens"
      >
        {renderProjectLens(state)}
      </PccDashboardCard>
      <PccDashboardCard
        footprint="detail"
        tier="tier3"
        region="detail"
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

function renderProjectLens(state: IUseUnifiedLifecycleReadModelState) {
  if (state.status === 'loading') return <PccPreviewState state="loading" />;
  if (state.status === 'error') return <PccPreviewState state="error" />;
  return <ProjectLensSwitcher viewModel={state.viewModel.projectLenses} />;
}

function renderRelatedRecords(state: IUseUnifiedLifecycleReadModelState) {
  if (state.status === 'loading') return <PccPreviewState state="loading" />;
  if (state.status === 'error') return <PccPreviewState state="error" />;
  return <RelatedRecordsPanel viewModel={state.viewModel.projectTraceability} />;
}

export default PccProjectHomeUnifiedLifecycleSection;
