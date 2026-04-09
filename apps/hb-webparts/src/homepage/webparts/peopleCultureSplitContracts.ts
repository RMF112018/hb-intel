/**
 * People & Culture split contracts — Phase-14 pc/ Prompt-01.
 *
 * These types are the explicit authoritative data model for the **split**
 * People & Culture surfaces:
 *
 *   - the People & Culture *public* webpart
 *     (`apps/hb-webparts/src/webparts/peopleCulturePublic/`)
 *   - the People & Culture HR *operating companion* webpart
 *     (`apps/hb-webparts/src/webparts/peopleCultureCompanion/`, not yet
 *     materialized)
 *
 * They intentionally live alongside — and do **not** replace — the legacy
 * merged People & Culture contracts in
 * `./communicationsContracts.ts`. The merged surface (`PeopleCultureMerged`,
 * manifest `27ac10f4-…`) remains live as a backward-compatibility seam and
 * continues to consume `PeopleCultureMergedConfig`. The split contracts
 * below are additive.
 *
 * The split model is strongly typed and narrow on purpose:
 *
 *   - no "misc metadata" escape hatches
 *   - no collapsing archived / expired / suppressed into a single flag
 *   - no implicit audience scope — every item declares company-wide vs
 *     targeted dimensions
 *   - no recognition primitives (HB Kudos is a separate product boundary
 *     and must never be imported from PC public or PC companion)
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/pc/Plan-Summary.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/pc/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/pc/Prompt-01-Data-Model-and-Contracts.md`
 */

import type { HomepageCtaLink, HomepageMediaSlot } from '../models/contentModels.js';
import type { PersonReference } from './communicationsContracts.js';

// ---------------------------------------------------------------------------
// 1. Content family
// ---------------------------------------------------------------------------

/**
 * The three top-level content families that the People & Culture public
 * webpart and the HR operating companion must support.
 *
 *   - `announcement`        — warm person/company announcements
 *   - `celebrationMilestone`— birthdays, anniversaries, milestones
 *   - `cultureProgramEvent` — broader culture programming / events
 *
 * Recognition (HB Kudos) is **not** a PC content family. Recognition is
 * owned by the separate HB Kudos webpart boundary.
 */
export type PeopleCultureContentFamily =
  | 'announcement'
  | 'celebrationMilestone'
  | 'cultureProgramEvent';

export const PEOPLE_CULTURE_CONTENT_FAMILIES: readonly PeopleCultureContentFamily[] = [
  'announcement',
  'celebrationMilestone',
  'cultureProgramEvent',
] as const;

// ---------------------------------------------------------------------------
// 2. Lifecycle / state model
// ---------------------------------------------------------------------------

/**
 * The authoritative lifecycle states for PC content. These are the eight
 * values required by `Decision-Lock-Appendix.md`. They are explicit and
 * must never silently collapse (`archived` vs `expired` vs `suppressed`
 * are all distinct and must remain distinct).
 */
export type PeopleCultureLifecycleState =
  | 'draft'
  | 'needsApproval'
  | 'scheduled'
  | 'live'
  | 'expiringSoon'
  | 'expired'
  | 'archived'
  | 'suppressed';

export const PEOPLE_CULTURE_LIFECYCLE_STATES: readonly PeopleCultureLifecycleState[] = [
  'draft',
  'needsApproval',
  'scheduled',
  'live',
  'expiringSoon',
  'expired',
  'archived',
  'suppressed',
] as const;

// ---------------------------------------------------------------------------
// 3. Approval trigger model
// ---------------------------------------------------------------------------

/**
 * Approval governance path a PC item travels under.
 *
 *   - `standard`       — ordinary HR editorial flow. No added approval.
 *   - `enterpriseWide` — enterprise-wide / high-visibility. Requires the
 *                        second approval checkpoint.
 *   - `homepagePinned` — pinned to the homepage. Requires the second
 *                        approval checkpoint regardless of audience.
 *
 * Per the Decision-Lock Appendix, pinning and enterprise-wide scope are
 * the only current triggers for the hybrid governance path. Targeted
 * audience scope alone does **not** force enterprise governance.
 */
