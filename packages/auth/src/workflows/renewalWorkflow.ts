import { applyOverrideApprovalAction } from './overrideApproval.js';
import { createStructuredOverrideRequest } from './overrideRequest.js';
import type {
  AccessControlOverrideRecord,
  AccessOverrideApprovalActionCommand,
  AccessOverrideRenewalAction,
  AccessOverrideRenewalCommand,
  AccessOverrideRenewalResult,
  AccessOverrideRequestPolicy,
  StructuredAccessOverrideRequest,
} from '../types.js';

/**
 * Determine whether a currently active override has expired.
 *
 * PH5.12 item 5: expiring overrides must not silently continue.
 */
export function isOverrideExpired(
  record: AccessControlOverrideRecord,
  now: Date = new Date(),
): boolean {
  if (!record.expiration.expiresAt) {
    return false;
  }

  return new Date(record.expiration.expiresAt).getTime() <= now.getTime();
}

/**
 * Create a renewal request that always carries updated justification.
 */
export function createRenewalRequest(
  command: AccessOverrideRenewalCommand,
  policy: AccessOverrideRequestPolicy,
): StructuredAccessOverrideRequest {
  if (command.updatedJustification.trim().length < policy.minimumBusinessReasonLength) {
    throw new Error(
      `Updated justification must be at least ${policy.minimumBusinessReasonLength} characters for renewal review.`,
    );
  }

  return createStructuredOverrideRequest({
    requestId: command.renewalRequestId,
    targetUserId: command.targetUserId,
    baseRoleId: command.baseRoleId,
    requestedChange: command.requestedChange,
    businessReason: command.updatedJustification,
    targetFeatureId: command.targetFeatureId,
    targetAction: command.targetAction,
    requesterId: command.requesterId,
    requestedDurationHours: command.requestedDurationHours,
    requestedExpiresAt: command.requestedExpiresAt,
    requestedAt: command.requestedAt,
    renewalOfRequestId: command.previousRequestId,
  }, policy);
}

/**
 * Renewal execution path requiring a fresh approval decision.
 */
export function runRenewalWorkflow(params: {
  action: AccessOverrideRenewalAction;
  policy: AccessOverrideRequestPolicy;
  approvalCommand: AccessOverrideApprovalActionCommand;
}): AccessOverrideRenewalResult {
  const request = createRenewalRequest(params.action, params.policy);

  const approval = applyOverrideApprovalAction({
    request,
    command: params.approvalCommand,
  });

  if (!approval.ok || !approval.override) {
    return {
      ok: false,
      message: approval.message,
    };
  }

  return {
    ok: true,
    message: 'Renewal request completed with fresh approval.',
    request,
    override: approval.override,
    audit: approval.audit,
  };
}
