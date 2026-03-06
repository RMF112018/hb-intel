import { approveOverrideRequest } from '../backend/overrideRecord.js';
import type {
  AccessControlAuditEventRecord,
  AccessControlOverrideRecord,
  AccessOverrideApprovalActionCommand,
  AccessOverrideApprovalDecision,
  AccessOverrideApprovalPolicy,
  AccessOverrideApprovalResult,
  StructuredAccessOverrideRequest,
} from '../types.js';
import {
  createAccessControlAuditEvent,
} from '../backend/accessControlModel.js';
import { createOverrideRequest } from '../backend/overrideRecord.js';
import { toOverrideRequestInput } from './overrideRequest.js';

/**
 * Default approval policy for Phase 5.12 standard override governance.
 *
 * Alignment notes:
 * - PH5 item 4 + 5.12 item 4: default expiration for standard overrides.
 * - PH5 item 3 + 5.12 item 3: permanent access requires explicit justification.
 */
export const DEFAULT_OVERRIDE_APPROVAL_POLICY: AccessOverrideApprovalPolicy = {
  defaultExpirationHours: 24 * 30,
  minimumPermanentJustificationLength: 20,
};

/**
 * Create a pending override record from a structured request.
 */
export function createPendingOverrideFromRequest(
  request: StructuredAccessOverrideRequest,
): AccessControlOverrideRecord {
  return createOverrideRequest(toOverrideRequestInput(request));
}

/**
 * Apply approve/reject decisions for standard override workflows.
 */
export function applyOverrideApprovalAction(params: {
  request: StructuredAccessOverrideRequest;
  command: AccessOverrideApprovalActionCommand;
  policy?: AccessOverrideApprovalPolicy;
}): AccessOverrideApprovalResult {
  const policy = params.policy ?? DEFAULT_OVERRIDE_APPROVAL_POLICY;
  const pendingRecord = createPendingOverrideFromRequest(params.request);

  if (params.command.decision === 'reject') {
    return rejectOverride(pendingRecord, params.command);
  }

  return approveOverride(pendingRecord, params.command, policy);
}

function approveOverride(
  record: AccessControlOverrideRecord,
  command: AccessOverrideApprovalActionCommand,
  policy: AccessOverrideApprovalPolicy,
): AccessOverrideApprovalResult {
  const expiresAt = resolveApprovedExpiration(command, policy, record.approval.requestedAt);

  if (command.markPermanent) {
    const justification = command.permanentJustification?.trim() ?? '';
    if (justification.length < policy.minimumPermanentJustificationLength) {
      return {
        ok: false,
        decision: 'approve',
        message: `Permanent override requires explicit justification (minimum ${policy.minimumPermanentJustificationLength} characters).`,
      };
    }
  }

  const approved = approveOverrideRequest(record, {
    approverId: command.reviewerId,
    approvedAt: command.reviewedAt,
  });

  const updated: AccessControlOverrideRecord = {
    ...approved,
    expiration: {
      expiresAt: command.markPermanent ? undefined : expiresAt,
      renewalState: command.markPermanent ? 'not-required' : approved.expiration.renewalState,
    },
    review: {
      ...approved.review,
      reviewRequired: false,
      reviewReason: command.markPermanent ? command.permanentJustification : approved.review.reviewReason,
    },
  };

  return {
    ok: true,
    decision: command.decision,
    message: 'Override approved with governed expiration policy.',
    override: updated,
    audit: createDecisionAudit(updated, command, 'override-approved', {
      expiresAt: updated.expiration.expiresAt,
      permanent: command.markPermanent ?? false,
    }),
  };
}

function rejectOverride(
  record: AccessControlOverrideRecord,
  command: AccessOverrideApprovalActionCommand,
): AccessOverrideApprovalResult {
  const reason = command.rejectionReason?.trim();
  if (!reason) {
    return {
      ok: false,
      decision: 'reject',
      message: 'Rejection reason is required.',
    };
  }

  const updated: AccessControlOverrideRecord = {
    ...record,
    approval: {
      ...record.approval,
      state: 'rejected',
      approverId: command.reviewerId,
      approvedAt: command.reviewedAt ?? new Date().toISOString(),
    },
    status: 'revoked',
    review: {
      ...record.review,
      reviewRequired: false,
      reviewReason: reason,
      reviewMarkedBy: command.reviewerId,
      reviewMarkedAt: command.reviewedAt ?? new Date().toISOString(),
    },
  };

  return {
    ok: true,
    decision: 'reject',
    message: 'Override rejected.',
    override: updated,
    audit: createDecisionAudit(updated, command, 'override-rejected', { reason }),
  };
}

function resolveApprovedExpiration(
  command: AccessOverrideApprovalActionCommand,
  policy: AccessOverrideApprovalPolicy,
  requestedAt: string,
): string {
  if (command.expiresAt) {
    return command.expiresAt;
  }

  const requested = new Date(requestedAt);
  requested.setHours(requested.getHours() + policy.defaultExpirationHours);
  return requested.toISOString();
}

function createDecisionAudit(
  override: AccessControlOverrideRecord,
  command: AccessOverrideApprovalActionCommand,
  eventType: Extract<AccessControlAuditEventRecord['eventType'], 'override-approved' | 'override-rejected'>,
  details?: Record<string, unknown>,
): AccessControlAuditEventRecord {
  return createAccessControlAuditEvent({
    eventType,
    actorId: command.reviewerId,
    subjectUserId: override.targetUserId,
    overrideId: override.id,
    details,
    occurredAt: command.reviewedAt,
  });
}

/**
 * Helper for narrowing known approval decision values.
 */
export function isOverrideApprovalDecision(value: string): value is AccessOverrideApprovalDecision {
  return value === 'approve' || value === 'reject';
}
