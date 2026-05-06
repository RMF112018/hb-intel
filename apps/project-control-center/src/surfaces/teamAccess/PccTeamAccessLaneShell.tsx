import { Fragment, type FC } from 'react';
import type { PccPersona } from '@hbc/models/pcc';
import { PccTeamAccessHeaderCard } from './PccTeamAccessHeaderCard';
import { PccTeamViewerLaneCard } from './PccTeamViewerLaneCard';
import { PccPermissionRequestLaneCard } from './PccPermissionRequestLaneCard';
import { PccAccessManagerLaneCard } from './PccAccessManagerLaneCard';
import { createTeamAccessPreviewModel, DEFAULT_TEAM_ACCESS_PREVIEW_MODEL } from './shared';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';

/**
 * Shared presentational shell for the Team & Access surface.
 *
 * Used by both `PccTeamAccessSurface` (fixture default path) and
 * `PccTeamAccessReadModelContent` (after the read-model hook resolves).
 * Imports neither of those components; the import direction is
 * Surface → LaneShell ← Content with no cycle.
 */
export interface PccTeamAccessLaneShellProps {
  readonly previewPersona?: PccPersona;
  readonly previewHasProjectSiteAccess?: boolean;
}

export const PccTeamAccessLaneShell: FC<PccTeamAccessLaneShellProps> = ({
  previewPersona,
  previewHasProjectSiteAccess,
}) => {
  const model =
    typeof previewPersona === 'string' && typeof previewHasProjectSiteAccess === 'boolean'
      ? createTeamAccessPreviewModel(previewPersona, previewHasProjectSiteAccess)
      : DEFAULT_TEAM_ACCESS_PREVIEW_MODEL;

  const showTeamViewer = model.branch === 'access-manager' || model.branch === 'has-project-access';
  const showPermissionRequest =
    model.branch === 'access-manager' || model.branch === 'needs-project-access';
  const showAccessManager = model.branch === 'access-manager';

  return (
    <Fragment>
      <PccTeamAccessHeaderCard />
      {model.branch !== 'access-manager' ? (
        <PccDashboardCard
          footprint="wide"
          tier="state"
          region="state"
          eyebrow="Access Manager Controls"
          title="Access manager actions"
        >
          <PccPreviewState
            state="unauthorized-persona"
            title="Access manager actions are restricted"
            description="Your role can view team and access context. Only access managers can assign and approve."
          />
        </PccDashboardCard>
      ) : null}
      {showTeamViewer ? <PccTeamViewerLaneCard model={model} /> : null}
      {showPermissionRequest ? <PccPermissionRequestLaneCard model={model} /> : null}
      {showAccessManager ? <PccAccessManagerLaneCard model={model} /> : null}
    </Fragment>
  );
};

export default PccTeamAccessLaneShell;
