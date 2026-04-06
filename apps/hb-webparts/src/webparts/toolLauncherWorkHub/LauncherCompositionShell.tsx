/**
 * LauncherCompositionShell — Desktop anatomy shell for Tool Launcher.
 *
 * Implements the 4-region desktop layout:
 *   1. Command band (top) — title, search placeholder, utility actions
 *   2. Flagship stage (primary body, left ~65%) — featured platforms
 *   3. Utility rail (secondary body, right ~35%) — support, notices
 *   4. Workflow shelves (below body) — categorized platform groups
 *
 * This shell owns layout/spacing only. Each region accepts ReactNode
 * children so downstream prompts can deepen visuals without redoing
 * the structural composition.
 *
 * Phase 02-01: Desktop skeleton — composition first, not polish first.
 */
import * as React from 'react';
import { HP_SPACE, HP_RADIUS, HP_BORDER } from '../../homepage/tokens.js';

/* ── Region props ────────────────────────────────────────────────── */

export interface LauncherCompositionShellProps {
  /** Command band content (title, search, utility actions). Suppressed if absent. */
  commandBand?: React.ReactNode;
  /** Flagship stage content (featured platform cards). Required for meaningful render. */
  flagshipStage?: React.ReactNode;
  /** Utility rail content (support, notices, favorites). Suppressed if absent. */
  utilityRail?: React.ReactNode;
  /** Workflow shelf content (categorized platform groups). Suppressed if absent. */
  workflowShelves?: React.ReactNode;
  /** aria-label for the launcher landmark */
  'aria-label'?: string;
}

/* ── Styles ──────────────────────────────────────────────────────── */

const shellStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
};

const commandBandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: HP_SPACE.xl,
  padding: `${HP_SPACE.md}px ${HP_SPACE.lg}px`,
  borderRadius: HP_RADIUS.command,
  border: HP_BORDER.subtle,
  background: 'rgba(34,83,145,0.03)',
  minHeight: 40,
};

/** 8/4 desktop split: flagship stage ~65%, utility rail ~35% */
const bodyStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: HP_SPACE.xl,
};

const bodyWithRailStyle: React.CSSProperties = {
  ...bodyStyle,
  gridTemplateColumns: '2fr 1fr',
};

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
  'aria-label': ariaLabel = 'Tool Launcher / Work Hub',
}: LauncherCompositionShellProps): React.JSX.Element {
  const hasBody = flagshipStage || utilityRail;
  const hasRail = Boolean(utilityRail);

  return (
    <div role="region" aria-label={ariaLabel} style={shellStyle}>
      {commandBand && (
        <div data-launcher-region="command-band" style={commandBandStyle}>
          {commandBand}
        </div>
      )}

      {hasBody && (
        <div
          data-launcher-region="body"
          style={hasRail ? bodyWithRailStyle : bodyStyle}
        >
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
