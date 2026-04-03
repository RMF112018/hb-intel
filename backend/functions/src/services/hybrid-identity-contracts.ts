/**
 * P9-05: Hybrid Identity backend contracts, models, and action types.
 *
 * This file defines the typed action catalog, request/response shapes,
 * source-of-authority routing types, risk metadata, audit payload normalization,
 * and connector-reference models for the Phase 9 Hybrid Identity control lane.
 *
 * These contracts are the execution blueprint that Prompts 06–09 implement.
 * They are phase-local — the broader generalized admin-run contracts from
 * earlier phases are reused where they exist, but Phase 9-specific types
 * live here to avoid pretending the full platform abstraction is complete.
 */

import type { ConnectorClass } from './connection-registry-service.js';
import type { IdentityAuthorityType } from './graph-service.js';

// ─── Action identifiers ────────────────────────────────────────────────────────

/** Hybrid identity action domain. */
export type HybridIdentityDomain = 'user' | 'group' | 'access-setup' | 'sync' | 'connection';

/** Risk tier from the Phase 9 risk taxonomy. */
export type HybridIdentityRiskTier = 'routine' | 'elevated' | 'destructive' | 'sync-sensitive' | 'deferred';

/** Checkpoint / preview requirement. */
export type CheckpointRequirement = 'none' | 'preview' | 'confirmation' | 'double-confirmation';

/** Required execution boundary. */
export type ExecutionBoundary = 'graph' | 'ad-ds' | 'authority-routed' | 'both';

/**
 * Typed action identifier for hybrid identity operations.
 * Maps 1:1 to the Phase 9 identity action catalog (P9-03).
 */
export type HybridIdentityActionId =
  // User actions
  | 'user:search' | 'user:read' | 'user:create-adds' | 'user:create-cloud'
  | 'user:update-adds' | 'user:update-cloud' | 'user:disable-adds' | 'user:disable-cloud'
  | 'user:enable-adds' | 'user:enable-cloud' | 'user:delete-adds' | 'user:delete-cloud'
  // Group actions
  | 'group:search' | 'group:read' | 'group:read-members'
  | 'group:create-cloud' | 'group:update-cloud' | 'group:add-members-cloud'
  | 'group:remove-members-cloud' | 'group:delete-cloud'
  | 'group:create-adds' | 'group:add-members-adds' | 'group:remove-members-adds' | 'group:delete-adds'
  // Access-setup actions
  | 'access:grant-rollout' | 'access:normalize-employee'
  // Sync actions
  | 'sync:check-user' | 'sync:check-group' | 'sync:check-org' | 'sync:verify-propagation';

/**
 * Static action descriptor from the catalog.
 * Used to look up metadata before execution.
 */
export interface IHybridIdentityActionDescriptor {
  readonly id: HybridIdentityActionId;
  readonly domain: HybridIdentityDomain;
  readonly label: string;
  readonly sourceOfAuthority: IdentityAuthorityType | 'coordinated' | 'visibility';
  readonly riskTier: HybridIdentityRiskTier;
  readonly destructive: boolean;
  readonly checkpoint: CheckpointRequirement;
  readonly executionBoundary: ExecutionBoundary;
  readonly requiredConnector: ConnectorClass | 'authority-dependent' | null;
  readonly graphPermission: string | null;
  readonly addsRequirement: string | null;
  readonly auditLevel: 'read' | 'full' | 'full-with-evidence';
  readonly phaseDisposition: 'implement-now' | 'defer' | 'not-in-scope';
}

// ─── Request / response shapes ─────────────────────────────────────────────────

/**
 * Base request for all hybrid identity actions.
 * Every action handler receives this common envelope.
 */
export interface IHybridIdentityRequest {
  readonly actionId: HybridIdentityActionId;
  readonly actor: IHybridIdentityActor;
  readonly correlationId: string;
  readonly timestamp: string;
}

/** Actor metadata extracted from the authenticated Bearer token. */
export interface IHybridIdentityActor {
  readonly upn: string;
  readonly oid: string;
  readonly displayName: string;
}

// ── User action requests ────────────────────────────────────────────────────

export interface IUserSearchRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:search';
  readonly query: string;
  readonly top?: number;
}

export interface IUserReadRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:read';
  readonly userIdentifier: string;
}

export interface IUserCreateADDSRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:create-adds';
  readonly samAccountName: string;
  readonly userPrincipalName: string;
  readonly displayName: string;
  readonly givenName?: string;
  readonly surname?: string;
  readonly department?: string;
  readonly title?: string;
  readonly mail?: string;
  readonly targetOu: string;
}

export interface IUserCreateCloudRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:create-cloud';
  readonly displayName: string;
  readonly userPrincipalName: string;
  readonly mailNickname: string;
  readonly password: string;
  readonly forceChangePassword: boolean;
  readonly jobTitle?: string;
  readonly department?: string;
}

export interface IUserUpdateADDSRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:update-adds';
  readonly distinguishedName: string;
  readonly properties: {
    readonly displayName?: string;
    readonly department?: string;
    readonly title?: string;
    readonly mail?: string;
  };
}

export interface IUserUpdateCloudRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:update-cloud';
  readonly userId: string;
  readonly properties: {
    readonly displayName?: string;
    readonly jobTitle?: string;
    readonly department?: string;
    readonly mail?: string;
  };
}

export interface IUserToggleADDSRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:disable-adds' | 'user:enable-adds';
  readonly distinguishedName: string;
}

export interface IUserToggleCloudRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:disable-cloud' | 'user:enable-cloud';
  readonly userId: string;
}

