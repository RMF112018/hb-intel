/**
 * LauncherWorkflowShelves — Secondary platform groupings by work pattern.
 *
 * Phase 05-01: Contract-driven shelf rendering using enriched
 * LauncherWorkflowShelf with shelfId, platformCount, and pre-sorted
 * platforms from the normalization layer.
 *
 * Shelf headings show the shelf name + platform count badge.
 * Visually secondary to the flagship stage — uses HbcLauncherSurface
 * tile grid with smaller tiles.
 *
 * Empty shelves are suppressed by the normalization layer (zero-platform
 * shelves are never derived). The component returns null if the shelves
 * array is empty.
 */
import * as React from 'react';
import { HbcLauncherSurface } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER } from '../../homepage/tokens.js';
import { resolveGroupIcon, platformToTile } from './launcherIconResolution.js';
import type { LauncherWorkflowShelf } from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherWorkflowShelvesProps {
  shelves: LauncherWorkflowShelf[];
}

/* ── Styles ───────────────────────────────────────────────────────── */

const shelfContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.md,
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
          <HbcLauncherSurface
            groups={[
              {
                id: shelf.shelfId,
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