export type PeopleCultureApprovalTrigger =
  | 'standard'
  | 'enterpriseWide'
  | 'homepagePinned';

// ---------------------------------------------------------------------------
// 4. Audience model
// ---------------------------------------------------------------------------

/**
 * A single audience dimension. The repository currently recognizes the
 * following dimensions. New dimensions must be added explicitly here, not
 * through a `string` escape hatch.
 */
export type PeopleCultureAudienceDimension =
  | 'office'
  | 'department'
  | 'region'
  | 'roleFamily'
  | 'projectTeam';

export interface PeopleCultureAudienceTag {
  dimension: PeopleCultureAudienceDimension;
  /** Stable term label or key (e.g. `Coral Springs`, `SAFETY`, `pm-track`). */
  value: string;
}

/**
 * Audience scope for a single PC item.
 *
 *   - `companyWide`           — visible to every employee
 *   - `targeted` with tags    — visible only to employees whose own tag set
 *                               intersects the item's tag set. An empty
 *                               `tags` array on a targeted item is invalid
 *                               and must be rejected upstream — it is
 *                               *not* silently treated as company-wide.
 */
export type PeopleCultureAudienceScope =
  | { kind: 'companyWide' }
  | { kind: 'targeted'; tags: PeopleCultureAudienceTag[] };

/**
 * A viewer's own audience identity. Used by the public surface to filter
 * targeted items down to those that intersect the viewer's tag set.
 */
export interface PeopleCultureViewerAudience {
  tags: PeopleCultureAudienceTag[];
}

// ---------------------------------------------------------------------------
// 5. Homepage governance metadata
// ---------------------------------------------------------------------------

/**
 * Where a PC item currently sits in the homepage hierarchy.
 *
 *   - `featured`  — hero/featured tier
 *   - `supporting`— supporting/secondary tier
 *   - `excluded`  — not on homepage
 */
export type PeopleCultureHomepageTier = 'featured' | 'supporting' | 'excluded';

/**
 * Who decided the current homepage placement:
 *   - `systemDefault` — placement derived from the default ranking rules
 *   - `hrOverride`    — HR explicitly overrode the system
 */
export type PeopleCultureHomepageOverrideSource = 'systemDefault' | 'hrOverride';

/**
 * Why a homepage placement is flagged as conflicted. The companion
 * Homepage surface surfaces these to HR so pins/overrides don't silently
 * collide.
 */
export type PeopleCultureHomepageConflictReason =
  | 'pinnedOverflow'
  | 'featuredOverflow'
  | 'supportingOverflow'
  | 'audienceAmbiguity'
  | 'expiringWhilePinned';

export interface PeopleCultureHomepageGovernance {
  tier: PeopleCultureHomepageTier;
  overrideSource: PeopleCultureHomepageOverrideSource;
  /** Pinned to the homepage. Pinning forces the hybrid approval trigger. */
  isPinned: boolean;
  /** Optional manual ordering within the tier. Lower = earlier. */
  order?: number;
  /** Non-empty when the placement is currently conflicted. */
  conflictReason?: PeopleCultureHomepageConflictReason;
}

// ---------------------------------------------------------------------------
// 6. Media-source model
// ---------------------------------------------------------------------------

/**
 * Explicit media source for a PC item. Person-based items default to
 * `profilePhoto`; HR can override with uploaded, campaign, or event art,
 * or explicitly declare `none`.
 *
 * Non-person campaign/event items should use `campaignArtwork` or
 * `eventPhotography` as their primary media.
 */
export type PeopleCultureMediaSource =
  | { kind: 'profilePhoto'; personId: string }
  | { kind: 'hrUpload'; src: string; alt: string }
  | { kind: 'campaignArtwork'; src: string; alt: string }
  | { kind: 'eventPhotography'; src: string; alt: string }
  | { kind: 'none' };

export type PeopleCultureMediaSourceKind = PeopleCultureMediaSource['kind'];

/**
 * A resolved media slot, tagged with the originating source kind so the
 * companion can surface which media channel is currently active.
 *
 * When a profile-photo resolver is not available at runtime (e.g., in
 * local dev), `profilePhoto` sources fall through to `none`.
 */
