/**
 * HB Kudos role capabilities — Phase-14 kudos/ Prompt-03.
 *
 * Pure helper that maps the Decision-Lock-Appendix admin / reviewer /
 * viewer role matrix into a capability flag record. The HR approval
 * companion webpart consumes this to gate action availability in the
 * UI; the governance writer (`kudosGovernanceWriter.ts`) consumes the
 * same flags as a server-side safety check before issuing any PATCH.
 *
 * This is a pure, synchronous helper. Real SharePoint group membership
 * resolution against `kudosAdminsGroup` / `kudosReviewersGroup` is
 * scoped out of Prompt-03 and deferred to Prompt-05 (Permissions,
 * Notifications, and Work Management). Until that lands, the HR
 * companion uses the `simulatedRole` webpart property so the UI gates
 * can be exercised in development and packaging.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-00-Authority-and-Scope-Lock-Report.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-03-HR-Approval-Companion-Webpart.md`
 */

/**
 * The three-role kudos governance model from the Decision-Lock-Appendix.
 *
 *  - `admin`    Full governance authority. Can approve, reject, request
 *               revision, flag/clear admin review, schedule, pin,
 *               feature, remove, restore, and close out admin review.
 *  - `reviewer` Can approve, reject, request revision, flag admin
 *               review, and clear admin review. Cannot schedule, pin,
 *               feature, remove, or restore — those are admin-only per
 *               `Decision-Lock-Appendix.md §Admin-Only Actions`.
 *  - `viewer`   Employee-level access. No governance actions at all.
 *               The HR companion must never accept viewer-role writes.
 */
export type KudosRole = 'admin' | 'reviewer' | 'viewer';

export const KUDOS_ROLES: readonly KudosRole[] = ['admin', 'reviewer', 'viewer'] as const;

/**
 * Capability flags derived from a `KudosRole`. Extended once to keep
 * the call sites honest — if a new action type is added, this
 * interface should grow so the UI + writer both surface a
 * deliberate gate decision.
 */
export interface KudosCapabilities {
  /** Shown the governance workspace at all. `false` redirects ordinary viewers. */
  canViewGovernance: boolean;
  /** Can move items into `approved` (with `HomepageEnabled=true`). */
  canApprove: boolean;
  /** Can move items into `rejected`. */
  canReject: boolean;
  /** Can move items into `revisionRequested`. */
  canRequestRevision: boolean;
  /** Can set `IsFlaggedForAdminReview=true` + store reason. */
  canFlagAdminReview: boolean;
  /** Can close out an admin review by setting `AdminReviewedBy/At`. */
  canClearAdminReview: boolean;
  /** Admin-only: schedule a future publish. */
  canSchedule: boolean;
  /** Admin-only: pin / unpin. */
  canPin: boolean;
  /** Admin-only: feature / unfeature. */
  canFeature: boolean;
  /** Admin-only: remove from public view. */
  canRemove: boolean;
  /** Admin-only: restore a removed entry. */
  canRestore: boolean;
  /** Can claim and reassign queue items. */
  canClaim: boolean;
  /** Can dispatch the bulk approve flow. */
  canBulkApprove: boolean;
  /** Admin-only: edit a published entry in place. */
  canEditPublished: boolean;
}

const ADMIN_CAPABILITIES: KudosCapabilities = {
  canViewGovernance: true,
  canApprove: true,
  canReject: true,
  canRequestRevision: true,
  canFlagAdminReview: true,
  canClearAdminReview: true,
  canSchedule: true,
  canPin: true,
  canFeature: true,
  canRemove: true,
  canRestore: true,
  canClaim: true,
  canBulkApprove: true,
  canEditPublished: true,
};

const REVIEWER_CAPABILITIES: KudosCapabilities = {
  canViewGovernance: true,
  canApprove: true,
  canReject: true,
  canRequestRevision: true,
  canFlagAdminReview: true,
  canClearAdminReview: true,
  canSchedule: false,
  canPin: false,
  canFeature: false,
  canRemove: false,
  canRestore: false,
  canClaim: true,
  canBulkApprove: true,
  canEditPublished: false,
};

const VIEWER_CAPABILITIES: KudosCapabilities = {
  canViewGovernance: false,
  canApprove: false,
  canReject: false,
  canRequestRevision: false,
  canFlagAdminReview: false,
  canClearAdminReview: false,
  canSchedule: false,
  canPin: false,
  canFeature: false,
  canRemove: false,
  canRestore: false,
  canClaim: false,
  canBulkApprove: false,
  canEditPublished: false,
};

/**
 * Map a `KudosRole` to its capability flag record. Pure and
 * deterministic — safe to call from UI render paths, tests, and the
 * governance writer's pre-flight checks.
 */
export function deriveKudosCapabilities(role: KudosRole): KudosCapabilities {
  switch (role) {
    case 'admin':
      return ADMIN_CAPABILITIES;
    case 'reviewer':
      return REVIEWER_CAPABILITIES;
    case 'viewer':
    default:
      return VIEWER_CAPABILITIES;
  }
}

/**
 * Parse a raw webpart property (possibly untyped from the manifest
 * config) into a valid `KudosRole`. Unknown / missing values default
 * to `'viewer'` so a mis-configured instance fails closed rather than
 * silently granting admin authority.
 */
export function parseKudosRole(raw: unknown): KudosRole {
  if (raw === 'admin' || raw === 'reviewer' || raw === 'viewer') {
    return raw;
  }
  return 'viewer';
}

/**
 * Friendly labels for the role chip shown in the HR companion header.
 */
export const KUDOS_ROLE_LABELS: Record<KudosRole, string> = {
  admin: 'Kudos Admin',
  reviewer: 'Kudos Reviewer',
  viewer: 'View only',
};
