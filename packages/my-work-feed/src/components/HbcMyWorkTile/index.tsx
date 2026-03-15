/**
 * HbcMyWorkTile — SF29-T06
 *
 * Compact project-scoped card showing top N work items.
 * Uses HbcCard with header (title + count badges) and footer (View All).
 * Tier-aware: essential = simple, standard = badges + footer, expert = + waiting + health.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcCard, HbcTypography, HbcStatusBadge, HbcButton, HbcSpinner } from '@hbc/ui-kit';
import { useMyWork } from '../../hooks/useMyWork.js';
import { useMyWorkCounts } from '../../hooks/useMyWorkCounts.js';
import { useMyWorkActions } from '../../hooks/useMyWorkActions.js';
import { HbcMyWorkListItem } from '../HbcMyWorkListItem/index.js';
import type { IMyWorkItem } from '../../types/index.js';

export interface IHbcMyWorkTileProps {
  projectId: string;
  maxItems?: number;
  onOpenFeed?: () => void;
  onItemSelect?: (item: IMyWorkItem) => void;
  className?: string;
}

export function HbcMyWorkTile({
  projectId,
  maxItems = 5,
  onOpenFeed,
  onItemSelect,
  className,
}: IHbcMyWorkTileProps): JSX.Element {
  const { tier } = useComplexity();
  const { feed, isLoading } = useMyWork({ query: { projectId }, enabled: true });
  const { counts } = useMyWorkCounts({ projectId });
  const { executeAction } = useMyWorkActions();

  const items = feed?.items.slice(0, maxItems) ?? [];

  const header = (
    <div className="hbc-my-work-tile__header">
      <HbcTypography intent="heading4">My Work</HbcTypography>
      {counts && (
        <span className="hbc-my-work-tile__counts">
          <HbcStatusBadge variant="info" label={`${counts.totalCount}`} />
          {tier !== 'essential' && (
            <>
              <HbcStatusBadge variant="error" label={`${counts.nowCount} now`} />
              <HbcStatusBadge variant="warning" label={`${counts.blockedCount} blocked`} />
            </>
          )}
          {tier === 'expert' && (
            <HbcStatusBadge variant="info" label={`${counts.waitingCount} waiting`} />
          )}
        </span>
      )}
    </div>
  );

  const footer = tier !== 'essential' && onOpenFeed ? (
    <div className="hbc-my-work-tile__footer">
      <HbcButton variant="secondary" onClick={onOpenFeed}>View All</HbcButton>
    </div>
  ) : undefined;

  return (
    <HbcCard header={header} footer={footer} className={className}>
      <div className="hbc-my-work-tile__body">
        {isLoading && <HbcSpinner size="sm" />}
        {!isLoading && items.map((item) => (
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
    </HbcCard>
  );
}
