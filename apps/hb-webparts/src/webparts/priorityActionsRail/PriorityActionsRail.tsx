import * as React from 'react';
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePriorityActionsRailConfig } from '../../homepage/helpers/utilityConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageRailShell } from '../../homepage/shared/HomepageRailShell.js';
import { HomepageUtilityDenseGroup } from '../../homepage/shared/HomepageUtilityDenseGroup.js';
import type { PriorityActionsRailConfig } from '../../homepage/webparts/utilityContracts.js';

export interface PriorityActionsRailProps {
  config?: Partial<PriorityActionsRailConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

export function PriorityActionsRail({ config, activeAudience, isLoading = false }: PriorityActionsRailProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading priority actions" />;
  }

  const normalized = normalizePriorityActionsRailConfig(config, activeAudience);

  if (normalized.groups.length === 0) {
    const hasConfiguredInput = Boolean(config?.actions?.length || config?.groups?.length);
    const message = resolveAuthoringMessage('priorityActionsRail', hasConfiguredInput ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  return (
    <HbcCard header={<h2 style={{ margin: 0 }}>{normalized.heading}</h2>}>
      <HomepageRailShell label="priority-actions-rail">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {normalized.groups.map((group) => (
            <HomepageUtilityDenseGroup key={group.id} title={group.title}>
              {group.actions.map((action) => (
                <div key={action.id}>
                  <a href={action.href}>{action.title}</a>
                  {action.badge ? <HbcStatusBadge label={action.badge.label} variant={action.badge.variant ?? 'info'} /> : null}
                  {action.description ? <p style={{ margin: '4px 0 0' }}>{action.description}</p> : null}
                </div>
              ))}
            </HomepageUtilityDenseGroup>
          ))}
        </div>
      </HomepageRailShell>
    </HbcCard>
  );
}
