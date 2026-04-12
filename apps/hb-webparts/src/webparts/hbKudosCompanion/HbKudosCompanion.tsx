/**
 * HbKudosCompanion — HR Approval Companion webpart.
 *
 * Split-runtime adjacency (Phase-21 Wave 4 containment contract):
 *   - Sibling runtime: `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`.
 *   - Ownership map: `../hbKudos/kudosRuntimeContract.ts` (authoritative).
 *   - Shared local product layer: `../hbKudos/kudosSurfaceFamily.ts`
 *     (tokens, icons, variants, style modules). Do NOT reach across
 *     runtimes; compose from the family index only.
 *   - Webpart id: `HB_KUDOS_COMPANION_WEBPART_ID` in
 *     `../hbKudos/kudosRuntimeContract.ts`; mirrored in
 *     `HbKudosCompanionWebPart.manifest.json` and `mount.tsx`.
 *   - This runtime OWNS the governance workspace (queue filter
 *     reducer, patch planning, audit dispatch, bulk approve,
 *     dialog workflow, role-aware detail panel) and MUST NOT own
 *     public-facing masthead / featured / archive / reader /
 *     composer / celebrate — those are the public runtime's
 *     responsibilities.
 *
 * Premium homepage-hosted governance workspace for HB Kudos
 * moderation. HR / admin only — renders a filterable queue of kudos
 * entries across the full `KudosWorkflowStatus` union and dispatches
 * typed governance actions through `submitKudosGovernanceAction` with
 * matching writes to `Kudos Audit Events`.
 *
 * Architecture:
 *   - Data: `usePeopleCultureData` with post-mutation cache
 *     invalidation via `invalidatePeopleCultureCache`.
 *   - Filter: reducer-light local state over `KudosQueueFilterState`
 *     (filter buttons + ownership + search + toggle chips + bulk
 *     selection).
 *   - Write: `submitKudosGovernanceAction` — one PATCH + one audit
 *     event per action. Writer-level authorization verifies role
 *     before any network call.
 *   - Role: `resolveKudosRole` queries SharePoint group membership
 *     against canonical Entra security groups (HB Kudos Admins,
 *     HB Kudos Reviewers). Not configurable per webpart instance.
 *   - Dialog: all governance inputs use `KudosGovernanceInputDialog`
 *     (no window.prompt). Actions dispatched via two-phase state
 *     pattern (open dialog → confirm → dispatch).
 *   - Detail panel: `HbcKudosComposerFlyout` shell + shared
 *     `KudosDetailPanelContent` with full audit timeline for
 *     governance roles.
 *
 * Shared-primitive discipline: UI composed from `@hbc/ui-kit/homepage`
 * primitives + shared governance primitives in
 * `KudosGovernancePrimitives.tsx` (tokenized colors, tab buttons,
 * toggle chips, toolbar labels, error alerts, input dialog, action
 * buttons, audit timeline). Queue rows remain local — too coupled to
 * companion-specific data shapes for premature promotion.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 */
import * as React from 'react';
import { clsx } from 'clsx';
import {
  HbcAvatarStack,
  HbcCard,
  HbcEmptyState,
  HbcKudosComposerFlyout,
  HbcSpinner,
  HbcStatusBadge,
} from '@hbc/ui-kit/homepage';
import { usePeopleCultureData } from '../../homepage/data/usePeopleCultureData.js';
import { submitKudosGovernanceAction, fetchKudosAuditTimeline, type KudosAuditTimelineEntry } from '../../homepage/data/kudosGovernanceWriter.js';
import { getSiteUrl, getKudosListHostUrl, resolveCurrentUserId } from '../../homepage/data/spContext.js';
import { KudosDetailPanelContent } from '../../homepage/shared/KudosDetailPanelContent.js';
import {
  KUDOS_ROLE_LABELS,
  deriveKudosCapabilities,
  type KudosCapabilities,
  type KudosRole,
} from '../../homepage/helpers/kudosCapabilities.js';
import { resolveKudosRoleStatus, type KudosRoleResolutionStatus } from '../../homepage/helpers/kudosRoleResolver.js';
import {
  KudosActionButton,
  KudosGovernanceTabButton,
  KudosGovernanceToggleChip,
  KudosGovernanceToolbarLabel,
  KudosGovernanceErrorAlert,
  KudosGovernanceInputDialog,
  KudosGovernanceDateTimeDialog,
  KudosGovernanceAssignmentDialog,
  kudosCSSVars,
} from '../../homepage/shared/KudosGovernancePrimitives.js';
import {
  deriveKudosOverdueStatus,
  findKudosReminderTargets,
  DEFAULT_KUDOS_OVERDUE_THRESHOLDS,
  type KudosOverdueStatus,
  type KudosOverdueThresholds,
} from '../../homepage/helpers/kudosNotificationBuilder.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import { Trophy } from '../hbKudos/kudosIcons.js';
import { KudosFlyoutBody, kudosFlyoutStyles } from '../hbKudos/KudosFlyoutBody.js';
import companionStyles from './companion.module.css';
import {
  buildKudosRecipientSummary,
  buildWorkflowChipDescriptor,
  deriveAgingBucket,
  DEFAULT_KUDOS_QUEUE_FILTER_STATE,
  needsAdminReview,
  type KudosAgingBucket,
  type KudosEntry,
  type KudosPatch,
  type KudosQueueFilterState,
  type KudosWorkflowStatus,
} from '../../homepage/webparts/kudosContracts.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HbKudosCompanionProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  /** Dev-only hook so tests can pin "now" for aging derivation. */
  nowIso?: string;
}

// ---------------------------------------------------------------------------
// Tab model
// ---------------------------------------------------------------------------

interface CompanionTab {
  id: string;
  label: string;
  /** Statuses this tab scopes the queue to. */
  statuses: readonly KudosWorkflowStatus[];
  /** Optional additional predicate (e.g. admin review flag). */
  extraPredicate?: (entry: KudosEntry) => boolean;
  /** Queue ordering: oldest-first for review queues, newest-first for resolved. */
  sortDirection: 'oldest' | 'newest';
}

/**
 * Decision-Lock-Appendix queue model:
 * Pending → Revision Requested → Flagged for Admin Review →
 * Approved → Rejected → Removed / Unpublished
 */
const COMPANION_TABS: readonly CompanionTab[] = [
  {
    id: 'pending',
    label: 'Pending',
    statuses: ['pending'],
    sortDirection: 'oldest',
  },
  {
    id: 'revisionRequested',
    label: 'Revision requested',
    statuses: ['revisionRequested'],
    sortDirection: 'oldest',
  },
  {
    id: 'flagged',
    label: 'Flagged for admin',
    statuses: ['pending', 'revisionRequested', 'approved', 'approvedScheduled'],
    extraPredicate: (entry) => needsAdminReview(entry),
    sortDirection: 'newest',
  },
  {
    id: 'approved',
    label: 'Approved',
    statuses: ['approved', 'approvedScheduled'],
    sortDirection: 'newest',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    statuses: ['rejected', 'withdrawn'],
    sortDirection: 'newest',
  },
  {
    id: 'removed',
    label: 'Removed / Unpublished',
    statuses: ['removedUnpublished'],
    sortDirection: 'newest',
  },
];

