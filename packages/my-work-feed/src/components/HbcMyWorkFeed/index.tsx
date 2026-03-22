/**
 * HbcMyWorkFeed — SF29-T06
 *
 * Full workspace feed with grouping, filtering, search, and sorting.
 * State is component-local (D1).
 * Essential: flat HbcDataTable, no controls.
 * Standard: CommandBar + per-group HbcDataTable.
 * Expert: + sort + source health footer.
 *
 * UIF-002: Replaced HbcMyWorkListItem card list + grouped <button> headers with
 * HbcDataTable per group. Group headers are now <section> + <div> containing
 * a standalone <h3> and a separate collapse <button>, eliminating the illegal
 * button > h3 nesting and UA button background interference.
 *
 * Groups start expanded by default. collapsedGroups tracks what has been
 * manually collapsed rather than what is open, so initial render shows all items.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ColumnDef } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import {
  HbcCommandBar,
  HbcSpinner,
  HbcBanner,
  HbcDataTable,
  HbcButton,
  HbcStatusBadge,
  HbcTooltip,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_GRAY,
  HBC_STATUS_RAMP_INFO,
  HBC_RADIUS_LG,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  TRANSITION_FAST,
  heading4,
  bodySmall,
  hbcBrandRamp,
  useDensity,
} from '@hbc/ui-kit';
import { ChevronDown } from '@hbc/ui-kit/icons';
import { useMyWork } from '../../hooks/useMyWork.js';
import { useMyWorkActions } from '../../hooks/useMyWorkActions.js';
import { HbcMyWorkOfflineBanner } from '../HbcMyWorkOfflineBanner/index.js';
import { HbcMyWorkEmptyState } from '../HbcMyWorkEmptyState/index.js';
import { HbcMyWorkSourceHealth } from '../HbcMyWorkSourceHealth/index.js';
import { resolveCtaAction } from '../../utils/resolveCtaLabel.js';
import { formatModuleLabel } from '../../utils/formatModuleLabel.js';
import type { IMyWorkItem, IMyWorkQuery, MyWorkState } from '../../types/index.js';
import type { StatusVariant } from '@hbc/ui-kit';

export interface IHbcMyWorkFeedProps {
  query?: IMyWorkQuery;
  onItemSelect?: (item: IMyWorkItem) => void;
  onOpenReasonDrawer?: (itemId: string) => void;
  /** UIF-001a: ID of the currently active/detail-viewed item for row highlighting. */
  activeItemId?: string;
  /** UIF-008: External KPI filter key (e.g. 'action-now', 'blocked', 'unread'). */
  kpiFilter?: string | null;
  /** UIF-020-addl: Callback to clear the active KPI filter. */
  onClearKpiFilter?: () => void;
  className?: string;
}

type GroupingKey = 'lane' | 'priority' | 'project' | 'module';
type SortKey = 'rank' | 'updated' | 'created';

interface IActiveFilters {
  overdue: boolean;
  blocked: boolean;
  unread: boolean;
}

const GROUPINGS: Record<GroupingKey, (item: IMyWorkItem) => string> = {
  lane: (item) => item.lane,
  priority: (item) => item.priority,
  project: (item) => item.context.projectName ?? item.context.projectId ?? 'No Project',
  module: (item) => item.context.moduleKey,
};

/**
 * UIF-001: Human-readable labels for MyWorkLane slug values.
 * MB-01 — no developer-internal labels visible to users.
 */
const LANE_LABELS: Record<string, string> = {
  'do-now': 'Action Required',
  'waiting-blocked': 'Waiting / Blocked',
  watch: 'Watching',
  'delegated-team': 'Delegated to Team',
  deferred: 'Deferred',
};

/**
 * UIF-001: Lane-color left border accent using status ramp tokens.
 * Governed by UI-Kit-Visual-Language-Guide.md status color ramps.
 */
