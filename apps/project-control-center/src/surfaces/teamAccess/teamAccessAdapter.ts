import {
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  TEAM_ACCESS_AUDIENCE_STATES,
  TEAM_ACCESS_MANAGER_PERSONAS,
  TEAM_ACCESS_REQUEST_STATUSES,
  type ITeamAccessPreviewModel,
  type ITeamAccessRequestPreview,
  type ITeamAccessViewerLaneModel,
  type PccPersona,
  type TeamAccessAudienceState,
  type TeamAccessExecutionStatus,
  type TeamAccessManagerPersona,
  type TeamAccessRequestStatus,
} from '@hbc/models/pcc';

import type {
  IPccTeamAccessAuditTrailRow,
  IPccTeamAccessExecutionPosture,
  IPccTeamAccessMemberCounts,
  IPccTeamAccessRequestStatusBucket,
  IPccTeamAccessViewModel,
  IPccTeamAccessVisibleLanes,
  TeamAccessBranch,
} from './teamAccessViewModel';

export type { TeamAccessBranch } from './teamAccessViewModel';

export const TEAM_ACCESS_BRANCHES = TEAM_ACCESS_AUDIENCE_STATES;

export const NO_PERMISSION_CHANGE_NOTICE = 'No permission change has been executed';

export const REQUEST_STATUS_LABELS: Readonly<Record<TeamAccessRequestStatus, string>> = {
  'draft-preview': 'Draft preview',
  'submitted-preview': 'Submitted preview',
  'pending-review': 'Pending Review',
  'approved-pending-execution': 'Approved — Pending Execution',
  rejected: 'Rejected',
  'completed-manual': 'Completed (manual)',
};

export const EXECUTION_STATUS_LABELS: Readonly<Record<TeamAccessExecutionStatus, string>> = {
  'preview-only': 'Preview only',
  'manual-it-handled': 'Manual IT handled',
  'backend-gated-later': 'Backend-gated later',
};

export function isTeamAccessManagerPersona(persona: PccPersona): boolean {
  return TEAM_ACCESS_MANAGER_PERSONAS.includes(persona as TeamAccessManagerPersona);
}

export function resolveTeamAccessAudienceState(
  persona: PccPersona,
  hasProjectSiteAccess: boolean,
): TeamAccessAudienceState {
  if (isTeamAccessManagerPersona(persona)) return 'access-manager';
  return hasProjectSiteAccess ? 'has-project-access' : 'needs-project-access';
}

export function resolveTeamAccessBranch(
  persona: PccPersona,
  hasProjectSiteAccess: boolean,
): TeamAccessBranch {
  return resolveTeamAccessAudienceState(persona, hasProjectSiteAccess);
}

export function resolveTeamAccessVisibleLanes(branch: TeamAccessBranch): IPccTeamAccessVisibleLanes {
  return {
    showTeamViewer: branch === 'access-manager' || branch === 'has-project-access',
    showPermissionRequest: branch === 'access-manager' || branch === 'needs-project-access',
    showAccessManager: branch === 'access-manager',
  };
}

function buildMemberCounts(source: ITeamAccessPreviewModel): IPccTeamAccessMemberCounts {
  const viewerLane = source.lanes[0];
  const internal = viewerLane.internalCount;
  const external = viewerLane.externalCount;
  const guest = viewerLane.guestCount;
  return { internal, external, guest, total: internal + external + guest };
}

function buildRequestStatusBuckets(
  records: readonly ITeamAccessRequestPreview[],
): readonly IPccTeamAccessRequestStatusBucket[] {
  return TEAM_ACCESS_REQUEST_STATUSES.map((status) => ({
    status,
    label: REQUEST_STATUS_LABELS[status],
    count: records.filter((record) => record.requestStatus === status).length,
  }));
}

function buildExecutionPosture(
  executionStatus: TeamAccessExecutionStatus,
): IPccTeamAccessExecutionPosture {
  return {
    status: executionStatus,
    statusLabel: EXECUTION_STATUS_LABELS[executionStatus],
    manualItHandled: executionStatus === 'manual-it-handled',
    backendGatedLater: executionStatus === 'backend-gated-later',
    noPermissionChangeNotice: NO_PERMISSION_CHANGE_NOTICE,
  };
}

function buildAuditTrailRows(
  records: readonly ITeamAccessRequestPreview[],
): readonly IPccTeamAccessAuditTrailRow[] {
  return records.map((record) => ({
    rowId: record.requestId,
    status: record.requestStatus,
    primaryLabel: `${record.requestedUserLabel} · ${REQUEST_STATUS_LABELS[record.requestStatus]}`,
    secondaryLabel: record.reviewedByLabel
      ? `Requested by ${record.requestedByLabel} · Reviewed by ${record.reviewedByLabel}`
      : `Requested by ${record.requestedByLabel}`,
    commentPreview: record.reviewerCommentPreview,
    noPermissionChangeNotice: NO_PERMISSION_CHANGE_NOTICE,
  }));
}

export interface IBuildPccTeamAccessViewModelInput {
  source: ITeamAccessPreviewModel;
  persona: PccPersona;
  hasProjectSiteAccess: boolean;
}

export function buildPccTeamAccessViewModel(
  input: IBuildPccTeamAccessViewModelInput,
): IPccTeamAccessViewModel {
  const { source, persona, hasProjectSiteAccess } = input;
  const [viewerLane, permissionRequestLane, accessManagerLane] = source.lanes;
  const audienceState = resolveTeamAccessAudienceState(persona, hasProjectSiteAccess);
  const visibleLanes = resolveTeamAccessVisibleLanes(audienceState);

  const records = permissionRequestLane.requestPreviewRecords;
  const requestStatusBuckets = buildRequestStatusBuckets(records);
  const pendingReviewCount =
    requestStatusBuckets.find((bucket) => bucket.status === 'pending-review')?.count ?? 0;
  const approvedPendingExecutionCount =
    requestStatusBuckets.find((bucket) => bucket.status === 'approved-pending-execution')?.count ??
    0;

  const projectedViewerLane: ITeamAccessViewerLaneModel = {
    ...viewerLane,
    currentUser: {
      ...viewerLane.currentUser,
      persona,
      hasProjectSiteAccess,
      audienceState,
    },
  };

  return {
    branch: audienceState,
    audienceState,
    visibleLanes,
    currentPersona: persona,
    hasProjectSiteAccess,
    managerPersonas: TEAM_ACCESS_MANAGER_PERSONAS,
    memberCounts: buildMemberCounts(source),
    requestStatusBuckets,
    pendingReviewCount,
    approvedPendingExecutionCount,
    executionPosture: buildExecutionPosture(accessManagerLane.executionStatus),
    auditTrailRows: buildAuditTrailRows(records),
    viewerLane: projectedViewerLane,
    permissionRequestLane,
    accessManagerLane,
  };
}

export function buildDefaultPccTeamAccessViewModel(): IPccTeamAccessViewModel {
  const viewerLane = SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[0];
  return buildPccTeamAccessViewModel({
    source: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
    persona: viewerLane.currentUser.persona,
    hasProjectSiteAccess: viewerLane.currentUser.hasProjectSiteAccess,
  });
}
