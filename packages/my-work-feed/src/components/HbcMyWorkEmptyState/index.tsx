/**
 * HbcMyWorkEmptyState — SF29-T05
 *
 * Empty state display for panel and feed contexts.
 * Complexity-tier-aware: Essential = title only, Standard = + description,
 * Expert = + primary action.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';

export interface IHbcMyWorkEmptyStateProps {
  variant?: 'panel' | 'feed';
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

export function HbcMyWorkEmptyState({
  variant = 'panel',
  className,
}: IHbcMyWorkEmptyStateProps): JSX.Element {
  const { tier } = useComplexity();
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
