import type { AccessControlOverrideRecord, AccessOverrideApprovalActionCommand, AccessOverrideApprovalDecision, AccessOverrideApprovalPolicy, AccessOverrideApprovalResult, StructuredAccessOverrideRequest } from '../types.js';
/**
 * Default approval policy for Phase 5.12 standard override governance.
 *
 * Alignment notes:
 * - PH5 item 4 + 5.12 item 4: default expiration for standard overrides.
 * - PH5 item 3 + 5.12 item 3: permanent access requires explicit justification.
 */
export declare const DEFAULT_OVERRIDE_APPROVAL_POLICY: AccessOverrideApprovalPolicy;
/**
 * Create a pending override record from a structured request.
 */
export declare function createPendingOverrideFromRequest(request: StructuredAccessOverrideRequest): AccessControlOverrideRecord;
/**
 * Apply approve/reject decisions for standard override workflows.
 */
export declare function applyOverrideApprovalAction(params: {
    request: StructuredAccessOverrideRequest;
    command: AccessOverrideApprovalActionCommand;
    policy?: AccessOverrideApprovalPolicy;
}): AccessOverrideApprovalResult;
/**
 * Helper for narrowing known approval decision values.
 */
export declare function isOverrideApprovalDecision(value: string): value is AccessOverrideApprovalDecision;
//# sourceMappingURL=overrideApproval.d.ts.map