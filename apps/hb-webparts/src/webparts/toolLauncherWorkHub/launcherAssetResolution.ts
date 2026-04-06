/**
 * Asset resolution for Tool Launcher flagship cards.
 *
 * Bridges launcher record metadata with the tool-launcher asset manifest
 * to determine the best logo treatment for each platform. Resolution order:
 *
 *   1. Launcher record logoAssetRef (from SharePoint list) — if valid
 *   2. Asset manifest light variant (governed logo path) — if record has
 *      a matching manifest entry by platformKey
 *   3. Governed fallback from manifest (fallbackLucideIcon, fallbackLabel)
 *   4. Platform-specific or category-based Lucide icon from icon resolution
 *
 * The result is a LogoResolution object describing what to render:
 *   - 'image': render <img> with the resolved src
 *   - 'icon': render a Lucide icon (from manifest fallback or icon resolution)
 *   - 'monogram': render a text monogram (first letter of platform name)
 */
import {
  Settings,
  Users,
  Briefcase,
  BarChart3,
  Building2,
  FileText,
  type LucideIcon,
} from '@hbc/ui-kit/homepage';
import { resolvePlatformIcon } from './launcherIconResolution.js';
import type { LauncherPlatformRecord } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Asset manifest data (from tool-launcher-asset-manifest.ts) ── */

interface ManifestFallback {
  fallbackLabel: string;
  fallbackLucideIcon?: string;
}

interface ManifestEntry {
  lightLogo: string | null;
  darkLogo: string | null;
  fallback: ManifestFallback;
}

/**
 * Inline manifest data for the 9 known platforms. Sourced from the
 * planning artifact tool-launcher-asset-manifest.ts. Kept inline to
 * avoid importing from docs/architecture/plans.
 */
const ASSET_MANIFEST: Record<string, ManifestEntry> = {
  bamboohr: {
    lightLogo: '/assets/tool-launcher/vendors/bamboohr/bamboohr-logo-full-color.svg',
    darkLogo: '/assets/tool-launcher/vendors/bamboohr/bamboohr-logo-white.svg',
    fallback: { fallbackLabel: 'BambooHR', fallbackLucideIcon: 'Users' },
  },
  hh2: {
    lightLogo: '/assets/tool-launcher/vendors/hh2/hh2-wordmark-light.svg',
    darkLogo: '/assets/tool-launcher/vendors/hh2/hh2-wordmark-dark.svg',
    fallback: { fallbackLabel: 'hh2', fallbackLucideIcon: 'Briefcase' },
  },
  'sap-concur': {
    lightLogo: '/assets/tool-launcher/vendors/sap-concur/sap-concur-wordmark-light.svg',
    darkLogo: '/assets/tool-launcher/vendors/sap-concur/sap-concur-wordmark-dark.svg',
    fallback: { fallbackLabel: 'SAP Concur', fallbackLucideIcon: 'Receipt' },
  },
  'employee-navigator': {
    lightLogo: '/assets/tool-launcher/vendors/employee-navigator/employee-navigator-color.svg',
    darkLogo: '/assets/tool-launcher/vendors/employee-navigator/employee-navigator-white.svg',
    fallback: { fallbackLabel: 'Employee Navigator', fallbackLucideIcon: 'Users' },
  },
  adp: {
    lightLogo: '/assets/tool-launcher/vendors/adp/adp-wordmark-red.svg',
    darkLogo: '/assets/tool-launcher/vendors/adp/adp-wordmark-white.svg',
    fallback: { fallbackLabel: 'ADP', fallbackLucideIcon: 'Receipt' },
  },
  procore: {
    lightLogo: '/assets/tool-launcher/vendors/procore/procore-wordmark-orange.svg',
    darkLogo: '/assets/tool-launcher/vendors/procore/procore-wordmark-white.svg',
    fallback: { fallbackLabel: 'Procore', fallbackLucideIcon: 'Building2' },
  },
  compass: {
    lightLogo: '/assets/tool-launcher/vendors/compass/compass-wordmark-light.svg',
    darkLogo: '/assets/tool-launcher/vendors/compass/compass-wordmark-dark.svg',
    fallback: { fallbackLabel: 'COMPASS', fallbackLucideIcon: 'Compass' },
  },
  'document-crunch': {
    lightLogo: '/assets/tool-launcher/vendors/document-crunch/document-crunch-wordmark-light.svg',
    darkLogo: '/assets/tool-launcher/vendors/document-crunch/document-crunch-wordmark-dark.svg',
    fallback: { fallbackLabel: 'Document Crunch', fallbackLucideIcon: 'FileText' },
  },
  hedricklearn: {
    lightLogo: '/assets/tool-launcher/vendors/hedricklearn/hedricklearn-tenant-wordmark-light.svg',
    darkLogo: '/assets/tool-launcher/vendors/hedricklearn/hedricklearn-tenant-wordmark-dark.svg',
    fallback: { fallbackLabel: 'HedrickLearn', fallbackLucideIcon: 'GraduationCap' },
  },
};

/** Map manifest fallbackLucideIcon names to actual Lucide components */
const LUCIDE_NAME_MAP: Record<string, LucideIcon> = {
  Users,
  Briefcase,
  Receipt: BarChart3, // Receipt not in homepage exports; use BarChart3
  Building2,
  Compass: Settings, // Compass not in homepage exports; use Settings
  FileText,
  GraduationCap: FileText, // GraduationCap not in homepage exports; use FileText
};

/* ── Resolution types ────────────────────────────────────────────── */

export type LogoResolution =
  | { type: 'image'; src: string; alt: string }
  | { type: 'icon'; icon: LucideIcon }
  | { type: 'monogram'; letter: string; label: string };

/* ── Resolution function ─────────────────────────────────────────── */

/**
 * Resolve the best logo treatment for a platform.
 *
 * @param platform Normalized launcher record
 * @param preferDark When true, prefer dark logo variant (for dark surfaces)
 */
export function resolveLogoAsset(
  platform: LauncherPlatformRecord,
  preferDark = false,
): LogoResolution {
  // 1. Launcher record logoAssetRef (from SharePoint list)
  if (platform.logoAssetRef) {
    return {
      type: 'image',
      src: preferDark && platform.darkLogoAssetRef ? platform.darkLogoAssetRef : platform.logoAssetRef,
      alt: `${platform.name} logo`,
    };
  }

  // 2. Asset manifest governed logo
  const manifest = ASSET_MANIFEST[platform.platformKey];
  if (manifest) {
    const src = preferDark ? (manifest.darkLogo ?? manifest.lightLogo) : manifest.lightLogo;
    if (src) {
      return { type: 'image', src, alt: `${platform.name} logo` };
    }

    // 3. Manifest-governed fallback icon
    const iconName = manifest.fallback.fallbackLucideIcon;
    if (iconName && LUCIDE_NAME_MAP[iconName]) {
      return { type: 'icon', icon: LUCIDE_NAME_MAP[iconName] };
    }

    // Manifest exists but no usable logo or icon — use monogram
    return {
      type: 'monogram',
      letter: manifest.fallback.fallbackLabel.charAt(0).toUpperCase(),
      label: manifest.fallback.fallbackLabel,
    };
  }

  // 4. No manifest entry — use platform/category icon resolution
  return { type: 'icon', icon: resolvePlatformIcon(platform) };
}
