import {
  createReviewMetadata,
  normalizeAccessControlStatus,
  resolveRenewalState,
} from './accessControlModel.js';
import type {
  AccessControlOverrideRecord,
  AccessControlRecordStatus,
  AccessOverrideGrantChange,
  AccessOverrideRequest,
  BaseRoleDefinitionVersionDiff,
  RenewalState,
} from '../types.js';

/**
 * Create a new explicit override request record.
 *
 * Governance notes:
 * - Roles remain clean defaults; exceptions are modeled as first-class records.
 * - Microsoft/SharePoint identity is treated as input, not authorization source-of-truth.
 */
export function createOverrideRequest(request: AccessOverrideRequest): AccessControlOverrideRecord {
  validateEmergencyRequest(request);

  const nowIso = new Date().toISOString();
  const expiration = {
    expiresAt: request.expiresAt,
    renewalState: resolveRenewalState({ expiresAt: request.expiresAt, renewalState: 'not-required' }),
  };

  return {
    id: request.id,
    targetUserId: request.targetUserId,
    baseRoleId: request.baseRoleId,
    requestedChange: normalizeRequestedChange(request.requestedChange),
    reason: request.reason,
    requesterId: request.requesterId,
    approval: {
      state: 'pending',
      requestedAt: request.requestedAt ?? nowIso,
      approverId: null,
      approvedAt: null,
    },
    expiration,
    emergency: request.emergency,
    review: createReviewMetadata({ reviewRequired: request.reviewRequired ?? false }),
    status: normalizeAccessControlStatus('active'),
  };
}

/**
 * Transition a pending override request to approved/active.
 */
export function approveOverrideRequest(
  record: AccessControlOverrideRecord,
  approval: {
    approverId: string;
    approvedAt?: string;
  },
): AccessControlOverrideRecord {
  if (record.approval.state !== 'pending') {
    throw new Error('Only pending override requests can be approved.');
  }

  const approvedAt = approval.approvedAt ?? new Date().toISOString();
  return {
    ...record,
    approval: {
      ...record.approval,
      state: 'approved',
      approverId: approval.approverId,
      approvedAt,
    },
    status: normalizeAccessControlStatus('active'),
  };
}

/**
 * Mark an override as revoked.
 */
export function revokeOverrideRecord(record: AccessControlOverrideRecord): AccessControlOverrideRecord {
  ensureTerminalStateNotReached(record.status, 'revoked');
  return {
    ...record,
    status: normalizeAccessControlStatus('revoked'),
  };
}

/**
 * Mark an override as archived.
 */
export function archiveOverrideRecord(record: AccessControlOverrideRecord): AccessControlOverrideRecord {
  return {
    ...record,
    status: normalizeAccessControlStatus('archived'),
  };
}

/**
 * Renew an expiring override with a new expiration and explicit re-approval marker.
 */
export function renewOverrideRecord(
  record: AccessControlOverrideRecord,
  params: { expiresAt: string },
): AccessControlOverrideRecord {
  if (record.status !== 'active') {
    throw new Error('Only active overrides can be renewed.');
  }

  return {
    ...record,
    expiration: {
      expiresAt: params.expiresAt,
      renewalState: 'renewed',
    },
    review: createReviewMetadata({ reviewRequired: false }),
  };
}

/**
 * Resolve the current lifecycle status considering explicit status + expiration metadata.
 */
export function resolveOverrideLifecycleStatus(
  record: AccessControlOverrideRecord,
  now: Date = new Date(),
): AccessControlRecordStatus {
  if (record.status !== 'active') {
    return record.status;
  }

  const renewalState: RenewalState = resolveRenewalState(record.expiration, now);
  return renewalState === 'expired' ? 'archived' : 'active';
}

/**
 * Flag one override for mandatory review.
 */
export function flagOverrideForReview(
  record: AccessControlOverrideRecord,
  params: {
    reason: string;
    markedBy: string;
    markedAt?: string;
  },
): AccessControlOverrideRecord {
  return {
    ...record,
    review: createReviewMetadata({
      reviewRequired: true,
      reviewReason: params.reason,
      reviewMarkedBy: params.markedBy,
      reviewMarkedAt: params.markedAt,
    }),
  };
}

/**
 * Mark dependent overrides for review when base-role definitions change.
 *
 * This intentionally does not mutate grants automatically to avoid silent rebasing.
 */
export function markDependentOverridesForRoleReview(params: {
  overrides: AccessControlOverrideRecord[];
  changedRoles: BaseRoleDefinitionVersionDiff[];
  markedBy: string;
  markedAt?: string;
}): AccessControlOverrideRecord[] {
  const changedRoleIds = new Set(params.changedRoles.map((diff) => diff.roleId));

  return params.overrides.map((record) => {
    if (!changedRoleIds.has(record.baseRoleId)) {
      return record;
    }

    return flagOverrideForReview(record, {
      reason: 'Base role definition changed; override requires explicit review.',
      markedBy: params.markedBy,
      markedAt: params.markedAt,
    });
  });
}

function validateEmergencyRequest(request: AccessOverrideRequest): void {
  if (request.emergency && request.reason.trim().length < 10) {
    throw new Error('Emergency overrides require a detailed reason.');
  }

  if (request.emergency && !request.expiresAt) {
    throw new Error('Emergency overrides require a short explicit expiration timestamp.');
  }
}

function ensureTerminalStateNotReached(
  current: AccessControlRecordStatus,
  target: AccessControlRecordStatus,
): void {
  if (current === 'archived' && target !== 'archived') {
    throw new Error('Archived overrides cannot transition to active or revoked states.');
  }
}

function normalizeRequestedChange(change: AccessOverrideGrantChange): AccessOverrideGrantChange {
  return {
    mode: change.mode,
    grants: Array.from(new Set(change.grants.map((grant) => grant.trim()).filter(Boolean))).sort(),
  };
}
