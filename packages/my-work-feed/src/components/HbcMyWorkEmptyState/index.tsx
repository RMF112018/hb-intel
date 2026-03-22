/**
 * HbcMyWorkEmptyState — SF29-T05
 *
 * Empty state display for panel and feed contexts.
 * Complexity-tier-aware: Essential = title only, Standard = + description,
 * Expert = + primary action.
 *
 * UIF-020-addl: Filter-aware messaging when a KPI filter produces zero results.
 * Names the active filter, explains zero-result meaning contextually, offers
 * "View all items" CTA, and warns if data sources are degraded.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';

export interface IHbcMyWorkEmptyStateProps {
  variant?: 'panel' | 'feed';
  /** UIF-020-addl: Active KPI filter key (e.g. 'aging', 'blocked'). */
  kpiFilter?: string | null;
  /** UIF-020-addl: True when data sources are degraded — adds caveat to empty message. */
  isDegraded?: boolean;
  /** UIF-020-addl: Callback to clear the active KPI filter. */
  onClearFilter?: () => void;
  className?: string;
}

const CONTENT = {
  panel: {
    title: "You're all caught up",
    description: 'No work items need your attention right now.',
  },
  feed: {
    title: "You're all caught up",
    description:
      'All work items have been addressed. New items will appear here as they are assigned or escalated to you.',
  },
} as const;

// UIF-020-addl: Context-aware messaging per KPI filter.
const KPI_FILTER_CONTENT: Record<string, { label: string; zeroMessage: string }> = {
  'action-now': { label: 'Action Now', zeroMessage: 'No items require immediate action.' },
  'blocked':    { label: 'Blocked', zeroMessage: 'No items are currently blocked.' },
  'unread':     { label: 'Unread', zeroMessage: 'All items have been read.' },
  'escalation': { label: 'Escalation Candidates', zeroMessage: 'No items need escalation — nothing is overdue or blocked.' },
  'aging':      { label: 'Aging', zeroMessage: 'No items aging past threshold — all work items are within their due date ranges.' },
};

export function HbcMyWorkEmptyState({
  variant = 'panel',
  kpiFilter,
  isDegraded,
  onClearFilter,
  className,
}: IHbcMyWorkEmptyStateProps): JSX.Element {
  const { tier } = useComplexity();

  // UIF-020-addl: Filter-specific empty state when a KPI filter is active.
  const filterContent = kpiFilter ? KPI_FILTER_CONTENT[kpiFilter] : undefined;

  if (filterContent) {
    const degradedCaveat = isDegraded
      ? ' Some data sources are unavailable — this count may be incomplete.'
      : '';
    return (
      <HbcEmptyState
        className={className}
        title={`No ${filterContent.label} items`}
        description={tier !== 'essential' ? filterContent.zeroMessage + degradedCaveat : undefined}
        secondaryAction={
          onClearFilter
            ? <HbcButton variant="ghost" size="sm" onClick={onClearFilter}>View all items</HbcButton>
            : undefined
        }
      />
    );
  }

  // Default: unfiltered empty state.
  const content = CONTENT[variant];
  return (
    <HbcEmptyState
      className={className}
      title={content.title}
      description={tier !== 'essential' ? content.description : undefined}
      primaryAction={
        tier === 'expert'
          ? <HbcButton variant="secondary" size="sm">View completed items</HbcButton>
          : undefined
      }
    />
  );
}
