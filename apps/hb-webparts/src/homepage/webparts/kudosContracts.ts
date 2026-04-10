/**
 * HB Kudos contracts — Phase-14 kudos/ Prompt-01.
 *
 * Authoritative final-state data model for the HB Kudos recognition
 * product and the HR approval companion webpart. These contracts extend
 * (they do not replace) the legacy merged recognition model in
 * `./communicationsContracts.ts` and are the types Prompts 02–06 of the
 * kudos/ package must consume.
 *
 * Design rules enforced by this file:
 *
 *   - No stringly-typed recipient model. Typed recipient buckets and a
 *     single `KudosRecipient` shape cover individual + team + department
 *     + project-group targeting for both reads and writes.
 *   - No loose workflow-status strings. `KudosWorkflowStatus` is the
 *     single authoritative 7-state union and every predicate/mapping
 *     helper in this file consumes it explicitly.
 *   - No implicit governance state. Admin-review, scheduling, prominence,
 *     claim/reassignment, remove/restore, revision, and withdrawal
 *     metadata each get their own explicit shape so later prompts cannot
 *     accidentally collapse them into a single flag.
 *   - No inline ad-hoc view models. Employee-facing recognition surfaces
 *     and governance workspace surfaces both consume typed view-model
 *     contracts so the shared primitives promoted in Prompts 02–03 can
 *     stay disciplined.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Plan-Summary.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Schema-Reference-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-kudos-sharepoint-schema-report.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-00-Authority-and-Scope-Lock-Report.md`
 */

import type { HomepageMediaSlot } from '../models/contentModels.js';
import type {
  KudosCurrentVisibilityMode,
  KudosEntry,
  KudosProminenceIntent,
  KudosRecipient,
  KudosRecipientType,
  KudosWorkflowStatus,
  PersonReference,
} from './communicationsContracts.js';

// Re-export the existing primitives so kudos/ consumers can import
// everything from a single module.
export type {
  KudosCurrentVisibilityMode,
  KudosEntry,
  KudosProminenceIntent,
  KudosRecipient,
  KudosRecipientType,
  KudosWorkflowStatus,
  PersonReference,
};

// ---------------------------------------------------------------------------
// 1. Typed recipient buckets and write payloads
// ---------------------------------------------------------------------------

/**
 * Explicit typed recipient buckets. This is the final-state shape for
 * submission and editing flows. Plain text / comma-delimited recipient
 * models are not acceptable (Decision-Lock-Appendix §UI governance,
 * Prompt-00 §5 recipient compliance).
 */
export interface KudosRecipientBuckets {
  /** Resolved SharePoint user ids for `IndividualRecipients` (UserMulti). */
  individualUserIds: readonly number[];
  /** Taxonomy labels for `TeamRecipients`. */
  teamLabels: readonly string[];
  /** Taxonomy labels for `DepartmentRecipients`. */
  departmentLabels: readonly string[];
  /** Taxonomy labels for `ProjectGroupRecipients`. */
  projectGroupLabels: readonly string[];
}

export const EMPTY_KUDOS_RECIPIENT_BUCKETS: KudosRecipientBuckets = {
  individualUserIds: [],
  teamLabels: [],
  departmentLabels: [],
  projectGroupLabels: [],
};

/** Author-submitted fields for a new kudos entry. */
export interface KudosSubmissionPayload {
  headline: string;
  excerpt: string;
  details?: string;
  primaryImageUrl?: string;
  imageAltText?: string;
  recipients: KudosRecipientBuckets;
}

// ---------------------------------------------------------------------------
// 2. Governance metadata groups (explicit, non-collapsing)
// ---------------------------------------------------------------------------

export interface KudosRevisionMetadata {
  revisionRequestedBy?: PersonReference;
  revisionRequestedAt?: string;
  revisionGuidance?: string;
}

export interface KudosWithdrawalMetadata {
  withdrawnBy?: PersonReference;
  withdrawnAt?: string;
}

