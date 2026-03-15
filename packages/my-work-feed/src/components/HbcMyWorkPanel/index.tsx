/**
 * HbcMyWorkPanel — SF29-T05
 *
 * Panel composition shell: offline banner, planning bar,
 * grouped item list with loading/error/empty states.
 * Filter state is local (D3).
 */

import React, { useState } from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcPanel, HbcBanner, HbcButton, HbcSpinner, HbcTypography } from '@hbc/ui-kit';
import { ChevronDown, ChevronUp } from '@hbc/ui-kit/icons';
import { useMyWorkPanel } from '../../hooks/useMyWorkPanel.js';
import { useMyWorkActions } from '../../hooks/useMyWorkActions.js';
import { useMyWorkPanelStore } from '../../store/MyWorkPanelStore.js';
import { HbcMyWorkOfflineBanner } from '../HbcMyWorkOfflineBanner/index.js';
import {
  HbcMyWorkPlanningBar,
  type MyWorkPlanningFilter,
} from '../HbcMyWorkPlanningBar/index.js';
import { HbcMyWorkEmptyState } from '../HbcMyWorkEmptyState/index.js';
import { HbcMyWorkListItem } from '../HbcMyWorkListItem/index.js';

export interface IHbcMyWorkPanelProps {
  onOpenFeed?: () => void;
  className?: string;
}

export function HbcMyWorkPanel({
  onOpenFeed,
  className,
}: IHbcMyWorkPanelProps): JSX.Element {
  const { tier } = useComplexity();
  const { groups, counts, isPanelOpen, isLoading, isError, closePanel } = useMyWorkPanel();
  const { executeAction } = useMyWorkActions();
  const { expandedGroups, toggleGroup } = useMyWorkPanelStore();
  const [activeFilter, setActiveFilter] = useState<MyWorkPlanningFilter | undefined>();

  const allItems = groups.flatMap((g) => g.items);
  const hasItems = allItems.length > 0;

  return (
    <HbcPanel
      open={isPanelOpen}
      onClose={closePanel}
      title="My Work"
      size="sm"
      className={className}
    >
      <div className="hbc-my-work-panel__body">
        {/* Offline banner */}
        <HbcMyWorkOfflineBanner />

        {/* Planning bar — essential tier skips this */}
        {tier !== 'essential' && (
          <HbcMyWorkPlanningBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="hbc-my-work-panel__loading">
            <HbcSpinner size="md" />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <HbcBanner variant="error">Unable to load work items. Please try again.</HbcBanner>
        )}

        {/* Empty */}
        {!isLoading && !isError && !hasItems && <HbcMyWorkEmptyState variant="panel" />}

        {/* Items */}
        {!isLoading && !isError && hasItems && (
          <div className="hbc-my-work-panel__groups">
            {tier === 'essential' ? (
              /* Essential: flat list, no grouping */
              allItems.map((item) => (
                <HbcMyWorkListItem
                  key={item.workItemId}
                  item={item}
                  onAction={executeAction}
                />
              ))
            ) : (
              /* Standard/Expert: grouped by lane */
              groups.map((group) => {
                const isExpanded = expandedGroups.has(group.groupKey);
                return (
                  <div key={group.groupKey} className="hbc-my-work-panel__group">
                    <button
                      type="button"
                      className="hbc-my-work-panel__group-header"
                      onClick={() => toggleGroup(group.groupKey)}
                      aria-expanded={isExpanded}
                    >
                      <HbcTypography intent="heading4">
                        {group.groupKey} ({group.count})
                      </HbcTypography>
                      {isExpanded ? <ChevronUp size="sm" /> : <ChevronDown size="sm" />}
                    </button>
                    {isExpanded && (
                      <div className="hbc-my-work-panel__group-body">
                        {group.items.map((item) => (
                          <HbcMyWorkListItem
                            key={item.workItemId}
                            item={item}
                            onAction={executeAction}
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

        {/* Footer */}
        {onOpenFeed && (
          <div className="hbc-my-work-panel__footer">
            <HbcButton variant="secondary" onClick={onOpenFeed}>
              View All
            </HbcButton>
          </div>
        )}
      </div>
    </HbcPanel>
  );
}