export interface PeopleCultureResolvedMedia {
  slot: HomepageMediaSlot;
  sourceKind: PeopleCultureMediaSourceKind;
}

// ---------------------------------------------------------------------------
// 7. Milestone candidate model
// ---------------------------------------------------------------------------

/** Recurring milestone types that are auto-generated from a trusted source. */
export type PeopleCultureMilestoneCandidateType =
  | 'birthday'
  | 'serviceAnniversary'
  | 'newHireAnniversary';

/** Review states a milestone candidate can sit in before it becomes a live item. */
export type PeopleCultureMilestoneCandidateReviewState =
  | 'pendingReview'
  | 'accepted'
  | 'edited'
  | 'suppressed';

export interface PeopleCultureMilestoneCandidate {
  id: string;
  candidateType: PeopleCultureMilestoneCandidateType;
  personId: string;
  personDisplayName: string;
  /** ISO date (yyyy-mm-dd) the milestone occurs on. */
  occursOn: string;
  /** ISO timestamp at which the candidate was generated by the trusted source. */
  generatedAt: string;
  /** Trusted source-system identifier (e.g. `PeopleData`). */
  sourceSystem: string;
  reviewState: PeopleCultureMilestoneCandidateReviewState;
  reviewedBy?: PersonReference;
  reviewedAt?: string;
  /** For service / new-hire anniversaries. */
  anniversaryYears?: number;
  /** When HR converts the candidate into a live item, the item id is recorded here. */
  linkedItemId?: string;
}

// ---------------------------------------------------------------------------
// 8. Role / permission model
// ---------------------------------------------------------------------------

/**
 * PC operating roles. Per the Decision-Lock Appendix, v1 has two effective
 * tiers — Editor and Approver/Admin. We model `approver` and `admin` as
 * separate literal types so v2 can diverge capabilities without rewriting
 * consumer code, but both currently share the same capability sheet.
 */
export type PeopleCultureRole = 'editor' | 'approver' | 'admin';

export interface PeopleCultureRoleCapabilities {
  canCreate: boolean;
  canEdit: boolean;
  canSchedule: boolean;
  canSubmitForApproval: boolean;
  canApprove: boolean;
  canPublish: boolean;
  canUnpublish: boolean;
  canPin: boolean;
  canSuppress: boolean;
  canManageHomepage: boolean;
  canResolveApprovals: boolean;
  canClaimApproval: boolean;
  canReassignApproval: boolean;
}

export const PEOPLE_CULTURE_ROLE_CAPABILITIES: Record<
  PeopleCultureRole,
  PeopleCultureRoleCapabilities
> = {
  editor: {
    canCreate: true,
    canEdit: true,
    canSchedule: true,
    canSubmitForApproval: true,
    canApprove: false,
    canPublish: false,
    canUnpublish: false,
    canPin: false,
    canSuppress: false,
    canManageHomepage: false,
    canResolveApprovals: false,
    canClaimApproval: false,
    canReassignApproval: false,
  },
  approver: {
    canCreate: true,
    canEdit: true,
    canSchedule: true,
    canSubmitForApproval: true,
    canApprove: true,
    canPublish: true,
    canUnpublish: true,
    canPin: true,
    canSuppress: true,
    canManageHomepage: true,
    canResolveApprovals: true,
    canClaimApproval: true,
    canReassignApproval: true,
  },
  admin: {
    canCreate: true,
    canEdit: true,
    canSchedule: true,
    canSubmitForApproval: true,
    canApprove: true,
    canPublish: true,
    canUnpublish: true,
    canPin: true,
    canSuppress: true,
    canManageHomepage: true,
    canResolveApprovals: true,
    canClaimApproval: true,
    canReassignApproval: true,
  },
};

// ---------------------------------------------------------------------------
// 9. Notification / intake metadata
// ---------------------------------------------------------------------------

export type PeopleCultureNotificationRecipientKind =
  | 'submitter'
  | 'contentOwner'
  | 'editor'
  | 'approver';

export type PeopleCultureNotificationTrigger =
  | 'submitted'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'revisionRequested'
  | 'expired';

