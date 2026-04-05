import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageActionRow, HbcHomepageIconFrame, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeToolLauncherWorkHubConfig } from '../../homepage/helpers/utilityConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageRailShell } from '../../homepage/shared/HomepageRailShell.js';
import { HomepageUtilityDenseGroup } from '../../homepage/shared/HomepageUtilityDenseGroup.js';
import { resolveUtilityIconContent } from '../../homepage/helpers/iconResolver.js';
import type { ToolLauncherWorkHubConfig } from '../../homepage/webparts/utilityContracts.js';
import { hpHeadingReset, hpZoneFlexLayout } from '../../homepage/tokens.js';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

export function ToolLauncherWorkHub({ config, activeAudience, isLoading = false }: ToolLauncherWorkHubProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading tool launchers" />;
  }

  const normalized = normalizeToolLauncherWorkHubConfig(config, activeAudience);
  if (normalized.groups.length === 0) {
    const hasConfiguredInput = Boolean(config?.groups?.length);
    const message = resolveAuthoringMessage('toolLauncherWorkHub', hasConfiguredInput ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  return (
    <HbcHomepageSurfaceCard surface="utility" header={<h2 style={hpHeadingReset}>{normalized.heading}</h2>}>
      <HomepageRailShell label="tool-launcher-work-hub">
        <div style={hpZoneFlexLayout}>
          {normalized.groups.map((group) => (
            <HomepageUtilityDenseGroup key={group.id} title={group.title}>
              {group.items.map((item) => (
                <HbcHomepageActionRow
                  key={item.id}
                  title={item.title}
                  href={item.href}
                  description={item.description}
                  icon={
                    <HbcHomepageIconFrame size="sm" tint="brand">
                      {resolveUtilityIconContent(item.iconKey)}
                    </HbcHomepageIconFrame>
                  }
                  badge={item.badge ? <HbcStatusBadge label={item.badge.label} variant={item.badge.variant ?? 'neutral'} /> : undefined}
                />
              ))}
            </HomepageUtilityDenseGroup>
          ))}
        </div>
      </HomepageRailShell>
    </HbcHomepageSurfaceCard>
  );
}
