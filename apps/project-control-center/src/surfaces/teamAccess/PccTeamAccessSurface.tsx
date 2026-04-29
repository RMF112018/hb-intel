import { Fragment, type FC } from 'react';
import type { PccPersona } from '@hbc/models/pcc';
import { PccTeamAccessHeaderCard } from './PccTeamAccessHeaderCard';
import { PccTeamViewerLaneCard } from './PccTeamViewerLaneCard';
import { PccPermissionRequestLaneCard } from './PccPermissionRequestLaneCard';
import { PccAccessManagerLaneCard } from './PccAccessManagerLaneCard';
import { createTeamAccessPreviewModel, DEFAULT_TEAM_ACCESS_PREVIEW_MODEL } from './shared';

export interface PccTeamAccessSurfaceProps {
  previewPersona?: PccPersona;
  previewHasProjectSiteAccess?: boolean;
}

export const PccTeamAccessSurface: FC<PccTeamAccessSurfaceProps> = ({
  previewPersona,
  previewHasProjectSiteAccess,
}) => {
  const model =
    typeof previewPersona === 'string' && typeof previewHasProjectSiteAccess === 'boolean'
      ? createTeamAccessPreviewModel(previewPersona, previewHasProjectSiteAccess)
      : DEFAULT_TEAM_ACCESS_PREVIEW_MODEL;

  const showTeamViewer = model.branch === 'access-manager' || model.branch === 'has-project-access';
  const showPermissionRequest = model.branch === 'access-manager' || model.branch === 'needs-project-access';
  const showAccessManager = model.branch === 'access-manager';

  return (
    <Fragment>
      <PccTeamAccessHeaderCard />
      {showTeamViewer ? <PccTeamViewerLaneCard model={model} /> : null}
      {showPermissionRequest ? <PccPermissionRequestLaneCard model={model} /> : null}
      {showAccessManager ? <PccAccessManagerLaneCard model={model} /> : null}
    </Fragment>
  );
};

export default PccTeamAccessSurface;