export interface KudosAdminReviewMetadata {
  /** Mirrors the live `IsFlaggedForAdminReview` boolean. */
  isFlaggedForAdminReview?: boolean;
  adminReviewFlaggedBy?: PersonReference;
  adminReviewFlaggedAt?: string;
  adminReviewReason?: string;
  adminReviewedBy?: PersonReference;
  adminReviewedAt?: string;
}

export interface KudosRemovalMetadata {
  /** Mirrors the live `IsRemovedFromPublicView` boolean. */
  isRemovedFromPublicView?: boolean;
  removedBy?: PersonReference;
  removedAt?: string;
  removedReason?: string;
  restoredBy?: PersonReference;
  restoredAt?: string;
}

export interface KudosScheduleMetadata {
  isScheduled?: boolean;
  scheduledPublishAt?: string;
  scheduledBy?: PersonReference;
  scheduleChangedBy?: PersonReference;
  scheduleChangedAt?: string;
  scheduleCancelledBy?: PersonReference;
  scheduleCancelledAt?: string;
}

export interface KudosProminenceFailureMetadata {
  prominenceFailureAt?: string;
  prominenceFailureReason?: string;
}

export interface KudosClaimOwnership {
  claimOwner?: PersonReference;
  claimedAt?: string;
  assignedOwner?: PersonReference;
  reassignedBy?: PersonReference;
  reassignedAt?: string;
  reviewedBy?: PersonReference;
  reviewedAt?: string;
}

export interface KudosModerationNotes {
  rejectionReason?: string;
  moderatorNotes?: string;
}

/**
 * Full-fidelity governance-facing entry that extends `KudosEntry` with
 * every live-list metadata group the HR approval companion needs. The
 * employee-facing recognition surface may continue to consume the
 * narrower `KudosEntry`; the governance workspace consumes this shape.
 */
export interface KudosGovernanceEntry
  extends KudosEntry,
    KudosRevisionMetadata,
    KudosWithdrawalMetadata,
    KudosAdminReviewMetadata,
    KudosRemovalMetadata,
    KudosScheduleMetadata,
    KudosProminenceFailureMetadata,
    KudosClaimOwnership,
    KudosModerationNotes {}

// ---------------------------------------------------------------------------
// 3. Audit event contracts
// ---------------------------------------------------------------------------

export type KudosAuditEventType =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'revisionRequested'
  | 'reopen'
  | 'remove'
  | 'restore'
  | 'flagAdminReview'
  | 'clearAdminReview'
  | 'claim'
  | 'reassign'
  | 'schedule'
  | 'unschedule'
  | 'feature'
  | 'unfeature'
  | 'pin'
  | 'unpin'
  | 'celebrate';

export const KUDOS_AUDIT_EVENT_TYPES: readonly KudosAuditEventType[] = [
  'submit',
  'approve',
  'reject',
  'revisionRequested',
  'reopen',
  'remove',
  'restore',
  'flagAdminReview',
  'clearAdminReview',
  'claim',
  'reassign',
  'schedule',
  'unschedule',
  'feature',
  'unfeature',
  'pin',
  'unpin',
  'celebrate',
] as const;

/**
 * Read shape for a row from the `Kudos Audit Events` list. The
 * `oldValue` and `newValue` payloads are deliberately typed as
 * `unknown` so the UI summarizers can enforce a per-event-type contract
 * rather than leaking raw JSON blobs through to end users.
 */
export interface KudosAuditEvent {
  /** SharePoint item id for this audit row. */
  id: number;
  /** Foreign key to the parent `People Culture Kudos` item. */
  kudosId: string;
  eventType: KudosAuditEventType;
  actor?: PersonReference;
  /** ISO timestamp for when the event occurred. */
  eventAt: string;
  publicNote?: string;
  internalNote?: string;
  /**
   * Pre-change snapshot for reducer/replay. Writers should serialize
   * small, well-shaped objects here (never raw form state).
   */
  oldValue?: unknown;
  /** Post-change snapshot for reducer/replay. */
  newValue?: unknown;
}

