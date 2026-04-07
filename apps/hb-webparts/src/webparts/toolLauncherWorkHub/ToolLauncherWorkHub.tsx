/**
 * ToolLauncherWorkHub — Premium command launcher surface
 *
 * Phase 06-01: All-platforms overlay wired to command band button.
 * All 4 regions + overlay extracted to dedicated components.
 * Icon resolution consolidated in launcherIconResolution.ts.
 *
 * Phase 11G: Authoring, SPFx host, and packaging hardening.
 *   - Explicit error state for list fetch failures (shows professional
 *     empty state instead of silently falling to config bridge)
 *   - data-hbc-homepage markers on root element for edit-mode awareness
 *   - Defensive guards for partial/sparse presentation data
 *   - aria-live region on state transitions for screen reader awareness
 *
 * Primary data source: live SharePoint list "Tool Launcher Contents"
 * via useToolLauncherData(). Falls back to manifest config props when
 * running outside SPFx (local dev / demo / packaging).
 *
 * Live data is rendered through the 4-region composition shell:
 *   1. Command band — LauncherCommandBand (with "All Platforms" action)
 *   2. Flagship stage — LauncherFlagshipStage
 *   3. Utility rail — LauncherUtilityRail
 *   4. Workflow shelves — LauncherWorkflowShelves
 *   + All-platforms overlay — LauncherAllPlatformsOverlay (toggled by command band)
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
import { LauncherAllPlatformsOverlay } from './LauncherAllPlatformsOverlay.js';
import { prepareAllForSearch } from './launcherSearch.js';
import { useResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
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
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const tier = useResponsiveTier();

  // Pre-compute searchable records for command band inline search (stable across renders)
  const searchable = React.useMemo(
    () => (listPlatforms ? prepareAllForSearch(listPlatforms) : []),
    [listPlatforms],
  );

  // Loading state
  if (isLoading || listLoading) {
    return (
      <div data-hbc-homepage="tool-launcher" data-launcher-state="loading">
        <HomepageLoadingState label="Loading tool launchers" />
      </div>
    );
  }

  // Explicit error state — list fetch failed and no platforms available
  if (listError && !listPlatforms) {
    // When list fetch fails, try config fallback before showing error
    const bridged = bridgeConfigToGroups(config, activeAudience);
    if (bridged) {
      return (
        <div data-hbc-homepage="tool-launcher" data-launcher-state="config-fallback">
          <HbcLauncherSurface
            groups={bridged.groups}
            layout="grid"
            aria-label={bridged.heading}
          />
        </div>
      );
    }

    // No fallback available — show professional error state
    return (
      <div data-hbc-homepage="tool-launcher" data-launcher-state="error" role="status" aria-live="polite">
        <HomepageEmptyState
          title="Unable to load platforms"
          description="The Tool Launcher Contents list could not be reached. Refresh the page or contact your SharePoint administrator if this continues."
        />
      </div>
    );
  }

  // Live list data → 4-region composition shell + overlay
  if (listPlatforms && !listError) {
    if (listPlatforms.length === 0) {
      const message = resolveAuthoringMessage('toolLauncherWorkHub', 'listEmpty');
      return (
        <div data-hbc-homepage="tool-launcher" data-launcher-state="list-empty" role="status" aria-live="polite">
          <HomepageEmptyState title={message.title} description={message.description} />
        </div>
      );
    }

    const presentation = deriveToolLauncherPresentation(listPlatforms, activeAudience);

    // All platforms filtered by audience → show empty state
    if (presentation.allPlatforms.length === 0) {
      const message = resolveAuthoringMessage('toolLauncherWorkHub', 'listEmpty');
      return (
        <div data-hbc-homepage="tool-launcher" data-launcher-state="audience-filtered" role="status" aria-live="polite">
          <HomepageEmptyState title={message.title} description={message.description} />
        </div>
      );
    }

    const featuredCount = presentation.featuredStage.platforms.length;

    return (
      <div data-hbc-homepage="tool-launcher" data-launcher-state="live">
        <LauncherCompositionShell
          tier={tier}
          commandBand={
            <LauncherCommandBand
              platformCount={presentation.allPlatforms.length}
              featuredCount={featuredCount}
              onAllPlatforms={() => setOverlayOpen(true)}
              tier={tier}
              searchable={searchable}
            />
          }
          flagshipStage={
            featuredCount > 0
              ? <LauncherFlagshipStage platforms={presentation.featuredStage.platforms} tier={tier} />
              : undefined
          }
          utilityRail={<LauncherUtilityRail presentation={presentation} />}
          workflowShelves={
            <>
              <LauncherWorkflowShelves shelves={presentation.workflowShelves} />
              <LauncherAllPlatformsOverlay
                index={presentation.platformIndex}
                allPlatforms={presentation.allPlatforms}
                isOpen={overlayOpen}
                onClose={() => setOverlayOpen(false)}
              />
            </>
          }
        />
      </div>
    );
  }

  // Fallback: local grouped config (transitional for non-SPFx environments)
  const bridged = bridgeConfigToGroups(config, activeAudience);
  if (!bridged) {
    const hasConfiguredInput = Boolean(config?.groups?.length);
    const message = resolveAuthoringMessage('toolLauncherWorkHub', hasConfiguredInput ? 'invalid' : 'noData');
    return (
      <div data-hbc-homepage="tool-launcher" data-launcher-state="no-config" role="status" aria-live="polite">
        <HomepageEmptyState title={message.title} description={message.description} />
      </div>
    );
  }

  return (
    <div data-hbc-homepage="tool-launcher" data-launcher-state="config-fallback">
      <HbcLauncherSurface
        groups={bridged.groups}
        layout="grid"
        aria-label={bridged.heading}
      />
    </div>
  );
}
