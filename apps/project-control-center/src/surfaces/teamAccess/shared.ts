import {
  SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
  SAMPLE_TEAM_ACCESS_VIEWER_LANE,
  TEAM_ACCESS_MANAGER_PERSONAS,
  type ITeamAccessAccessManagerLaneModel,
  type ITeamAccessPermissionRequestLaneModel,
  type ITeamAccessViewerLaneModel,
  type PccPersona,
} from '@hbc/models/pcc';

export type TeamAccessBranch = 'access-manager' | 'has-project-access' | 'needs-project-access';

export interface TeamAccessPreviewModel {
  branch: TeamAccessBranch;
  viewerLane: ITeamAccessViewerLaneModel;
  permissionRequestLane: ITeamAccessPermissionRequestLaneModel;
  accessManagerLane: ITeamAccessAccessManagerLaneModel;
  currentPersona: PccPersona;
  hasProjectSiteAccess: boolean;
}

function isAccessManager(persona: PccPersona): boolean {
  return TEAM_ACCESS_MANAGER_PERSONAS.includes(persona as (typeof TEAM_ACCESS_MANAGER_PERSONAS)[number]);
}

export function resolveTeamAccessBranch(
  persona: PccPersona,
  hasProjectSiteAccess: boolean,
): TeamAccessBranch {
  if (isAccessManager(persona)) return 'access-manager';
  return hasProjectSiteAccess ? 'has-project-access' : 'needs-project-access';
}

export function createTeamAccessPreviewModel(
  persona: PccPersona,
  hasProjectSiteAccess: boolean,
): TeamAccessPreviewModel {
  const viewerLane: ITeamAccessViewerLaneModel = {
    ...SAMPLE_TEAM_ACCESS_VIEWER_LANE,
    currentUser: {
      ...SAMPLE_TEAM_ACCESS_VIEWER_LANE.currentUser,
      persona,
      hasProjectSiteAccess,
      audienceState: isAccessManager(persona)
        ? 'access-manager'
        : hasProjectSiteAccess
          ? 'has-project-access'
          : 'needs-project-access',
    },
  };

  return {
    branch: resolveTeamAccessBranch(persona, hasProjectSiteAccess),
    viewerLane,
    permissionRequestLane: SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
    accessManagerLane: SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
    currentPersona: persona,
    hasProjectSiteAccess,
  };
}

export const DEFAULT_TEAM_ACCESS_PREVIEW_MODEL = createTeamAccessPreviewModel(
  SAMPLE_TEAM_ACCESS_VIEWER_LANE.currentUser.persona,
  SAMPLE_TEAM_ACCESS_VIEWER_LANE.currentUser.hasProjectSiteAccess,
);
