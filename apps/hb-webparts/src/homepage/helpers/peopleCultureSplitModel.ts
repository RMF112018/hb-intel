/**
 * People & Culture split model helpers — Phase-14 pc/ Prompt-01.
 *
 * Pure derivation and normalization helpers that operate on the contracts
 * in `../webparts/peopleCultureSplitContracts.ts`. These helpers are the
 * shared behavior shelf that both the PC *public* webpart and the PC HR
 * *operating companion* webpart consume so the two surfaces stay in sync
 * on:
 *
 *   - lifecycle state derivation
 *   - approval-trigger classification (hybrid governance path)
 *   - audience visibility
 *   - homepage governance hierarchy
 *   - media-source resolution (profile-photo-first with HR override)
 *   - role capability gates
 *   - companion overview aggregation
 *
 * No DOM, no React, no network. Everything here is deterministic and
 * testable in isolation.
 */

import type { HomepageMediaSlot } from '../models/contentModels.js';
import type {
  PeopleCultureApprovalTrigger,
  PeopleCultureAudienceScope,
  PeopleCultureCompanionConfig,
  PeopleCultureCompanionOverview,
  PeopleCultureHomepageConflictReason,
  PeopleCultureHomepageGovernance,
  PeopleCultureItem,
  PeopleCultureLifecycleCounts,
  PeopleCultureLifecycleCountsByFamily,
  PeopleCultureLifecycleState,
  PeopleCultureMediaSource,
  PeopleCultureMilestoneCandidate,
  PeopleCulturePublicConfig,
  PeopleCulturePublicOutput,
  PeopleCultureQueueHealth,
  PeopleCultureResolvedMedia,
  PeopleCultureRole,
  PeopleCultureRoleCapabilities,
  PeopleCultureViewerAudience,
} from '../webparts/peopleCultureSplitContracts.js';
import {
  DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG,
  PEOPLE_CULTURE_CONTENT_FAMILIES,
  PEOPLE_CULTURE_ROLE_CAPABILITIES,
} from '../webparts/peopleCultureSplitContracts.js';

const MS_PER_DAY = 86_400_000;

/** Default window for the `expiringSoon` classifier. */
export const DEFAULT_EXPIRING_SOON_WINDOW_DAYS = 7;

function parseTimestamp(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : undefined;
}

// ---------------------------------------------------------------------------
// Lifecycle state derivation
// ---------------------------------------------------------------------------

/**
 * Options for lifecycle classification.
 */
export interface DeriveLifecycleStateOptions {
  /** Window (in days) before `expiresAt` during which a live item becomes `expiringSoon`. */
  expiringSoonWindowDays?: number;
}

/**
 * Input for `deriveLifecycleState`. A caller can provide a pre-existing
 * PeopleCultureItem (the classifier will ignore its own `lifecycleState`)
 * or just the lifecycle-relevant fields.
 */
export type LifecycleDerivationInput = Pick<
  PeopleCultureItem,
  | 'submittedAt'
  | 'approvedAt'
  | 'scheduledStart'
  | 'scheduledEnd'
  | 'publishedAt'
  | 'expiresAt'
  | 'archivedAt'
  | 'suppressedAt'
>;

/**
 * Derive the current lifecycle state from the item's timestamps.
 *
 * Rules, in priority order (highest priority first):
 *
 *   1. `suppressedAt` set  → `suppressed`   (intentionally withheld)
 *   2. `archivedAt`  set   → `archived`     (intentional retention)
 *   3. `expiresAt`   set AND `now > expiresAt` → `expired`
 *   4. `publishedAt` set AND within `expiringSoonWindowDays` of `expiresAt` → `expiringSoon`
 *   5. `publishedAt` set AND `now >= publishedAt`        → `live`
 *   6. `scheduledStart` set AND `now < scheduledStart`   → `scheduled`
 *   7. `approvedAt`  set (but not yet published/scheduled for the future) → `scheduled`
 *   8. `submittedAt` set (pending HR workflow)           → `needsApproval`
 *   9. otherwise → `draft`
 *
 * `archived` and `suppressed` are deliberately kept separate from
 * `expired`; archival is intentional retention, suppression is
 * intentional withholding, and expiry is time-based aging.
 */
