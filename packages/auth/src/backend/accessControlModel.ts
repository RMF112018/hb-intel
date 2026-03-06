import type {
  AccessControlAuditEventRecord,
  AccessControlAuditEventType,
  AccessControlOverrideReviewMetadata,
  AccessControlRecordStatus,
  AccessOverrideExpirationMetadata,
  BaseRoleDefinition,
  BaseRoleDefinitionInput,
  BaseRoleDefinitionVersionDiff,
  RenewalState,
} from '../types.js';

/**
 * Create a normalized base-role definition owned by HB Intel access-control data.
 *
 * Traceability:
 * - PH5.10-Auth-Shell-Plan.md §5.10 items 1-2
 * - PH5-Auth-Shell-Plan.md locked Option C (HB Intel-owned authorization SoR)
 * - D-10 alignment: provider identity remains input only; role truth is app-owned.
 */
export function createBaseRoleDefinition(input: BaseRoleDefinitionInput): BaseRoleDefinition {
  const timestamp = input.updatedAt ?? new Date().toISOString();
  return {
    id: input.id.trim(),
    name: input.name.trim(),
    grants: normalizeGrants(input.grants),
    version: input.version,
    updatedAt: timestamp,
    updatedBy: input.updatedBy.trim(),
  };
}

/**
 * Normalize explicit record status to enforce the approved lifecycle vocabulary.
 */
export function normalizeAccessControlStatus(status?: AccessControlRecordStatus): AccessControlRecordStatus {
  return status ?? 'active';
}

/**
 * Resolve renewal state from explicit metadata and optional expiry timestamp.
 */
export function resolveRenewalState(
  metadata: Pick<AccessOverrideExpirationMetadata, 'expiresAt' | 'renewalState'>,
  now: Date = new Date(),
): RenewalState {
  if (!metadata.expiresAt) {
    return metadata.renewalState ?? 'not-required';
  }

  if (metadata.renewalState === 'renewed' || metadata.renewalState === 'pending-renewal') {
    return metadata.renewalState;
  }

  return new Date(metadata.expiresAt).getTime() <= now.getTime() ? 'expired' : 'not-required';
}

/**
 * Build review metadata payload used when role-definition drift requires override re-review.
 *
 * D-04 alignment: deterministic timestamp + actor attribution for reproducible audit trails.
 */
export function createReviewMetadata(params: {
  reviewRequired: boolean;
  reviewReason?: string;
  reviewMarkedBy?: string;
  reviewMarkedAt?: string;
}): AccessControlOverrideReviewMetadata {
  return {
    reviewRequired: params.reviewRequired,
    reviewReason: params.reviewReason,
    reviewMarkedBy: params.reviewMarkedBy,
    reviewMarkedAt: params.reviewRequired
      ? (params.reviewMarkedAt ?? new Date().toISOString())
      : undefined,
  };
}

/**
 * Create typed audit event records for auth/access governance operations.
 *
 * D-07 alignment: explicit, validated payload shape for governance workflows.
 * D-12 alignment: keeps shell/UI rendering concerns separate from backend audit modeling.
 */
export function createAccessControlAuditEvent(params: {
  eventType: AccessControlAuditEventType;
  actorId: string;
  subjectUserId: string;
  overrideId?: string;
  roleId?: string;
  details?: Record<string, unknown>;
  occurredAt?: string;
}): AccessControlAuditEventRecord {
  return {
    id: createAuditEventId(params.eventType),
    eventType: params.eventType,
    actorId: params.actorId,
    subjectUserId: params.subjectUserId,
    overrideId: params.overrideId,
    roleId: params.roleId,
    details: params.details,
    occurredAt: params.occurredAt ?? new Date().toISOString(),
  };
}

/**
 * Compare role-definition versions to identify base-role references requiring override review.
 */
export function getChangedBaseRoleReferences(params: {
  previous: BaseRoleDefinition[];
  next: BaseRoleDefinition[];
}): BaseRoleDefinitionVersionDiff[] {
  const previousById = new Map(params.previous.map((role) => [role.id, role]));
  const nextById = new Map(params.next.map((role) => [role.id, role]));
  const diffs: BaseRoleDefinitionVersionDiff[] = [];

  for (const [roleId, nextRole] of nextById) {
    const previousRole = previousById.get(roleId);
    if (!previousRole) {
      diffs.push({
        roleId,
        previousVersion: null,
        nextVersion: nextRole.version,
      });
      continue;
    }

    if (previousRole.version !== nextRole.version) {
      diffs.push({
        roleId,
        previousVersion: previousRole.version,
        nextVersion: nextRole.version,
      });
    }
  }

  return diffs;
}

function normalizeGrants(grants: string[]): string[] {
  return Array.from(
    new Set(
      grants
        .map((grant) => grant.trim())
        .filter((grant) => grant.length > 0),
    ),
  ).sort();
}

function createAuditEventId(eventType: AccessControlAuditEventType): string {
  const seed = Math.random().toString(36).slice(2, 10);
  return `ace-${eventType}-${seed}`;
}