const LANE_COLORS: Record<string, string> = {
  'waiting-blocked': HBC_STATUS_RAMP_RED[50],
  'do-now': HBC_STATUS_RAMP_AMBER[50],
  watch: HBC_STATUS_RAMP_GRAY[50],
  'delegated-team': HBC_STATUS_RAMP_INFO[50],
  deferred: HBC_STATUS_RAMP_GRAY[50],
};

/**
 * UIF-020-addl: Priority-group human-readable labels.
 */
const PRIORITY_LABELS: Record<string, string> = {
  now: 'Now',
  soon: 'Soon',
  watch: 'Watching',
  deferred: 'Deferred',
};

/**
 * UIF-020-addl: Priority-group display order — Now first (highest urgency).
 */
const PRIORITY_ORDER: string[] = ['now', 'soon', 'watch', 'deferred'];

/**
 * UIF-020-addl: Priority-group left-border accent colors.
 */
const PRIORITY_COLORS: Record<string, string> = {
  now: HBC_STATUS_RAMP_RED[50],
  soon: HBC_STATUS_RAMP_AMBER[50],
  watch: HBC_STATUS_RAMP_GRAY[50],
  deferred: HBC_STATUS_RAMP_GRAY[50],
};

/**
 * Lane-container: Module-group accent colors. Uses info ramp so module groups
 * are visually distinct from lane/priority groups.
 */
const MODULE_COLORS: Record<string, string> = {
  'bic-next-move': HBC_STATUS_RAMP_INFO[50],
  'workflow-handoff': HBC_STATUS_RAMP_INFO[30],
  'acknowledgment': HBC_STATUS_RAMP_GRAY[50],
  'notification-intelligence': HBC_STATUS_RAMP_AMBER[30],
  'session-state': HBC_STATUS_RAMP_GRAY[30],
  'module': HBC_STATUS_RAMP_INFO[50],
};

/** Fallback accent for project and unknown groupings. */
const DEFAULT_GROUP_ACCENT = HBC_STATUS_RAMP_GRAY[30];

/** Construction/business domain acronyms that must stay uppercase in titles. */
const DOMAIN_ACRONYMS = new Set(['bd', 'rfi', 'pm', 'pmp', 'qc', 'hse', 'mep', 'hvac', 'bim', 'spfx']);

/**
 * UIF-020-addl: Lane-group display order for consistent rendering.
 */
const LANE_ORDER: string[] = ['waiting-blocked', 'do-now', 'watch', 'delegated-team', 'deferred'];

/**
 * UIF-008-addl: Human-readable display labels for MyWorkState values.
 * Ensures the STATUS column shows a meaningful badge for every row.
 */
const STATE_DISPLAY_LABELS: Record<MyWorkState, string> = {
  new: 'New',
  active: 'In Progress',
  blocked: 'Blocked',
  waiting: 'Waiting',
  deferred: 'Deferred',
  superseded: 'Superseded',
  completed: 'Completed',
};

/**
 * UIF-008-addl: Badge variant mapping for MyWorkState values.
 */
const STATE_BADGE_VARIANT: Record<MyWorkState, StatusVariant> = {
  new: 'info',
  active: 'inProgress',
  blocked: 'error',
  waiting: 'warning',
  deferred: 'neutral',
  superseded: 'neutral',
  completed: 'completed',
};

/** Lane-container: Acronym-aware group label formatting.
 * Known domain acronyms (BD, RFI, PM, etc.) stay uppercase instead of
 * being naively title-cased to "Bd", "Rfi", etc. */
