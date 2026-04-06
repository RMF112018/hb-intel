/**
 * ToolLauncherWorkHub — Premium command launcher surface
 *
 * Phase 02-03: Flagship stage and utility rail extracted to dedicated
 * components with brand-asset slots, support metadata, and notice
 * rendering.
 *
 * Primary data source: live SharePoint list "Tool Launcher Contents"
 * via useToolLauncherData(). Falls back to manifest config props when
 * running outside SPFx (local dev / demo / packaging).
 *
 * Live data is rendered through the 4-region composition shell:
 *   1. Command band — LauncherCommandBand
 *   2. Flagship stage — LauncherFlagshipStage
 *   3. Utility rail — LauncherUtilityRail
 *   4. Workflow shelves — HbcLauncherSurface per shelf
 *
 * Config fallback still uses the flat HbcLauncherSurface bridge.
 */
import * as React from 'react';
import {
  HbcLauncherSurface,
  Settings,
  Shield,
  DollarSign,
  HardHat,
  Users,
  Building2,
  Keyboard,
  Landmark,
  BarChart3,
  FileText,
  Briefcase,
  type LucideIcon,
  type LauncherGroup,
  type LauncherTileTint,
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
import { HP_SPACE, HP_BORDER } from '../../homepage/tokens.js';
import type { ToolLauncherWorkHubConfig } from '../../homepage/webparts/utilityContracts.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Icon resolution for config fallback + workflow shelves ──

const PLATFORM_FALLBACK_ICON: Record<string, LucideIcon> = {
  bamboohr: Users,
  hh2: Briefcase,
  'sap-concur': BarChart3,
  'employee-navigator': Users,
  adp: BarChart3,
  procore: Building2,
  compass: Settings,
  'document-crunch': FileText,
  hedricklearn: FileText,
};

const TOOL_ICON_MAP: Record<string, LucideIcon> = {
  safety: Shield,
  finance: DollarSign,
  field: HardHat,
  hr: Users,
  ops: Settings,
  admin: Building2,
  it: Keyboard,
  legal: Landmark,
  report: BarChart3,
  document: FileText,
  project: Briefcase,
};

const TOOL_TINT_MAP: Record<string, LauncherTileTint> = {
  safety: 'danger',
  finance: 'accent',
  field: 'warm',
  hr: 'brand',
  ops: 'neutral',
  admin: 'brand',
  it: 'neutral',
  legal: 'brand',
  report: 'accent',
  document: 'neutral',
  project: 'brand',
};

function resolveToolIcon(iconKey: string | undefined): LucideIcon {
  if (!iconKey) return Settings;
  return TOOL_ICON_MAP[iconKey.trim().toLowerCase()] ?? Settings;
}

function resolveToolTint(iconKey: string | undefined): LauncherTileTint {
  if (!iconKey) return 'brand';
  return TOOL_TINT_MAP[iconKey.trim().toLowerCase()] ?? 'brand';
}

function resolveGroupIcon(groupTitle: string): LucideIcon {
  const key = groupTitle.toLowerCase();
  if (key.includes('safety') || key.includes('field')) return Shield;
  if (key.includes('finance') || key.includes('accounting')) return DollarSign;
  if (key.includes('admin')) return Building2;
  if (key.includes('hr') || key.includes('human') || key.includes('people')) return Users;
  if (key.includes('training') || key.includes('compliance')) return FileText;
  return Settings;
}

function resolvePlatformIcon(platform: LauncherPlatformRecord): LucideIcon {
  const manifestIcon = PLATFORM_FALLBACK_ICON[platform.platformKey];
  if (manifestIcon) return manifestIcon;
  const iconHint = platform.category?.toLowerCase() ?? platform.platformKey;
  return resolveToolIcon(iconHint);
}

function platformToTile(platform: LauncherPlatformRecord) {
  const iconHint = platform.category?.toLowerCase() ?? platform.platformKey;
  return {
    id: platform.platformKey,
    label: platform.name,
    description: platform.descriptor,
    icon: resolvePlatformIcon(platform),
    tint: resolveToolTint(iconHint),
    href: platform.launchUrl,
  };
}

// ── Workflow shelves renderer ──

const shelfHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgba(0,0,0,0.55)',
  paddingBottom: HP_SPACE.sm,
  borderBottom: HP_BORDER.subtle,
};

function renderWorkflowShelves(shelves: { shelfName: string; platforms: LauncherPlatformRecord[] }[]): React.ReactNode {
  if (shelves.length === 0) return null;

  return (
    <>
      {shelves.map((shelf) => (
        <div key={shelf.shelfName}>
          <h4 style={shelfHeadingStyle}>{shelf.shelfName}</h4>
          <HbcLauncherSurface
            groups={[
              {
                id: `shelf-${shelf.shelfName.toLowerCase().replace(/\s+/g, '-')}`,
                label: shelf.shelfName,
                icon: resolveGroupIcon(shelf.shelfName),
                tiles: shelf.platforms.map(platformToTile),
              },
            ]}
            layout="grid"
          />
        </div>
      ))}
    </>
  );
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

    const presentation = deriveToolLauncherPresentation(listPlatforms);

    return (
      <LauncherCompositionShell
        commandBand={<LauncherCommandBand platformCount={listPlatforms.length} />}
        flagshipStage={<LauncherFlagshipStage platforms={presentation.featuredStage.platforms} />}
        utilityRail={<LauncherUtilityRail presentation={presentation} platforms={listPlatforms} />}
        workflowShelves={renderWorkflowShelves(presentation.workflowShelves)}
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