/** Limited non-HR intake — designated submitter roles. */
export type PeopleCultureIntakeSubmitterRole =
  | 'manager'
  | 'leader'
  | 'businessPartner';

export type PeopleCultureIntakeReviewState =
  | 'awaitingHrReview'
  | 'acceptedIntoDraft'
  | 'returnedForChanges'
  | 'declined';

/**
 * A non-HR intake submission. HR reviews, edits, and decides whether to
 * promote the submission into a real PC item (draft/scheduled/published).
 * Submissions never publish directly — there is no open all-employee
 * intake channel in v1.
 */
export interface PeopleCultureIntakeSubmission {
  id: string;
  submittedBy: PersonReference;
  submitterRole: PeopleCultureIntakeSubmitterRole;
  /** ISO timestamp. */
  submittedAt: string;
  suggestedFamily: PeopleCultureContentFamily;
  title: string;
  body: string;
  reviewState: PeopleCultureIntakeReviewState;
  reviewedBy?: PersonReference;
  reviewedAt?: string;
  reviewNotes?: string;
  /** Set once HR promotes the submission into a PC item. */
  linkedItemId?: string;
}

/**
 * A rendered notification event. The notification runtime derives these
 * from item state transitions — it does NOT persist them. Recipients are
 * the current operator cohort plus the content owner / submitter; the
 * featured subject of an announcement is explicitly not a recipient.
 */
export interface PeopleCultureNotificationEvent {
  id: string;
  trigger: PeopleCultureNotificationTrigger;
  itemId: string;
  itemTitle: string;
  itemFamily: PeopleCultureContentFamily;
  recipientKind: PeopleCultureNotificationRecipientKind;
  recipient?: PersonReference;
  /** ISO timestamp when the event was emitted. */
  emittedAt: string;
  /** Optional one-line context the companion renders with the event. */
  context?: string;
}

/**
 * Targeting-risk reasons surfaced by the targeting guardrails helper.
 * Used to flag items whose `targeted` audience scope looks dangerous.
 */
export type PeopleCultureTargetingRiskReason =
  | 'emptyTargetedAudience'
  | 'unknownDimension'
  | 'outOfTaxonomyValue';

// ---------------------------------------------------------------------------
// 10. Preview model
// ---------------------------------------------------------------------------

export type PeopleCultureRenderContext = 'publicWebpart' | 'companionItem';
export type PeopleCultureRenderVariant = 'featured' | 'supporting';
export type PeopleCultureRenderViewport = 'desktop' | 'mobile';

/**
 * A multi-context preview key. The companion preview surface iterates
 * over a fixed set of these keys so HR can see how an item will render
 * across the public webpart hierarchy and the companion item card.
 */
export interface PeopleCulturePreviewKey {
  context: PeopleCultureRenderContext;
  variant?: PeopleCultureRenderVariant;
  viewport?: PeopleCultureRenderViewport;
}

export const PEOPLE_CULTURE_DEFAULT_PREVIEW_KEYS: readonly PeopleCulturePreviewKey[] = [
  { context: 'publicWebpart', variant: 'featured', viewport: 'desktop' },
  { context: 'publicWebpart', variant: 'supporting', viewport: 'desktop' },
  { context: 'publicWebpart', variant: 'featured', viewport: 'mobile' },
  { context: 'companionItem' },
] as const;

// ---------------------------------------------------------------------------
// 11. Core PC item — the unit of content
// ---------------------------------------------------------------------------

/**
 * The unit of content that flows through the split model. Every field
 * here is explicit — no dumping ground for metadata, no side channels.
 *
 * Lifecycle-adjacent dates (`scheduledStart`, `publishedAt`, `expiresAt`,
 * `archivedAt`, `suppressedAt`) are kept as distinct fields so the
 * lifecycle state classifier can tell them apart without ambiguity.
 */
export interface PeopleCultureItem {
  id: string;
  family: PeopleCultureContentFamily;
  lifecycleState: PeopleCultureLifecycleState;

  title: string;
  body: string;
  cta?: HomepageCtaLink;

