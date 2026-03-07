import type { AccessControlAuditEventRecord, AccessControlAuditEventSource, AccessControlAuditEventType, AccessControlAuditOutcome, AccessControlOverrideReviewMetadata, AccessControlRecordStatus, AccessOverrideExpirationMetadata, BaseRoleDefinition, BaseRoleDefinitionInput, BaseRoleDefinitionVersionDiff, RenewalState } from '../types.js';
/**
 * Create a normalized base-role definition owned by HB Intel access-control data.
 *
 * Traceability:
 * - PH5.10-Auth-Shell-Plan.md §5.10 items 1-2
 * - PH5-Auth-Shell-Plan.md locked Option C (HB Intel-owned authorization SoR)
 * - D-10 alignment: provider identity remains input only; role truth is app-owned.
 */
export declare function createBaseRoleDefinition(input: BaseRoleDefinitionInput): BaseRoleDefinition;
/**
 * Normalize explicit record status to enforce the approved lifecycle vocabulary.
 */
export declare function normalizeAccessControlStatus(status?: AccessControlRecordStatus): AccessControlRecordStatus;
/**
 * Resolve renewal state from explicit metadata and optional expiry timestamp.
 */
export declare function resolveRenewalState(metadata: Pick<AccessOverrideExpirationMetadata, 'expiresAt' | 'renewalState'>, now?: Date): RenewalState;
/**
 * Build review metadata payload used when role-definition drift requires override re-review.
 *
 * D-04 alignment: deterministic timestamp + actor attribution for reproducible audit trails.
 */
export declare function createReviewMetadata(params: {
    reviewRequired: boolean;
    reviewReason?: string;
    reviewMarkedBy?: string;
    reviewMarkedAt?: string;
}): AccessControlOverrideReviewMetadata;
/**
 * Create typed audit event records for auth/access governance operations.
 *
 * D-07 alignment: explicit, validated payload shape for governance workflows.
 * D-12 alignment: keeps shell/UI rendering concerns separate from backend audit modeling.
 */
export declare function createAccessControlAuditEvent(params: {
    eventType: AccessControlAuditEventType;
    actorId: string;
    subjectUserId: string;
    runtimeMode?: AccessControlAuditEventRecord['runtimeMode'];
    source?: AccessControlAuditEventSource;
    correlationId?: string;
    overrideId?: string;
    requestId?: string;
    roleId?: string;
    featureId?: string;
    action?: string;
    outcome?: AccessControlAuditOutcome;
    details?: Record<string, unknown>;
    occurredAt?: string;
}): AccessControlAuditEventRecord;
/**
 * Compare role-definition versions to identify base-role references requiring override review.
 */
export declare function getChangedBaseRoleReferences(params: {
    previous: BaseRoleDefinition[];
    next: BaseRoleDefinition[];
}): BaseRoleDefinitionVersionDiff[];
//# sourceMappingURL=accessControlModel.d.ts.map