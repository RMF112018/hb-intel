/**
 * HbcMyWorkFeed — SF29-T06
 *
 * Full workspace feed with grouping, filtering, search, and sorting.
 * State is component-local (D1). Reuses HbcMyWorkListItem (D2).
 * Essential: flat list, no controls. Standard: CommandBar + grouping.
 * Expert: + sort + source health footer.
 *
 * Groups start expanded by default. collapsedGroups tracks what has been
 * manually collapsed rather than what is open, so initial render shows all items.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcCommandBar, HbcSpinner, HbcBanner } from '@hbc/ui-kit';
import { ChevronDown } from '@hbc/ui-kit/icons';
import { useMyWork } from '../../hooks/useMyWork.js';
import { useMyWorkActions } from '../../hooks/useMyWorkActions.js';
import { HbcMyWorkOfflineBanner } from '../HbcMyWorkOfflineBanner/index.js';
import { HbcMyWorkListItem } from '../HbcMyWorkListItem/index.js';
import { HbcMyWorkEmptyState } from '../HbcMyWorkEmptyState/index.js';
import { HbcMyWorkSourceHealth } from '../HbcMyWorkSourceHealth/index.js';
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
 * Human-readable labels for MyWorkLane slug values.
 * Falls back to title-casing the slug for any unlisted values.
 */
const LANE_LABELS: Record<string, string> = {
  'do-now': 'Do Now',
  'waiting-blocked': 'Waiting / Blocked',
  watch: 'Watch',
  'delegated-team': 'Delegated to Team',
  deferred: 'Deferred',
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

export function HbcMyWorkFeed({
  query,
  onItemSelect,
  onOpenReasonDrawer: _onOpenReasonDrawer,
  kpiFilter,
  className,
}: IHbcMyWorkFeedProps): JSX.Element {
  const { tier } = useComplexity();
  const { feed, isLoading, isError } = useMyWork({ query });
  const { executeAction } = useMyWorkActions();

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

  // Build CommandBar actions (grouping selector + sort for expert)
  const actions = [
    ...(['lane', 'priority', 'project', 'module'] as const).map((key) => ({
      key: `group-${key}`,
      label: `Group by ${key}`,
      active: groupingKey === key,
      onClick: () => setGroupingKey(key),
    })),
    ...(tier === 'expert'
      ? (['rank', 'updated', 'created'] as const).map((key) => ({
          key: `sort-${key}`,
          label: `Sort by ${key}`,
          active: sortKey === key,
          onClick: () => setSortKey(key),
        }))
      : []),
  ];

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
    >
      <HbcMyWorkOfflineBanner />

      {tier !== 'essential' && (
        <HbcCommandBar
          filters={filters}
          actions={actions}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
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
            <div
              style={{
                borderRadius: '6px',
                border: '1px solid var(--colorNeutralStroke2)',
                overflow: 'hidden',
              }}
            >
              {processedItems.map((item) => (
                <HbcMyWorkListItem
                  key={item.workItemId}
                  item={item}
                  onAction={(request) => {
                    executeAction(request);
                    onItemSelect?.(request.item);
                  }}
                />
              ))}
            </div>
          ) : (
            groups.map((group) => {
              const isExpanded = !collapsedGroups.has(group.groupKey);
              return (
                <div
                  key={group.groupKey}
                  style={{
                    borderRadius: '6px',
                    border: '1px solid var(--colorNeutralStroke2)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Group header
                      border: 'none' MUST precede borderBottom — border is a
                      shorthand that resets all sides; placing it first lets
                      borderBottom win as the last-declared property. */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.groupKey)}
                    aria-expanded={isExpanded}
                    style={{
                      // Reset UA button styles first (UIF-001)
                      appearance: 'none' as const,
                      WebkitAppearance: 'none' as const,
                      border: 'none',
                      outline: 'none',
                      // Layout
                      width: '100%',
                      boxSizing: 'border-box' as const,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      // Spacing & surface
                      padding: '10px 14px',
                      backgroundColor: isExpanded
                        ? 'var(--colorNeutralBackground2)'
                        : 'var(--colorNeutralBackground3)',
                      // Separator — declared after border: none so it wins
                      borderBottom: isExpanded
                        ? '1px solid var(--colorNeutralStroke2)'
                        : '0',
                      // Typography & interaction
                      cursor: 'pointer',
                      color: 'var(--colorNeutralForeground1)',
                      userSelect: 'none' as const,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          lineHeight: '1.25',
                          color: 'var(--colorNeutralForeground1)',
                          letterSpacing: '0.01em',
                          opacity: isExpanded ? 1 : 0.7,
                          transition: 'opacity 200ms ease',
                        }}
                      >
                        {formatGroupLabel(group.groupKey)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--colorNeutralBackground4)',
                          color: 'var(--colorNeutralForeground2)',
                          minWidth: '22px',
                          textAlign: 'center' as const,
                          lineHeight: '1.4',
                          opacity: isExpanded ? 1 : 0.7,
                          transition: 'opacity 200ms ease',
                        }}
                      >
                        {group.items.length}
                      </span>
                    </div>
                    <span
                      style={{
                        color: 'var(--colorNeutralForeground3)',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease',
                      }}
                    >
                      <ChevronDown size="sm" />
                    </span>
                  </button>

                  {/* Group body */}
                  {isExpanded && (
                    <div style={{ backgroundColor: 'var(--colorNeutralBackground1)' }}>
                      {group.items.map((item) => (
                        <HbcMyWorkListItem
                          key={item.workItemId}
                          item={item}
                          onAction={(request) => {
                            executeAction(request);
                            onItemSelect?.(request.item);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
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