  approvalTrigger: PeopleCultureApprovalTrigger;
  audience: PeopleCultureAudienceScope;
  homepage: PeopleCultureHomepageGovernance;
  mediaSource: PeopleCultureMediaSource;

  /** Optional person reference for person-centric families (announcements, milestones). */
  personRef?: PersonReference;

  submittedBy?: PersonReference;
  /** ISO timestamp. */
  submittedAt?: string;
  approvedBy?: PersonReference;
  /** ISO timestamp. */
  approvedAt?: string;

  /** Scheduled publish window. */
  scheduledStart?: string;
  scheduledEnd?: string;
  /** Actual publish moment. Required for `live`/`expiringSoon`/`expired`. */
  publishedAt?: string;
  /** Effective end-of-life for the public surface. */
  expiresAt?: string;

  /** Set when the item is explicitly archived (retained history). */
  archivedAt?: string;
  /** Set when the item is explicitly suppressed (withheld without deletion). */
  suppressedAt?: string;

  /** Optional linkage to the milestone candidate this item originated from. */
  milestoneCandidateId?: string;
  /** Optional linkage to the non-HR intake submission this item originated from. */
  intakeSubmissionId?: string;

  /** Optional freeform tags — not an audience escape hatch. */
  tags?: string[];
}

// ---------------------------------------------------------------------------
// 12. Public webpart config + output
// ---------------------------------------------------------------------------

/**
 * Config consumed by the People & Culture *public* webpart. The public
 * webpart receives items that have already been derived/normalized; its
 * job is to present the homepage hierarchy and apply viewer-audience
 * scoping.
 */
export interface PeopleCulturePublicConfig {
  heading?: string;
  items?: PeopleCultureItem[];
  maxFeatured?: number;
  maxSupporting?: number;
}

export interface PeopleCulturePublicOutput {
  heading: string;
  featured: PeopleCultureItem[];
  supporting: PeopleCultureItem[];
  isEmpty: boolean;
}

export const DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG = {
  heading: 'People and Culture',
  maxFeatured: 2,
  maxSupporting: 6,
} as const;

// ---------------------------------------------------------------------------
// 13. Companion webpart config + output
// ---------------------------------------------------------------------------

/**
 * Config consumed by the PC HR operating companion webpart. The companion
 * sees the full item set, plus milestone candidates and non-HR intake
 * submissions. The current user's role is required so capability gates
 * can be enforced at the surface layer.
 */
export interface PeopleCultureCompanionConfig {
  heading?: string;
  items?: PeopleCultureItem[];
  milestoneCandidates?: PeopleCultureMilestoneCandidate[];
  intakeSubmissions?: PeopleCultureIntakeSubmission[];
  currentUserRole?: PeopleCultureRole;
}

export interface PeopleCultureLifecycleCounts {
  draft: number;
  needsApproval: number;
  scheduled: number;
  live: number;
  expiringSoon: number;
  expired: number;
  archived: number;
  suppressed: number;
}

export type PeopleCultureLifecycleCountsByFamily = Record<
  PeopleCultureContentFamily,
  PeopleCultureLifecycleCounts
>;

/**
 * Aggregate queue-health label for the companion overview. Derived from
 * pending-approval, expiring-soon, and homepage-conflict counts against
 * configurable thresholds.
 */
export type PeopleCultureQueueHealth = 'healthy' | 'watch' | 'attention';

/**
 * Overview data for the companion landing page. Lightweight operational
 * dashboard — not a heavy analytics board.
 */
export interface PeopleCultureCompanionOverview {
  lifecycleCountsByFamily: PeopleCultureLifecycleCountsByFamily;
  pendingApprovals: PeopleCultureItem[];
  upcomingScheduled: PeopleCultureItem[];
  expiringSoonItems: PeopleCultureItem[];
  homepageConflicts: PeopleCultureItem[];
  pendingMilestoneCandidates: PeopleCultureMilestoneCandidate[];
  pendingIntakeSubmissions: PeopleCultureIntakeSubmission[];
  /**
   * Aggregate queue health. `healthy` when all signals are low, `watch`
   * when at least one signal is elevated, `attention` when any signal
   * crosses the attention threshold.
   */
  queueHealth: PeopleCultureQueueHealth;
}
