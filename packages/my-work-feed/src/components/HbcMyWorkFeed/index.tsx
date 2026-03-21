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

import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef } from '@hbc/ui-kit';
import { useComplexity } from '@hbc/complexity';
import {
  HbcCommandBar,
  HbcSpinner,
  HbcBanner,
  HbcDataTable,
  HbcButton,
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
} from '@hbc/ui-kit';
import { ChevronDown } from '@hbc/ui-kit/icons';
import { useMyWork } from '../../hooks/useMyWork.js';
import { useMyWorkActions } from '../../hooks/useMyWorkActions.js';
import { HbcMyWorkOfflineBanner } from '../HbcMyWorkOfflineBanner/index.js';
import { HbcMyWorkEmptyState } from '../HbcMyWorkEmptyState/index.js';
import { HbcMyWorkSourceHealth } from '../HbcMyWorkSourceHealth/index.js';
import { resolveCtaAction } from '../../utils/resolveCtaLabel.js';
import { formatModuleLabel } from '../../utils/formatModuleLabel.js';
import type { IMyWorkItem, IMyWorkQuery } from '../../types/index.js';

export interface IHbcMyWorkFeedProps {
  query?: IMyWorkQuery;
  onItemSelect?: (item: IMyWorkItem) => void;
  onOpenReasonDrawer?: (itemId: string) => void;
  /** UIF-008: External KPI filter key (e.g. 'action-now', 'blocked', 'unread'). */
  kpiFilter?: string | null;
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

function formatGroupLabel(key: string): string {
  return (
    LANE_LABELS[key] ??
    key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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

// ─── Column height sizing ────────────────────────────────────────────────────
/** Estimated row height for HbcDataTable virtualizer (px). */
const ESTIMATED_ROW_HEIGHT = 48;
/** Header row height (px) — matches HbcDataTable thead. */
const TABLE_HEADER_HEIGHT = 44;

/**
 * Returns a px height string for HbcDataTable sized to content.
 * Avoids the default 600px allocation for groups with few items.
 */
function resolveTableHeight(itemCount: number): string {
  return `${itemCount * ESTIMATED_ROW_HEIGHT + TABLE_HEADER_HEIGHT}px`;
}

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
): ColumnDef<IMyWorkItem, unknown>[] {
  return [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Work Item',
      size: 280,
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

        const inner = (
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
      size: 120,
      cell: ({ row }) => {
        const item = row.original;
        const tags: React.ReactNode[] = [];
        if (item.isOverdue) {
          tags.push(
            <span
              key="overdue"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: HBC_STATUS_RAMP_RED[90],
                color: HBC_STATUS_RAMP_RED[30],
                whiteSpace: 'nowrap',
              }}
            >
              Overdue
            </span>,
          );
        }
        if (item.isBlocked) {
          tags.push(
            <span
              key="blocked"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: HBC_STATUS_RAMP_AMBER[90],
                color: HBC_STATUS_RAMP_AMBER[30],
                whiteSpace: 'nowrap',
              }}
            >
              Blocked
            </span>,
          );
        }
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tags.length > 0 ? tags : (
              <span style={{ color: 'var(--colorNeutralForeground4)', fontSize: '0.6875rem' }}>—</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'source',
      header: 'Source',
      size: 160,
      cell: ({ row }) => {
        const item = row.original;
        const projectColor = resolveProjectColor(item.context.projectId);
        const projectName = item.context.projectName ?? item.context.projectId ?? '—';
        const moduleLabel = formatModuleLabel(item.context.moduleKey);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <span
              aria-hidden="true"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: projectColor,
                flexShrink: 0,
              }}
            />
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
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
              {/* UIF-006: Module label as neutral chip — no raw kebab keys exposed */}
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  lineHeight: '1.5',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--colorNeutralBackground4)',
                  color: 'var(--colorNeutralForeground3)',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {moduleLabel}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'dueDate',
      accessorKey: 'dueDateIso',
      header: 'Due',
      size: 100,
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
      size: 120,
      cell: ({ row }) => {
        const item = row.original;
        // UIF-007: CTA label + variant differentiated by lane/status.
        const cta = resolveCtaAction(item);
        return (
          <HbcButton
            variant={cta.variant}
            size="sm"
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
  kpiFilter,
  className,
}: IHbcMyWorkFeedProps): JSX.Element {
  const { tier } = useComplexity();
  const { feed, isLoading, isError } = useMyWork({ query });
  const { executeAction: _executeAction } = useMyWorkActions();

  const [searchTerm, setSearchTerm] = useState('');
  const [groupingKey, setGroupingKey] = useState<GroupingKey>('lane');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  // Track collapsed groups — groups start expanded (absent from this set = expanded).
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
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

  // UIF-002: Stable column definitions — rebuilt only when onItemSelect identity changes.
  const workItemColumns = useMemo(
    () => buildWorkItemColumns(onItemSelect),
    [onItemSelect],
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
    }
    // 'total' or null = no additional KPI filtering

    // Sort
    items = sortItems(items, sortKey);

    return items;
  }, [feed?.items, searchTerm, activeFilters, kpiFilter, sortKey]);

  const groups = useMemo(() => {
    if (tier === 'essential') return [];
    return groupItems(processedItems, GROUPINGS[groupingKey]);
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
          searchPlaceholder="Search work items\u2026"
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

      {!isLoading && !isError && !hasItems && <HbcMyWorkEmptyState variant="feed" />}

      {!isLoading && !isError && hasItems && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {tier === 'essential' ? (
            // UIF-002: HbcDataTable replaces card list for all tiers.
            // Essential tier renders a single ungrouped table.
            <HbcDataTable
              data={processedItems}
              columns={workItemColumns}
              isLoading={false}
              height={resolveTableHeight(processedItems.length)}
              estimatedRowHeight={ESTIMATED_ROW_HEIGHT}
              mobileCardFields={['title', 'dueDateIso']}
              onRowClick={(item) => {
                if (onItemSelect) {
                  onItemSelect(item);
                } else if (item.context.href) {
                  window.location.href = item.context.href;
                }
              }}
            />
          ) : (
            groups.map((group) => {
              const isExpanded = !collapsedGroups.has(group.groupKey);
              const label = formatGroupLabel(group.groupKey);
              const laneColor = LANE_COLORS[group.groupKey] ?? 'transparent';
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
                    overflow: 'hidden',
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
                        height={resolveTableHeight(group.items.length)}
                        estimatedRowHeight={ESTIMATED_ROW_HEIGHT}
                        mobileCardFields={['title', 'dueDateIso']}
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
            })
          )}
        </div>
      )}

      {tier === 'expert' && feed?.healthState && (
        <HbcMyWorkSourceHealth healthState={feed.healthState} />
      )}
    </div>
  );
}
