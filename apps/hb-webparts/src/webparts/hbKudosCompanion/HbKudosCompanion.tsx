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
import { resolveKudosRole } from '../../homepage/helpers/kudosRoleResolver.js';
import {
  KUDOS_GOV_TOKENS,
  KudosActionButton,
  KudosGovernanceTabButton,
  KudosGovernanceToggleChip,
  KudosGovernanceToolbarLabel,
  KudosGovernanceErrorAlert,
  KudosGovernanceInputDialog,
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
        style={{
          display: 'grid',
          gridTemplateColumns: selectable ? 'auto 1fr auto' : '1fr auto',
          alignItems: 'flex-start',
          gap: 10,
          padding: '10px 14px',
        }}
      >
        {selectable ? (
          <label
            style={{ display: 'inline-flex', alignItems: 'center', marginTop: 4 }}
            aria-label={`Select ${entry.headline}`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(entry.id)}
              style={{ width: 16, height: 16 }}
            />
          </label>
        ) : null}

        <button
          type="button"
          onClick={() => onOpenDetail(entry)}
          style={{
            display: 'block',
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'inherit',
            font: 'inherit',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              flexWrap: 'wrap',
            }}
          >
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
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 999,
                background: KUDOS_GOV_TOKENS.blueSubtle08,
                color: KUDOS_GOV_TOKENS.brandBlue,
              }}
            >
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
          <h4
            style={{
              margin: '0 0 6px',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '-0.015em',
              color: KUDOS_GOV_TOKENS.textPrimary,
            }}
          >
            {entry.headline}
          </h4>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '0.8125rem',
              lineHeight: 1.55,
              color: KUDOS_GOV_TOKENS.textSecondary,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entry.excerpt}
          </p>
          {entry.recipients.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HbcAvatarStack
                people={entry.recipients.slice(0, 4).map((r) => ({
                  id: r.id,
                  name: r.name,
                  src: r.media?.src,
                }))}
                size="sm"
                max={4}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  color: KUDOS_GOV_TOKENS.textFaint,
                  fontWeight: 600,
                }}
              >
                {summary.label}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: KUDOS_GOV_TOKENS.textFaint,
                  fontWeight: 500,
                  marginLeft: 'auto',
                }}
              >
                Submitted by {entry.submittedBy.displayName}
              </span>
            </div>
          ) : null}
        </button>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              color: KUDOS_GOV_TOKENS.textCaption,
              fontWeight: 600,
            }}
          >
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

          <div
            role="group"
            aria-label="Governance actions"
            className={kudosFlyoutStyles.actionZone}
          >
            <KudosActionButton label="Reject" onClick={() => onAction('reject')} disabled={!canReject || dispatching} tone="danger" testId="hb-kudos-action-reject" />
            <KudosActionButton label="Request revision" onClick={() => onAction('requestRevision')} disabled={!canRequestRevision || dispatching} tone="warning" testId="hb-kudos-action-request-revision" />
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
            {capabilities.canRemove && entry?.workflowStatus !== 'removedUnpublished' ? (
              <KudosActionButton label="Remove" onClick={() => onAction('remove')} disabled={dispatching} tone="danger" testId="hb-kudos-action-remove" />
            ) : null}
            {capabilities.canRestore && entry?.workflowStatus === 'removedUnpublished' ? (
              <KudosActionButton label="Restore" onClick={() => onAction('restore')} disabled={dispatching} tone="info" testId="hb-kudos-action-restore" />
            ) : null}
            {capabilities.canFlagAdminReview && !needsAdminReview(entry) ? (
              <KudosActionButton label="Flag for admin review" onClick={() => onAction('flagAdminReview')} disabled={dispatching} tone="warning" testId="hb-kudos-action-flag" />
            ) : null}
            {capabilities.canClearAdminReview && needsAdminReview(entry) ? (
              <KudosActionButton label="Clear admin review" onClick={() => onAction('clearAdminReview')} disabled={dispatching} tone="info" testId="hb-kudos-action-clear-flag" />
            ) : null}
            {capabilities.canApprove && entry?.workflowStatus === 'rejected' ? (
              <KudosActionButton label="Reopen" onClick={() => onAction('reopen')} disabled={dispatching} tone="info" testId="hb-kudos-action-reopen" />
            ) : null}
            {capabilities.canEditPublished && entry?.workflowStatus === 'approved' ? (
              <KudosActionButton label="Edit published" onClick={() => onAction('updateContent')} disabled={dispatching} tone="info" testId="hb-kudos-action-update-content" />
            ) : null}
            {capabilities.canClaim ? (
              <KudosActionButton label="Claim" onClick={() => onAction('claim')} disabled={dispatching} tone="info" testId="hb-kudos-action-claim" />
            ) : null}
            {capabilities.canClaim ? (
              <KudosActionButton label="Reassign" onClick={() => onAction('reassign')} disabled={dispatching} tone="info" testId="hb-kudos-action-assign" />
            ) : null}
            <KudosActionButton label="Celebrate" onClick={() => onAction('celebrate')} disabled={dispatching} tone="info" />
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
  React.useEffect(() => {
    let cancelled = false;
    setRoleResolving(true);
    resolveKudosRole({
      siteUrl: getSiteUrl(),
      currentUserEmail: identity?.email,
      simulatedRole: config?.simulatedRole,
    }).then((resolved) => {
      if (!cancelled) { setRole(resolved); setRoleResolving(false); }
    }).catch(() => {
      if (!cancelled) { setRole('viewer'); setRoleResolving(false); }
    });
    return () => { cancelled = true; };
    // simulatedRole intentionally excluded — dev-only, should not
    // re-trigger production resolution on property pane changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.email]);
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

      // Actions that require dialog input.
      const dialogMap: Record<string, Omit<NonNullable<typeof inputDialog>, 'kind'>> = {
        reject: { title: 'Rejection reason', description: 'Provide a submitter-facing reason for the rejection.', placeholder: 'Enter rejection reason…' },
        requestRevision: { title: 'Revision guidance', description: 'Provide guidance so the submitter knows what to change.', placeholder: 'Enter revision guidance…' },
        flagAdminReview: { title: 'Admin review reason', description: 'Why does this item need admin review?', placeholder: 'Enter reason…' },
        schedule: { title: 'Scheduled publish date', description: 'Enter the date/time when this item should go live.', placeholder: 'e.g. 2026-05-01T09:00:00Z' },
        pin: { title: 'Pin order', description: 'Select the pin slot (1 is highest).', choices: [{ value: '1', label: '1 — Top' }, { value: '2', label: '2 — Middle' }, { value: '3', label: '3 — Bottom' }] },
        feature: { title: 'Featured expiry date', description: 'When should the featured status expire? Leave empty for default.', placeholder: 'e.g. 2026-06-01T00:00:00Z', allowEmpty: true },
        remove: { title: 'Removal reason', description: 'Provide a reason for removing this item from public view.', placeholder: 'Enter removal reason…' },
        reassign: { title: 'Reassign to user', description: 'Enter the SharePoint user ID of the new assignee.', placeholder: 'e.g. 42' },
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
        case 'schedule':
          patch = { kind: 'schedule', kudosId: detailEntry.id, scheduledPublishAtIso: value.trim() };
          break;
        case 'pin': {
          const pinOrder = Number(value);
          patch = { kind: 'pin', kudosId: detailEntry.id, pinOrder: Number.isFinite(pinOrder) ? pinOrder : undefined };
          break;
        }
        case 'feature':
          patch = { kind: 'feature', kudosId: detailEntry.id, featuredExpiresAtIso: value.trim() || undefined };
          break;
        case 'remove':
          patch = { kind: 'remove', kudosId: detailEntry.id, removedReason: value.trim() };
          break;
        case 'reassign': {
          const assignedUserId = Number(value);
          if (!Number.isFinite(assignedUserId) || assignedUserId <= 0) return;
          patch = { kind: 'reassign', kudosId: detailEntry.id, assignedUserId };
          break;
        }
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

  if (roleResolving) {
    return (
      <section
        data-hbc-webpart="hb-kudos-companion"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}
      >
        <HbcSpinner size="md" />
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}
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

      {/* Queue filter buttons — not WAI-ARIA tabs (no tabpanels; content
           is filtered in-place). Each button uses aria-pressed. */}
      <div role="group" aria-label="Queue filters" className={companionStyles.filterBar}>
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

      {/* Search and filter controls */}
      <div
        role="group"
        aria-label="Search and filter controls"
        className={companionStyles.searchCluster}
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

      {/* Queue list — distinct true-empty vs filtered-empty branches so
          operators can tell a quiet system apart from an over-filtered view. */}
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
    </section>
  );
}

// ToggleChip promoted to KudosGovernanceToggleChip in shared governance primitives.
