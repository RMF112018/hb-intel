/**
 * CanvasTileCard — D-SF13-T05, D-01 (TileRegistry), D-06 (complexity), D-07 (SPFx inline styles)
 *
 * Internal sub-component that renders a single tile within the canvas grid.
 * Looks up the tile definition from the registry, selects the complexity-appropriate
 * variant, and wraps it in React.Suspense for lazy loading.
 */
import React, { useState, useEffect } from 'react';
import type { ICanvasTilePlacement, ComplexityTier, DataSourceBadge } from '../types/index.js';
import { get } from '../registry/index.js';
import { CanvasApi } from '../api/index.js';
import {
  CANVAS_GRID_COLUMNS,
  MIN_COL_SPAN,
  MAX_COL_SPAN,
  MIN_ROW_SPAN,
  MAX_ROW_SPAN,
  MANDATORY_TILE_LOCK_ICON,
} from '../constants/index.js';

export interface CanvasTileCardProps {
  placement: ICanvasTilePlacement;
  projectId: string;
  complexityTier: ComplexityTier;
  isMandatory: boolean;
  isLocked: boolean;
}

/** Clamp a value to [min, max] */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function CanvasTileCard({
  placement,
  projectId,
  complexityTier,
  isMandatory,
  isLocked,
}: CanvasTileCardProps): React.ReactElement {
  const [dataSourceBadge, setDataSourceBadge] = useState<DataSourceBadge | null>(null);

  const definition = get(placement.tileKey);

  // Fetch data-source metadata — degrade gracefully on failure (D-08)
  useEffect(() => {
    let cancelled = false;
    CanvasApi.getTileDataSourceMetadata(projectId, placement.tileKey)
      .then((meta) => {
        if (!cancelled) {
          setDataSourceBadge(meta.badge);
        }
      })
      .catch(() => {
        // Badge simply not shown on failure — deterministic degradation
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, placement.tileKey]);

  // Normalize invalid config — clamp spans, fix overflow (D-04)
  const colSpan = clamp(placement.colSpan, MIN_COL_SPAN, MAX_COL_SPAN);
  const rowSpan = clamp(placement.rowSpan, MIN_ROW_SPAN, MAX_ROW_SPAN);
  let colStart = placement.colStart;
  if (colStart + colSpan - 1 > CANVAS_GRID_COLUMNS) {
    colStart = 1;
  }
  const rowStart = placement.rowStart;

  const gridStyle: React.CSSProperties = {
    gridColumn: `${colStart} / span ${colSpan}`,
    gridRow: `${rowStart} / span ${rowSpan}`,
  };

  const locked = isMandatory || isLocked;

  // Unknown tile fallback
  if (!definition) {
    return (
      <div data-testid="tile-unknown" style={gridStyle}>
        Unknown tile: {placement.tileKey}
      </div>
    );
  }

  const TileComponent = definition.component[complexityTier];

  return (
    <div data-testid="canvas-tile-card" style={gridStyle}>
      {locked && (
        <span data-testid="tile-lock-icon" aria-label={MANDATORY_TILE_LOCK_ICON}>
          🔒
        </span>
      )}
      {dataSourceBadge && (
        <span data-testid="tile-data-source-badge">{dataSourceBadge}</span>
      )}
      <React.Suspense
        fallback={<div data-testid="tile-loading">Loading tile...</div>}
      >
        <TileComponent
          projectId={projectId}
          tileKey={placement.tileKey}
          isLocked={locked}
          dataSource={dataSourceBadge ?? undefined}
        />
      </React.Suspense>
    </div>
  );
}
