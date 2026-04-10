/**
 * HbKudosCompanion — HR Approval Companion webpart.
 *
 * Phase-14 kudos/ Prompt-03 — HR Approval Companion.
 *
 * Premium homepage-hosted governance workspace for HB Kudos
 * moderation. This webpart is distinct from the employee-facing
 * `HbKudos` surface (Prompt-02): it is HR / admin only, renders a
 * filterable queue of kudos entries across the full 7-state
 * `KudosWorkflowStatus` union, and dispatches typed governance
 * actions through `submitKudosGovernanceAction` with matching
 * writes to `Kudos Audit Events`.
 *
 * Architecture:
 *   - Data read: `usePeopleCultureData` (shared with the employee
 *     webpart) returns the current kudos snapshot.
 *   - State: a reducer-light local filter state over
 *     `KudosQueueFilterState` (tabs + ownership + search + quick
 *     toggles + bulk selection).
 *   - Write: `submitKudosGovernanceAction` from
 *     `data/kudosGovernanceWriter.ts`. Each action sends one PATCH
 *     + one audit event. Writer-level authorization verifies the
 *     caller's role before any network call.
 *   - Role gating: `resolveKudosRole` from `helpers/kudosRoleResolver.ts`
 *     queries SharePoint group membership at mount time. Falls back to
 *     `simulatedRole` only when siteUrl is unavailable (local dev).
 *   - Detail panel: reuses `HbcKudosComposerFlyout` as the shell and
 *     composes existing shared primitives inside.
 *
 * Shared-primitive discipline: this webpart follows the same local
 * composition stance the employee webpart (`HbKudos.tsx`) landed with
 * in Prompt-02. All UI is built from primitives exported via
 * `@hbc/ui-kit/homepage` — no imports from `@hbc/ui-kit` bare,
 * `/primitives`, `/app-shell`, or `/fluent`. Promotion of the queue
 * row / governance toolbar / audit timeline as dedicated shared
 * primitives is deliberately deferred to Prompt-06 closure once
 * overlap between the employee + HR consumers can be audited.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-00-Authority-and-Scope-Lock-Report.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-03-HR-Approval-Companion-Webpart.md`
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
import { getSiteUrl, resolveCurrentUserId } from '../../homepage/data/spContext.js';
import { KudosDetailPanelContent } from '../../homepage/shared/KudosDetailPanelContent.js';
import {
  KUDOS_ROLE_LABELS,
  deriveKudosCapabilities,
  type KudosCapabilities,
  type KudosRole,
} from '../../homepage/helpers/kudosCapabilities.js';
import { resolveKudosRole } from '../../homepage/helpers/kudosRoleResolver.js';
import {
  deriveKudosOverdueStatus,
  findKudosReminderTargets,
  DEFAULT_KUDOS_OVERDUE_THRESHOLDS,
  type KudosOverdueStatus,
  type KudosOverdueThresholds,
} from '../../homepage/helpers/kudosNotificationBuilder.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
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
        style={{
          display: 'grid',
          gridTemplateColumns: selectable ? 'auto 1fr auto' : '1fr auto',
          alignItems: 'flex-start',
          gap: 14,
          padding: '14px 16px',
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
                background: 'rgba(34, 83, 145, 0.08)',
                color: '#225391',
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
              color: '#1a1310',
            }}
          >
            {entry.headline}
          </h4>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '0.8125rem',
              lineHeight: 1.55,
              color: 'rgba(26, 19, 16, 0.68)',
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
                  color: 'rgba(26, 19, 16, 0.58)',
                  fontWeight: 600,
                }}
              >
                {summary.label}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'rgba(26, 19, 16, 0.48)',
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
              color: 'rgba(26, 19, 16, 0.45)',
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

type DetailActionKind = 'approve' | 'reject' | 'requestRevision' | 'flagAdminReview' | 'clearAdminReview' | 'schedule' | 'unschedule' | 'pin' | 'unpin' | 'feature' | 'unfeature' | 'remove' | 'restore' | 'claim' | 'reassign' | 'celebrate';

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
    const siteUrl = getSiteUrl();
    if (!siteUrl) return;
    let cancelled = false;
    setTimelineLoading(true);
    fetchKudosAuditTimeline(siteUrl, entry.id).then((events) => {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <KudosDetailPanelContent
            entry={entry}
            role={role}
            timeline={timeline}
            timelineLoading={timelineLoading}
          />

          {error ? (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(196, 49, 75, 0.08)',
                border: '1px solid rgba(196, 49, 75, 0.22)',
                color: '#c4314b',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          ) : null}

          <div
            role="group"
            aria-label="Governance actions"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: 6,
              borderTop: '1px dashed rgba(229, 126, 70, 0.22)',
            }}
          >
            <ActionButton label="Reject" onClick={() => onAction('reject')} disabled={!canReject || dispatching} tone="danger" />
            <ActionButton label="Request revision" onClick={() => onAction('requestRevision')} disabled={!canRequestRevision || dispatching} tone="warning" />
            {capabilities.canSchedule ? (
              entry?.isScheduled
                ? <ActionButton label="Unschedule" onClick={() => onAction('unschedule')} disabled={dispatching} tone="info" />
                : <ActionButton label="Schedule" onClick={() => onAction('schedule')} disabled={dispatching} tone="info" />
            ) : null}
            {capabilities.canPin ? (
              entry?.isPinned
                ? <ActionButton label="Unpin" onClick={() => onAction('unpin')} disabled={dispatching} tone="info" />
                : <ActionButton label="Pin" onClick={() => onAction('pin')} disabled={dispatching} tone="info" />
            ) : null}
            {capabilities.canFeature ? (
              entry?.isFeatured
                ? <ActionButton label="Unfeature" onClick={() => onAction('unfeature')} disabled={dispatching} tone="info" />
                : <ActionButton label="Feature" onClick={() => onAction('feature')} disabled={dispatching} tone="info" />
            ) : null}
            {capabilities.canRemove && entry?.workflowStatus !== 'removedUnpublished' ? (
              <ActionButton label="Remove" onClick={() => onAction('remove')} disabled={dispatching} tone="danger" />
            ) : null}
            {capabilities.canRestore && entry?.workflowStatus === 'removedUnpublished' ? (
              <ActionButton label="Restore" onClick={() => onAction('restore')} disabled={dispatching} tone="info" />
            ) : null}
            {capabilities.canFlagAdminReview && !needsAdminReview(entry) ? (
              <ActionButton label="Flag for admin review" onClick={() => onAction('flagAdminReview')} disabled={dispatching} tone="warning" />
            ) : null}
            {capabilities.canClearAdminReview && needsAdminReview(entry) ? (
              <ActionButton label="Clear admin review" onClick={() => onAction('clearAdminReview')} disabled={dispatching} tone="info" />
            ) : null}
            {capabilities.canClaim ? (
              <ActionButton label="Claim" onClick={() => onAction('claim')} disabled={dispatching} tone="info" />
            ) : null}
            {capabilities.canClaim ? (
              <ActionButton label="Reassign" onClick={() => onAction('reassign')} disabled={dispatching} tone="info" />
            ) : null}
            <ActionButton label="Celebrate" onClick={() => onAction('celebrate')} disabled={dispatching} tone="info" />
          </div>
        </div>
      ) : null}
    </HbcKudosComposerFlyout>
  );
}

// SectionHeading was moved into KudosDetailPanelContent.tsx (Prompt-04).

function ActionButton({
  label,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  tone: 'info' | 'warning' | 'danger';
}): React.JSX.Element {
  const toneColor =
    tone === 'danger' ? '#c4314b' : tone === 'warning' ? '#c26434' : '#225391';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        border: `1.5px solid ${toneColor}`,
        background: disabled ? 'rgba(128, 128, 128, 0.08)' : '#ffffff',
        color: disabled ? 'rgba(26, 19, 16, 0.4)' : toneColor,
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

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

  // Resolve real role from SharePoint group membership. Falls back to
  // simulatedRole only when siteUrl is unavailable (local dev).
  const [role, setRole] = React.useState<KudosRole>('viewer');
  const [roleResolving, setRoleResolving] = React.useState(true);
  React.useEffect(() => {
    let cancelled = false;
    setRoleResolving(true);
    resolveKudosRole({
      siteUrl: getSiteUrl(),
      currentUserEmail: identity?.email,
      kudosAdminsGroup: typeof config?.kudosAdminsGroup === 'string' ? config.kudosAdminsGroup : undefined,
      kudosReviewersGroup: typeof config?.kudosReviewersGroup === 'string' ? config.kudosReviewersGroup : undefined,
      simulatedRole: config?.simulatedRole,
    }).then((resolved) => {
      if (!cancelled) { setRole(resolved); setRoleResolving(false); }
    }).catch(() => {
      if (!cancelled) { setRole('viewer'); setRoleResolving(false); }
    });
    return () => { cancelled = true; };
  }, [config?.kudosAdminsGroup, config?.kudosReviewersGroup, config?.simulatedRole, identity?.email]);
  const capabilities = React.useMemo(() => deriveKudosCapabilities(role), [role]);

  // Configurable overdue thresholds from webpart properties.
  const overdueThresholds: KudosOverdueThresholds = React.useMemo(() => ({
    pendingOverdueDays: typeof config?.pendingOverdueDays === 'number' ? config.pendingOverdueDays : DEFAULT_KUDOS_OVERDUE_THRESHOLDS.pendingOverdueDays,
    adminReviewOverdueDays: typeof config?.adminReviewOverdueDays === 'number' ? config.adminReviewOverdueDays : DEFAULT_KUDOS_OVERDUE_THRESHOLDS.adminReviewOverdueDays,
  }), [config?.pendingOverdueDays, config?.adminReviewOverdueDays]);

  const { listConfig, isLoading } = usePeopleCultureData();
  const allKudos: KudosEntry[] = React.useMemo(() => listConfig?.kudos ?? [], [listConfig?.kudos]);

  const [filter, dispatch] = React.useReducer(filterReducer, INITIAL_FILTER_STATE);
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(() => new Set());
  const [detailEntry, setDetailEntry] = React.useState<KudosEntry | undefined>();
  const [dispatching, setDispatching] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | undefined>();

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

  const handleDetailAction = React.useCallback(
    async (kind: DetailActionKind) => {
      if (!detailEntry) return;
      setActionError(undefined);
      let patch: KudosPatch;
      if (kind === 'reject') {
        // eslint-disable-next-line no-alert
        const reason = window.prompt('Rejection reason?');
        if (!reason || !reason.trim()) return;
        patch = { kind: 'reject', kudosId: detailEntry.id, rejectionReason: reason.trim() };
      } else if (kind === 'requestRevision') {
        // eslint-disable-next-line no-alert
        const guidance = window.prompt('Revision guidance for the submitter?');
        if (!guidance || !guidance.trim()) return;
        patch = { kind: 'requestRevision', kudosId: detailEntry.id, revisionGuidance: guidance.trim() };
      } else if (kind === 'flagAdminReview') {
        // eslint-disable-next-line no-alert
        const reason = window.prompt('Admin review reason?');
        if (!reason || !reason.trim()) return;
        patch = { kind: 'flagAdminReview', kudosId: detailEntry.id, adminReviewReason: reason.trim() };
      } else if (kind === 'clearAdminReview') {
        patch = { kind: 'clearAdminReview', kudosId: detailEntry.id };
      } else if (kind === 'schedule') {
        // eslint-disable-next-line no-alert
        const dateStr = window.prompt('Scheduled publish date (ISO)?');
        if (!dateStr?.trim()) return;
        patch = { kind: 'schedule', kudosId: detailEntry.id, scheduledPublishAtIso: dateStr.trim() };
      } else if (kind === 'unschedule') {
        patch = { kind: 'unschedule', kudosId: detailEntry.id };
      } else if (kind === 'pin') {
        // eslint-disable-next-line no-alert
        const orderStr = window.prompt('Pin order (1-3)?', '1');
        const pinOrder = Number(orderStr);
        patch = { kind: 'pin', kudosId: detailEntry.id, pinOrder: Number.isFinite(pinOrder) ? pinOrder : undefined };
      } else if (kind === 'unpin') {
        patch = { kind: 'unpin', kudosId: detailEntry.id };
      } else if (kind === 'feature') {
        // eslint-disable-next-line no-alert
        const expiresStr = window.prompt('Featured expires at (ISO, optional)?');
        patch = { kind: 'feature', kudosId: detailEntry.id, featuredExpiresAtIso: expiresStr?.trim() || undefined };
      } else if (kind === 'unfeature') {
        patch = { kind: 'unfeature', kudosId: detailEntry.id };
      } else if (kind === 'remove') {
        // eslint-disable-next-line no-alert
        const reason = window.prompt('Removal reason?');
        if (!reason?.trim()) return;
        patch = { kind: 'remove', kudosId: detailEntry.id, removedReason: reason.trim() };
      } else if (kind === 'restore') {
        patch = { kind: 'restore', kudosId: detailEntry.id };
      } else if (kind === 'claim') {
        patch = { kind: 'claim', kudosId: detailEntry.id };
      } else if (kind === 'reassign') {
        // eslint-disable-next-line no-alert
        const userIdStr = window.prompt('SharePoint user ID to reassign to?');
        const assignedUserId = Number(userIdStr);
        if (!Number.isFinite(assignedUserId) || assignedUserId <= 0) return;
        patch = { kind: 'reassign', kudosId: detailEntry.id, assignedUserId };
      } else if (kind === 'celebrate') {
        const currentCount = detailEntry.celebrateCount ?? 0;
        patch = { kind: 'celebrate', kudosId: detailEntry.id, nextCount: currentCount + 1 };
      } else {
        patch = { kind: 'approve', kudosId: detailEntry.id };
      }

      const siteUrl = getSiteUrl();
      if (!siteUrl) {
        setActionError('SharePoint site context is not available.');
        return;
      }
      setDispatching(true);
      try {
        const result = await submitKudosGovernanceAction(
          siteUrl,
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
      } finally {
        setDispatching(false);
      }
    },
    [detailEntry, identity?.email],
  );

  const handleBulkApprove = React.useCallback(async () => {
    if (!capabilities.canBulkApprove) return;
    if (selectedIds.size === 0) return;
    const siteUrl = getSiteUrl();
    if (!siteUrl) {
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
          siteUrl,
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}
      >
        <HbcSpinner size="md" />
      </section>
    );
  }

  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-webpart-phase="phase-14-kudos-prompt-03"
      data-hbc-role={role}
      aria-label="HB Kudos Approval Companion"
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          padding: '8px 4px 16px',
          borderBottom: '1px solid rgba(229, 126, 70, 0.18)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.625rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#225391',
              marginBottom: 4,
            }}
          >
            HB Kudos governance
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.375rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0a1b33',
            }}
          >
            {heading}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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

      {/* Tabs */}
      <div role="tablist" aria-label="Queue tabs" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {COMPANION_TABS.map((tab) => {
          const active = tab.id === filter.tabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => dispatch({ type: 'setTab', tabId: tab.id })}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1.5px solid',
                borderColor: active ? '#225391' : 'rgba(34, 83, 145, 0.18)',
                background: active ? '#225391' : '#ffffff',
                color: active ? '#ffffff' : 'rgba(26, 19, 16, 0.68)',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Queue filters"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(34, 83, 145, 0.04)',
          border: '1px solid rgba(34, 83, 145, 0.14)',
        }}
      >
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(26, 19, 16, 0.55)',
            }}
          >
            Search
          </span>
          <input
            type="search"
            value={filter.searchText ?? ''}
            onChange={(e) => dispatch({ type: 'setSearch', value: e.target.value })}
            placeholder="Search recognition…"
            style={{
              padding: '6px 10px',
              fontSize: '0.8125rem',
              borderRadius: 8,
              border: '1px solid rgba(229, 126, 70, 0.28)',
              outline: 'none',
              minWidth: 200,
            }}
          />
        </label>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(26, 19, 16, 0.55)',
            }}
          >
            Ownership
          </span>
          <select
            value={filter.ownership}
            onChange={(e) =>
              dispatch({
                type: 'setOwnership',
                ownership: e.target.value as KudosQueueFilterState['ownership'],
              })
            }
            style={{
              padding: '6px 8px',
              fontSize: '0.8125rem',
              borderRadius: 8,
              border: '1px solid rgba(229, 126, 70, 0.28)',
            }}
          >
            <option value="all">All</option>
            <option value="mine">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
            <option value="others">Assigned to others</option>
          </select>
        </label>

        <ToggleChip
          label="Flagged for admin"
          active={filter.adminReviewOnly}
          onToggle={() => dispatch({ type: 'toggleAdminReviewOnly' })}
        />
        <ToggleChip
          label="Scheduled only"
          active={filter.scheduledOnly}
          onToggle={() => dispatch({ type: 'toggleScheduledOnly' })}
        />
      </div>

      {/* Bulk-select bar */}
      {selectable && selectedIds.size > 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'linear-gradient(90deg, rgba(229, 126, 70, 0.10), rgba(34, 83, 145, 0.06))',
            border: '1px solid rgba(229, 126, 70, 0.25)',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1a1310' }}>
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={() => void handleBulkApprove()}
            disabled={dispatching}
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #e57e46 0%, #d4693a 100%)',
              border: 'none',
              borderRadius: 8,
              cursor: dispatching ? 'not-allowed' : 'pointer',
            }}
          >
            {dispatching ? 'Approving…' : 'Approve selected'}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            disabled={dispatching}
            style={{
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'rgba(26, 19, 16, 0.62)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      ) : null}

      {actionError ? (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(196, 49, 75, 0.08)',
            border: '1px solid rgba(196, 49, 75, 0.22)',
            color: '#c4314b',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          {actionError}
        </div>
      ) : null}

      {/* Queue list */}
      {queue.length === 0 ? (
        <HbcEmptyState
          title="No kudos match this view"
          description="Try a different tab, clear filters, or check back after the next submission."
        />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
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
    </section>
  );
}

// ---------------------------------------------------------------------------
// Toggle chip (local helper)
// ---------------------------------------------------------------------------

function ToggleChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      style={{
        padding: '5px 12px',
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 999,
        border: '1.5px solid',
        borderColor: active ? '#225391' : 'rgba(34, 83, 145, 0.2)',
        background: active ? 'rgba(34, 83, 145, 0.12)' : '#ffffff',
        color: active ? '#225391' : 'rgba(26, 19, 16, 0.55)',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}
