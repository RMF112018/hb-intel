/**
 * PCC fixture — Team & Access lifecycle preview domain.
 *
 * Deterministic, non-PII, preview-safe fixture data for Wave 2 lanes:
 * Team Viewer, Permission Request, Access Manager.
 */

import type { PccUserId } from '../types.js';
import type {
  ITeamAccessAccessManagerLaneModel,
  ITeamAccessMemberRecord,
  ITeamAccessPermissionRequestLaneModel,
  ITeamAccessPreviewModel,
  ITeamAccessViewerLaneModel,
  TeamAccessExecutionStatus,
} from '../TeamAccess.js';
import { TEAM_ACCESS_MANAGER_PERSONAS } from '../TeamAccess.js';

const memberA = 'fixture-user-a' as PccUserId;
const memberB = 'fixture-user-b' as PccUserId;
const memberC = 'fixture-user-c' as PccUserId;
const memberD = 'fixture-user-d' as PccUserId;

export const SAMPLE_TEAM_ACCESS_MEMBERS: readonly ITeamAccessMemberRecord[] = [
  {
    memberId: memberA,
    displayLabel: 'User Alpha',
    memberKind: 'internal',
    companyLabel: 'Fictional Build Group',
    projectRoleLabel: 'Project Manager',
    persona: 'project-manager',
    permissionTemplateLabel: 'PM-Standard-Template',
    assignmentStatusLabel: 'Assigned',
    hasProjectSiteAccess: true,
  },
  {
    memberId: memberB,
    displayLabel: 'User Bravo',
    memberKind: 'internal',
    companyLabel: 'Fictional Build Group',
    projectRoleLabel: 'Lead Estimator',
    persona: 'lead-estimator',
    permissionTemplateLabel: 'Estimator-Template',
    assignmentStatusLabel: 'Assigned',
    orgChartParentMemberId: memberA,
    hasProjectSiteAccess: true,
  },
  {
    memberId: memberC,
    displayLabel: 'User Charlie',
    memberKind: 'guest',
    companyLabel: 'Example Vendor Collective',
    projectRoleLabel: 'Guest Reviewer',
    persona: 'viewer',
    permissionTemplateLabel: 'Guest-ReadOnly-Template',
    assignmentStatusLabel: 'Pending Access',
    orgChartParentMemberId: memberA,
    hasProjectSiteAccess: false,
  },
  {
    memberId: memberD,
    displayLabel: 'User Delta',
    memberKind: 'external',
    companyLabel: 'Example Partner Studio',
    projectRoleLabel: 'External Contributor',
    persona: 'external-contributor',
    permissionTemplateLabel: 'External-Contributor-Template',
    assignmentStatusLabel: 'Assigned',
    orgChartParentMemberId: memberA,
    hasProjectSiteAccess: true,
  },
] as const;

export const SAMPLE_TEAM_ACCESS_VIEWER_LANE: ITeamAccessViewerLaneModel = {
  lane: 'team-viewer',
  teamMapLabel: 'Project Team Map (Preview)',
  internalCount: 2,
  externalCount: 1,
  guestCount: 1,
  members: SAMPLE_TEAM_ACCESS_MEMBERS,
  currentUser: {
    memberId: memberA,
    persona: 'project-manager',
    projectRoleLabel: 'Project Manager',
    permissionTemplateLabel: 'PM-Standard-Template',
    hasProjectSiteAccess: true,
    audienceState: 'access-manager',
  },
};

export const SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE: ITeamAccessPermissionRequestLaneModel = {
  lane: 'permission-request',
  requestAccessEnabled: true,
  requestChangeEnabled: true,
  requestTemplateOptions: [
    'PM-Standard-Template',
    'Estimator-Template',
    'Guest-ReadOnly-Template',
  ],
  requestPreviewRecords: [
    {
      requestId: 'fixture-request-001',
      requestedUserLabel: 'User Charlie',
      requestedPersona: 'viewer',
      requestedPermissionTemplateLabel: 'Guest-ReadOnly-Template',
      businessJustification: 'Preview request: project kickoff review access.',
      requestStatus: 'pending-review',
      requestStatusLabel: 'Pending Review',
      requestedByLabel: 'User Alpha',
      reviewedByLabel: 'User Echo',
      reviewerCommentPreview: 'Review comment preview only.',
    },
    {
      requestId: 'fixture-request-002',
      requestedUserLabel: 'User Foxtrot',
      requestedPersona: 'project-team-member',
      requestedPermissionTemplateLabel: 'PM-Standard-Template',
      businessJustification: 'Preview request: assignment change needed.',
      requestStatus: 'approved-pending-execution',
      requestStatusLabel: 'Approved, Pending Execution',
      requestedByLabel: 'User Bravo',
      reviewedByLabel: 'User Alpha',
      reviewerCommentPreview: 'Execution is backend-gated later.',
    },
  ],
};

const executionStatus: TeamAccessExecutionStatus = 'backend-gated-later';

export const SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE: ITeamAccessAccessManagerLaneModel = {
  lane: 'access-manager',
  managerPersonas: TEAM_ACCESS_MANAGER_PERSONAS,
  canAddOrSearchUserPreview: true,
  assignmentFormPreviewEnabled: true,
  permissionTemplateOptions: [
    'PM-Standard-Template',
    'Estimator-Template',
    'Guest-ReadOnly-Template',
    'Ops-Manager-Template',
  ],
  approvalCommentPreviewEnabled: true,
  executionStatus,
  executionStatusLabel: 'backend-gated-later',
  auditPreviewLabel: 'Audit preview: assignment and approval events are preview-only.',
};

export const SAMPLE_TEAM_ACCESS_PREVIEW_MODEL: ITeamAccessPreviewModel = {
  lanes: [
    SAMPLE_TEAM_ACCESS_VIEWER_LANE,
    SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
    SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
  ],
};
