/**
 * ToolLauncherWorkHub — Premium command launcher surface
 *
 * Phase 03-02: Featured stage binding with audience-aware filtering.
 * All 4 regions extracted to dedicated components.
 * Icon resolution consolidated in launcherIconResolution.ts.
 *
 * Primary data source: live SharePoint list "Tool Launcher Contents"
 * via useToolLauncherData(). Falls back to manifest config props when
 * running outside SPFx (local dev / demo / packaging).
 *
 * Live data is rendered through the 4-region composition shell:
 *   1. Command band — LauncherCommandBand
 *   2. Flagship stage — LauncherFlagshipStage
 *   3. Utility rail — LauncherUtilityRail
 *   4. Workflow shelves — LauncherWorkflowShelves
 *
 * Config fallback still uses the flat HbcLauncherSurface bridge.
 */
import * as React from 'react';
import {
  HbcLauncherSurface,
  type LauncherGroup,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeToolLauncherWorkHubConfig } from '../../homepage/helpers/utilityConfig.js';
import { deriveToolLauncherPresentation } from '../../homepage/data/toolLauncherNormalization.js';
import { useToolLauncherData } from '../../homepage/data/useToolLauncherData.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { LauncherCompositionShell } from './LauncherCompositionShell.js';
import { LauncherCommandBand } from './LauncherCommandBand.js';
import { LauncherFlagshipStage } from './LauncherFlagshipStage.js';
import { LauncherUtilityRail } from './LauncherUtilityRail.js';
import { LauncherWorkflowShelves } from './LauncherWorkflowShelves.js';
import { resolveToolIcon, resolveToolTint, resolveGroupIcon } from './launcherIconResolution.js';
import type { ToolLauncherWorkHubConfig } from '../../homepage/webparts/utilityContracts.js';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Config fallback bridge ──

function bridgeConfigToGroups(
  config: Partial<ToolLauncherWorkHubConfig> | undefined,
  activeAudience: string | undefined,
): { groups: LauncherGroup[]; heading: string } | undefined {
  const normalized = normalizeToolLauncherWorkHubConfig(config, activeAudience);
  if (normalized.groups.length === 0) return undefined;

  return {
    heading: normalized.heading,
    groups: normalized.groups.map((group) => ({
      id: group.id,
      label: group.title,
      icon: resolveGroupIcon(group.title),
      tiles: group.items.map((item) => ({
        id: item.id,
        label: item.title,
        description: item.description,
        icon: resolveToolIcon(item.iconKey),
        tint: resolveToolTint(item.iconKey),
        href: item.href,
      })),
    })),
  };
}

// ── Component ──

export function ToolLauncherWorkHub({ config, activeAudience, isLoading = false }: ToolLauncherWorkHubProps): React.JSX.Element {
  const { platforms: listPlatforms, isLoading: listLoading, error: listError } = useToolLauncherData();

  if (isLoading || listLoading) {
    return <HomepageLoadingState label="Loading tool launchers" />;
  }

  // Live list data → 4-region composition shell
  if (listPlatforms && !listError) {
    if (listPlatforms.length === 0) {
      const message = resolveAuthoringMessage('toolLauncherWorkHub', 'listEmpty');
      return <HomepageEmptyState title={message.title} description={message.description} />;
    }

    const presentation = deriveToolLauncherPresentation(listPlatforms, activeAudience);
    const featuredCount = presentation.featuredStage.platforms.length;

    return (
      <LauncherCompositionShell
        commandBand={<LauncherCommandBand platformCount={presentation.allPlatforms.length} featuredCount={featuredCount} />}
        flagshipStage={<LauncherFlagshipStage platforms={presentation.featuredStage.platforms} />}
        utilityRail={<LauncherUtilityRail presentation={presentation} />}
        workflowShelves={<LauncherWorkflowShelves shelves={presentation.workflowShelves} />}
      />
    );
  }

  // Fallback: local grouped config (transitional for non-SPFx environments)
  const bridged = bridgeConfigToGroups(config, activeAudience);
  if (!bridged) {
    const hasConfiguredInput = Boolean(config?.groups?.length);
    const message = resolveAuthoringMessage('toolLauncherWorkHub', hasConfiguredInput ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  return (
    <HbcLauncherSurface
      groups={bridged.groups}
      layout="grid"
      aria-label={bridged.heading}
    />
  );
}
