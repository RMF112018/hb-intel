/**
 * HbcMyWorkBadge — SF29-T05
 *
 * Count badge showing immediate work item count.
 * Follows HbcNotificationBadge pattern.
 * Returns null at essential tier (D-08).
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { Toolbox } from '@hbc/ui-kit/icons';
import { useMyWorkCounts } from '../../hooks/useMyWorkCounts.js';

export interface IHbcMyWorkBadgeProps {
  onClick?: () => void;
  className?: string;
}

export function HbcMyWorkBadge({ onClick, className }: IHbcMyWorkBadgeProps): JSX.Element | null {
  const { tier } = useComplexity();
  const { counts } = useMyWorkCounts();

  if (tier === 'essential') return null;

  const nowCount = counts?.nowCount ?? 0;
  const showBadge = nowCount > 0;

  return (
    <button
      type="button"
      className={`hbc-my-work-badge${className ? ` ${className}` : ''}`}
      aria-label={nowCount > 0 ? `${nowCount} work items need attention` : 'My Work'}
      onClick={onClick}
    >
      <Toolbox size="md" />
      {showBadge && (
        <span className="hbc-my-work-badge__count" aria-hidden="true">
          {nowCount > 99 ? '99+' : nowCount}
        </span>
      )}
    </button>
  );
}
