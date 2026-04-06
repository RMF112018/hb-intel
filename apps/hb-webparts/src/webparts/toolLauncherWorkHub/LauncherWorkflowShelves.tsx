/**
 * LauncherWorkflowShelves — Secondary platform groupings by work pattern.
 *
 * Phase 02-04: Dedicated component for workflow shelf scaffolds.
 * Renders platforms grouped by their WorkflowShelf field value (e.g.,
 * "People & Payroll", "Field & Operations", "Training & Compliance",
 * "Finance & Admin").
 *
 * Visually secondary to the flagship stage — uses the existing
 * HbcLauncherSurface tile grid with smaller tiles. Each shelf has
 * an uppercase category heading with a subtle bottom border.
 *
 * Shelves are independently suppressible: empty shelves are not
 * rendered, and the component returns null if all shelves are empty.
 * Shelf ordering is preserved from the normalization layer
 * (alphabetical by shelf name).
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

const shelfHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.78rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'rgba(0,0,0,0.5)',
  paddingBottom: HP_SPACE.sm,
  borderBottom: HP_BORDER.subtle,
};

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherWorkflowShelves({ shelves }: LauncherWorkflowShelvesProps): React.JSX.Element | null {
  if (shelves.length === 0) return null;

  return (
    <>
      {shelves.map((shelf) => (
        <div key={shelf.shelfName} style={shelfContainerStyle} data-launcher-shelf={shelf.shelfName}>
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
