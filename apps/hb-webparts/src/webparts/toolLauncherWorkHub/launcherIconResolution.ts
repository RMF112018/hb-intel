/**
 * Shared icon and tint resolution for Tool Launcher components.
 *
 * Consolidates the icon maps and resolution functions previously
 * duplicated across ToolLauncherWorkHub, LauncherFlagshipStage, and
 * workflow shelf rendering. Used by all launcher composition components.
 *
 * Resolution chain for platform icons (transitional until logo assets):
 *   1. Platform-specific fallback from asset manifest (by platformKey)
 *   2. Category-based icon from TOOL_ICON_MAP
 *   3. Default Settings icon
 */
import {
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
  type LauncherTileTint,
} from '@hbc/ui-kit/homepage';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Platform-specific fallback icons (from asset manifest fallbackLucideIcon) ── */

export const PLATFORM_FALLBACK_ICON: Record<string, LucideIcon> = {
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

/* ── Category-based icon and tint maps ── */

export const TOOL_ICON_MAP: Record<string, LucideIcon> = {
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

export const TOOL_TINT_MAP: Record<string, LauncherTileTint> = {
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

/* ── Resolution functions ── */

export function resolveToolIcon(iconKey: string | undefined): LucideIcon {
  if (!iconKey) return Settings;
  return TOOL_ICON_MAP[iconKey.trim().toLowerCase()] ?? Settings;
}

export function resolveToolTint(iconKey: string | undefined): LauncherTileTint {
  if (!iconKey) return 'brand';
  return TOOL_TINT_MAP[iconKey.trim().toLowerCase()] ?? 'brand';
}

export function resolveGroupIcon(groupTitle: string): LucideIcon {
  const key = groupTitle.toLowerCase();
  if (key.includes('safety') || key.includes('field')) return Shield;
  if (key.includes('finance') || key.includes('accounting')) return DollarSign;
  if (key.includes('admin')) return Building2;
  if (key.includes('hr') || key.includes('human') || key.includes('people')) return Users;
  if (key.includes('training') || key.includes('compliance')) return FileText;
  return Settings;
}

export function resolvePlatformIcon(platform: LauncherPlatformRecord): LucideIcon {
  const manifestIcon = PLATFORM_FALLBACK_ICON[platform.platformKey];
  if (manifestIcon) return manifestIcon;
  const iconHint = platform.category?.toLowerCase() ?? platform.platformKey;
  return resolveToolIcon(iconHint);
}

export function platformToTile(platform: LauncherPlatformRecord) {
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
