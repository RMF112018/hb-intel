/**
 * ToolLauncherWorkHub — Premium command launcher surface
 *
 * Primary data source: live SharePoint list "Tool Launcher Contents"
 * via useToolLauncherData(). Falls back to manifest config props when
 * running outside SPFx (local dev / demo / packaging).
 *
 * Live data is normalized into LauncherPlatformRecord[] and bridged
 * into the existing HbcLauncherSurface grouped rendering model.
 * Featured platforms form the first group; workflow shelves form
 * subsequent groups. This bridge keeps the current renderer alive
 * during phased implementation toward the full 3-zone composition.
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
import type { ToolLauncherWorkHubConfig } from '../../homepage/webparts/utilityContracts.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Platform-specific fallback icons (from asset manifest fallbackLucideIcon) ──
// Used when logo assets are unavailable. Keyed by platformKey (slugified name).

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

// ── Lucide icon resolution (transitional — will be replaced by logo assets) ──

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

// ── Bridge: live data → LauncherGroup[] for HbcLauncherSurface ──

function platformToTile(platform: LauncherPlatformRecord) {
  // Resolution order (transitional until logo assets):
  // 1. Platform-specific fallback from asset manifest (by platformKey)
  // 2. Category-based icon hint
  // 3. Default Settings icon
  const manifestIcon = PLATFORM_FALLBACK_ICON[platform.platformKey];
  const iconHint = platform.category?.toLowerCase() ?? platform.platformKey;
  return {
    id: platform.platformKey,
    label: platform.name,
    description: platform.descriptor,
    icon: manifestIcon ?? resolveToolIcon(iconHint),
    tint: resolveToolTint(iconHint),
    href: platform.launchUrl,
  };
}

function bridgeLiveDataToGroups(platforms: LauncherPlatformRecord[]): LauncherGroup[] {
  const presentation = deriveToolLauncherPresentation(platforms);
  const groups: LauncherGroup[] = [];

  // Featured platforms as the first group
  if (presentation.featuredStage.platforms.length > 0) {
    groups.push({
      id: 'featured',
      label: 'Featured Platforms',
      icon: Building2,
      tiles: presentation.featuredStage.platforms.map(platformToTile),
    });
  }

  // Workflow shelves as subsequent groups
  for (const shelf of presentation.workflowShelves) {
    groups.push({
      id: `shelf-${shelf.shelfName.toLowerCase().replace(/\s+/g, '-')}`,
      label: shelf.shelfName,
      icon: resolveGroupIcon(shelf.shelfName),
      tiles: shelf.platforms.map(platformToTile),
    });
  }

  // Unshelved, non-featured platforms as a catch-all group
  const shelvedKeys = new Set<string>();
  for (const shelf of presentation.workflowShelves) {
    for (const p of shelf.platforms) shelvedKeys.add(p.platformKey);
  }
  const featuredKeys = new Set(presentation.featuredStage.platforms.map((p) => p.platformKey));
  const unshelved = platforms.filter((p) => !shelvedKeys.has(p.platformKey) && !featuredKeys.has(p.platformKey));

  if (unshelved.length > 0) {
    groups.push({
      id: 'other-platforms',
      label: 'Other Platforms',
      icon: Settings,
      tiles: unshelved.map(platformToTile),
    });
  }

  return groups;
}

// ── Component ──

export function ToolLauncherWorkHub({ config, activeAudience, isLoading = false }: ToolLauncherWorkHubProps): React.JSX.Element {
  const { platforms: listPlatforms, isLoading: listLoading, error: listError } = useToolLauncherData();

  if (isLoading || listLoading) {
    return <HomepageLoadingState label="Loading tool launchers" />;
  }

  // Live list data is the primary operating model.
  // On fetch error: fall through to config fallback silently (no error UI for end users).
  // Manifest config (props) is the narrow fallback for local dev / demo / packaging / errors.
  if (listPlatforms && !listError) {
    const groups = bridgeLiveDataToGroups(listPlatforms);
    if (groups.length === 0) {
      const message = resolveAuthoringMessage('toolLauncherWorkHub', 'listEmpty');
      return <HomepageEmptyState title={message.title} description={message.description} />;
    }
    return (
      <HbcLauncherSurface
        groups={groups}
        layout="grid"
        aria-label="Tool Launcher / Work Hub"
      />
    );
  }

  // Fallback: local grouped config (transitional for non-SPFx environments)
  const normalized = normalizeToolLauncherWorkHubConfig(config, activeAudience);
  if (normalized.groups.length === 0) {
    const hasConfiguredInput = Boolean(config?.groups?.length);
    const message = resolveAuthoringMessage('toolLauncherWorkHub', hasConfiguredInput ? 'invalid' : 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const groups: LauncherGroup[] = normalized.groups.map((group) => ({
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
  }));

  return (
    <HbcLauncherSurface
      groups={groups}
      layout="grid"
      aria-label={normalized.heading}
    />
  );
}
