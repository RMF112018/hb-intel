import {
  createOverrideRequest,
  resolveOverrideLifecycleStatus,
  revokeOverrideRecord,
} from './overrideRecord.js';
import type {
  AccessControlOverrideRecord,
  AccessOverrideRequest,
} from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// PER-specific override helpers (Phase 3 Stage 0.2)
//
// These functions compose the generic override lifecycle from overrideRecord.ts
// with PER-specific semantics: project scoping, department boundaries, and
// department-change suspension.
//
// Governing: P3-A2 §2.3, §2.4, §6.1 path 7, §11.8
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a pre-filled AccessOverrideRequest for an out-of-scope PER grant.
 *
 * Sets `overrideType: 'out-of-scope-per'`, `emergency: false`, and
 * `reviewRequired: true` automatically.
 */
export function createPerOverrideRequest(input: {
  id: string;
  targetUserId: string;
  projectIds: string[];
  department: string;
  reason: string;
  requesterId: string;
  expiresAt: string;
}): AccessControlOverrideRecord {
  const request: AccessOverrideRequest = {
    id: input.id,
    targetUserId: input.targetUserId,
    baseRoleId: 'portfolio-executive-reviewer',
    requestedChange: {
      mode: 'grant',
      grants: ['per:read', 'per:annotate', 'per:push-to-team', 'per:report-review-run'],
    },
    reason: input.reason,
    requesterId: input.requesterId,
    expiresAt: input.expiresAt,
    emergency: false,
    reviewRequired: true,
    overrideType: 'out-of-scope-per',
    projectIds: input.projectIds,
    department: input.department,
  };

  return createOverrideRequest(request);
}

/**
 * Check whether an override record is a PER out-of-scope grant.
 */
export function isPerOverride(record: AccessControlOverrideRecord): boolean {
  return record.overrideType === 'out-of-scope-per';
}

/**
 * Filter active PER overrides for a specific user.
 */
export function getPerOverridesForUser(
  records: AccessControlOverrideRecord[],
  userId: string,
): AccessControlOverrideRecord[] {
  return records.filter(
    (r) => isPerOverride(r) && r.targetUserId === userId && r.status === 'active',
  );
}

/**
 * Filter active PER overrides that include a specific project.
 */
export function getPerOverridesForProject(
  records: AccessControlOverrideRecord[],
  projectId: string,
): AccessControlOverrideRecord[] {
  return records.filter(
    (r) =>
      isPerOverride(r) &&
      r.status === 'active' &&
      r.projectIds != null &&
      r.projectIds.includes(projectId),
  );
}

/**
 * Filter PER overrides to only those currently active (not expired, not revoked).
 *
 * Resolves lifecycle status considering expiration metadata — records
 * past their `expiresAt` are excluded even if `status` is still `'active'`.
 *
 * @param records - All override records to filter
 * @param now - Reference time for expiration check (defaults to current time)
 */
export function getActivePerOverrides(
  records: AccessControlOverrideRecord[],
  now: Date = new Date(),
): AccessControlOverrideRecord[] {
  return records.filter((r) => {
    if (!isPerOverride(r)) return false;
    const lifecycleStatus = resolveOverrideLifecycleStatus(r, now);
    return lifecycleStatus === 'active';
  });
}

/**
 * Suspend (revoke) all active PER overrides for a user whose department
 * has changed, when those overrides were granted against the previous
 * department boundary.
 *
 * Returns new revoked copies — does not mutate the input records.
 *
 * Governing: P3-A1 §3.6, P3-A2 §11.8 note 9
 */
export function suspendPerOverridesForDepartmentChange(
  records: AccessControlOverrideRecord[],
  userId: string,
  previousDepartment: string,
): AccessControlOverrideRecord[] {
  return records.map((record) => {
    if (
      isPerOverride(record) &&
      record.targetUserId === userId &&
      record.department === previousDepartment &&
      record.status === 'active'
    ) {
      return revokeOverrideRecord(record);
    }
    return record;
  });
}
