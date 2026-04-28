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
