/**
 * PCC Team & Access preview model vocabulary.
 *
 * Read-model only. This file defines deterministic, fixture-friendly types
 * for Wave 2 Team & Access lifecycle preview lanes. It is NOT authoritative
 * authorization logic and must not trigger runtime mutation behavior.
 */

import type { PccPersona } from './PccUserRoles.js';
import type { PccUserId } from './types.js';

export const TEAM_ACCESS_MANAGER_PERSONAS = [
  'pcc-admin',
  'it-admin',
  'estimating-coordinator',
  'lead-estimator',
  'project-executive',
  'project-manager',
  'manager-of-operational-excellence',
] as const satisfies readonly PccPersona[];

export type TeamAccessManagerPersona = (typeof TEAM_ACCESS_MANAGER_PERSONAS)[number];

export const TEAM_ACCESS_LANES = ['team-viewer', 'permission-request', 'access-manager'] as const;
export type TeamAccessLane = (typeof TEAM_ACCESS_LANES)[number];

export const TEAM_ACCESS_AUDIENCE_STATES = [
  'has-project-access',
  'needs-project-access',
  'access-manager',
] as const;
export type TeamAccessAudienceState = (typeof TEAM_ACCESS_AUDIENCE_STATES)[number];

export const TEAM_ACCESS_MEMBER_KINDS = ['internal', 'external', 'guest'] as const;
export type TeamAccessMemberKind = (typeof TEAM_ACCESS_MEMBER_KINDS)[number];

export const TEAM_ACCESS_REQUEST_STATUSES = [
  'draft-preview',
  'submitted-preview',
  'pending-review',
  'approved-pending-execution',
  'rejected',
  'completed-manual',
] as const;
export type TeamAccessRequestStatus = (typeof TEAM_ACCESS_REQUEST_STATUSES)[number];

export const TEAM_ACCESS_EXECUTION_STATUSES = [
  'preview-only',
  'manual-it-handled',
  'backend-gated-later',
] as const;
export type TeamAccessExecutionStatus = (typeof TEAM_ACCESS_EXECUTION_STATUSES)[number];

export interface ITeamAccessMemberRecord {
  memberId: PccUserId;
  displayLabel: string;
  memberKind: TeamAccessMemberKind;
  companyLabel: string;
  projectRoleLabel: string;
  persona: PccPersona;
  permissionTemplateLabel: string;
  assignmentStatusLabel: string;
  orgChartParentMemberId?: PccUserId;
  hasProjectSiteAccess: boolean;
}

export interface ITeamAccessCurrentUserContext {
  memberId: PccUserId;
  persona: PccPersona;
  projectRoleLabel: string;
  permissionTemplateLabel: string;
  hasProjectSiteAccess: boolean;
  audienceState: TeamAccessAudienceState;
}

export interface ITeamAccessViewerLaneModel {
  lane: 'team-viewer';
  teamMapLabel: string;
  internalCount: number;
  externalCount: number;
  guestCount: number;
  members: readonly ITeamAccessMemberRecord[];
  currentUser: ITeamAccessCurrentUserContext;
}

export interface ITeamAccessRequestPreview {
  requestId: string;
  requestedUserLabel: string;
  requestedPersona: PccPersona;
  requestedPermissionTemplateLabel: string;
  businessJustification: string;
  requestStatus: TeamAccessRequestStatus;
  requestStatusLabel: string;
  requestedByLabel: string;
  reviewedByLabel?: string;
  reviewerCommentPreview?: string;
}

export interface ITeamAccessPermissionRequestLaneModel {
  lane: 'permission-request';
  requestAccessEnabled: boolean;
  requestChangeEnabled: boolean;
  requestTemplateOptions: readonly string[];
  requestPreviewRecords: readonly ITeamAccessRequestPreview[];
}

export interface ITeamAccessAccessManagerLaneModel {
  lane: 'access-manager';
  managerPersonas: readonly TeamAccessManagerPersona[];
  canAddOrSearchUserPreview: boolean;
  assignmentFormPreviewEnabled: boolean;
  permissionTemplateOptions: readonly string[];
  approvalCommentPreviewEnabled: boolean;
  executionStatus: TeamAccessExecutionStatus;
  executionStatusLabel: string;
  auditPreviewLabel: string;
}

export interface ITeamAccessPreviewModel {
  lanes: readonly [
    ITeamAccessViewerLaneModel,
    ITeamAccessPermissionRequestLaneModel,
    ITeamAccessAccessManagerLaneModel,
  ];
}
