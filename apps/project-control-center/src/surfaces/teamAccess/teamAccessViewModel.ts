import type {
  ITeamAccessAccessManagerLaneModel,
  ITeamAccessPermissionRequestLaneModel,
  ITeamAccessViewerLaneModel,
  PccPersona,
  TeamAccessAudienceState,
  TeamAccessExecutionStatus,
  TeamAccessManagerPersona,
  TeamAccessRequestStatus,
} from '@hbc/models/pcc';

export type TeamAccessBranch = TeamAccessAudienceState;

export interface IPccTeamAccessVisibleLanes {
  showTeamViewer: boolean;
  showPermissionRequest: boolean;
  showAccessManager: boolean;
}

export interface IPccTeamAccessMemberCounts {
  internal: number;
  external: number;
  guest: number;
  total: number;
}

export interface IPccTeamAccessRequestStatusBucket {
  status: TeamAccessRequestStatus;
  label: string;
  count: number;
}

export interface IPccTeamAccessExecutionPosture {
  status: TeamAccessExecutionStatus;
  statusLabel: string;
  manualItHandled: boolean;
  backendGatedLater: boolean;
  noPermissionChangeNotice: string;
}

export interface IPccTeamAccessAuditTrailRow {
  rowId: string;
  status: TeamAccessRequestStatus;
  primaryLabel: string;
  secondaryLabel: string;
  commentPreview?: string;
  noPermissionChangeNotice: string;
}

export interface IPccTeamAccessViewModel {
  branch: TeamAccessBranch;
  audienceState: TeamAccessAudienceState;
  visibleLanes: IPccTeamAccessVisibleLanes;
  currentPersona: PccPersona;
  hasProjectSiteAccess: boolean;
  managerPersonas: readonly TeamAccessManagerPersona[];
  memberCounts: IPccTeamAccessMemberCounts;
  requestStatusBuckets: readonly IPccTeamAccessRequestStatusBucket[];
  pendingReviewCount: number;
  approvedPendingExecutionCount: number;
  executionPosture: IPccTeamAccessExecutionPosture;
  auditTrailRows: readonly IPccTeamAccessAuditTrailRow[];
  viewerLane: ITeamAccessViewerLaneModel;
  permissionRequestLane: ITeamAccessPermissionRequestLaneModel;
  accessManagerLane: ITeamAccessAccessManagerLaneModel;
}