export function deriveLifecycleState(
  input: LifecycleDerivationInput,
  now: Date = new Date(),
  options: DeriveLifecycleStateOptions = {},
): PeopleCultureLifecycleState {
  const nowMs = now.getTime();
  const expiringSoonWindowDays =
    options.expiringSoonWindowDays ?? DEFAULT_EXPIRING_SOON_WINDOW_DAYS;

  if (input.suppressedAt) return 'suppressed';
  if (input.archivedAt) return 'archived';

  const expiresMs = parseTimestamp(input.expiresAt);
  if (expiresMs !== undefined && nowMs > expiresMs) return 'expired';

  const publishedMs = parseTimestamp(input.publishedAt);
  if (publishedMs !== undefined && nowMs >= publishedMs) {
    if (expiresMs !== undefined) {
      const windowMs = expiringSoonWindowDays * MS_PER_DAY;
      if (expiresMs - nowMs <= windowMs) return 'expiringSoon';
    }
    return 'live';
  }

  const scheduledStartMs = parseTimestamp(input.scheduledStart);
  if (scheduledStartMs !== undefined && nowMs < scheduledStartMs) return 'scheduled';

  if (input.approvedAt) return 'scheduled';
  if (input.submittedAt) return 'needsApproval';

  return 'draft';
}

// ---------------------------------------------------------------------------
// Approval trigger classification
// ---------------------------------------------------------------------------

export interface DeriveApprovalTriggerInput {
  homepage: PeopleCultureHomepageGovernance;
  audience: PeopleCultureAudienceScope;
}

export interface DeriveApprovalTriggerOptions {
  /**
   * When true, audiences with no targeting tags (i.e. `companyWide`) are
   * classified as `enterpriseWide`. This is the default — anything that
   * goes to every employee is high-visibility by definition. Targeted
   * audience scope alone does NOT trigger enterprise governance.
   */
  treatCompanyWideAsEnterprise?: boolean;
}

/**
 * Decide which approval path an item must travel. Pinning to the
 * homepage always forces the hybrid governance path regardless of
 * audience scope. Company-wide scope also forces it. Targeted audience
 * alone does not.
 */
export function deriveApprovalTrigger(
  input: DeriveApprovalTriggerInput,
  options: DeriveApprovalTriggerOptions = {},
): PeopleCultureApprovalTrigger {
  const treatCompanyWideAsEnterprise = options.treatCompanyWideAsEnterprise ?? true;

  if (input.homepage.isPinned) return 'homepagePinned';
  if (treatCompanyWideAsEnterprise && input.audience.kind === 'companyWide') {
    return 'enterpriseWide';
  }
  return 'standard';
}

// ---------------------------------------------------------------------------
// Audience matching
// ---------------------------------------------------------------------------

/**
 * Does `scope` include the viewer? Company-wide scopes always include
 * the viewer. Targeted scopes include the viewer only if at least one
 * of the item's audience tags matches one of the viewer's own tags on
 * the same dimension AND value. Targeted scopes with no tags are
 * treated as not-visible (empty targeted audience is invalid upstream,
 * but we fail closed here to avoid accidental disclosure).
 */
export function isAudienceVisibleToViewer(
  scope: PeopleCultureAudienceScope,
  viewer: PeopleCultureViewerAudience | undefined,
): boolean {
  if (scope.kind === 'companyWide') return true;

  if (!viewer || viewer.tags.length === 0) return false;
  if (scope.tags.length === 0) return false;

  return scope.tags.some((scopeTag) =>
    viewer.tags.some(
      (viewerTag) =>
        viewerTag.dimension === scopeTag.dimension &&
        viewerTag.value === scopeTag.value,
    ),
  );
}

// ---------------------------------------------------------------------------
// Media-source resolution
// ---------------------------------------------------------------------------

export type ProfilePhotoResolver = (
  personId: string,
) => { src: string; alt: string } | undefined;

/**
 * Resolve a media source into a concrete renderable slot, tagged with
 * the original source kind so the companion can show which media
 * channel is active.
 *
 * When the source is `profilePhoto` and no resolver is available (or
 * the resolver returns undefined), this function returns `undefined`.
 * Callers that want a fallback slot should provide a fallback at the
 * consumer layer rather than having it baked in here.
 */
