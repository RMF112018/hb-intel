/**
 * Panel projection hook — SF29-T04
 * Fetches feed, groups items, and passes through panel store actions.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMyWorkContext } from './MyWorkContext.js';
import { myWorkKeys } from './queryKeys.js';
import { aggregateFeed } from '../api/aggregateFeed.js';
import { computeCounts } from '../normalization/projectFeed.js';
import { useMyWorkPanelStore } from '../store/MyWorkPanelStore.js';
import type { IMyWorkQuery, IMyWorkItem, IMyWorkCounts } from '../types/index.js';

export interface IMyWorkPanelGroup {
  groupKey: string;
  items: IMyWorkItem[];
  count: number;
}

export interface IUseMyWorkPanelResult {
  groups: IMyWorkPanelGroup[];
  counts: IMyWorkCounts | undefined;
  isPanelOpen: boolean;
  isLoading: boolean;
  isError: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

function groupByLane(item: IMyWorkItem): string {
  return item.lane;
}

export function useMyWorkPanel(query?: IMyWorkQuery): IUseMyWorkPanelResult {
  const { context, defaultQuery } = useMyWorkContext();
  const mergedQuery: IMyWorkQuery = { ...defaultQuery, ...query };
  const userId = context.currentUserId;
  const panelStore = useMyWorkPanelStore();

  const result = useQuery({
    queryKey: myWorkKeys.panel(userId, mergedQuery),
    queryFn: () => aggregateFeed({ query: mergedQuery, context }),
  });

  const items = result.data?.items;
  const groupingFn = panelStore.grouping?.groupingFn ?? groupByLane;

  const groups = useMemo<IMyWorkPanelGroup[]>(() => {
    if (!items) return [];
    const map = new Map<string, IMyWorkItem[]>();
    for (const item of items) {
      const key = groupingFn(item);
      const list = map.get(key);
      if (list) {
        list.push(item);
      } else {
        map.set(key, [item]);
      }
    }
    return Array.from(map.entries()).map(([groupKey, groupItems]) => ({
      groupKey,
      items: groupItems,
      count: groupItems.length,
    }));
  }, [items, groupingFn]);

  const counts = useMemo<IMyWorkCounts | undefined>(
    () => (items ? computeCounts(items) : undefined),
    [items],
  );

  return {
    groups,
    counts,
    isPanelOpen: panelStore.isPanelOpen,
    isLoading: result.isLoading,
    isError: result.isError,
    openPanel: panelStore.openPanel,
    closePanel: panelStore.closePanel,
    togglePanel: panelStore.togglePanel,
  };
}
