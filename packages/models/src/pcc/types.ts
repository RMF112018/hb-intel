/**
 * PCC branded type aliases.
 *
 * Pure-TypeScript identifier brands used across PCC shared foundations.
 * No runtime tagging; the brand exists only at the type level.
 */

export type PccProjectId = string & { readonly __brand: 'PccProjectId' };
export type PccProjectNumber = string & { readonly __brand: 'PccProjectNumber' };
export type PccUserId = string & { readonly __brand: 'PccUserId' };
export type PccWorkflowItemId = string & { readonly __brand: 'PccWorkflowItemId' };
export type PccApprovalCheckpointId = string & { readonly __brand: 'PccApprovalCheckpointId' };
export type PccBusinessAuditEventId = string & { readonly __brand: 'PccBusinessAuditEventId' };
export type PccSiteUrl = string & { readonly __brand: 'PccSiteUrl' };

// Wave 14 — Approvals & Checkpoints control layer.
export type PccApprovalRequestId = string & { readonly __brand: 'PccApprovalRequestId' };
export type PccApprovalPolicyId = string & { readonly __brand: 'PccApprovalPolicyId' };
export type PccApprovalPolicyVersionId = string & {
  readonly __brand: 'PccApprovalPolicyVersionId';
};
export type PccApprovalRouteId = string & { readonly __brand: 'PccApprovalRouteId' };
export type PccApprovalStepId = string & { readonly __brand: 'PccApprovalStepId' };
export type PccApprovalParticipantId = string & {
  readonly __brand: 'PccApprovalParticipantId';
};
export type PccApprovalDecisionId = string & { readonly __brand: 'PccApprovalDecisionId' };
export type PccCheckpointDefinitionId = string & {
  readonly __brand: 'PccCheckpointDefinitionId';
};
export type PccCheckpointInstanceId = string & {
  readonly __brand: 'PccCheckpointInstanceId';
};
export type PccCheckpointEvidenceLinkId = string & {
  readonly __brand: 'PccCheckpointEvidenceLinkId';
};
export type PccCheckpointSourceReferenceId = string & {
  readonly __brand: 'PccCheckpointSourceReferenceId';
};
export type PccCheckpointAuditEventId = string & {
  readonly __brand: 'PccCheckpointAuditEventId';
};
export type PccApprovalPriorityActionLinkId = string & {
  readonly __brand: 'PccApprovalPriorityActionLinkId';
};
