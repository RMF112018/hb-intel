/**
 * LauncherCompositionShell — Responsive anatomy shell for Tool Launcher.
 *
 * Phase 07-01: Responsive contract implemented via ResponsiveTier prop.
 *
 * Desktop (≥1200px): 2fr/1fr body split, 16px gap/padding
 * Tablet (768–1199px): stacked body (flagship full-width, rail below), 16px gap/padding
 * Mobile (≤767px): stacked, 12px gap/padding, tighter spacing
 *
 * Each region accepts ReactNode children. The shell owns layout and
 * spacing — region components handle their own content adaptation.
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
  return {
    display: 'grid',
    gap: compact ? HP_SPACE.xl : HP_SPACE['2xl'],
    padding: compact ? HP_SPACE.xl : HP_SPACE['2xl'],
    borderRadius: HP_RADIUS.card,
    border: HP_BORDER.subtle,
    background: 'rgba(255,255,255,0.4)',
  };
}

function getBodyStyle(tier: ResponsiveTier, hasRail: boolean): React.CSSProperties {
  const useSideBySide = tier === 'desktop' && hasRail;
  return {
    display: 'grid',
    gridTemplateColumns: useSideBySide ? '2fr 1fr' : '1fr',
    gap: HP_SPACE.xl,
  };
}

const flagshipStageStyle: React.CSSProperties = {
  minWidth: 0,
};

const utilityRailStyle: React.CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: HP_SPACE.md,
  alignContent: 'start',
};

const shelvesStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
};

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
        <div data-launcher-region="workflow-shelves" style={shelvesStyle}>
          {workflowShelves}
        </div>
      )}
    </div>
  );
}
