/**
 * HbcMyWorkTeamFeed — SF29-T06
 *
 * Team oversight feed with scope selector (delegated-by-me, my-team, escalation-candidate).
 * Essential: flat list, no controls. Standard: scope + search + aging/blocked badges.
 * Expert: + escalation count badge.
 */

import React, { useState, useMemo } from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcCommandBar, HbcTypography, HbcSpinner, HbcBanner, HbcStatusBadge } from '@hbc/ui-kit';
import { useMyWorkTeamFeed } from '../../hooks/useMyWorkTeamFeed.js';
import type { MyWorkOwnerScope } from '../../hooks/useMyWorkTeamFeed.js';
import { useMyWorkActions } from '../../hooks/useMyWorkActions.js';
import { HbcMyWorkListItem } from '../HbcMyWorkListItem/index.js';
import { HbcMyWorkEmptyState } from '../HbcMyWorkEmptyState/index.js';
import type { IMyWorkItem, IMyWorkQuery } from '../../types/index.js';

export interface IHbcMyWorkTeamFeedProps {
  defaultScope?: MyWorkOwnerScope;
  query?: IMyWorkQuery;
  onItemSelect?: (item: IMyWorkItem) => void;
  className?: string;
}

const SCOPE_LABELS: Record<MyWorkOwnerScope, string> = {
  'delegated-by-me': 'Delegated by me',
  'my-team': 'My team',
  'escalation-candidate': 'Escalation candidates',
};

export function HbcMyWorkTeamFeed({
  defaultScope = 'delegated-by-me',
  query,
  onItemSelect,
  className,
}: IHbcMyWorkTeamFeedProps): JSX.Element {
  const { tier } = useComplexity();
  const [activeScope, setActiveScope] = useState<MyWorkOwnerScope>(defaultScope);
  const [searchTerm, setSearchTerm] = useState('');

  const { teamFeed, isLoading, isError } = useMyWorkTeamFeed({
    ownerScope: activeScope,
    query,
  });
  const { executeAction } = useMyWorkActions();

  const filteredItems = useMemo(() => {
    if (!teamFeed?.items) return [];
    if (!searchTerm) return teamFeed.items;
    const term = searchTerm.toLowerCase();
    return teamFeed.items.filter((item) => item.title.toLowerCase().includes(term));
  }, [teamFeed?.items, searchTerm]);

  const hasItems = filteredItems.length > 0;

  // Build CommandBar filters (scope selectors)
  const filters = (['delegated-by-me', 'my-team', 'escalation-candidate'] as const).map(
    (scope) => ({
      key: scope,
      label: SCOPE_LABELS[scope],
      active: activeScope === scope,
      onToggle: () => setActiveScope(scope),
    }),
  );

  return (
    <div className={`hbc-my-work-team-feed${className ? ` ${className}` : ''}`}>
      {tier !== 'essential' && (
        <>
          <HbcCommandBar
            filters={filters}
            actions={[]}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {teamFeed && (
            <div className="hbc-my-work-team-feed__summary">
              <HbcStatusBadge variant="warning" label={`${teamFeed.agingCount} aging`} />
              <HbcStatusBadge variant="error" label={`${teamFeed.blockedCount} blocked`} />
              {tier === 'expert' && (
                <HbcStatusBadge
                  variant="info"
                  label={`${teamFeed.escalationCandidateCount} escalation`}
                />
              )}
            </div>
          )}
        </>
      )}

      {isLoading && (
        <div className="hbc-my-work-team-feed__loading">
          <HbcSpinner size="md" />
        </div>
      )}

      {isError && !isLoading && (
        <HbcBanner variant="error">Unable to load team items. Please try again.</HbcBanner>
      )}

      {!isLoading && !isError && !hasItems && <HbcMyWorkEmptyState variant="feed" />}

      {!isLoading && !isError && hasItems && (
        <div className="hbc-my-work-team-feed__items">
          {filteredItems.map((item) => (
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
}
