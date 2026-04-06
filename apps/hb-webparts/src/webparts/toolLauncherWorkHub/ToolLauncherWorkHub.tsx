/**
 * ToolLauncherWorkHub — Premium command launcher surface
 *
 * Phase 02-01: Desktop composition skeleton using LauncherCompositionShell.
 *
 * Primary data source: live SharePoint list "Tool Launcher Contents"
 * via useToolLauncherData(). Falls back to manifest config props when
 * running outside SPFx (local dev / demo / packaging).
 *
 * Live data is rendered through the 4-region composition shell:
 *   1. Command band — title + placeholder action area
 *   2. Flagship stage — featured platforms as prominent launch cards
 *   3. Utility rail — notices summary (support/access deferred)
 *   4. Workflow shelves — categorized platform groups
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
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import type { ToolLauncherWorkHubConfig } from '../../homepage/webparts/utilityContracts.js';
import type { LauncherPlatformRecord, LauncherPresentationModel } from '../../homepage/webparts/toolLauncherContracts.js';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ── Platform-specific fallback icons (from asset manifest fallbackLucideIcon) ──

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

// ── Region renderers for the composition shell ──

const flagshipCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(255,255,255,0.6)',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'box-shadow 150ms ease, transform 150ms ease',
};

const flagshipIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(34,83,145,0.06)',
  flexShrink: 0,
};

const flagshipNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  fontWeight: 600,
};

const flagshipDescStyle: React.CSSProperties = {
  margin: `${HP_SPACE.xs}px 0 0`,
  fontSize: '0.78rem',
  color: 'rgba(0,0,0,0.6)',
};

const flagshipGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: HP_SPACE.xl,
};

function renderFlagshipStage(platforms: LauncherPlatformRecord[]): React.ReactNode {
  if (platforms.length === 0) return null;
  return (
    <div style={flagshipGridStyle}>
      {platforms.map((p) => {
        const Icon = resolvePlatformIcon(p);
        return (
          <a
            key={p.platformKey}
            href={p.launchUrl}
            target={p.openInNewTab ? '_blank' : undefined}
            rel={p.openInNewTab ? 'noopener noreferrer' : undefined}
            style={flagshipCardStyle}
          >
            <div style={flagshipIconContainerStyle}>
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <div>
              <p style={flagshipNameStyle}>{p.name}</p>
              {p.descriptor && <p style={flagshipDescStyle}>{p.descriptor}</p>}
            </div>
          </a>
        );
      })}
    </div>
  );
}

const railSectionStyle: React.CSSProperties = {
  padding: HP_SPACE.lg,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(0,0,0,0.015)',
};

const railHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgba(0,0,0,0.5)',
};

const railItemStyle: React.CSSProperties = {
  marginTop: HP_SPACE.md,
  fontSize: '0.8rem',
  color: 'rgba(0,0,0,0.7)',
};

function renderUtilityRail(presentation: LauncherPresentationModel): React.ReactNode {
  const { activeNotices } = presentation.noticesSummary;
  // Rail is suppressible when no content is available
  if (activeNotices.length === 0) return null;

  return (
    <div style={railSectionStyle}>
      <h4 style={railHeadingStyle}>Platform Notices</h4>
      {activeNotices.map((n) => (
        <div key={n.platformKey} style={railItemStyle}>
          <strong>{n.name}</strong>: {n.notice.label}
          {n.notice.details && <span> — {n.notice.details}</span>}
        </div>
      ))}
    </div>
  );
}

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

function renderWorkflowShelves(presentation: LauncherPresentationModel): React.ReactNode {
  if (presentation.workflowShelves.length === 0) return null;

  return (
    <>
      {presentation.workflowShelves.map((shelf) => (
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

// ── Config fallback bridge (unchanged from Phase 01) ──

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
        flagshipStage={renderFlagshipStage(presentation.featuredStage.platforms)}
        utilityRail={renderUtilityRail(presentation)}
        workflowShelves={renderWorkflowShelves(presentation)}
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
