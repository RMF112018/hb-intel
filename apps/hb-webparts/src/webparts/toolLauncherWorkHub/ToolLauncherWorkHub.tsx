/**
 * ToolLauncherWorkHub — Premium command launcher surface
 * Phase 17-04 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcLauncherSurface with icon-led tiles, grouped
 * categories, and motion interaction feedback. Replaces the old
 * composition shells (HomepageRailShell, HomepageUtilityDenseGroup)
 * with the dedicated launcher surface.
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
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { ToolLauncherWorkHubConfig } from '../../homepage/webparts/utilityContracts.js';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Lucide icon resolution for tool keys ─────────────────────────────

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
  return Settings;
}

export function ToolLauncherWorkHub({ config, activeAudience, isLoading = false }: ToolLauncherWorkHubProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading tool launchers" />;
  }

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
