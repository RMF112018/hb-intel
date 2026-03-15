/**
 * HbcMyWorkFeed — SF29-T06
 *
 * Full workspace feed with grouping, filtering, search, and sorting.
 * State is component-local (D1). Reuses HbcMyWorkListItem (D2).
 * Essential: flat list, no controls. Standard: CommandBar + grouping.
 * Expert: + sort + source health footer.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcCommandBar, HbcTypography, HbcSpinner, HbcBanner } from '@hbc/ui-kit';
import { ChevronDown, ChevronUp } from '@hbc/ui-kit/icons';
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
  onOpenReasonDrawer,
  className,
}: IHbcMyWorkFeedProps): JSX.Element {
  const { tier } = useComplexity();
  const { feed, isLoading, isError } = useMyWork({ query });
  const { executeAction } = useMyWorkActions();

  const [searchTerm, setSearchTerm] = useState('');
  const [groupingKey, setGroupingKey] = useState<GroupingKey>('lane');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<IActiveFilters>({
    overdue: false,
    blocked: false,
    unread: false,
  });

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
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

    // Sort
    items = sortItems(items, sortKey);

    return items;
  }, [feed?.items, searchTerm, activeFilters, sortKey]);

  const groups = useMemo(() => {
    if (tier === 'essential') return [];
    return groupItems(processedItems, GROUPINGS[groupingKey]);
  }, [processedItems, groupingKey, tier]);

  const hasItems = processedItems.length > 0;

  // Build CommandBar filters
  const filters = [
    {
      key: 'overdue',
      label: 'Overdue',
      active: activeFilters.overdue,
      onToggle: () => setActiveFilters((f) => ({ ...f, overdue: !f.overdue })),
    },
    {
      key: 'blocked',
      label: 'Blocked',
      active: activeFilters.blocked,
      onToggle: () => setActiveFilters((f) => ({ ...f, blocked: !f.blocked })),
    },
    {
      key: 'unread',
      label: 'Unread',
      active: activeFilters.unread,
      onToggle: () => setActiveFilters((f) => ({ ...f, unread: !f.unread })),
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
    <div className={`hbc-my-work-feed${className ? ` ${className}` : ''}`}>
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
        <div className="hbc-my-work-feed__loading">
          <HbcSpinner size="md" />
        </div>
      )}

      {isError && !isLoading && (
        <HbcBanner variant="error">Unable to load work items. Please try again.</HbcBanner>
      )}

      {!isLoading && !isError && !hasItems && <HbcMyWorkEmptyState variant="feed" />}

      {!isLoading && !isError && hasItems && (
        <div className="hbc-my-work-feed__items">
          {tier === 'essential' ? (
            processedItems.map((item) => (
              <HbcMyWorkListItem
                key={item.workItemId}
                item={item}
                onAction={(request) => {
                  executeAction(request);
                  onItemSelect?.(request.item);
                }}
              />
            ))
          ) : (
            groups.map((group) => {
              const isExpanded = expandedGroups.has(group.groupKey);
              return (
                <div key={group.groupKey} className="hbc-my-work-feed__group">
                  <button
                    type="button"
                    className="hbc-my-work-feed__group-header"
                    onClick={() => toggleGroup(group.groupKey)}
                    aria-expanded={isExpanded}
                  >
                    <HbcTypography intent="heading4">
                      {group.groupKey} ({group.items.length})
                    </HbcTypography>
                    {isExpanded ? <ChevronUp size="sm" /> : <ChevronDown size="sm" />}
                  </button>
                  {isExpanded && (
                    <div className="hbc-my-work-feed__group-body">
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
