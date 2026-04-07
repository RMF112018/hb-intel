/**
 * LauncherCompositionShell — Premium responsive anatomy shell for Tool Launcher.
 *
 * Phase 11B: Composition re-architecture with zone-differentiated regions,
 * stronger visual hierarchy, and premium surface treatment.
 *
 * Desktop (≥1200px): asymmetric body split (5fr/2fr), zone backgrounds
 * Tablet (768–1199px): stacked body (flagship full-width, rail below)
 * Mobile (≤767px): stacked, compact spacing
 *
 * Each region accepts ReactNode children. The shell owns layout, spacing,
 * and zone-level visual treatment — region components own content.
 */
import * as React from 'react';
import { HP_SPACE, HP_RADIUS, HP_BORDER } from '../../homepage/tokens.js';
import type { ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';

/* ── Region props ────────────────────────────────────────────────── */

export interface LauncherCompositionShellProps {
  /** Command band content. Suppressed if absent. */
  commandBand?: React.ReactNode;
  /** Flagship stage content. Required for meaningful render. */
  flagshipStage?: React.ReactNode;
  /** Utility rail content. Suppressed if absent. */
  utilityRail?: React.ReactNode;
  /** Workflow shelf content. Suppressed if absent. */
  workflowShelves?: React.ReactNode;
  /** Current responsive tier. Defaults to 'desktop'. */
  tier?: ResponsiveTier;
  /** aria-label for the launcher landmark */
  'aria-label'?: string;
}

/* ── Style factories ─────────────────────────────────────────────── */

function getShellStyle(tier: ResponsiveTier): React.CSSProperties {
  const compact = tier === 'mobile';
  const padding = compact ? HP_SPACE.xl : HP_SPACE['3xl'];
  return {
    display: 'grid',
    gap: compact ? HP_SPACE.xl : HP_SPACE['2xl'],
    padding,
    borderRadius: HP_RADIUS.editorial,
    border: HP_BORDER.brandAccent,
    background: 'linear-gradient(180deg, rgba(34,83,145,0.035) 0%, rgba(255,255,255,0.6) 100%)',
    position: 'relative',
    overflow: 'hidden',
  };
}

/** Brand accent bar at the top of the shell */
const accentBarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 3,
  background: 'linear-gradient(90deg, #225391 0%, rgba(229,126,70,0.7) 100%)',
  borderRadius: `${HP_RADIUS.editorial}px ${HP_RADIUS.editorial}px 0 0`,
};

function getBodyStyle(tier: ResponsiveTier, hasRail: boolean): React.CSSProperties {
  const useSideBySide = tier === 'desktop' && hasRail;
  return {
    display: 'grid',
    gridTemplateColumns: useSideBySide ? '5fr 2fr' : '1fr',
    gap: useSideBySide ? HP_SPACE['2xl'] : HP_SPACE.xl,
    alignItems: 'start',
  };
}

const flagshipStageStyle: React.CSSProperties = {
  minWidth: 0,
};

const utilityRailStyle: React.CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: HP_SPACE.lg,
  alignContent: 'start',
  padding: HP_SPACE.xl,
  background: 'rgba(34,83,145,0.02)',
  borderRadius: HP_RADIUS.card,
  border: HP_BORDER.subtle,
};

function getShelvesStyle(tier: ResponsiveTier): React.CSSProperties {
  const compact = tier === 'mobile';
  return {
    display: 'grid',
    gap: compact ? HP_SPACE.xl : HP_SPACE['2xl'],
    paddingTop: HP_SPACE.lg,
    borderTop: HP_BORDER.subtle,
  };
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherCompositionShell({
  commandBand,
  flagshipStage,
  utilityRail,
  workflowShelves,
  tier = 'desktop',
  'aria-label': ariaLabel = 'Tool Launcher / Work Hub',
}: LauncherCompositionShellProps): React.JSX.Element {
  const hasBody = flagshipStage || utilityRail;
  const hasRail = Boolean(utilityRail);

  return (
    <div role="region" aria-label={ariaLabel} style={getShellStyle(tier)}>
      {/* Brand accent bar */}
      <div style={accentBarStyle} aria-hidden="true" />

      {commandBand && (
        <div data-launcher-region="command-band">
          {commandBand}
        </div>
      )}

      {hasBody && (
        <div data-launcher-region="body" style={getBodyStyle(tier, hasRail)}>
          {flagshipStage && (
            <div data-launcher-region="flagship-stage" style={flagshipStageStyle}>
              {flagshipStage}
            </div>
          )}
          {utilityRail && (
            <aside data-launcher-region="utility-rail" style={utilityRailStyle}>
              {utilityRail}
            </aside>
          )}
        </div>
      )}

      {workflowShelves && (
        <div data-launcher-region="workflow-shelves" style={getShelvesStyle(tier)}>
          {workflowShelves}
        </div>
      )}
    </div>
  );
}
