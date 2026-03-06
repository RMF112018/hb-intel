import { applyOverrideApprovalAction } from './overrideApproval.js';
import {
  DEFAULT_OVERRIDE_REQUEST_POLICY,
  createStructuredOverrideRequest,
} from './overrideRequest.js';
import type {
  AccessControlAuditEventRecord,
  AccessOverrideEmergencyBoundaryCheck,
  AccessOverrideEmergencyCommand,
  AccessOverrideEmergencyPolicy,
  AccessOverrideEmergencyResult,
  StructuredAccessOverrideRequest,
} from '../types.js';
import { createAccessControlAuditEvent } from '../backend/accessControlModel.js';
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';

/**
 * Strict emergency workflow policy with short expiration and review boundaries.
 */
export const DEFAULT_EMERGENCY_ACCESS_POLICY: AccessOverrideEmergencyPolicy = {
  authorizedRoles: ['Administrator', 'SecurityAdmin'],
  maximumEmergencyHours: 4,
  minimumReasonLength: 20,
  minimumBoundaryReasonLength: 20,
};

/**
 * Enforce emergency boundaries so break-glass does not replace normal workflow.
 *
 * Alignment notes:
 * - PH5.12 item 8: emergency cannot become normal-path substitute.
 * - D-04: deterministic boundary decision result.
 */
export function evaluateEmergencyBoundary(
  command: AccessOverrideEmergencyCommand,
  policy: AccessOverrideEmergencyPolicy = DEFAULT_EMERGENCY_ACCESS_POLICY,
): AccessOverrideEmergencyBoundaryCheck {
  const normalizedReason = command.emergencyReason.trim();
  if (normalizedReason.length < policy.minimumReasonLength) {
    return {
      allowed: false,
      reason: `Emergency reason must be at least ${policy.minimumReasonLength} characters.`,
    };
  }

  const hasAuthorizedRole = command.requesterRoles.some((role) =>
    policy.authorizedRoles.includes(role),
  );
  if (!hasAuthorizedRole) {
    return {
      allowed: false,
      reason: 'Requester is not authorized for emergency access actions.',
    };
  }

  if (command.normalWorkflowAvailable && !command.boundaryBypassReason) {
    return {
      allowed: false,
      reason:
        'Emergency access rejected because normal workflow is available and no boundary bypass reason was supplied.',
    };
  }

  if (
    command.normalWorkflowAvailable &&
    command.boundaryBypassReason!.trim().length < policy.minimumBoundaryReasonLength
  ) {
    return {
      allowed: false,
      reason: `Boundary bypass reason must be at least ${policy.minimumBoundaryReasonLength} characters.`,
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}

/**
 * Execute emergency access grant with immediate approval and mandatory post-review.
 */
export function runEmergencyAccessWorkflow(
  command: AccessOverrideEmergencyCommand,
  policy: AccessOverrideEmergencyPolicy = DEFAULT_EMERGENCY_ACCESS_POLICY,
): AccessOverrideEmergencyResult {
  const boundary = evaluateEmergencyBoundary(command, policy);
  if (!boundary.allowed) {
    return {
      ok: false,
      message: boundary.reason ?? 'Emergency boundary policy rejected request.',
    };
  }

  const requestedAt = command.requestedAt ?? new Date().toISOString();
  const expiresAt = new Date(requestedAt);
  expiresAt.setHours(expiresAt.getHours() + policy.maximumEmergencyHours);

  const request: StructuredAccessOverrideRequest = createStructuredOverrideRequest(
    {
      requestId: command.requestId,
      targetUserId: command.targetUserId,
      baseRoleId: command.baseRoleId,
      requestedChange: command.requestedChange,
      businessReason: command.emergencyReason,
      targetFeatureId: command.targetFeatureId,
      targetAction: command.targetAction,
      requesterId: command.requesterId,
      requestedAt,
      requestedExpiresAt: expiresAt.toISOString(),
    },
    DEFAULT_OVERRIDE_REQUEST_POLICY,
  );

  const approval = applyOverrideApprovalAction({
    request,
    command: {
      reviewerId: command.requesterId,
      decision: 'approve',
      reviewedAt: command.requestedAt,
      expiresAt: expiresAt.toISOString(),
    },
  });

  if (!approval.ok || !approval.override) {
    return {
      ok: false,
      message: approval.message,
    };
  }

  const override = {
    ...approval.override,
    emergency: true,
    review: {
      ...approval.override.review,
      reviewRequired: true,
      reviewReason: 'Emergency access requires mandatory post-action review.',
      reviewMarkedBy: command.requesterId,
      reviewMarkedAt: command.requestedAt ?? new Date().toISOString(),
    },
  };

  logEmergencyAudit(command, override.id);

  return {
    ok: true,
    message: 'Emergency access granted with mandatory post-action review.',
    request,
    override,
    audit: mergeAudits(
      approval.audit,
      createAccessControlAuditEvent({
        eventType: 'review-flag-generated',
        actorId: command.requesterId,
        subjectUserId: command.targetUserId,
        source: 'workflow',
        overrideId: override.id,
        requestId: command.requestId,
        featureId: command.targetFeatureId,
        action: command.targetAction,
        outcome: 'pending',
        details: {
          emergency: true,
          postReviewRequired: true,
          boundaryBypassReason: command.boundaryBypassReason,
        },
        occurredAt: command.requestedAt,
      }),
    ),
  };
}

function mergeAudits(
  primary: AccessControlAuditEventRecord | undefined,
  secondary: AccessControlAuditEventRecord,
): AccessControlAuditEventRecord[] {
  if (!primary) {
    return [secondary];
  }

  return [primary, secondary];
}

/**
 * PH5.13 event fan-out: emergency usage and review flag generation.
 */
function logEmergencyAudit(command: AccessOverrideEmergencyCommand, overrideId: string): void {
  recordStructuredAuditEvent({
    eventType: 'emergency-access-used',
    actorId: command.requesterId,
    subjectUserId: command.targetUserId,
    source: 'workflow',
    requestId: command.requestId,
    overrideId,
    featureId: command.targetFeatureId,
    action: command.targetAction,
    outcome: 'success',
    details: {
      requesterRoles: command.requesterRoles,
      boundaryBypassReason: command.boundaryBypassReason,
    },
    occurredAt: command.requestedAt,
  });

  recordStructuredAuditEvent({
    eventType: 'review-flag-generated',
    actorId: command.requesterId,
    subjectUserId: command.targetUserId,
    source: 'workflow',
    requestId: command.requestId,
    overrideId,
    featureId: command.targetFeatureId,
    action: command.targetAction,
    outcome: 'pending',
    details: {
      reason: 'Emergency access requires mandatory post-action review.',
    },
    occurredAt: command.requestedAt,
  });
}