function formatGroupLabel(key: string): string {
  return (
    PRIORITY_LABELS[key] ??
    LANE_LABELS[key] ??
    key
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => DOMAIN_ACRONYMS.has(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function sortItems(items: IMyWorkItem[], sortKey: SortKey): IMyWorkItem[] {
  if (sortKey === 'rank') return items;
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aDate = sortKey === 'updated' ? a.timestamps.updatedAtIso : a.timestamps.createdAtIso;
    const bDate = sortKey === 'updated' ? b.timestamps.updatedAtIso : b.timestamps.createdAtIso;
    return bDate.localeCompare(aDate);
  });
  return sorted;
}

function groupItems(
  items: IMyWorkItem[],
  groupFn: (item: IMyWorkItem) => string,
): Array<{ groupKey: string; items: IMyWorkItem[] }> {
  const groups = new Map<string, IMyWorkItem[]>();
  for (const item of items) {
    const key = groupFn(item);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return Array.from(groups.entries()).map(([groupKey, groupItems]) => ({
    groupKey,
    items: groupItems,
  }));
}

// ─── Column cell helpers ─────────────────────────────────────────────────────

// UIF-016: Deterministic project color from hbcBrandRamp categorical stops.
const PROJECT_COLOR_STOPS = [40, 60, 80, 100, 120, 140] as const;

function resolveProjectColor(projectId: string | undefined): string {
  if (!projectId) return hbcBrandRamp[80];
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = ((hash << 5) - hash + projectId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % PROJECT_COLOR_STOPS.length;
  return hbcBrandRamp[PROJECT_COLOR_STOPS[idx]];
}

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDueDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `Due ${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

// UIF-019-followup: resolveTableHeight removed — HbcDataTable default is now
// height='auto' (full content height, no scroll). estimatedRowHeight is still
// passed for the virtualizer's size estimation.
const ESTIMATED_ROW_HEIGHT = 48;

// ─── Work item column definitions ───────────────────────────────────────────

/**
 * Builds the ColumnDef array for IMyWorkItem tables.
 * Stable reference is guaranteed by the useMemo call in HbcMyWorkFeed.
 * onItemSelect is threaded through closure so columns do not need to be
 * rebuilt on every render — it is captured once and remains stable as long
 * as the parent memoizes correctly.
 */
function buildWorkItemColumns(
  onItemSelect: ((item: IMyWorkItem) => void) | undefined,
  ctaButtonSize: 'md' | 'lg' = 'md',
): ColumnDef<IMyWorkItem, unknown>[] {
  return [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Work Item',
      // Table-layout-fix: reduced from 340→200 to prevent 820px total exceeding ~670px container.
      // With table-layout:fixed + width:100%, these sizes distribute proportionally.
      size: 200,
      cell: ({ row }) => {
        const item = row.original;
        const isWatchMuted = item.lane === 'watch' && !item.isUnread && !item.isBlocked;
        const titleColor = isWatchMuted
          ? HBC_STATUS_RAMP_INFO[30]
          : HBC_STATUS_RAMP_INFO[50];
        const accentBorder = item.isBlocked
          ? `3px solid ${HBC_STATUS_RAMP_RED[50]}`
          : item.isUnread
          ? '3px solid var(--colorBrandForeground1)'
          : undefined;

        // UIF-006-addl: HbcTooltip shows full title on hover for truncated items.
        const inner = (
          <HbcTooltip content={item.title}>
            <span
              style={{
                fontWeight: item.isUnread ? 600 : 400,
                fontSize: bodySmall.fontSize,
                lineHeight: bodySmall.lineHeight,
                color: item.context.href ? titleColor : 'var(--colorNeutralForeground1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {item.title}
            </span>
          </HbcTooltip>
        );

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderLeft: accentBorder,
              paddingLeft: accentBorder ? '6px' : undefined,
              overflow: 'hidden',
            }}
          >
            {item.context.href ? (
              <a
                href={item.context.href}
                onClick={(e) => {
                  if (onItemSelect) {
                    e.preventDefault();
                    onItemSelect(item);
                  }
                }}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  overflow: 'hidden',
                  display: 'block',
                  width: '100%',
                }}
              >
                {inner}
              </a>
            ) : (
              inner
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      size: 80,
      cell: ({ row }) => {
        const item = row.original;
        const tags: React.ReactNode[] = [];
        if (item.isOverdue) {
          tags.push(
            // UIF-023-addl: medium size ensures consistent filled-pill rendering.
            <HbcStatusBadge key="overdue" variant="error" label="Overdue" size="medium" />,
          );
        }
        if (item.isBlocked) {
          tags.push(
            <HbcStatusBadge key="blocked" variant="warning" label="Blocked" size="medium" />,
          );
        }
        // UIF-008-addl: Show item state when no urgency flags — every row gets a status badge.
        if (tags.length === 0) {
          tags.push(
            <HbcStatusBadge
              key="state"
              variant={STATE_BADGE_VARIANT[item.state]}
              label={STATE_DISPLAY_LABELS[item.state]}
              size="medium"
            />,
          );
        }
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tags}
          </div>
        );
      },
    },
    {
      id: 'source',
      header: 'Source',
      size: 120,
      cell: ({ row }) => {
        const item = row.original;
        const projectColor = resolveProjectColor(item.context.projectId);
        // Row-content-fix: only show project name when it's real data, not a placeholder dash.
        const projectName = item.context.projectName ?? item.context.projectId ?? null;
        const moduleLabel = formatModuleLabel(item.context.moduleKey);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            {/* Row-content-fix: Project dot only when project name exists */}
            {projectName && <span
              aria-hidden="true"
              title={projectName}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: projectColor,
                flexShrink: 0,
              }}
            />}
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              {/* Row-content-fix: Only render project name when it exists.
                  Placeholder dash removed — empty source cells show only the module chip. */}
              {projectName && (
                <HbcTooltip content={projectName}>
                  <div
                    style={{
                      fontSize: bodySmall.fontSize,
                      color: 'var(--colorNeutralForeground1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {projectName}
                  </div>
                </HbcTooltip>
              )}
              {/* UIF-006/010-addl: Module chip with border + tooltip */}
              <HbcTooltip content={moduleLabel}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    lineHeight: '1.5',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--colorNeutralBackground4)',
                    border: '1px solid var(--colorNeutralStroke2)',
                    color: 'var(--colorNeutralForeground3)',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {moduleLabel}
                </span>
              </HbcTooltip>
            </div>
          </div>
        );
      },
    },
    {
      id: 'dueDate',
      accessorKey: 'dueDateIso',
      header: 'Due',
      size: 70,
      cell: ({ row }) => {
        const item = row.original;
        if (!item.dueDateIso) {
          return (
            <span style={{ color: 'var(--colorNeutralForeground4)', fontSize: bodySmall.fontSize }}>
              —
            </span>
          );
        }
        return (
          <span
            style={{
              fontSize: bodySmall.fontSize,
              color: item.isOverdue ? HBC_STATUS_RAMP_RED[50] : 'var(--colorNeutralForeground2)',
              fontWeight: item.isOverdue ? 600 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {formatDueDate(item.dueDateIso)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => {
        const item = row.original;
        // UIF-007: CTA label + variant differentiated by lane/status.
        const cta = resolveCtaAction(item);
        return (
          // UIF-016-addl: density-aware size via ctaButtonSize (md at compact, lg at comfortable/touch).
          <HbcButton
            variant={cta.variant}
            size={ctaButtonSize}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (onItemSelect) {
                onItemSelect(item);
              } else if (item.context.href) {
                window.location.href = item.context.href;
              }
            }}
          >
            {cta.label}
          </HbcButton>
        );
      },
    },
  ];
}

export function HbcMyWorkFeed({
  query,
  onItemSelect,
  onOpenReasonDrawer: _onOpenReasonDrawer,
  activeItemId,
  kpiFilter,
  onClearKpiFilter,
  className,
}: IHbcMyWorkFeedProps): JSX.Element {
  const { tier } = useComplexity();
  const { tier: rawDensityTier, setOverride: setDensityOverride } = useDensity();
  // UIF-015-addl: Map density.ts 'comfortable' → HbcCommandBar 'standard' for type compat.
  const densityTier = rawDensityTier === 'comfortable' ? 'standard' as const : rawDensityTier;
  // UIF-016-addl: Density-aware CTA button size.
  // compact → 'md' (36px ≥ 32px min), comfortable/touch → 'lg' (44px ≥ 40px/44px min).
  const ctaButtonSize = rawDensityTier === 'compact' ? 'md' as const : 'lg' as const;
  const { feed, isLoading, isError } = useMyWork({ query });
  const { executeAction: _executeAction } = useMyWorkActions();

  const [searchTerm, setSearchTerm] = useState('');
  // UIF-020-addl: Default to priority grouping with "Now" expanded, others collapsed.
  const [groupingKey, setGroupingKey] = useState<GroupingKey>('priority');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  // Track collapsed groups — groups absent from this set are expanded.
  // Priority default: all groups except 'now' start collapsed.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(PRIORITY_ORDER.filter((k) => k !== 'now')),
  );
  const [activeFilters, setActiveFilters] = useState<IActiveFilters>({
    overdue: false,
    blocked: false,
    unread: false,
  });

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // UIF-020-addl: Reset collapse state when grouping mode changes.
  // Priority mode: "Now" expanded, others collapsed. Other modes: all expanded.
  useEffect(() => {
    if (groupingKey === 'priority') {
      setCollapsedGroups(new Set(PRIORITY_ORDER.filter((k) => k !== 'now')));
    } else {
      setCollapsedGroups(new Set());
    }
  }, [groupingKey]);

  // UIF-002: Stable column definitions — rebuilt when onItemSelect or density changes.
  const workItemColumns = useMemo(
    () => buildWorkItemColumns(onItemSelect, ctaButtonSize),
    [onItemSelect, ctaButtonSize],
  );

  const processedItems = useMemo(() => {
    if (!feed?.items) return [];

    let items = feed.items;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.summary.toLowerCase().includes(term),
      );
    }

    // Apply toggle filters
    if (activeFilters.overdue) {
      items = items.filter((item) => item.isOverdue);
    }
    if (activeFilters.blocked) {
      items = items.filter((item) => item.isBlocked);
    }
    if (activeFilters.unread) {
      items = items.filter((item) => item.isUnread);
    }

    // UIF-008: External KPI filter from page-level click-to-filter
    if (kpiFilter === 'action-now') {
      items = items.filter((item) => item.priority === 'now');
    } else if (kpiFilter === 'blocked') {
      items = items.filter((item) => item.isBlocked);
    } else if (kpiFilter === 'unread') {
      items = items.filter((item) => item.isUnread);
    } else if (kpiFilter === 'escalation') {
      // UIF-013-addl: Escalation candidates = overdue OR blocked
      items = items.filter((item) => item.isOverdue || item.isBlocked || item.state === 'blocked');
    } else if (kpiFilter === 'aging') {
      // UIF-013-addl: Aging = overdue items
      items = items.filter((item) => item.isOverdue);
    }
    // 'total' or null = no additional KPI filtering

    // Sort
    items = sortItems(items, sortKey);

    return items;
  }, [feed?.items, searchTerm, activeFilters, kpiFilter, sortKey]);

  const groups = useMemo(() => {
    if (tier === 'essential') return [];
    const raw = groupItems(processedItems, GROUPINGS[groupingKey]);
    // UIF-020-addl: Sort groups by defined order for priority and lane modes.
    if (groupingKey === 'priority') {
      raw.sort((a, b) => {
        const ai = PRIORITY_ORDER.indexOf(a.groupKey);
        const bi = PRIORITY_ORDER.indexOf(b.groupKey);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    } else if (groupingKey === 'lane') {
      raw.sort((a, b) => {
        const ai = LANE_ORDER.indexOf(a.groupKey);
        const bi = LANE_ORDER.indexOf(b.groupKey);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    }
    return raw;
  }, [processedItems, groupingKey, tier]);

  const hasItems = processedItems.length > 0;

  // UIF-012: Compute filter counts from the base feed (unfiltered) so counts
  // reflect the total matching items regardless of which filters are active.
  const feedItems = feed?.items ?? [];
  const overdueCount = feedItems.filter((i) => i.isOverdue).length;
  const blockedCount = feedItems.filter((i) => i.isBlocked).length;
  const unreadCount = feedItems.filter((i) => i.isUnread).length;

  // Build CommandBar filters
  const filters = [
    {
      key: 'overdue',
      label: 'Overdue',
      active: activeFilters.overdue,
      onToggle: () => setActiveFilters((f) => ({ ...f, overdue: !f.overdue })),
      count: overdueCount,
      urgency: 'error' as const,
    },
    {
      key: 'blocked',
      label: 'Blocked',
      active: activeFilters.blocked,
      onToggle: () => setActiveFilters((f) => ({ ...f, blocked: !f.blocked })),
      count: blockedCount,
      urgency: 'warning' as const,
    },
    {
      key: 'unread',
      label: 'Unread',
      active: activeFilters.unread,
      onToggle: () => setActiveFilters((f) => ({ ...f, unread: !f.unread })),
      count: unreadCount,
      urgency: 'neutral' as const,
    },
  ];

  // UIF-010: Grouping controls rendered as a visible radiogroup row in HbcCommandBar.
  // Each entry reflects the active groupingKey so the selected option shows filled active state.
  const groupings = (['lane', 'priority', 'project', 'module'] as const).map((key) => ({
    key: `group-${key}`,
    label: `Group by ${key}`,
    active: groupingKey === key,
    onSelect: () => setGroupingKey(key),
  }));

  // Sort controls remain in overflow menu (expert-only progressive disclosure).
  const overflowActions =
    tier === 'expert'
      ? (['rank', 'updated', 'created'] as const).map((key) => ({
          key: `sort-${key}`,
          label: `Sort by ${key}`,
          onClick: () => setSortKey(key),
        }))
      : [];

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
    >
      <HbcMyWorkOfflineBanner />

      {tier !== 'essential' && (
        <HbcCommandBar
          filters={filters}
          groupings={groupings}
          overflowActions={overflowActions.length > 0 ? overflowActions : undefined}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search work items…"
          densityTier={densityTier}
          onDensityChange={(t) => setDensityOverride(t as 'compact' | 'comfortable' | 'touch')}
        />
      )}

      {isLoading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '32px 0',
          }}
        >
          <HbcSpinner size="md" />
        </div>
      )}

      {isError && !isLoading && (
        <HbcBanner variant="error">Unable to load work items. Please try again.</HbcBanner>
      )}

      {!isLoading && !isError && !hasItems && (
        <HbcMyWorkEmptyState
          variant="feed"
          kpiFilter={kpiFilter}
          isDegraded={(feed?.healthState?.degradedSourceCount ?? 0) > 0}
          onClearFilter={onClearKpiFilter}
        />
      )}

      {!isLoading && !isError && hasItems && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {tier === 'essential' ? (
            // UIF-002: HbcDataTable replaces card list for all tiers.
            // Essential tier renders a single ungrouped table.
            <HbcDataTable
              data={processedItems}
              columns={workItemColumns}
              isLoading={false}
              estimatedRowHeight={ESTIMATED_ROW_HEIGHT}
              mobileCardFields={['title', 'dueDateIso']}
              activeRowId={activeItemId}
              onRowClick={(item) => {
                if (onItemSelect) {
                  onItemSelect(item);
                } else if (item.context.href) {
                  window.location.href = item.context.href;
                }
              }}
            />
          ) : (<>
            {/* Row-content-fix: Warning when project grouping has no project data. */}
            {groupingKey === 'project' && groups.length === 1 && groups[0].groupKey === 'No Project' && (
              <HbcBanner variant="info">
                No project data available for these items. Assign projects to enable meaningful grouping.
              </HbcBanner>
            )}
            {groups.map((group) => {
              const isExpanded = !collapsedGroups.has(group.groupKey);
              const label = formatGroupLabel(group.groupKey);
              // Lane-container: accent color cascade — priority → lane → module → default.
              // No grouping mode falls to transparent.
              const laneColor = PRIORITY_COLORS[group.groupKey]
                ?? LANE_COLORS[group.groupKey]
                ?? MODULE_COLORS[group.groupKey]
                ?? DEFAULT_GROUP_ACCENT;
              // Stable IDs for ARIA labelling.
              const headerId = `my-work-group-hdr-${group.groupKey}`;
              const bodyId = `my-work-group-body-${group.groupKey}`;

              return (
                // UIF-002: <section> wraps each lane group. The group header is a
                // plain <div> containing a semantic <h3> and a standalone collapse
                // <button>. This eliminates the illegal button > h3 HTML and allows
                // Fluent UI CSS tokens on the header div to resolve correctly (no UA
                // button background interference).
                <section
                  key={group.groupKey}
                  data-lane={group.groupKey}
                  aria-label={label}
                  style={{
                    borderRadius: HBC_RADIUS_LG,
                    border: '1px solid var(--colorNeutralStroke2)',
                    // Table-layout-fix: overflowX hidden prevents horizontal bleed while
                    // overflowY visible preserves row expansion.
                    overflowX: 'hidden',
                    overflowY: 'visible',
                  }}
                >
                  {/* Group header — div, not button, so UA background does not override tokens */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`,
                      backgroundColor: isExpanded
                        ? 'var(--colorNeutralBackground2)'
                        : 'var(--colorNeutralBackground3)',
                      // UIF-001 + UIF-005: Lane-color left border accent (expanded only)
                      borderLeft: isExpanded
                        ? `4px solid ${laneColor}`
                        : '4px solid transparent',
                      // Separator between header and table body
                      borderBottom: isExpanded
                        ? '1px solid var(--colorNeutralStroke2)'
                        : undefined,
                      // UIF-001: Sticky lane headers (MB-03)
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {/* Left: heading + count badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3
                        id={headerId}
                        style={{
                          margin: 0,
                          fontWeight: heading4.fontWeight,
                          fontSize: heading4.fontSize,
                          lineHeight: heading4.lineHeight,
                          color: 'var(--colorNeutralForeground1)',
                          letterSpacing: '0.01em',
                          opacity: isExpanded ? 1 : 0.7,
                          transition: `opacity ${TRANSITION_FAST} ease`,
                        }}
                      >
                        {label}
                      </h3>
                      <span
                        aria-label={`${group.items.length} items`}
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--colorNeutralBackground4)',
                          color: 'var(--colorNeutralForeground2)',
                          minWidth: '22px',
                          textAlign: 'center',
                          lineHeight: '1.4',
                          opacity: isExpanded ? 1 : 0.7,
                          transition: `opacity ${TRANSITION_FAST} ease`,
                        }}
                      >
                        {group.items.length}
                      </span>
                    </div>

                    {/* Right: standalone collapse toggle */}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={bodyId}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
                      onClick={() => toggleGroup(group.groupKey)}
                      style={{
                        // Full UA reset — appearance does not apply to color/bg
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        border: 'none',
                        background: 'transparent',
                        padding: '4px',
                        margin: 0,
                        cursor: 'pointer',
                        // Flex icon centering
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--colorNeutralForeground3)',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          // UIF-005: 0° expanded (down), −90° collapsed (right)
                          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: `transform ${TRANSITION_FAST} ease`,
                        }}
                      >
                        <ChevronDown size="sm" />
                      </span>
                    </button>
                  </div>

                  {/* Group body — HbcDataTable per lane */}
                  {isExpanded && (
                    <div
                      id={bodyId}
                      role="region"
                      aria-labelledby={headerId}
                    >
                      <HbcDataTable
                        data={group.items}
                        columns={workItemColumns}
                        isLoading={false}
                        estimatedRowHeight={ESTIMATED_ROW_HEIGHT}
                        mobileCardFields={['title', 'dueDateIso']}
                        activeRowId={activeItemId}
                        onRowClick={(item) => {
                          if (onItemSelect) {
                            onItemSelect(item);
                          } else if (item.context.href) {
                            window.location.href = item.context.href;
                          }
                        }}
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </>)}
        </div>
      )}

      {tier === 'expert' && feed?.healthState && (
        <HbcMyWorkSourceHealth healthState={feed.healthState} />
      )}
    </div>
  );
}
