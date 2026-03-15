/**
 * HbcMyWorkLauncher — SF29-T05
 *
 * Top-level shell entry point: icon button + panel.
 * Essential: icon + inline count. Standard: icon + HbcMyWorkBadge.
 * Expert: + popover with count breakdown.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { Toolbox } from '@hbc/ui-kit/icons';
import { HbcPopover, HbcTypography } from '@hbc/ui-kit';
import { useMyWorkCounts } from '../../hooks/useMyWorkCounts.js';
import { useMyWorkPanelStore } from '../../store/MyWorkPanelStore.js';
import { HbcMyWorkBadge } from '../HbcMyWorkBadge/index.js';
import { HbcMyWorkPanel } from '../HbcMyWorkPanel/index.js';

export interface IHbcMyWorkLauncherProps {
  onOpenFeed?: () => void;
  className?: string;
}

export function HbcMyWorkLauncher({
  onOpenFeed,
  className,
}: IHbcMyWorkLauncherProps): JSX.Element {
  const { tier } = useComplexity();
  const { counts } = useMyWorkCounts();
  const { togglePanel } = useMyWorkPanelStore();

  const nowCount = counts?.nowCount ?? 0;

  return (
    <div className={`hbc-my-work-launcher${className ? ` ${className}` : ''}`}>
      {tier === 'essential' ? (
        <button
          type="button"
          className="hbc-my-work-launcher__button"
          aria-label={nowCount > 0 ? `${nowCount} work items need attention` : 'My Work'}
          onClick={togglePanel}
        >
          <Toolbox size="md" />
          {nowCount > 0 && (
            <span className="hbc-my-work-launcher__count">{nowCount}</span>
          )}
        </button>
      ) : tier === 'expert' ? (
        <HbcPopover
          trigger={
            <span className="hbc-my-work-launcher__expert-trigger">
              <HbcMyWorkBadge onClick={togglePanel} />
            </span>
          }
        >
          <div className="hbc-my-work-launcher__breakdown">
            <HbcTypography intent="bodySmall">Now: {counts?.nowCount ?? 0}</HbcTypography>
            <HbcTypography intent="bodySmall">Blocked: {counts?.blockedCount ?? 0}</HbcTypography>
            <HbcTypography intent="bodySmall">Waiting: {counts?.waitingCount ?? 0}</HbcTypography>
          </div>
        </HbcPopover>
      ) : (
        <HbcMyWorkBadge onClick={togglePanel} />
      )}

      <HbcMyWorkPanel onOpenFeed={onOpenFeed} />
    </div>
  );
}