export interface IUserDeleteADDSRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:delete-adds';
  readonly distinguishedName: string;
  readonly confirmationToken: string;
}

export interface IUserDeleteCloudRequest extends IHybridIdentityRequest {
  readonly actionId: 'user:delete-cloud';
  readonly userId: string;
  readonly confirmationToken: string;
}

// ── Group action requests ───────────────────────────────────────────────────

export interface IGroupSearchRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:search';
  readonly query: string;
  readonly top?: number;
}

export interface IGroupReadRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:read';
  readonly groupId: string;
}

export interface IGroupReadMembersRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:read-members';
  readonly groupId: string;
}

export interface IGroupCreateCloudRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:create-cloud';
  readonly displayName: string;
  readonly description: string;
}

export interface IGroupMembershipCloudRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:add-members-cloud' | 'group:remove-members-cloud';
  readonly groupId: string;
  readonly memberUpns: string[];
}

export interface IGroupDeleteCloudRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:delete-cloud';
  readonly groupId: string;
  readonly confirmationToken: string;
}

export interface IGroupCreateADDSRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:create-adds';
  readonly samAccountName: string;
  readonly displayName: string;
  readonly description: string;
  readonly targetOu: string;
}

export interface IGroupMembershipADDSRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:add-members-adds' | 'group:remove-members-adds';
  readonly groupDn: string;
  readonly memberDns: string[];
}

export interface IGroupDeleteADDSRequest extends IHybridIdentityRequest {
  readonly actionId: 'group:delete-adds';
  readonly distinguishedName: string;
  readonly confirmationToken: string;
}

// ── Access-setup requests ───────────────────────────────────────────────────

export interface IAccessGrantRolloutRequest extends IHybridIdentityRequest {
  readonly actionId: 'access:grant-rollout';
  readonly targetUserIdentifier: string;
  readonly groupAssignments: readonly {
    readonly groupId: string;
    readonly groupAuthority: IdentityAuthorityType;
  }[];
}

// ── Sync requests ───────────────────────────────────────────────────────────

export interface ISyncCheckRequest extends IHybridIdentityRequest {
  readonly actionId: 'sync:check-user' | 'sync:check-group' | 'sync:check-org' | 'sync:verify-propagation';
  readonly targetIdentifier?: string;
}

// ─── Union type for all requests ───────────────────────────────────────────────

export type HybridIdentityRequestPayload =
  | IUserSearchRequest | IUserReadRequest
  | IUserCreateADDSRequest | IUserCreateCloudRequest
  | IUserUpdateADDSRequest | IUserUpdateCloudRequest
  | IUserToggleADDSRequest | IUserToggleCloudRequest
  | IUserDeleteADDSRequest | IUserDeleteCloudRequest
  | IGroupSearchRequest | IGroupReadRequest | IGroupReadMembersRequest
  | IGroupCreateCloudRequest | IGroupMembershipCloudRequest | IGroupDeleteCloudRequest
  | IGroupCreateADDSRequest | IGroupMembershipADDSRequest | IGroupDeleteADDSRequest
  | IAccessGrantRolloutRequest
  | ISyncCheckRequest;

// ─── Result shapes ─────────────────────────────────────────────────────────────

/** Normalized result for all hybrid identity actions. */
export interface IHybridIdentityResult {
  readonly actionId: HybridIdentityActionId;
  readonly success: boolean;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly authorityUsed: IdentityAuthorityType | 'coordinated' | 'visibility';
  readonly data?: Record<string, unknown>;
  readonly error?: IHybridIdentityResultError;
  readonly syncState?: IHybridIdentitySyncState;
}

/** Error detail in action results. */
export interface IHybridIdentityResultError {
  readonly code: string;
  readonly message: string;
  readonly operatorGuidance?: string;
}

/** Post-action sync state for AD DS mutations. */
export interface IHybridIdentitySyncState {
  readonly syncPending: boolean;
  readonly estimatedSyncWindowMinutes: number;
  readonly lastKnownSyncTime: string | null;
}

// ─── Audit payload normalization ───────────────────────────────────────────────

/**
 * Normalized audit payload for hybrid identity actions.
 * Shapes the metadata captured for every identity operation.
 */
export interface IHybridIdentityAuditPayload {
  readonly actionId: HybridIdentityActionId;
  readonly domain: HybridIdentityDomain;
  readonly actor: IHybridIdentityActor;
  readonly target: IHybridIdentityAuditTarget;
  readonly sourceOfAuthority: IdentityAuthorityType | 'coordinated' | 'visibility';
  readonly riskTier: HybridIdentityRiskTier;
  readonly executionBoundary: ExecutionBoundary;
  readonly connectorUsed: ConnectorClass | null;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly success: boolean;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
  readonly syncState: IHybridIdentitySyncState | null;
  readonly evidenceSummary: string | null;
}

/** Target of an audited identity action. */
export interface IHybridIdentityAuditTarget {
  readonly objectType: 'user' | 'group' | 'membership' | 'organization' | 'connection';
  readonly identifier: string;
  readonly displayName: string | null;
}

// ─── Workflow routing types ────────────────────────────────────────────────────

/** Resolved routing decision for a hybrid identity action. */
export interface IWorkflowRoutingDecision {
  readonly actionId: HybridIdentityActionId;
  readonly resolvedAuthority: IdentityAuthorityType | 'coordinated';
  readonly executionBoundary: ExecutionBoundary;
  readonly requiredConnectors: readonly ConnectorClass[];
  readonly preflightChecks: readonly string[];
  readonly riskTier: HybridIdentityRiskTier;
  readonly checkpoint: CheckpointRequirement;
}
