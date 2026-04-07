/**
 * LauncherWorkflowShelves — Premium secondary platform groupings by work pattern.
 *
 * Phase 11B: Composition re-architecture. Stronger heading treatment with
 * brand-accented section dividers, tighter rhythm, and better visual
 * subordination to the flagship stage.
 *
 * Each shelf has a heading row with icon, name, and count badge, followed
 * by a responsive card grid. Empty shelves are suppressed by the
 * normalization layer (zero-platform shelves are never derived).
 */
import * as React from 'react';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import { resolveGroupIcon } from './launcherIconResolution.js';
import { LauncherShelfCard } from './LauncherShelfCard.js';
import type { LauncherWorkflowShelf } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherWorkflowShelvesProps {
  shelves: LauncherWorkflowShelf[];
}

/* ── Styles ───────────────────────────────────────────────────────── */

const shelfContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
};

const shelfHeadingRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  margin: 0,
  paddingBottom: HP_SPACE.md,
  borderBottom: HP_BORDER.brandAccent,
};

const shelfIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(34,83,145,0.06)',
  flexShrink: 0,
};

const shelfTitleStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 650,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgba(0,0,0,0.55)',
};

const shelfCountStyle: React.CSSProperties = {
  fontSize: '0.64rem',
  fontWeight: 500,
  padding: `1px ${HP_SPACE.sm}px`,
  borderRadius: 4,
  background: 'rgba(34,83,145,0.07)',
  color: 'rgba(34,83,145,0.6)',
};

const shelfGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: HP_SPACE.lg,
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherWorkflowShelves({ shelves }: LauncherWorkflowShelvesProps): React.JSX.Element | null {
  if (shelves.length === 0) return null;

  return (
    <>
      {shelves.map((shelf) => {
        const GroupIcon = resolveGroupIcon(shelf.shelfName);
        return (
          <div key={shelf.shelfId} style={shelfContainerStyle} data-launcher-shelf={shelf.shelfId}>
            <div style={shelfHeadingRowStyle}>
              <div style={shelfIconStyle}>
                <GroupIcon size={13} strokeWidth={2} color="rgba(34,83,145,0.5)" />
              </div>
              <span style={shelfTitleStyle}>{shelf.shelfName}</span>
              <span style={shelfCountStyle}>{shelf.platformCount}</span>
            </div>
            <div style={shelfGridStyle}>
              {shelf.platforms.map((p) => (
                <LauncherShelfCard key={p.platformKey} platform={p} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