export function resolveMediaSource(
  source: PeopleCultureMediaSource,
  profilePhotoResolver?: ProfilePhotoResolver,
): PeopleCultureResolvedMedia | undefined {
  switch (source.kind) {
    case 'profilePhoto': {
      const resolved = profilePhotoResolver?.(source.personId);
      if (!resolved) return undefined;
      const slot: HomepageMediaSlot = { src: resolved.src, alt: resolved.alt };
      return { slot, sourceKind: 'profilePhoto' };
    }
    case 'hrUpload':
    case 'campaignArtwork':
    case 'eventPhotography': {
      const slot: HomepageMediaSlot = { src: source.src, alt: source.alt };
      return { slot, sourceKind: source.kind };
    }
    case 'none':
      return undefined;
    default: {
      // Exhaustiveness check
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Role capability gates
// ---------------------------------------------------------------------------

export function hasPeopleCultureCapability(
  role: PeopleCultureRole | undefined,
  capability: keyof PeopleCultureRoleCapabilities,
): boolean {
  if (!role) return false;
  return PEOPLE_CULTURE_ROLE_CAPABILITIES[role][capability];
}

// ---------------------------------------------------------------------------
// Public webpart normalizer
// ---------------------------------------------------------------------------

export interface NormalizePeopleCulturePublicOptions {
  viewer?: PeopleCultureViewerAudience;
  now?: Date;
  expiringSoonWindowDays?: number;
}

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

/**
 * Normalize the raw public config into the split-aware public output.
 *
 * Items are:
 *   1. Validated (id/title/body present, family + lifecycle + audience set)
 *   2. Filtered to live states only (`live`, `expiringSoon`)
 *   3. Filtered to items the viewer can see
 *   4. Partitioned into `featured` vs `supporting` by their
 *      homepage.tier (items with `excluded` tier are dropped)
 *   5. Sorted within each tier by (pinned first, explicit order, fallback publishedAt desc)
 *   6. Truncated to `maxFeatured` / `maxSupporting`
 */
export function normalizePeopleCulturePublicConfig(
  input: Partial<PeopleCulturePublicConfig> | undefined,
  options: NormalizePeopleCulturePublicOptions = {},
): PeopleCulturePublicOutput {
  const heading = hasText(input?.heading)
    ? input.heading.trim()
    : DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.heading;

  const maxFeatured =
    Number.isFinite(input?.maxFeatured) && (input?.maxFeatured ?? 0) > 0
      ? (input?.maxFeatured as number)
      : DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxFeatured;
  const maxSupporting =
    Number.isFinite(input?.maxSupporting) && (input?.maxSupporting ?? 0) > 0
      ? (input?.maxSupporting as number)
      : DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxSupporting;

  const items = input?.items ?? [];

  const publiclyVisible = items
    .filter((item) => hasText(item.id) && hasText(item.title) && hasText(item.body))
    .filter((item) => item.lifecycleState === 'live' || item.lifecycleState === 'expiringSoon')
    .filter((item) => isAudienceVisibleToViewer(item.audience, options.viewer))
    .filter((item) => item.homepage.tier !== 'excluded');

  const sorted = [...publiclyVisible].sort(compareByHomepagePriority);

  const featured = sorted.filter((i) => i.homepage.tier === 'featured').slice(0, maxFeatured);
  const supporting = sorted.filter((i) => i.homepage.tier === 'supporting').slice(0, maxSupporting);

  return {
    heading,
    featured,
    supporting,
    isEmpty: featured.length === 0 && supporting.length === 0,
  };
}

function compareByHomepagePriority(a: PeopleCultureItem, b: PeopleCultureItem): number {
  const aPinned = a.homepage.isPinned ? 0 : 1;
  const bPinned = b.homepage.isPinned ? 0 : 1;
  if (aPinned !== bPinned) return aPinned - bPinned;

  const aOrder = Number.isFinite(a.homepage.order)
    ? (a.homepage.order as number)
    : Number.MAX_SAFE_INTEGER;
  const bOrder = Number.isFinite(b.homepage.order)
    ? (b.homepage.order as number)
    : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;

  const aPub = parseTimestamp(a.publishedAt) ?? 0;
  const bPub = parseTimestamp(b.publishedAt) ?? 0;
  if (aPub !== bPub) return bPub - aPub;

  return a.title.localeCompare(b.title);
}

// ---------------------------------------------------------------------------
// Lifecycle counting & companion overview
// ---------------------------------------------------------------------------

function emptyLifecycleCounts(): PeopleCultureLifecycleCounts {
  return {
    draft: 0,
    needsApproval: 0,
    scheduled: 0,
    live: 0,
    expiringSoon: 0,
    expired: 0,
    archived: 0,
    suppressed: 0,
  };
}

export function countLifecycleStatesByFamily(
  items: readonly PeopleCultureItem[],
): PeopleCultureLifecycleCountsByFamily {
  const byFamily: PeopleCultureLifecycleCountsByFamily = {
    announcement: emptyLifecycleCounts(),
    celebrationMilestone: emptyLifecycleCounts(),
    cultureProgramEvent: emptyLifecycleCounts(),
  };

  for (const item of items) {
    const bucket = byFamily[item.family];
    if (!bucket) continue;
    bucket[item.lifecycleState] += 1;
  }

  return byFamily;
}

export interface QueueHealthThresholds {
  /** Pending approvals that move health to `watch`. Default: 3. */
  pendingApprovalsWatch?: number;
  /** Pending approvals that move health to `attention`. Default: 6. */
  pendingApprovalsAttention?: number;
  /** Expiring-soon count that moves health to `watch`. Default: 2. */
  expiringSoonWatch?: number;
  /** Expiring-soon count that moves health to `attention`. Default: 5. */
  expiringSoonAttention?: number;
  /** Homepage conflict count that moves health to `watch`. Default: 1. */
  homepageConflictsWatch?: number;
  /** Homepage conflict count that moves health to `attention`. Default: 3. */
  homepageConflictsAttention?: number;
}

export interface BuildCompanionOverviewOptions {
  now?: Date;
  expiringSoonWindowDays?: number;
  upcomingScheduledWindowDays?: number;
  queueHealthThresholds?: QueueHealthThresholds;
}

/**
 * Build the lightweight companion overview dashboard payload. This is
 * derived data — it does not mutate the inputs.
 *
 * `upcomingScheduled` returns items whose `scheduledStart` is within
 * `upcomingScheduledWindowDays` (default 14) of `now`.
 *
 * `homepageConflicts` returns items whose homepage governance has a
 * `conflictReason` set.
 */
export function buildCompanionOverview(
  input: Partial<PeopleCultureCompanionConfig> | undefined,
  options: BuildCompanionOverviewOptions = {},
): PeopleCultureCompanionOverview {
  const items: readonly PeopleCultureItem[] = input?.items ?? [];
  const candidates: readonly PeopleCultureMilestoneCandidate[] =
    input?.milestoneCandidates ?? [];
  const submissions = input?.intakeSubmissions ?? [];

  const now = options.now ?? new Date();
  const nowMs = now.getTime();
  const upcomingWindowMs = (options.upcomingScheduledWindowDays ?? 14) * MS_PER_DAY;

  const pendingApprovals = items.filter((i) => i.lifecycleState === 'needsApproval');

  const upcomingScheduled = items.filter((i) => {
    if (i.lifecycleState !== 'scheduled') return false;
    const startMs = parseTimestamp(i.scheduledStart);
    if (startMs === undefined) return false;
    return startMs >= nowMs && startMs - nowMs <= upcomingWindowMs;
  });

  const expiringSoonItems = items.filter((i) => i.lifecycleState === 'expiringSoon');

  const homepageConflicts = items.filter((i) => Boolean(i.homepage.conflictReason));

  const pendingMilestoneCandidates = candidates.filter(
    (c) => c.reviewState === 'pendingReview',
  );

  const pendingIntakeSubmissions = submissions.filter(
    (s) => s.reviewState === 'awaitingHrReview',
  );

  const queueHealth = deriveQueueHealth({
    pendingApprovalsCount: pendingApprovals.length,
    expiringSoonCount: expiringSoonItems.length,
    homepageConflictsCount: homepageConflicts.length,
    thresholds: options.queueHealthThresholds,
  });

  return {
    lifecycleCountsByFamily: countLifecycleStatesByFamily(items),
    pendingApprovals,
    upcomingScheduled,
    expiringSoonItems,
    homepageConflicts,
    pendingMilestoneCandidates,
    pendingIntakeSubmissions,
    queueHealth,
  };
}

// ---------------------------------------------------------------------------
// Queue health derivation
// ---------------------------------------------------------------------------

const DEFAULT_QUEUE_HEALTH_THRESHOLDS: Required<QueueHealthThresholds> = {
  pendingApprovalsWatch: 3,
  pendingApprovalsAttention: 6,
  expiringSoonWatch: 2,
  expiringSoonAttention: 5,
  homepageConflictsWatch: 1,
  homepageConflictsAttention: 3,
};

export interface DeriveQueueHealthInput {
  pendingApprovalsCount: number;
  expiringSoonCount: number;
  homepageConflictsCount: number;
  thresholds?: QueueHealthThresholds;
}

/**
 * Derive the companion queue-health label from signal counts.
 * Any signal at or above its `attention` threshold → `attention`.
 * Otherwise, any signal at or above its `watch` threshold → `watch`.
 * Otherwise → `healthy`.
 */
export function deriveQueueHealth(
  input: DeriveQueueHealthInput,
): PeopleCultureQueueHealth {
  const t = { ...DEFAULT_QUEUE_HEALTH_THRESHOLDS, ...(input.thresholds ?? {}) };
  if (
    input.pendingApprovalsCount >= t.pendingApprovalsAttention ||
    input.expiringSoonCount >= t.expiringSoonAttention ||
    input.homepageConflictsCount >= t.homepageConflictsAttention
  ) {
    return 'attention';
  }
  if (
    input.pendingApprovalsCount >= t.pendingApprovalsWatch ||
    input.expiringSoonCount >= t.expiringSoonWatch ||
    input.homepageConflictsCount >= t.homepageConflictsWatch
  ) {
    return 'watch';
  }
  return 'healthy';
}

// ---------------------------------------------------------------------------
// Homepage conflict detection
// ---------------------------------------------------------------------------

export interface DetectHomepageConflictsOptions {
  maxFeatured?: number;
  maxSupporting?: number;
  maxPinned?: number;
}

/**
 * Detect homepage placement conflicts across an item set. Returns a map
 * of itemId → conflict reason. Callers can project this onto their
 * items to set `homepage.conflictReason`.
 *
 * Rules:
 *   - More than `maxPinned` items pinned → excess → `pinnedOverflow`
 *   - More than `maxFeatured` items in the featured tier → excess →
 *     `featuredOverflow`
 *   - More than `maxSupporting` items in the supporting tier → excess →
 *     `supportingOverflow`
 *   - An item with `lifecycleState === 'expiringSoon'` that is also
 *     pinned → `expiringWhilePinned` (surface-level warning)
 *
 * Overflow is decided by (pinned first, order asc, publishedAt desc)
 * — matching `compareByHomepagePriority`.
 */
export function detectHomepageConflicts(
  items: readonly PeopleCultureItem[],
  options: DetectHomepageConflictsOptions = {},
): Map<string, PeopleCultureHomepageConflictReason> {
  const maxFeatured = options.maxFeatured ?? DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxFeatured;
  const maxSupporting =
    options.maxSupporting ?? DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxSupporting;
  const maxPinned = options.maxPinned ?? maxFeatured;

  const result = new Map<string, PeopleCultureHomepageConflictReason>();

  const liveish = items.filter(
    (i) => i.lifecycleState === 'live' || i.lifecycleState === 'expiringSoon',
  );
  const sorted = [...liveish].sort(compareByHomepagePriority);

  const pinned = sorted.filter((i) => i.homepage.isPinned);
  const featured = sorted.filter((i) => i.homepage.tier === 'featured');
  const supporting = sorted.filter((i) => i.homepage.tier === 'supporting');

  for (const overflowItem of pinned.slice(maxPinned)) {
    result.set(overflowItem.id, 'pinnedOverflow');
  }
  for (const overflowItem of featured.slice(maxFeatured)) {
    if (!result.has(overflowItem.id)) result.set(overflowItem.id, 'featuredOverflow');
  }
  for (const overflowItem of supporting.slice(maxSupporting)) {
    if (!result.has(overflowItem.id)) result.set(overflowItem.id, 'supportingOverflow');
  }
  for (const item of liveish) {
    if (
      item.lifecycleState === 'expiringSoon' &&
      item.homepage.isPinned &&
      !result.has(item.id)
    ) {
      result.set(item.id, 'expiringWhilePinned');
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Re-exports (convenience for consumers)
// ---------------------------------------------------------------------------

export { PEOPLE_CULTURE_CONTENT_FAMILIES, PEOPLE_CULTURE_ROLE_CAPABILITIES };
