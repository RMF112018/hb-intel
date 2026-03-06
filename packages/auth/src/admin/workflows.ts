import {
  approveOverrideRequest,
  createAccessControlAuditEvent,
  createReviewMetadata,
  renewOverrideRecord,
} from '../backend/index.js';
import type {
  AccessControlAuditEventRecord,
  AccessControlOverrideRecord,
  AccessControlRoleAccessRecord,
  AccessControlWorkflowResult,
  BaseRoleDefinition,
  ReviewEmergencyAccessCommand,
  ReviewOverrideCommand,
  ResolveRoleChangeReviewCommand,
  ReviewOverrideDecision,
  RenewOverrideCommand,
} from '../types.js';

/**
 * Convert one override record into a normalized queue row model for admin UX.
 */
export function toOverrideQueueItem(record: AccessControlOverrideRecord): AccessControlOverrideRecord {
  return {
    ...record,
    requestedChange: {
      ...record.requestedChange,
      grants: [...record.requestedChange.grants],
    },
  };
}

/**
 * Determine whether an override is due for renewal based on expiration metadata.
 */
export function isRenewalDue(
  record: AccessControlOverrideRecord,
  renewalWindowHours = 24 * 7,
  now: Date = new Date(),
): boolean {
  if (record.status !== 'active' || !record.expiration.expiresAt) {
    return false;
  }

  const expirationMs = new Date(record.expiration.expiresAt).getTime();
  const diffMs = expirationMs - now.getTime();
  return diffMs <= renewalWindowHours * 60 * 60 * 1000;
}

/**
 * Build a role/access lookup projection from base role definitions and overrides.
 */
export function buildRoleAccessLookup(
  roles: BaseRoleDefinition[],
  overrides: AccessControlOverrideRecord[],
): AccessControlRoleAccessRecord[] {
  return roles.map((role) => {
    const attached = overrides.filter((override) => override.baseRoleId === role.id);
    return {
      roleId: role.id,
      roleName: role.name,
      grants: role.grants,
      activeOverrideCount: attached.filter((override) => override.status === 'active').length,
      pendingOverrideCount: attached.filter((override) => override.approval.state === 'pending').length,
      reviewRequiredCount: attached.filter((override) => override.review.reviewRequired).length,
    };
  });
}

/**
 * Apply an approval or rejection decision for a standard override request.
 */
export function applyOverrideReviewDecision(
  record: AccessControlOverrideRecord,
  command: Omit<ReviewOverrideCommand, 'overrideId'>,
): AccessControlWorkflowResult {
  if (record.approval.state !== 'pending') {
    return {
      ok: false,
      message: 'Only pending override requests can be reviewed.',
    };
  }

  if (command.decision === 'approve') {
    const updatedOverride = approveOverrideRequest(record, {
      approverId: command.reviewerId,
      approvedAt: command.reviewedAt,
    });

    return {
      ok: true,
      message: 'Override approved.',
      updatedOverride,
      auditEvent: createAccessControlAuditEvent({
        eventType: 'override-approved',
        actorId: command.reviewerId,
        subjectUserId: record.targetUserId,
        overrideId: record.id,
      }),
    };
  }

  const rejectionReason = command.reason?.trim();
  if (!rejectionReason) {
    return {
      ok: false,
      message: 'Rejection reason is required.',
    };
  }

  const updatedOverride: AccessControlOverrideRecord = {
    ...record,
    approval: {
      ...record.approval,
      state: 'rejected',
      approverId: command.reviewerId,
      approvedAt: command.reviewedAt ?? new Date().toISOString(),
    },
    status: 'revoked',
    review: createReviewMetadata({
      reviewRequired: false,
      reviewReason: rejectionReason,
      reviewMarkedBy: command.reviewerId,
      reviewMarkedAt: command.reviewedAt,
    }),
  };

  return {
    ok: true,
    message: 'Override rejected.',
    updatedOverride,
    auditEvent: createAccessControlAuditEvent({
      eventType: 'override-rejected',
      actorId: command.reviewerId,
      subjectUserId: record.targetUserId,
      overrideId: record.id,
      details: { reason: rejectionReason },
    }),
  };
}

