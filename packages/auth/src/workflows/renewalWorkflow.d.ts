import type { AccessControlOverrideRecord, AccessOverrideApprovalActionCommand, AccessOverrideRenewalAction, AccessOverrideRenewalCommand, AccessOverrideRenewalResult, AccessOverrideRequestPolicy, StructuredAccessOverrideRequest } from '../types.js';
/**
 * Determine whether a currently active override has expired.
 *
 * PH5.12 item 5: expiring overrides must not silently continue.
 */
export declare function isOverrideExpired(record: AccessControlOverrideRecord, now?: Date): boolean;
/**
 * Create a renewal request that always carries updated justification.
 */
export declare function createRenewalRequest(command: AccessOverrideRenewalCommand, policy: AccessOverrideRequestPolicy): StructuredAccessOverrideRequest;
/**
 * Renewal execution path requiring a fresh approval decision.
 */
export declare function runRenewalWorkflow(params: {
    action: AccessOverrideRenewalAction;
    policy: AccessOverrideRequestPolicy;
    approvalCommand: AccessOverrideApprovalActionCommand;
}): AccessOverrideRenewalResult;
//# sourceMappingURL=renewalWorkflow.d.ts.map