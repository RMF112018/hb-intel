/**
 * ToolLauncherWorkHub — Premium command launcher surface
 * Phase 15-05 — Command and utility surface overhaul
 *
 * Each tool group renders with a deliberate heading and icon-forward
 * tile presentation. Primary items (first in group) get larger icon
 * frames with accent tint and visual emphasis. The surface reads as
 * a command launcher, not a categorized link list.
 */
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
import { hpHeadingReset, hpZoneFlexLayout, HP_SPACE } from '../../homepage/tokens.js';
import interactiveStyles from '../../homepage/homepage-interactive.module.css';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Primary launcher tile (first item in group) ──────────────────────

const primaryTileStyle: React.CSSProperties = {
  padding: `${HP_SPACE.md}px ${HP_SPACE.xl}px`,
  background: 'rgba(34, 83, 145, 0.03)',
  borderBottom: '1px solid rgba(34, 83, 145, 0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

// ── Secondary launcher tile ──────────────────────────────────────────

const secondaryTileStyle: React.CSSProperties = {
  padding: `${HP_SPACE.sm}px ${HP_SPACE.xl}px`,
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

function LauncherTileItem({
  item,
  isPrimary,
}: {
  item: ToolLauncherItem;
  isPrimary: boolean;
}): React.JSX.Element {
  const iconSize = isPrimary ? 'lg' : 'md';
  const iconTint = isPrimary ? 'accent' : 'brand';
  const tileStyle = isPrimary ? primaryTileStyle : secondaryTileStyle;
  const containerClass = interactiveStyles.actionRowContainer;

  return (
    <div style={tileStyle} className={containerClass}>
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
