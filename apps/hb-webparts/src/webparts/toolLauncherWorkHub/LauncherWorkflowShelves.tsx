/**
 * LauncherWorkflowShelves — Secondary platform groupings by work pattern.
 *
 * Phase 05-02: Renders LauncherShelfCard instances instead of delegating
 * to HbcLauncherSurface. Each shelf has a heading row with name + count
 * badge, followed by a responsive card grid.
 *
 * Shelf cards are medium-weight (40px logo, horizontal layout, no motion)
 * — visually subordinate to flagship cards (56px logo, column layout,
 * spring motion, CTA row).
 *
 * Empty shelves are suppressed by the normalization layer (zero-platform
 * shelves are never derived). The component returns null if the shelves
 * array is empty.
 */
import * as React from 'react';
import { HP_SPACE, HP_BORDER } from '../../homepage/tokens.js';
import { LauncherShelfCard } from './LauncherShelfCard.js';
import type { LauncherWorkflowShelf } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherWorkflowShelvesProps {
  shelves: LauncherWorkflowShelf[];
}

/* ── Styles ───────────────────────────────────────────────────────── */

const shelfContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
};

const shelfHeadingRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.sm,
  margin: 0,
  paddingBottom: HP_SPACE.sm,
  borderBottom: HP_BORDER.subtle,
};

const shelfTitleStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgba(0,0,0,0.5)',
};

const shelfCountStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  fontWeight: 500,
  padding: `0 ${HP_SPACE.xs}px`,
  borderRadius: 3,
  background: 'rgba(0,0,0,0.06)',
  color: 'rgba(0,0,0,0.45)',
};

const shelfGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: HP_SPACE.md,
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherWorkflowShelves({ shelves }: LauncherWorkflowShelvesProps): React.JSX.Element | null {
  if (shelves.length === 0) return null;

  return (
    <>
      {shelves.map((shelf) => (
        <div key={shelf.shelfId} style={shelfContainerStyle} data-launcher-shelf={shelf.shelfId}>
          <div style={shelfHeadingRowStyle}>
            <span style={shelfTitleStyle}>{shelf.shelfName}</span>
            <span style={shelfCountStyle}>{shelf.platformCount}</span>
          </div>
          <div style={shelfGridStyle}>
            {shelf.platforms.map((p) => (
              <LauncherShelfCard key={p.platformKey} platform={p} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