/**
 * Apply renewal handling for an expiring override.
 */
export function applyRenewalRequest(
  record: AccessControlOverrideRecord,
  command: Omit<RenewOverrideCommand, 'overrideId'>,
): AccessControlWorkflowResult {
  const normalizedReason = command.reason.trim();
  if (normalizedReason.length < 10) {
    return {
      ok: false,
      message: 'Renewal reason must include meaningful justification.',
    };
  }

  try {
    const renewed = renewOverrideRecord(record, {
      expiresAt: command.expiresAt,
    });

    return {
      ok: true,
      message: 'Override renewed.',
      updatedOverride: {
        ...renewed,
        review: createReviewMetadata({
          reviewRequired: false,
          reviewReason: normalizedReason,
          reviewMarkedBy: command.reviewerId,
          reviewMarkedAt: command.reviewedAt,
        }),
      },
      auditEvent: createAccessControlAuditEvent({
        eventType: 'override-renewed',
        actorId: command.reviewerId,
        subjectUserId: record.targetUserId,
        overrideId: record.id,
        details: { reason: normalizedReason, expiresAt: command.expiresAt },
      }),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to renew override.',
    };
  }
}

/**
 * Resolve role-change review queue entries by clearing mandatory review flags.
 */
export function resolveRoleChangeReview(
  record: AccessControlOverrideRecord,
  command: Omit<ResolveRoleChangeReviewCommand, 'overrideId'>,
): AccessControlWorkflowResult {
  if (!record.review.reviewRequired) {
    return {
      ok: false,
      message: 'Override is not marked for role-change review.',
    };
  }

  const updatedOverride: AccessControlOverrideRecord = {
    ...record,
    review: createReviewMetadata({
      reviewRequired: false,
      reviewReason: command.reason,
      reviewMarkedBy: command.reviewerId,
      reviewMarkedAt: command.reviewedAt,
    }),
  };

  return {
    ok: true,
    message: 'Role-change review completed.',
    updatedOverride,
    auditEvent: createAccessControlAuditEvent({
      eventType: 'override-review-resolved',
      actorId: command.reviewerId,
      subjectUserId: record.targetUserId,
      overrideId: record.id,
      details: { reason: command.reason },
    }),
  };
}

/**
 * Resolve emergency-access review queue entries with explicit reason requirement.
 */
export function applyEmergencyReviewDecision(
  record: AccessControlOverrideRecord,
  command: Omit<ReviewEmergencyAccessCommand, 'overrideId'>,
): AccessControlWorkflowResult {
  if (!record.emergency) {
    return {
      ok: false,
      message: 'Emergency review can be applied only to emergency overrides.',
    };
  }

  if (command.reason.trim().length < 10) {
    return {
      ok: false,
      message: 'Emergency review requires a detailed reason.',
    };
  }

  return applyOverrideReviewDecision(record, {
    reviewerId: command.reviewerId,
    reviewedAt: command.reviewedAt,
    decision: command.decision,
    reason: command.reason,
  });
}

/**
 * Filter overrides by decision state for role-review and emergency queues.
 */
export function deriveQueueByDecision(
  overrides: AccessControlOverrideRecord[],
  decision: ReviewOverrideDecision,
): AccessControlOverrideRecord[] {
  if (decision === 'approve') {
    return overrides.filter((override) => override.approval.state === 'pending');
  }

  return overrides.filter((override) => override.approval.state === 'rejected');
}

/**
 * Keep audit events newest-first for read-only admin visibility.
 */
export function sortAuditEventsDescending(
  events: AccessControlAuditEventRecord[],
): AccessControlAuditEventRecord[] {
  return [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}
