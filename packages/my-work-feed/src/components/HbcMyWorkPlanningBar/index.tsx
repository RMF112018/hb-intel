/**
 * HbcMyWorkPlanningBar — SF29-T05
 *
 * Horizontal filter bar for panel planning views.
 * Returns null at essential tier.
 * Standard: 3 filters. Expert: + Waiting On.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcButton } from '@hbc/ui-kit';
import type { IMyWorkCounts } from '../../types/index.js';

export type MyWorkPlanningFilter = 'today' | 'this-week' | 'waiting-on' | 'deferred';

export interface IHbcMyWorkPlanningBarProps {
  activeFilter?: MyWorkPlanningFilter;
  onFilterChange?: (filter: MyWorkPlanningFilter | undefined) => void;
  counts?: IMyWorkCounts;
  className?: string;
}

interface FilterDef {
  key: MyWorkPlanningFilter;
  label: string;
  countKey?: keyof IMyWorkCounts;
  expertOnly?: boolean;
}

const FILTERS: FilterDef[] = [
  { key: 'today', label: 'Today', countKey: 'nowCount' },
  { key: 'this-week', label: 'This Week', countKey: 'totalCount' },
  { key: 'waiting-on', label: 'Waiting On', countKey: 'waitingCount', expertOnly: true },
  { key: 'deferred', label: 'Deferred', countKey: 'deferredCount' },
];

export function HbcMyWorkPlanningBar({
  activeFilter,
  onFilterChange,
  counts,
  className,
}: IHbcMyWorkPlanningBarProps): JSX.Element | null {
  const { tier } = useComplexity();

  if (tier === 'essential') return null;

  const visibleFilters = FILTERS.filter((f) => !f.expertOnly || tier === 'expert');

  return (
    <div className={`hbc-my-work-planning-bar${className ? ` ${className}` : ''}`} role="toolbar" aria-label="Work filters">
      {visibleFilters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = filter.countKey && counts ? counts[filter.countKey] : undefined;

        return (
          <HbcButton
            key={filter.key}
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange?.(isActive ? undefined : filter.key)}
            aria-pressed={isActive}
          >
            {filter.label}
            {count !== undefined ? ` (${count})` : ''}
          </HbcButton>
        );
      })}
    </div>
  );
}