// ---------------------------------------------------------------------------
// Local filter reducer
// ---------------------------------------------------------------------------

type FilterAction =
  | { type: 'setTab'; tabId: string }
  | { type: 'setSearch'; value: string }
  | { type: 'setOwnership'; ownership: KudosQueueFilterState['ownership'] }
  | { type: 'toggleAdminReviewOnly' }
  | { type: 'toggleScheduledOnly' }
  | { type: 'toggleAging'; bucket: KudosAgingBucket };

interface CompanionFilterState extends KudosQueueFilterState {
  tabId: string;
}

const INITIAL_FILTER_STATE: CompanionFilterState = {
  ...DEFAULT_KUDOS_QUEUE_FILTER_STATE,
  tabId: COMPANION_TABS[0]!.id,
};

function filterReducer(state: CompanionFilterState, action: FilterAction): CompanionFilterState {
  switch (action.type) {
    case 'setTab': {
      const tab = COMPANION_TABS.find((t) => t.id === action.tabId);
      if (!tab) return state;
      return {
        ...state,
        tabId: action.tabId,
        statuses: tab.statuses,
        adminReviewOnly: tab.id === 'flagged' ? true : false,
      };
    }
    case 'setSearch':
      return { ...state, searchText: action.value };
    case 'setOwnership':
      return { ...state, ownership: action.ownership };
    case 'toggleAdminReviewOnly':
      return { ...state, adminReviewOnly: !state.adminReviewOnly };
    case 'toggleScheduledOnly':
      return { ...state, scheduledOnly: !state.scheduledOnly };
    case 'toggleAging': {
      const has = state.aging.includes(action.bucket);
      return {
        ...state,
        aging: has
          ? state.aging.filter((b) => b !== action.bucket)
          : [...state.aging, action.bucket],
      };
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Queue filtering (pure)
// ---------------------------------------------------------------------------

export function applyCompanionFilter(
  entries: KudosEntry[],
  state: CompanionFilterState,
  nowIso: string,
  currentUserId: number | undefined,
): KudosEntry[] {
  const tab = COMPANION_TABS.find((t) => t.id === state.tabId);
  if (!tab) return [];
  const q = state.searchText?.trim().toLowerCase() ?? '';
  const filtered = entries.filter((entry) => {
    // Workflow status gate — fall back to the narrow status for rows
    // that predate the workflow column.
    if (entry.workflowStatus) {
      if (!tab.statuses.includes(entry.workflowStatus)) return false;
    } else if (tab.id === 'pending') {
      if (entry.status !== 'pending') return false;
    } else if (tab.id === 'approved') {
      if (entry.status !== 'approved') return false;
    } else if (tab.id === 'rejected') {
      if (entry.status !== 'rejected') return false;
    } else {
      return false;
    }
    if (tab.extraPredicate && !tab.extraPredicate(entry)) return false;
    if (state.adminReviewOnly && !needsAdminReview(entry)) return false;
    if (state.scheduledOnly && entry.isScheduled !== true) return false;
    // Ownership filter using real claim/assignment data.
    const ownerId = entry.assignedOwnerId ?? entry.claimOwnerId;
    if (state.ownership === 'unassigned') {
      if (ownerId != null) return false;
    }
    if (state.ownership === 'mine' && currentUserId) {
      if (ownerId !== currentUserId) return false;
    }
    if (state.ownership === 'others' && currentUserId) {
      if (ownerId == null || ownerId === currentUserId) return false;
    }
    if (state.aging.length > 0) {
      const bucket = deriveAgingBucket(entry.submittedDate, nowIso);
      if (!state.aging.includes(bucket)) return false;
    }
    if (q) {
      const haystack = [
        entry.headline,
        entry.excerpt,
        entry.submittedBy.displayName,
        ...entry.recipients.map((r) => r.name),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Sort per decision-lock: oldest-first for review queues, newest-first otherwise.
  const direction = tab.sortDirection === 'oldest' ? 1 : -1;
  return filtered.sort((a, b) => {
    const aTs = Date.parse(a.submittedDate) || 0;
    const bTs = Date.parse(b.submittedDate) || 0;
    return (aTs - bTs) * direction;
  });
}

// ---------------------------------------------------------------------------
// Queue row (local composition)
// ---------------------------------------------------------------------------

interface QueueRowProps {
  entry: KudosEntry;
  nowIso: string;
  selected: boolean;
  selectable: boolean;
  overdueStatus: KudosOverdueStatus;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (entry: KudosEntry) => void;
}

const AGING_LABEL: Record<KudosAgingBucket, string> = {
  freshToday: 'Today',
  within3Days: '≤ 3 days',
  within7Days: '≤ 7 days',
  within14Days: '≤ 14 days',
  stale: 'Stale',
};

function QueueRow({
  entry,
  nowIso,
  selected,
  selectable,
  overdueStatus,
  onToggleSelect,
  onOpenDetail,
}: QueueRowProps): React.JSX.Element {
  const summary = buildKudosRecipientSummary(entry.recipients);
  const workflowChip = entry.workflowStatus
    ? buildWorkflowChipDescriptor(entry.workflowStatus)
    : undefined;
  const aging = deriveAgingBucket(entry.submittedDate, nowIso);
  const flagged = needsAdminReview(entry);

  return (
    <HbcCard weight="standard">
      <div
        data-hbc-testid="hb-kudos-queue-row"
        className={clsx(
          companionStyles.queueRow,
          selectable && companionStyles.queueRowSelectable,
        )}
      >
        {selectable ? (
          <label
            className={companionStyles.queueRowSelect}
            aria-label={`Select ${entry.headline}`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(entry.id)}
              className={companionStyles.queueRowCheckbox}
            />
          </label>
        ) : null}

        <button
          type="button"
          onClick={() => onOpenDetail(entry)}
          className={companionStyles.queueRowButton}
        >
          {/* Row body — state/scan rail on top, headline dominant,
              excerpt secondary. Kept visually primary for scan order. */}
          <div className={companionStyles.queueRowBody}>
            <div className={companionStyles.queueRowChipRow}>
              {workflowChip ? (
                <HbcStatusBadge
                  variant={
                    workflowChip.tone === 'success'
                      ? 'success'
                      : workflowChip.tone === 'warning'
                        ? 'warning'
                        : workflowChip.tone === 'danger'
                          ? 'critical'
                          : 'info'
                  }
                  size="small"
                  label={workflowChip.label}
                />
              ) : null}
              <span className={companionStyles.queueRowAgingChip}>
                {AGING_LABEL[aging]}
              </span>
              {flagged ? (
                <HbcStatusBadge variant="warning" size="small" label="Flagged for admin" />
              ) : null}
              {overdueStatus === 'overdue' ? (
                <HbcStatusBadge variant="critical" size="small" label="Overdue" />
              ) : overdueStatus === 'approaching' ? (
                <HbcStatusBadge variant="warning" size="small" label="Approaching due" />
              ) : null}
            </div>
            <h4 className={companionStyles.queueRowHeadline}>
              {entry.headline}
            </h4>
            <p className={companionStyles.queueRowExcerpt}>
              {entry.excerpt}
            </p>
          </div>
          {/* Row footer — submission context is a first-class scan
              target and must render regardless of recipient
              presence. The footer zone always exists; only the
              avatar stack and the computed recipient summary are
              gated by recipient presence, and the empty case
              degrades to a muted, data-honest placeholder. */}
          <div className={companionStyles.queueRowFooter}>
            {entry.recipients.length > 0 ? (
              <>
                <HbcAvatarStack
                  people={entry.recipients.slice(0, 4).map((r) => ({
                    id: r.id,
                    name: r.name,
                    src: r.media?.src,
                  }))}
                  size="sm"
                  max={4}
                />
                <span className={companionStyles.queueRowRecipientSummary}>
                  {summary.label}
                </span>
              </>
            ) : (
              <span className={companionStyles.queueRowRecipientsEmpty}>
                No recipients linked
              </span>
            )}
            <span className={companionStyles.queueRowSubmittedBy}>
              Submitted by {entry.submittedBy.displayName}
            </span>
          </div>
        </button>

        <div className={companionStyles.queueRowDateCell}>
          <span className={companionStyles.queueRowDate}>
            {new Date(entry.submittedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </HbcCard>
  );
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

type DetailActionKind = 'approve' | 'reject' | 'requestRevision' | 'reopen' | 'flagAdminReview' | 'clearAdminReview' | 'schedule' | 'unschedule' | 'pin' | 'unpin' | 'feature' | 'unfeature' | 'remove' | 'restore' | 'claim' | 'reassign' | 'celebrate' | 'updateContent';

interface DetailPanelProps {
  entry: KudosEntry | undefined;
  onClose: () => void;
  capabilities: KudosCapabilities;
  role: KudosRole;
  dispatching: boolean;
  error?: string;
  onAction: (kind: DetailActionKind) => void;
}

function DetailPanel({
  entry,
  onClose,
  capabilities,
  role,
  dispatching,
  error,
  onAction,
}: DetailPanelProps): React.JSX.Element {
  const canApprove = capabilities.canApprove && entry?.workflowStatus !== 'approved';
  const canReject = capabilities.canReject && entry?.workflowStatus !== 'rejected';
  const canRequestRevision =
    capabilities.canRequestRevision && entry?.workflowStatus === 'pending';

  // Fetch audit timeline when the panel opens.
  const [timeline, setTimeline] = React.useState<KudosAuditTimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = React.useState(false);
  React.useEffect(() => {
    if (!entry) { setTimeline([]); return; }
    const listHostUrl = getKudosListHostUrl();
    if (!listHostUrl) return;
    let cancelled = false;
    setTimelineLoading(true);
    fetchKudosAuditTimeline(listHostUrl, entry.id).then((events) => {
      if (!cancelled) { setTimeline(events); setTimelineLoading(false); }
    }).catch(() => { if (!cancelled) setTimelineLoading(false); });
    return () => { cancelled = true; };
  }, [entry?.id]);

  return (
    <HbcKudosComposerFlyout
      open={Boolean(entry)}
      onClose={onClose}
      title={entry?.headline ?? 'Governance detail'}
      subtitle={entry ? `Submitted by ${entry.submittedBy.displayName}` : undefined}
      primaryAction={
        canApprove
          ? {
              label: 'Approve',
              onClick: () => onAction('approve'),
              loading: dispatching,
              disabled: dispatching,
            }
          : { label: 'Close', onClick: onClose }
      }
      secondaryAction={canApprove ? { label: 'Close', onClick: onClose } : undefined}
    >
      {entry ? (
        <KudosFlyoutBody
          as="section"
          testId="hb-kudos-companion-detail"
          ariaLabel="Governance detail"
        >
          <KudosDetailPanelContent
            entry={entry}
            role={role}
            timeline={timeline}
            timelineLoading={timelineLoading}
          />

          {error ? <KudosGovernanceErrorAlert message={error} /> : null}

          {/* Action families — governance operations grouped by
              operator intent rather than a flat wrapped strip.
              Destructive "Takedown" family is set apart with its
              own separator and tint so removal is never buried.
              Capability gates are preserved 1:1 per button. */}
          <div className={kudosFlyoutStyles.actionFamilies}>

            {/* Review decision — moderation outcome for this item. */}
            <div
              role="group"
              aria-label="Review decision"
              className={kudosFlyoutStyles.actionFamily}
            >
              <span className={kudosFlyoutStyles.actionFamilyLabel}>
                Review decision
              </span>
              <div className={kudosFlyoutStyles.actionFamilyRow}>
                <KudosActionButton label="Reject" onClick={() => onAction('reject')} disabled={!canReject || dispatching} tone="danger" testId="hb-kudos-action-reject" />
                <KudosActionButton label="Request revision" onClick={() => onAction('requestRevision')} disabled={!canRequestRevision || dispatching} tone="warning" testId="hb-kudos-action-request-revision" />
                {capabilities.canApprove && entry?.workflowStatus === 'rejected' ? (
                  <KudosActionButton label="Reopen" onClick={() => onAction('reopen')} disabled={dispatching} tone="info" testId="hb-kudos-action-reopen" />
                ) : null}
              </div>
            </div>

            {/* Publication & prominence — what the approved item
                does on the public surface. Rendered only when the
                operator has at least one capability in the family. */}
            {(capabilities.canSchedule ||
              capabilities.canPin ||
              capabilities.canFeature ||
              (capabilities.canEditPublished && entry?.workflowStatus === 'approved')) ? (
              <div
                role="group"
                aria-label="Publication and prominence"
                className={kudosFlyoutStyles.actionFamily}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>
                  Publication &amp; prominence
                </span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  {capabilities.canSchedule ? (
                    entry?.isScheduled
                      ? <KudosActionButton label="Unschedule" onClick={() => onAction('unschedule')} disabled={dispatching} tone="info" testId="hb-kudos-action-unschedule" />
                      : <KudosActionButton label="Schedule" onClick={() => onAction('schedule')} disabled={dispatching} tone="info" testId="hb-kudos-action-schedule" />
                  ) : null}
                  {capabilities.canPin ? (
                    entry?.isPinned
                      ? <KudosActionButton label="Unpin" onClick={() => onAction('unpin')} disabled={dispatching} tone="info" testId="hb-kudos-action-unpin" />
                      : <KudosActionButton label="Pin" onClick={() => onAction('pin')} disabled={dispatching} tone="info" testId="hb-kudos-action-pin" />
                  ) : null}
                  {capabilities.canFeature ? (
                    entry?.isFeatured
                      ? <KudosActionButton label="Unfeature" onClick={() => onAction('unfeature')} disabled={dispatching} tone="info" testId="hb-kudos-action-unfeature" />
                      : <KudosActionButton label="Feature" onClick={() => onAction('feature')} disabled={dispatching} tone="info" testId="hb-kudos-action-feature" />
                  ) : null}
                  {capabilities.canEditPublished && entry?.workflowStatus === 'approved' ? (
                    <KudosActionButton label="Edit published" onClick={() => onAction('updateContent')} disabled={dispatching} tone="info" testId="hb-kudos-action-update-content" />
                  ) : null}
                  <KudosActionButton label="Celebrate" onClick={() => onAction('celebrate')} disabled={dispatching} tone="info" />
                </div>
              </div>
            ) : null}

            {/* Admin review flag — internal routing signal. */}
            {(capabilities.canFlagAdminReview || capabilities.canClearAdminReview) ? (
              <div
                role="group"
                aria-label="Admin review flag"
                className={kudosFlyoutStyles.actionFamily}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>
                  Admin review flag
                </span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  {capabilities.canFlagAdminReview && !needsAdminReview(entry) ? (
                    <KudosActionButton label="Flag for admin review" onClick={() => onAction('flagAdminReview')} disabled={dispatching} tone="warning" testId="hb-kudos-action-flag" />
                  ) : null}
                  {capabilities.canClearAdminReview && needsAdminReview(entry) ? (
                    <KudosActionButton label="Clear admin review" onClick={() => onAction('clearAdminReview')} disabled={dispatching} tone="info" testId="hb-kudos-action-clear-flag" />
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Ownership — assignment operations. */}
            {capabilities.canClaim ? (
              <div
                role="group"
                aria-label="Ownership"
                className={kudosFlyoutStyles.actionFamily}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>
                  Ownership
                </span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  <KudosActionButton label="Claim" onClick={() => onAction('claim')} disabled={dispatching} tone="info" testId="hb-kudos-action-claim" />
                  <KudosActionButton label="Reassign" onClick={() => onAction('reassign')} disabled={dispatching} tone="info" testId="hb-kudos-action-assign" />
                </div>
              </div>
            ) : null}

            {/* Takedown — destructive family. Visibly separated so
                remove/restore decisions read as deliberate work. */}
            {((capabilities.canRemove && entry?.workflowStatus !== 'removedUnpublished') ||
              (capabilities.canRestore && entry?.workflowStatus === 'removedUnpublished')) ? (
              <div
                role="group"
                aria-label="Takedown"
                className={clsx(
                  kudosFlyoutStyles.actionFamily,
                  kudosFlyoutStyles.actionFamilyDestructive,
                )}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>
                  Takedown
                </span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  {capabilities.canRemove && entry?.workflowStatus !== 'removedUnpublished' ? (
                    <KudosActionButton label="Remove" onClick={() => onAction('remove')} disabled={dispatching} tone="danger" testId="hb-kudos-action-remove" />
                  ) : null}
                  {capabilities.canRestore && entry?.workflowStatus === 'removedUnpublished' ? (
                    <KudosActionButton label="Restore" onClick={() => onAction('restore')} disabled={dispatching} tone="info" testId="hb-kudos-action-restore" />
                  ) : null}
                </div>
              </div>
            ) : null}

          </div>
        </KudosFlyoutBody>
      ) : null}
    </HbcKudosComposerFlyout>
  );
}

// ActionButton promoted to shared KudosGovernancePrimitives.

// ---------------------------------------------------------------------------
// Main webpart
// ---------------------------------------------------------------------------

export function HbKudosCompanion({
  config,
  identity,
  nowIso,
}: HbKudosCompanionProps): React.JSX.Element {
  const heading =
    (typeof config?.heading === 'string' && config.heading) || 'HB Kudos Approval Companion';

  // Resolve role from the real SharePoint site permission model.
  // In production, queries IsSiteAdmin + group membership on the
  // companion's host site against canonical Entra security groups.
  // Falls back to simulatedRole only when siteUrl is unavailable
  // (local dev / jsdom).
  const [role, setRole] = React.useState<KudosRole>('viewer');
  const [roleResolving, setRoleResolving] = React.useState(true);
  const [roleStatus, setRoleStatus] = React.useState<KudosRoleResolutionStatus>('simulated');
  const [roleAttempt, setRoleAttempt] = React.useState(0);
  const retryRoleResolution = React.useCallback(() => setRoleAttempt((n) => n + 1), []);
  React.useEffect(() => {
    let cancelled = false;
    setRoleResolving(true);
    resolveKudosRoleStatus({
      siteUrl: getSiteUrl(),
      currentUserEmail: identity?.email,
      simulatedRole: config?.simulatedRole,
    }).then((resolution) => {
      if (!cancelled) {
        setRole(resolution.role);
        setRoleStatus(resolution.status);
        setRoleResolving(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setRole('viewer');
        setRoleStatus('resolution-failed');
        setRoleResolving(false);
      }
    });
    return () => { cancelled = true; };
    // simulatedRole intentionally excluded — dev-only, should not
    // re-trigger production resolution on property pane changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.email, roleAttempt]);
  const capabilities = React.useMemo(() => deriveKudosCapabilities(role), [role]);

  // Configurable overdue thresholds from webpart properties.
  const overdueThresholds: KudosOverdueThresholds = React.useMemo(() => ({
    pendingOverdueDays: typeof config?.pendingOverdueDays === 'number' ? config.pendingOverdueDays : DEFAULT_KUDOS_OVERDUE_THRESHOLDS.pendingOverdueDays,
    adminReviewOverdueDays: typeof config?.adminReviewOverdueDays === 'number' ? config.adminReviewOverdueDays : DEFAULT_KUDOS_OVERDUE_THRESHOLDS.adminReviewOverdueDays,
  }), [config?.pendingOverdueDays, config?.adminReviewOverdueDays]);

  const { listConfig, isLoading, error: loadError, refresh: refreshData } = usePeopleCultureData();
  const allKudos: KudosEntry[] = React.useMemo(() => listConfig?.kudos ?? [], [listConfig?.kudos]);

  const [filter, dispatch] = React.useReducer(filterReducer, INITIAL_FILTER_STATE);
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(() => new Set());
  const [detailEntry, setDetailEntry] = React.useState<KudosEntry | undefined>();
  const [dispatching, setDispatching] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | undefined>();

  // Governance input dialog state — replaces window.prompt calls.
  const [inputDialog, setInputDialog] = React.useState<{
    kind: DetailActionKind;
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmLabel?: string;
    choices?: readonly { value: string; label: string }[];
    allowEmpty?: boolean;
  } | null>(null);

  // Two-phase updateContent: after headline is confirmed, prompt for excerpt.
  const [pendingUpdateHeadline, setPendingUpdateHeadline] = React.useState<string | undefined>();

  // Task-specific dialog slots (Phase-25 Prompt-03). Schedule /
  // feature-expiry use a datetime picker; reassign uses an
  // email-resolving assignee picker. Separate from `inputDialog` so
  // the generic text/select dialog logic stays uninvolved.
  type DateTimeDialogKind = 'schedule' | 'feature';
  const [dateTimeDialog, setDateTimeDialog] = React.useState<{
    kind: DateTimeDialogKind;
    title: string;
    description?: string;
    fieldLabel?: string;
    hint?: string;
    defaultIso?: string;
    confirmLabel?: string;
    allowEmpty?: boolean;
  } | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = React.useState(false);

  const now = nowIso ?? new Date().toISOString();

  // Resolve the current user's SharePoint ID for ownership filtering.
  const [currentUserId, setCurrentUserId] = React.useState<number | undefined>();
  React.useEffect(() => {
    resolveCurrentUserId().then(setCurrentUserId).catch(() => {});
  }, []);

  const queue = React.useMemo(
    () => applyCompanionFilter(allKudos, filter, now, currentUserId),
    [allKudos, filter, now, currentUserId],
  );

  // Compute overdue status per queue entry for visual indicators.
  const overdueMap = React.useMemo(() => {
    const map = new Map<string, KudosOverdueStatus>();
    for (const entry of queue) {
      const ws = entry.workflowStatus;
      if (ws === 'pending' || ws === 'revisionRequested') {
        map.set(entry.id, deriveKudosOverdueStatus(entry.submittedDate, now, overdueThresholds.pendingOverdueDays));
      } else if (entry.isFlaggedForAdminReview === true) {
        map.set(entry.id, deriveKudosOverdueStatus(entry.submittedDate, now, overdueThresholds.adminReviewOverdueDays));
      } else {
        map.set(entry.id, 'ok');
      }
    }
    return map;
  }, [queue, now, overdueThresholds]);

  // Compute reminder targets for the header summary badge.
  const reminderTargets = React.useMemo(
    () => findKudosReminderTargets(allKudos, now, overdueThresholds),
    [allKudos, now, overdueThresholds],
  );

  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => setSelectedIds(new Set()), []);

  // Dispatch a governance patch — shared by both immediate actions and
  // dialog-confirmed actions. Separated from action routing so the
  // dialog confirm handler can call it without duplicating network code.
  const dispatchGovernancePatch = React.useCallback(
    async (patch: KudosPatch) => {
      if (!detailEntry) return;
      const listHostUrl = getKudosListHostUrl();
      if (!listHostUrl) {
        setActionError('SharePoint site context is not available.');
        return;
      }
      setDispatching(true);
      try {
        const result = await submitKudosGovernanceAction(
          listHostUrl,
          patch,
          {
            actorEmail: identity?.email,
            callerRole: role,
            headline: detailEntry.headline,
            isFirstPublish: patch.kind === 'approve' && detailEntry.wasEverPublished !== true,
            itemIsFlaggedForAdminReview: detailEntry.isFlaggedForAdminReview === true,
          },
        );
        if (!result.ok) {
          setActionError(result.error);
          return;
        }
        setActionError(undefined);
        setDetailEntry(undefined);
        // Trigger immediate data refresh so the queue reflects the mutation.
        refreshData();
      } finally {
        setDispatching(false);
      }
    },
    [detailEntry, identity?.email, role, refreshData],
  );

  // Phase A: route detail actions. Actions requiring input open the
  // dialog; no-input actions dispatch immediately.
  const handleDetailAction = React.useCallback(
    (kind: DetailActionKind) => {
      if (!detailEntry) return;
      setActionError(undefined);

      // Actions that dispatch immediately (no input needed).
      switch (kind) {
        case 'approve':
          void dispatchGovernancePatch({ kind: 'approve', kudosId: detailEntry.id });
          return;
        case 'clearAdminReview':
          void dispatchGovernancePatch({ kind: 'clearAdminReview', kudosId: detailEntry.id });
          return;
        case 'unschedule':
          void dispatchGovernancePatch({ kind: 'unschedule', kudosId: detailEntry.id });
          return;
        case 'unpin':
          void dispatchGovernancePatch({ kind: 'unpin', kudosId: detailEntry.id });
          return;
        case 'unfeature':
          void dispatchGovernancePatch({ kind: 'unfeature', kudosId: detailEntry.id });
          return;
        case 'restore':
          void dispatchGovernancePatch({ kind: 'restore', kudosId: detailEntry.id });
          return;
        case 'claim':
          void dispatchGovernancePatch({ kind: 'claim', kudosId: detailEntry.id });
          return;
        case 'celebrate': {
          const currentCount = detailEntry.celebrateCount ?? 0;
          void dispatchGovernancePatch({ kind: 'celebrate', kudosId: detailEntry.id, nextCount: currentCount + 1 });
          return;
        }
        default:
          break;
      }

      // Task-specific dialogs — scheduling and reassignment need
      // structured controls, not free-text entry.
      if (kind === 'schedule') {
        setDateTimeDialog({
          kind: 'schedule',
          title: 'Scheduled publish',
          description: 'Pick the date and time when this item should go live. The picker uses your local timezone; the value is stored in UTC.',
          fieldLabel: 'Publish at',
          hint: 'Minute precision is enough — the queue reveals items once this moment passes.',
          confirmLabel: 'Schedule',
        });
        return;
      }
      if (kind === 'feature') {
        setDateTimeDialog({
          kind: 'feature',
          title: 'Featured expiry',
          description: 'Choose when featured status should expire. Leave empty to keep the default expiry window.',
          fieldLabel: 'Expires at',
          confirmLabel: 'Feature',
          allowEmpty: true,
        });
        return;
      }
      if (kind === 'reassign') {
        setAssignmentDialogOpen(true);
        return;
      }

      // Remaining actions use the generic text/select dialog.
      const dialogMap: Record<string, Omit<NonNullable<typeof inputDialog>, 'kind'>> = {
        reject: { title: 'Rejection reason', description: 'Provide a submitter-facing reason for the rejection.', placeholder: 'Enter rejection reason…' },
        requestRevision: { title: 'Revision guidance', description: 'Provide guidance so the submitter knows what to change.', placeholder: 'Enter revision guidance…' },
        flagAdminReview: { title: 'Admin review reason', description: 'Why does this item need admin review?', placeholder: 'Enter reason…' },
        pin: { title: 'Pin order', description: 'Select the pin slot (1 is highest).', choices: [{ value: '1', label: '1 — Top' }, { value: '2', label: '2 — Middle' }, { value: '3', label: '3 — Bottom' }] },
        remove: { title: 'Removal reason', description: 'Provide a reason for removing this item from public view.', placeholder: 'Enter removal reason…' },
        reopen: { title: 'Reopen to status', description: 'Choose which status the item should return to.', choices: [{ value: 'pending', label: 'Pending review' }, { value: 'revisionRequested', label: 'Revision requested' }] },
        updateContent: { title: 'Edit headline', description: 'Update the recognition headline.', placeholder: 'Enter updated headline…', defaultValue: detailEntry.headline ?? '', confirmLabel: 'Next: excerpt' },
      };

      const config = dialogMap[kind];
      if (config) {
        setInputDialog({ kind, ...config });
      }
    },
    [detailEntry, dispatchGovernancePatch],
  );

  // Dedicated confirm handlers for the task-specific dialogs.
  const handleDateTimeDialogConfirm = React.useCallback(
    (isoUtc: string) => {
      if (!detailEntry || !dateTimeDialog) return;
      const kind = dateTimeDialog.kind;
      setDateTimeDialog(null);
      if (kind === 'schedule') {
        void dispatchGovernancePatch({
          kind: 'schedule',
          kudosId: detailEntry.id,
          scheduledPublishAtIso: isoUtc,
        });
      } else if (kind === 'feature') {
        void dispatchGovernancePatch({
          kind: 'feature',
          kudosId: detailEntry.id,
          featuredExpiresAtIso: isoUtc || undefined,
        });
      }
    },
    [detailEntry, dateTimeDialog, dispatchGovernancePatch],
  );

  const handleAssignmentDialogConfirm = React.useCallback(
    (resolved: { userId: number }) => {
      if (!detailEntry) return;
      setAssignmentDialogOpen(false);
      void dispatchGovernancePatch({
        kind: 'reassign',
        kudosId: detailEntry.id,
        assignedUserId: resolved.userId,
      });
    },
    [detailEntry, dispatchGovernancePatch],
  );

  // Phase B: dialog confirm handler — build the patch from the dialog
  // value and dispatch.
  const handleInputDialogConfirm = React.useCallback(
    (value: string) => {
      if (!detailEntry || !inputDialog) return;
      const kind = inputDialog.kind;

      // Special two-phase flow for updateContent: headline → excerpt.
      if (kind === 'updateContent' && pendingUpdateHeadline === undefined) {
        setPendingUpdateHeadline(value);
        setInputDialog({
          kind: 'updateContent',
          title: 'Edit excerpt',
          description: 'Update the recognition excerpt.',
          placeholder: 'Enter updated excerpt…',
          defaultValue: detailEntry.excerpt ?? '',
          confirmLabel: 'Save changes',
        });
        return;
      }

      setInputDialog(null);

      let patch: KudosPatch;
      switch (kind) {
        case 'reject':
          patch = { kind: 'reject', kudosId: detailEntry.id, rejectionReason: value.trim() };
          break;
        case 'requestRevision':
          patch = { kind: 'requestRevision', kudosId: detailEntry.id, revisionGuidance: value.trim() };
          break;
        case 'flagAdminReview':
          patch = { kind: 'flagAdminReview', kudosId: detailEntry.id, adminReviewReason: value.trim() };
          break;
        case 'pin': {
          const pinOrder = Number(value);
          patch = { kind: 'pin', kudosId: detailEntry.id, pinOrder: Number.isFinite(pinOrder) ? pinOrder : undefined };
          break;
        }
        case 'remove':
          patch = { kind: 'remove', kudosId: detailEntry.id, removedReason: value.trim() };
          break;
        case 'reopen': {
          const targetStatus = value.startsWith('revision') ? 'revisionRequested' as const : 'pending' as const;
          patch = { kind: 'reopen', kudosId: detailEntry.id, targetStatus };
          break;
        }
        case 'updateContent': {
          const patchFields: { headline?: string; excerpt?: string } = {};
          const hl = (pendingUpdateHeadline ?? '').trim();
          if (hl && hl !== (detailEntry.headline ?? '')) patchFields.headline = hl;
          const ex = value.trim();
          if (ex && ex !== (detailEntry.excerpt ?? '')) patchFields.excerpt = ex;
          setPendingUpdateHeadline(undefined);
          if (Object.keys(patchFields).length === 0) return;
          patch = { kind: 'updateContent', kudosId: detailEntry.id, ...patchFields };
          break;
        }
        default:
          return;
      }
      void dispatchGovernancePatch(patch);
    },
    [detailEntry, inputDialog, pendingUpdateHeadline, dispatchGovernancePatch],
  );

  const handleBulkApprove = React.useCallback(async () => {
    if (!capabilities.canBulkApprove) return;
    if (selectedIds.size === 0) return;
    const listHostUrl = getKudosListHostUrl();
    if (!listHostUrl) {
      setActionError('SharePoint site context is not available.');
      return;
    }
    setActionError(undefined);
    setDispatching(true);
    let failures = 0;
    try {
      for (const id of selectedIds) {
        const entry = queue.find((e) => e.id === id);
        if (!entry) continue;
        // Only approve pending / revisionRequested — other states are
        // not in scope for bulk approve.
        if (entry.workflowStatus && entry.workflowStatus !== 'pending' && entry.workflowStatus !== 'revisionRequested') {
          continue;
        }
        const result = await submitKudosGovernanceAction(
          listHostUrl,
          { kind: 'approve', kudosId: entry.id },
          {
            actorEmail: identity?.email,
            callerRole: role,
            headline: entry.headline,
            isFirstPublish: entry.wasEverPublished !== true,
          },
        );
        if (!result.ok) failures += 1;
      }
      if (failures > 0) {
        setActionError(`${failures} of ${selectedIds.size} bulk approvals failed.`);
      }
      clearSelection();
    } finally {
      setDispatching(false);
    }
  }, [capabilities.canBulkApprove, clearSelection, identity?.email, queue, selectedIds]);

  const selectable =
    capabilities.canBulkApprove && (filter.tabId === 'pending' || filter.tabId === 'revisionRequested' || filter.tabId === 'flagged');

  // Active-tab metadata for the workspace subtitle and queue-region
  // header. Lets operators parse scope + counts without decoding the
  // filter bar state.
  const activeTab = COMPANION_TABS.find((t) => t.id === filter.tabId) ?? COMPANION_TABS[0]!;
  const scopeCount = React.useMemo(
    () => applyCompanionFilter(
      allKudos,
      { ...filter, searchText: '', ownership: 'all', adminReviewOnly: false, scheduledOnly: false, aging: [] },
      now,
      currentUserId,
    ).length,
    [allKudos, filter, now, currentUserId],
  );
  const isRefined = queue.length !== scopeCount;

  if (roleResolving) {
    return (
      <section
        data-hbc-webpart="hb-kudos-companion"
        data-hbc-state="role-resolving"
        className={companionStyles.stateCentered}
      >
        <HbcSpinner size="md" />
      </section>
    );
  }

  // Degraded state: the live SharePoint permission check threw or
  // returned a non-OK response. Role falls closed to `viewer`, but we
  // must NOT present the workspace as a permission denial — that
  // would misattribute an infra failure to the user's access.
  if (roleStatus === 'resolution-failed') {
    return (
      <section
        data-hbc-webpart="hb-kudos-companion"
        data-hbc-state="role-resolution-failed"
        data-hbc-testid="hb-kudos-companion-role-error"
        aria-label="HB Kudos Approval Companion"
        className={companionStyles.root}
        style={kudosCSSVars()}
      >
        <KudosGovernanceErrorAlert
          message="Unable to verify your HB Kudos governance role. This is a permission-check failure, not an access denial."
        />
        <HbcEmptyState
          title="Permission check unavailable"
          description="The companion could not reach the SharePoint permission model to confirm your role. Try again; if the problem persists, contact your SharePoint admin."
          primaryAction={
            <KudosActionButton
              label="Retry"
              tone="info"
              disabled={false}
              onClick={retryRoleResolution}
              testId="hb-kudos-companion-role-error-retry"
            />
          }
        />
      </section>
    );
  }

  // Degraded state: no canonical list-host URL is available in a
  // production runtime. The runtime hardcodes HBCentral, so this only
  // fires if the constant has been cleared or a malformed override
  // was set. Render an explicit "not configured" state rather than
  // silently attempting a fetch with no target.
  //
  // The `simulated` path (dev-harness / jsdom) never needs a live
  // list-host URL — data is supplied through the harness adapter —
  // so the guard is scoped to real production resolution.
  if (roleStatus !== 'simulated' && !getKudosListHostUrl()) {
    return (
      <section
        data-hbc-webpart="hb-kudos-companion"
        data-hbc-state="host-unconfigured"
        data-hbc-testid="hb-kudos-companion-host-missing"
        aria-label="HB Kudos Approval Companion"
        className={companionStyles.root}
        style={kudosCSSVars()}
      >
        <HbcEmptyState
          title="Workspace not configured"
          description="No Kudos list host is available. This webpart must be deployed with a valid kudosListHostUrl (canonical: HBCentral). Contact your SharePoint admin."
        />
      </section>
    );
  }

  // Permission groups and list-host URL are canonical constants — no
  // per-instance configuration is required for production runtime.

  if (!capabilities.canViewGovernance) {
    return (
      <section data-hbc-webpart="hb-kudos-companion" data-hbc-role={role}>
        <HbcEmptyState
          title="Access restricted"
          description="This governance workspace is available to HB Kudos admins and reviewers. Contact your SharePoint admin if you believe you should have access."
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section
        data-hbc-webpart="hb-kudos-companion"
        data-hbc-state="loading"
        className={companionStyles.stateCentered}
      >
        <HbcSpinner size="md" />
      </section>
    );
  }

  // Load / binding failure — a distinct render path from an ordinary
  // empty queue. Required by the SPFx homepage overlay doctrine so a
  // data-fetch failure is never mistaken for "no kudos to review".
  if (loadError) {
    return (
      <section
        data-hbc-webpart="hb-kudos-companion"
        data-hbc-state="load-error"
        data-hbc-testid="hb-kudos-companion-load-error"
        data-hbc-role={role}
        aria-label="HB Kudos Approval Companion"
        className={companionStyles.root}
        style={kudosCSSVars()}
      >
        <KudosGovernanceErrorAlert
          message={`Unable to load kudos data: ${loadError}. This is a data-load problem, not an empty queue.`}
        />
        <HbcEmptyState
          title="Kudos data unavailable"
          description="The governance workspace could not load kudos from SharePoint. Try refreshing; if the problem persists, contact your SharePoint admin."
          primaryAction={
            <KudosActionButton
              label="Retry"
              tone="info"
              disabled={false}
              onClick={refreshData}
              testId="hb-kudos-companion-load-error-retry"
            />
          }
        />
      </section>
    );
  }

  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-webpart-phase="phase-14-kudos-phase-04"
      data-hbc-testid="hb-kudos-companion-root"
      data-hbc-role={role}
      aria-label="HB Kudos Approval Companion"
      className={companionStyles.root}
      style={kudosCSSVars()}
    >
      <header className={companionStyles.header}>
        <div className={companionStyles.headerLead}>
          <div className={companionStyles.eyebrow}>
            <Trophy size={11} strokeWidth={2.5} aria-hidden="true" />
            HB Kudos governance
          </div>
          <h2 className={companionStyles.title}>
            {heading}
          </h2>
          <div className={companionStyles.workspaceSubtitle} aria-live="polite">
            <span>{activeTab.label}</span>
            <span className={companionStyles.workspaceSubtitleDot}>·</span>
            <span>
              {queue.length} {queue.length === 1 ? 'item' : 'items'}
              {isRefined ? ` of ${scopeCount}` : ''}
            </span>
            {reminderTargets.length > 0 ? (
              <>
                <span className={companionStyles.workspaceSubtitleDot}>·</span>
                <span>{reminderTargets.length} overdue</span>
              </>
            ) : null}
          </div>
        </div>
        <div
          className={companionStyles.headerMeta}
          role="status"
          aria-live="polite"
        >
          {reminderTargets.length > 0 ? (
            <HbcStatusBadge
              variant="warning"
              size="small"
              label={`${reminderTargets.length} overdue`}
            />
          ) : null}
          <HbcStatusBadge
            variant={role === 'admin' ? 'critical' : role === 'reviewer' ? 'info' : 'warning'}
            size="small"
            label={KUDOS_ROLE_LABELS[role]}
          />
        </div>
      </header>

      {/* Control zone — scopes (tabs) on top, in-scope refinement
           (search, ownership, toggle chips) below. One surface, two
           clearly distinct rows so operators differentiate "which
           queue am I looking at" from "how am I narrowing it". */}
      <section
        className={companionStyles.controlZone}
        aria-label="Queue controls"
      >
        {/* Queue filter buttons — not WAI-ARIA tabs (no tabpanels;
             content is filtered in-place). Each button uses
             aria-pressed. */}
        <div
          role="group"
          aria-label="Queue scope"
          className={clsx(companionStyles.filterBar, companionStyles.controlZoneTabs)}
        >
          {COMPANION_TABS.map((tab) => (
            <KudosGovernanceTabButton
              key={tab.id}
              label={tab.label}
              active={tab.id === filter.tabId}
              onClick={() => dispatch({ type: 'setTab', tabId: tab.id })}
              testId={`hb-kudos-queue-tab-${tab.id}`}
            />
          ))}
        </div>

        {/* Search and in-scope refinement controls */}
        <div
          role="group"
          aria-label="Refinement controls"
          className={clsx(companionStyles.searchCluster, companionStyles.controlZoneRefinement)}
        >
        <label className={companionStyles.searchField}>
          <KudosGovernanceToolbarLabel>Search</KudosGovernanceToolbarLabel>
          <input
            type="search"
            value={filter.searchText ?? ''}
            onChange={(e) => dispatch({ type: 'setSearch', value: e.target.value })}
            placeholder="Search recognition…"
            data-hbc-testid="hb-kudos-queue-filter-search"
            className={companionStyles.searchInput}
          />
        </label>

        <label className={companionStyles.ownershipField}>
          <KudosGovernanceToolbarLabel>Ownership</KudosGovernanceToolbarLabel>
          <select
            value={filter.ownership}
            onChange={(e) =>
              dispatch({
                type: 'setOwnership',
                ownership: e.target.value as KudosQueueFilterState['ownership'],
              })
            }
            data-hbc-testid="hb-kudos-queue-filter-ownership"
            className={companionStyles.ownershipSelect}
          >
            <option value="all">All</option>
            <option value="mine">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
            <option value="others">Assigned to others</option>
          </select>
        </label>

        <KudosGovernanceToggleChip
          label="Flagged for admin"
          active={filter.adminReviewOnly}
          onToggle={() => dispatch({ type: 'toggleAdminReviewOnly' })}
          testId="hb-kudos-queue-filter-admin-review"
        />
        <KudosGovernanceToggleChip
          label="Scheduled only"
          active={filter.scheduledOnly}
          onToggle={() => dispatch({ type: 'toggleScheduledOnly' })}
          testId="hb-kudos-queue-filter-scheduled"
        />
        </div>
      </section>

      {/* Bulk-select bar */}
      {selectable && selectedIds.size > 0 ? (
        <div
          role="group"
          aria-label="Bulk actions"
          className={companionStyles.bulkBar}
        >
          <span className={companionStyles.bulkCount}>
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={() => void handleBulkApprove()}
            disabled={dispatching}
            aria-busy={dispatching ? 'true' : undefined}
            data-hbc-testid="hb-kudos-bulk-approve"
            className={companionStyles.bulkApproveBtn}
          >
            {dispatching ? 'Approving…' : 'Approve selected'}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            disabled={dispatching}
            className={companionStyles.bulkClearBtn}
          >
            Clear
          </button>
        </div>
      ) : null}

      {actionError ? <KudosGovernanceErrorAlert message={actionError} /> : null}

      {/* Queue region — distinct browsing layer with a scoped
          subheader so operators parse the active queue scope and
          visible count before scanning rows. */}
      <section
        className={companionStyles.queueRegion}
        aria-label="Queue"
      >
        <div className={companionStyles.queueRegionHeader}>
          <span className={companionStyles.queueRegionLabel}>
            {activeTab.label} queue
          </span>
          <span className={companionStyles.queueRegionCount}>
            {queue.length} {queue.length === 1 ? 'item' : 'items'}
            {isRefined ? ` · refined from ${scopeCount}` : ''}
          </span>
        </div>

        {/* Distinct true-empty vs filtered-empty branches so
            operators can tell a quiet system apart from an
            over-filtered view. */}
        {queue.length === 0 ? (
          allKudos.length === 0 ? (
            <div data-hbc-state="true-empty">
              <HbcEmptyState
                title="No kudos in the system yet"
                description="The governance workspace is connected and working — there are currently no kudos submissions to review."
              />
            </div>
          ) : (
            <div data-hbc-state="filtered-empty">
              <HbcEmptyState
                title="No kudos match this view"
                description="Kudos exist outside the current filter. Try a different tab, clear search, or adjust the ownership / flag filters to see them."
              />
            </div>
          )
        ) : (
          <div className={companionStyles.queueGrid}>
            {queue.map((entry) => (
              <QueueRow
                key={entry.id}
                entry={entry}
                nowIso={now}
                selected={selectedIds.has(entry.id)}
                selectable={selectable}
                overdueStatus={overdueMap.get(entry.id) ?? 'ok'}
                onToggleSelect={toggleSelect}
                onOpenDetail={(e) => {
                  setDetailEntry(e);
                  setActionError(undefined);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <DetailPanel
        entry={detailEntry}
        onClose={() => setDetailEntry(undefined)}
        capabilities={capabilities}
        role={role}
        dispatching={dispatching}
        error={actionError}
        onAction={(kind) => void handleDetailAction(kind)}
      />

      <KudosGovernanceInputDialog
        open={inputDialog !== null}
        onClose={() => { setInputDialog(null); setPendingUpdateHeadline(undefined); }}
        onConfirm={handleInputDialogConfirm}
        title={inputDialog?.title ?? ''}
        description={inputDialog?.description}
        placeholder={inputDialog?.placeholder}
        defaultValue={inputDialog?.defaultValue}
        confirmLabel={inputDialog?.confirmLabel}
        choices={inputDialog?.choices}
        allowEmpty={inputDialog?.allowEmpty}
      />

      {/* Task-specific dialogs (Phase-25 Prompt-03) — structured
          controls for scheduling and reassignment instead of raw
          text input. Typed patch contracts are preserved. */}
      <KudosGovernanceDateTimeDialog
        open={dateTimeDialog !== null}
        onClose={() => setDateTimeDialog(null)}
        onConfirm={handleDateTimeDialogConfirm}
        title={dateTimeDialog?.title ?? ''}
        description={dateTimeDialog?.description}
        fieldLabel={dateTimeDialog?.fieldLabel}
        hint={dateTimeDialog?.hint}
        defaultIso={dateTimeDialog?.defaultIso}
        confirmLabel={dateTimeDialog?.confirmLabel}
        allowEmpty={dateTimeDialog?.allowEmpty}
      />
      <KudosGovernanceAssignmentDialog
        open={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        onConfirm={handleAssignmentDialogConfirm}
        title="Reassign kudos"
        description="Enter the assignee's email. The companion resolves the user against the canonical list-host site and dispatches the typed reassign patch."
        listHostUrl={getKudosListHostUrl() ?? ''}
        confirmLabel="Reassign"
      />
    </section>
  );
}

// ToggleChip promoted to KudosGovernanceToggleChip in shared governance primitives.
