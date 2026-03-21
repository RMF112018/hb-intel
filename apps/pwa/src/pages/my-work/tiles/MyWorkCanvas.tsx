/**
 * MyWorkCanvas — lightweight canvas renderer for My Work Hub zones.
 *
 * Uses @hbc/project-canvas registry primitives (getAll) to resolve registered
 * tiles, then renders them using React.Suspense with complexity-variant
 * selection. Unlike HbcProjectCanvas, this does not call CanvasApi (no
 * projectId needed) and does not use ROLE_DEFAULT_TILES (my-work tiles
 * have their own defaultForRoles gating).
 *
 * Renders tiles as direct children (React fragment) so they participate
 * in the parent zone's 12-column CSS grid from HubZoneLayout.
 *
 * G0 — P2-F1 §2.2
 */
import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ComplexityTier, ICanvasTileDefinition } from '@hbc/project-canvas';
import { getAll } from '@hbc/project-canvas';
import { useAuthStore } from '@hbc/auth';

/** Complexity tier ordering for minComplexity filtering. */
const TIER_ORDER: Record<ComplexityTier, number> = {
  essential: 0,
  standard: 1,
  expert: 2,
};

export interface MyWorkCanvasProps {
  /** Filter tiles to those whose tileKey starts with this prefix. */
  tilePrefix: string;
  /** Current complexity tier — selects the tile component variant. */
  complexityTier: ComplexityTier;
}

export function MyWorkCanvas({ tilePrefix, complexityTier }: MyWorkCanvasProps): ReactNode {
  const session = useAuthStore((s) => s.session);
  const userRoles = session?.resolvedRoles ?? [];

  const tiles = useMemo(() => {
    const all = getAll();
    return all.filter((tile) => {
      // Filter by zone prefix
      if (!tile.tileKey.startsWith(tilePrefix)) return false;
      // Filter by minimum complexity tier
      if (tile.minComplexity && TIER_ORDER[tile.minComplexity] > TIER_ORDER[complexityTier]) {
        return false;
      }
      // Filter by role — tile shows if any user role matches defaultForRoles
      if (tile.defaultForRoles.length > 0) {
        const hasRole = tile.defaultForRoles.some((r) => userRoles.includes(r));
        if (!hasRole) return false;
      }
      return true;
    });
  }, [tilePrefix, complexityTier, userRoles]);

  return (
    <>
      {tiles.map((tile) => (
        <MyWorkCanvasTile
          key={tile.tileKey}
          definition={tile}
          complexityTier={complexityTier}
        />
      ))}
    </>
  );
}

/** Renders a single tile with complexity variant selection and Suspense. */
function MyWorkCanvasTile({
  definition,
  complexityTier,
}: {
  definition: ICanvasTileDefinition;
  complexityTier: ComplexityTier;
}): ReactNode {
  const TileComponent = definition.component[complexityTier];

  const gridStyle: React.CSSProperties = {
    gridColumn: `span ${definition.defaultColSpan}`,
  };

  return (
    <div style={gridStyle} data-tile-key={definition.tileKey}>
      <React.Suspense
        fallback={<div style={{ minHeight: '80px' }}>Loading...</div>}
      >
        <TileComponent
          projectId="my-work-hub"
          tileKey={definition.tileKey}
        />
      </React.Suspense>
    </div>
  );
}