/** Write shape for a new row in `Kudos Audit Events`. */
export interface KudosAuditEventInput {
  kudosId: string;
  eventType: KudosAuditEventType;
  /** Resolved SharePoint user id for the `Actor` Person field. */
  actorUserId?: number;
  /** ISO timestamp. Defaults to `new Date().toISOString()` at the writer. */
  eventAtIso?: string;
  publicNote?: string;
  internalNote?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

// ---------------------------------------------------------------------------
// 4. Governance write-patch contracts (Prompts 03–05 consume these)
// ---------------------------------------------------------------------------

interface KudosPatchBase {
  kudosId: string;
  actorUserId?: number;
  actedAtIso?: string;
  publicNote?: string;
  internalNote?: string;
}

export interface KudosApprovalPatch extends KudosPatchBase {
  kind: 'approve';
  flagForAdminReview?: boolean;
  adminReviewReason?: string;
}

export interface KudosRejectPatch extends KudosPatchBase {
  kind: 'reject';
  rejectionReason: string;
}

export interface KudosRevisionRequestPatch extends KudosPatchBase {
  kind: 'requestRevision';
  revisionGuidance: string;
}

export interface KudosResubmitPatch extends KudosPatchBase {
  kind: 'resubmit';
  updatedHeadline?: string;
  updatedExcerpt?: string;
  updatedDetails?: string;
}

export interface KudosWithdrawPatch extends KudosPatchBase {
  kind: 'withdraw';
}

export interface KudosRemovePatch extends KudosPatchBase {
  kind: 'remove';
  removedReason: string;
}

export interface KudosRestorePatch extends KudosPatchBase {
  kind: 'restore';
}

export interface KudosSchedulePatch extends KudosPatchBase {
  kind: 'schedule';
  scheduledPublishAtIso: string;
}

export interface KudosUnschedulePatch extends KudosPatchBase {
  kind: 'unschedule';
}

export interface KudosPinPatch extends KudosPatchBase {
  kind: 'pin';
  pinOrder?: number;
}

export interface KudosUnpinPatch extends KudosPatchBase {
  kind: 'unpin';
}

export interface KudosFeaturePatch extends KudosPatchBase {
  kind: 'feature';
  featuredExpiresAtIso?: string;
}

export interface KudosUnfeaturePatch extends KudosPatchBase {
  kind: 'unfeature';
}

export interface KudosClaimPatch extends KudosPatchBase {
  kind: 'claim';
}

export interface KudosReassignPatch extends KudosPatchBase {
  kind: 'reassign';
  /** Resolved SharePoint user id of the new assignee. */
  assignedUserId: number;
}

export interface KudosFlagAdminReviewPatch extends KudosPatchBase {
  kind: 'flagAdminReview';
  adminReviewReason: string;
}

export interface KudosClearAdminReviewPatch extends KudosPatchBase {
  kind: 'clearAdminReview';
}

export interface KudosCelebratePatch extends KudosPatchBase {
  kind: 'celebrate';
  /** New count after increment. Writers should atomically recompute. */
  nextCount: number;
}

export interface KudosUpdateContentPatch extends KudosPatchBase {
  kind: 'updateContent';
  headline?: string;
  excerpt?: string;
  details?: string;
  primaryImageUrl?: string;
  imageAltText?: string;
  recipients?: KudosRecipientBuckets;
}

export type KudosPatch =
  | KudosApprovalPatch
  | KudosRejectPatch
  | KudosRevisionRequestPatch
  | KudosResubmitPatch
  | KudosWithdrawPatch
  | KudosRemovePatch
  | KudosRestorePatch
  | KudosSchedulePatch
  | KudosUnschedulePatch
  | KudosPinPatch
  | KudosUnpinPatch
  | KudosFeaturePatch
  | KudosUnfeaturePatch
  | KudosClaimPatch
  | KudosReassignPatch
  | KudosFlagAdminReviewPatch
  | KudosClearAdminReviewPatch
  | KudosCelebratePatch
  | KudosUpdateContentPatch;

export type KudosPatchKind = KudosPatch['kind'];

// ---------------------------------------------------------------------------
// 5. Employee-facing view models
// ---------------------------------------------------------------------------

/**
 * Compact mixed-recipient summary for spotlight/card/rail surfaces.
 * Lets the shared recipient-summary primitive render without each
 * consumer re-bucketing the `KudosRecipient[]` list.
 */
export interface KudosRecipientSummary {
  total: number;
  individual: KudosRecipient[];
  team: KudosRecipient[];
  department: KudosRecipient[];
  projectGroup: KudosRecipient[];
  /** Single-line label like `3 individuals · 2 teams`. */
  label: string;
}

export interface KudosSpotlightViewModel {
  id: string;
  headline: string;
  excerpt: string;
  submittedBy: PersonReference;
  submittedDate: string;
  approvedDate?: string;
  recipients: KudosRecipientSummary;
  prominenceIntent?: KudosProminenceIntent;
  media?: HomepageMediaSlot;
  celebrateCount?: number;
}

export interface KudosArchiveCardViewModel {
  id: string;
  headline: string;
  excerpt: string;
  submittedDate: string;
  submitterDisplayName: string;
  recipients: KudosRecipientSummary;
  workflowStatus: KudosWorkflowStatus;
  visibilityMode?: KudosCurrentVisibilityMode;
  prominenceIntent?: KudosProminenceIntent;
  celebrateCount?: number;
  media?: HomepageMediaSlot;
}

export interface KudosDetailSection {
  id: string;
  heading: string;
  tone?: KudosChipTone;
  body: string;
}

// ---------------------------------------------------------------------------
// 6. Governance workspace view models
// ---------------------------------------------------------------------------

/**
 * Non-collapsing aging buckets for HR queue rows. Derived from the
 * submission timestamp (or the most recent workflow event) relative to
 * "now" at render time.
 */
export type KudosAgingBucket =
  | 'freshToday'
  | 'within3Days'
  | 'within7Days'
  | 'within14Days'
  | 'stale';

/**
 * Tone set for shared status chips. Governance and employee surfaces
 * share this tone language so a single chip family can render every
 * workflow/prominence/visibility state.
 */
export type KudosChipTone =
  | 'neutral'
  | 'info'
  | 'pending'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted';

export interface KudosWorkflowChipDescriptor {
  status: KudosWorkflowStatus;
  tone: KudosChipTone;
  label: string;
}

export interface KudosQueueRowViewModel {
  id: string;
  headline: string;
  submittedBy: PersonReference;
  submittedDate: string;
  workflowStatus: KudosWorkflowStatus;
  workflowChip: KudosWorkflowChipDescriptor;
  recipients: KudosRecipientSummary;
  aging: KudosAgingBucket;
  isFlaggedForAdminReview: boolean;
  isScheduled: boolean;
  scheduledPublishAt?: string;
  claimOwner?: PersonReference;
  assignedOwner?: PersonReference;
  prominenceIntent?: KudosProminenceIntent;
  visibilityMode?: KudosCurrentVisibilityMode;
}

export interface KudosQueueFilterState {
  statuses: readonly KudosWorkflowStatus[];
  ownership: 'all' | 'mine' | 'unassigned';
  aging: readonly KudosAgingBucket[];
  adminReviewOnly: boolean;
  scheduledOnly: boolean;
  searchText?: string;
}

export const DEFAULT_KUDOS_QUEUE_FILTER_STATE: KudosQueueFilterState = {
  statuses: ['pending', 'revisionRequested'],
  ownership: 'all',
  aging: [],
  adminReviewOnly: false,
  scheduledOnly: false,
};

export interface KudosTimelineEntryViewModel {
  id: number;
  eventType: KudosAuditEventType;
  actorDisplayName?: string;
  eventAt: string;
  label: string;
  tone: KudosChipTone;
  publicNote?: string;
  internalNote?: string;
}

// ---------------------------------------------------------------------------
// 7. Mapping helpers and predicates
// ---------------------------------------------------------------------------

const WORKFLOW_STATUS_LABELS: Record<KudosWorkflowStatus, string> = {
  pending: 'Pending review',
  revisionRequested: 'Revision requested',
  approved: 'Approved',
  approvedScheduled: 'Scheduled',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  removedUnpublished: 'Removed',
};

const WORKFLOW_STATUS_CHIP_TONES: Record<KudosWorkflowStatus, KudosChipTone> = {
  pending: 'pending',
  revisionRequested: 'warning',
  approved: 'success',
  approvedScheduled: 'info',
  rejected: 'danger',
  withdrawn: 'muted',
  removedUnpublished: 'muted',
};

const AUDIT_EVENT_LABELS: Record<KudosAuditEventType, string> = {
  submit: 'Submitted',
  approve: 'Approved',
  reject: 'Rejected',
  revisionRequested: 'Revision requested',
  reopen: 'Reopened',
  remove: 'Removed from public view',
  restore: 'Restored',
  flagAdminReview: 'Flagged for admin review',
  clearAdminReview: 'Admin review cleared',
  claim: 'Claimed',
  reassign: 'Reassigned',
  schedule: 'Scheduled',
  unschedule: 'Schedule cancelled',
  feature: 'Featured',
  unfeature: 'Unfeatured',
  pin: 'Pinned',
  unpin: 'Unpinned',
  celebrate: 'Celebrated',
};

const AUDIT_EVENT_CHIP_TONES: Record<KudosAuditEventType, KudosChipTone> = {
  submit: 'info',
  approve: 'success',
  reject: 'danger',
  revisionRequested: 'warning',
  reopen: 'info',
  remove: 'danger',
  restore: 'success',
  flagAdminReview: 'warning',
  clearAdminReview: 'neutral',
  claim: 'info',
  reassign: 'info',
  schedule: 'info',
  unschedule: 'muted',
  feature: 'success',
  unfeature: 'muted',
  pin: 'info',
  unpin: 'muted',
  celebrate: 'success',
};

export function mapWorkflowStatusLabel(status: KudosWorkflowStatus): string {
  return WORKFLOW_STATUS_LABELS[status];
}

export function mapWorkflowStatusToChipTone(status: KudosWorkflowStatus): KudosChipTone {
  return WORKFLOW_STATUS_CHIP_TONES[status];
}

export function buildWorkflowChipDescriptor(
  status: KudosWorkflowStatus,
): KudosWorkflowChipDescriptor {
  return {
    status,
    tone: WORKFLOW_STATUS_CHIP_TONES[status],
    label: WORKFLOW_STATUS_LABELS[status],
  };
}

export function mapAuditEventTypeLabel(eventType: KudosAuditEventType): string {
  return AUDIT_EVENT_LABELS[eventType];
}

export function mapAuditEventTypeChipTone(eventType: KudosAuditEventType): KudosChipTone {
  return AUDIT_EVENT_CHIP_TONES[eventType];
}

const PENDING_STATUSES: ReadonlySet<KudosWorkflowStatus> = new Set([
  'pending',
  'revisionRequested',
]);

const RESOLVED_STATUSES: ReadonlySet<KudosWorkflowStatus> = new Set([
  'approved',
  'approvedScheduled',
  'rejected',
  'withdrawn',
  'removedUnpublished',
]);

export function isWorkflowPending(status: KudosWorkflowStatus): boolean {
  return PENDING_STATUSES.has(status);
}

export function isWorkflowResolved(status: KudosWorkflowStatus): boolean {
  return RESOLVED_STATUSES.has(status);
}

/**
 * `true` when the entry is in a state that should appear on the public
 * homepage. Scheduled-only items (`approvedScheduled`) are intentionally
 * not public-visible yet — the scheduler flips them to `approved` at
 * go-live.
 */
export function isPubliclyVisible(entry: Pick<KudosEntry, 'workflowStatus' | 'homepageEnabled'>): boolean {
  if (entry.homepageEnabled !== true) return false;
  return entry.workflowStatus === 'approved';
}

/**
 * `true` when the entry should appear in the employee-facing archive
 * browse view (including items that are no longer on the homepage, but
 * were once approved and are not currently removed).
 */
export function isArchiveEligible(
  entry: Pick<KudosEntry, 'workflowStatus' | 'wasEverPublished'> &
    Partial<Pick<KudosRemovalMetadata, 'isRemovedFromPublicView'>>,
): boolean {
  if (entry.isRemovedFromPublicView === true) return false;
  if (entry.wasEverPublished !== true) return false;
  return entry.workflowStatus === 'approved' || entry.workflowStatus === 'approvedScheduled';
}

export function isHomepageVisible(
  entry: Pick<KudosEntry, 'workflowStatus' | 'homepageEnabled'>,
): boolean {
  return isPubliclyVisible(entry);
}

/**
 * `true` when an entry is flagged for admin review and that review
 * has not yet been resolved. Accepts an unknown shape because the
 * read path in Prompt-03 does not yet hydrate the admin review
 * metadata onto every `KudosEntry` — callers can pass any entry and
 * the function defensively reads only the fields it needs.
 */
export function needsAdminReview(entry: unknown): boolean {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Partial<KudosAdminReviewMetadata>;
  return e.isFlaggedForAdminReview === true && !e.adminReviewedAt;
}

// ---------------------------------------------------------------------------
// 8. Recipient summary helper
// ---------------------------------------------------------------------------

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Bucket a `KudosRecipient[]` list into the shared
 * `KudosRecipientSummary` view-model shape with a deterministic label.
 * Pure function — safe to call from both UI and tests.
 */
export function buildKudosRecipientSummary(
  recipients: readonly KudosRecipient[],
): KudosRecipientSummary {
  const individual: KudosRecipient[] = [];
  const team: KudosRecipient[] = [];
  const department: KudosRecipient[] = [];
  const projectGroup: KudosRecipient[] = [];

  for (const recipient of recipients) {
    switch (recipient.recipientType) {
      case 'individual':
        individual.push(recipient);
        break;
      case 'team':
        team.push(recipient);
        break;
      case 'department':
        department.push(recipient);
        break;
      case 'projectGroup':
        projectGroup.push(recipient);
        break;
    }
  }

  const segments: string[] = [];
  if (individual.length > 0) segments.push(pluralize(individual.length, 'individual', 'individuals'));
  if (team.length > 0) segments.push(pluralize(team.length, 'team', 'teams'));
  if (department.length > 0) segments.push(pluralize(department.length, 'department', 'departments'));
  if (projectGroup.length > 0) segments.push(pluralize(projectGroup.length, 'project group', 'project groups'));

  return {
    total: recipients.length,
    individual,
    team,
    department,
    projectGroup,
    label: segments.length === 0 ? 'No recipients' : segments.join(' · '),
  };
}

// ---------------------------------------------------------------------------
// 9. Aging helper
// ---------------------------------------------------------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Classify the age of a kudos entry into a non-collapsing bucket. The
 * `referenceDateIso` argument is required so callers in tests (and
 * deterministic snapshot flows) can pin "now" explicitly. Invalid or
 * missing timestamps return `'stale'` defensively.
 */
export function deriveAgingBucket(
  submittedDateIso: string | undefined,
  referenceDateIso: string,
): KudosAgingBucket {
  if (!submittedDateIso) return 'stale';
  const submittedMs = Date.parse(submittedDateIso);
  const referenceMs = Date.parse(referenceDateIso);
  if (Number.isNaN(submittedMs) || Number.isNaN(referenceMs)) return 'stale';

  const deltaDays = Math.max(0, Math.floor((referenceMs - submittedMs) / MS_PER_DAY));
  if (deltaDays === 0) return 'freshToday';
  if (deltaDays <= 3) return 'within3Days';
  if (deltaDays <= 7) return 'within7Days';
  if (deltaDays <= 14) return 'within14Days';
  return 'stale';
}
