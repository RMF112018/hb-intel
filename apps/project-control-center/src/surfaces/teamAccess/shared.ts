import {
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  type ITeamAccessAccessManagerLaneModel,
  type ITeamAccessPermissionRequestLaneModel,
  type ITeamAccessViewerLaneModel,
  type PccPersona,
} from '@hbc/models/pcc';

import {
  buildPccTeamAccessViewModel,
  isTeamAccessManagerPersona,
  resolveTeamAccessBranch,
} from './teamAccessAdapter';

export type { TeamAccessBranch } from './teamAccessViewModel';
export { isTeamAccessManagerPersona, resolveTeamAccessBranch };

import type { TeamAccessBranch } from './teamAccessViewModel';

export interface TeamAccessPreviewModel {
  branch: TeamAccessBranch;
  viewerLane: ITeamAccessViewerLaneModel;
  permissionRequestLane: ITeamAccessPermissionRequestLaneModel;
  accessManagerLane: ITeamAccessAccessManagerLaneModel;
  currentPersona: PccPersona;
  hasProjectSiteAccess: boolean;
}

export function createTeamAccessPreviewModel(
  persona: PccPersona,
  hasProjectSiteAccess: boolean,
): TeamAccessPreviewModel {
  const vm = buildPccTeamAccessViewModel({
    source: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
    persona,
    hasProjectSiteAccess,
  });

  return {
    branch: vm.branch,
    viewerLane: vm.viewerLane,
    permissionRequestLane: vm.permissionRequestLane,
    accessManagerLane: vm.accessManagerLane,
    currentPersona: vm.currentPersona,
    hasProjectSiteAccess: vm.hasProjectSiteAccess,
  };
}

const defaultViewerLane = SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[0];

export const DEFAULT_TEAM_ACCESS_PREVIEW_MODEL = createTeamAccessPreviewModel(
  defaultViewerLane.currentUser.persona,
  defaultViewerLane.currentUser.hasProjectSiteAccess,
);
