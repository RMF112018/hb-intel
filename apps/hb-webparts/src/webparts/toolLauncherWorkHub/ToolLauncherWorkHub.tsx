import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageActionRow, HbcHomepageIconFrame, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeToolLauncherWorkHubConfig } from '../../homepage/helpers/utilityConfig.js';
import { resolveUtilityIconContent } from '../../homepage/helpers/iconResolver.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageRailShell } from '../../homepage/shared/HomepageRailShell.js';
import { HomepageUtilityDenseGroup } from '../../homepage/shared/HomepageUtilityDenseGroup.js';
import type { ToolLauncherWorkHubConfig, ToolLauncherItem } from '../../homepage/webparts/utilityContracts.js';
import { hpHeadingReset, hpZoneFlexLayout } from '../../homepage/tokens.js';
import interactiveStyles from '../../homepage/homepage-interactive.module.css';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Launcher tile composition ──────────────────────────────────────
// Each launcher item renders as a hover-interactive tile with a
// medium-size icon frame, linked title, optional badge, and trailing
// directional arrow. The first item in each group uses a brand-tint
// icon at medium size for primary emphasis; subsequent items use a
// neutral-tint icon at small size for clear visual hierarchy.

function LauncherTileItem({
  item,
  isPrimary,
}: {
  item: ToolLauncherItem;
  isPrimary: boolean;
}): React.JSX.Element {
  const iconSize = isPrimary ? 'md' : 'sm';
  const iconTint = isPrimary ? 'brand' : 'neutral';
  const containerClass = isPrimary
    ? `${interactiveStyles.actionRowContainer} ${interactiveStyles.launcherTilePrimary}`
    : interactiveStyles.actionRowContainer;

  return (
    <div className={containerClass}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <HbcHomepageActionRow
          title={item.title}
          href={item.href}
          description={item.description}
          icon={
            <HbcHomepageIconFrame size={iconSize} tint={iconTint}>
              {resolveUtilityIconContent(item.iconKey)}
            </HbcHomepageIconFrame>
          }
          badge={
            item.badge
              ? <HbcStatusBadge label={item.badge.label} variant={item.badge.variant ?? 'neutral'} />
              : undefined
          }
        />
      </div>
      <span className={interactiveStyles.actionRowArrow} aria-hidden="true">{'\u203A'}</span>
    </div>
  );
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
              {group.items.map((item, idx) => (
                <LauncherTileItem
                  key={item.id}
                  item={item}
                  isPrimary={idx === 0}
                />
              ))}
            </HomepageUtilityDenseGroup>
          ))}
        </div>
      </HomepageRailShell>
    </HbcHomepageSurfaceCard>
  );
}
