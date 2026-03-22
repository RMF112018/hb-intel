/**
 * CanvasTileCard — D-SF13-T05, D-01 (TileRegistry), D-06 (complexity)
 *
 * Renders a single tile within the canvas grid. Supports two modes:
 * - View mode: renders the tile component with lazy loading
 * - Edit mode (iOS homescreen): jiggle animation, red "-" removal badge,
 *   drag-and-drop via @dnd-kit/sortable
 */
import React, { useState, useEffect } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ICanvasTilePlacement, ComplexityTier, DataSourceBadge } from '../types/index.js';
import { get } from '../registry/index.js';
import { CanvasApi } from '../api/index.js';
import {
  CANVAS_GRID_COLUMNS,
  MIN_COL_SPAN,
  MAX_COL_SPAN,
  MIN_ROW_SPAN,
  MAX_ROW_SPAN,
} from '../constants/index.js';
import { HBC_STATUS_RAMP_RED } from '@hbc/ui-kit';

export interface CanvasTileCardProps {
  placement: ICanvasTilePlacement;
  projectId: string;
  complexityTier: ComplexityTier;
  isMandatory: boolean;
  isLocked: boolean;
  /** Edit mode — enables jiggle, removal badge, drag-and-drop. */
  isEditing?: boolean;
  /** Tile index in the array (for staggered animation delay). */
  index?: number;
  /** Called when user clicks the "-" removal badge. */
  onRemove?: (tileKey: string) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const useStyles = makeStyles({
  // ── Edit mode styles ───────────────────────────────────────────────
  editWrapper: {
    position: 'relative',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  jiggle: {
    animationName: {
      '0%': { transform: 'rotate(-0.7deg)' },
      '50%': { transform: 'rotate(0.7deg)' },
      '100%': { transform: 'rotate(-0.7deg)' },
    },
    animationDuration: '280ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
      ...shorthands.border('2px', 'dashed', '#0078d4'),
    },
  },
  dragging: {
    opacity: 0.4,
    transform: 'scale(1.02)',
  },
  removeBadge: {
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: HBC_STATUS_RAMP_RED[50],
    color: '#FFFFFF',
    ...shorthands.border('2px', 'solid', '#FFFFFF'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '1',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    ...shorthands.padding('0px'),
    ':hover': {
      backgroundColor: HBC_STATUS_RAMP_RED[30],
      transform: 'scale(1.15)',
    },
  },
});

export function CanvasTileCard({
  placement,
  projectId,
  complexityTier,
  isMandatory,
  isLocked,
  isEditing = false,
  index = 0,
  onRemove,
}: CanvasTileCardProps): React.ReactElement {
  const styles = useStyles();
  const [dataSourceBadge, setDataSourceBadge] = useState<DataSourceBadge | null>(null);
  const definition = get(placement.tileKey);
  const locked = isMandatory || isLocked;
  const title = definition?.title ?? placement.tileKey;

  // Fetch data-source metadata (view mode only)
  useEffect(() => {
    if (isEditing) return;
    let cancelled = false;
    CanvasApi.getTileDataSourceMetadata(projectId, placement.tileKey)
      .then((meta) => { if (!cancelled) setDataSourceBadge(meta.badge); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [projectId, placement.tileKey, isEditing]);

  // Sortable hook — active only in edit mode
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: placement.tileKey,
    disabled: !isEditing || locked,
  });

  // Grid positioning
  const colSpan = clamp(placement.colSpan, MIN_COL_SPAN, MAX_COL_SPAN);
  const rowSpan = clamp(placement.rowSpan, MIN_ROW_SPAN, MAX_ROW_SPAN);
  let colStart = placement.colStart;
  if (colStart + colSpan - 1 > CANVAS_GRID_COLUMNS) colStart = 1;

  const gridStyle: React.CSSProperties = {
    gridColumn: `${colStart} / span ${colSpan}`,
    gridRow: `${placement.rowStart} / span ${rowSpan}`,
    ...(isEditing ? {
      transform: CSS.Transform.toString(transform),
      transition,
      animationDelay: `${index * 40}ms`,
    } : {}),
  };

  // Unknown tile fallback
  if (!definition) {
    return (
      <div data-testid="tile-unknown" style={gridStyle}>
        Unknown tile: {placement.tileKey}
      </div>
    );
  }

  const TileComponent = definition.component[complexityTier];

  // ── Edit mode rendering ──────────────────────────────────────────────
  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        className={mergeClasses(styles.editWrapper, styles.jiggle, isDragging ? styles.dragging : undefined)}
        style={gridStyle}
        data-testid="canvas-tile-card"
        {...attributes}
        {...listeners}
      >
        {/* Red "-" removal badge — hidden for locked/mandatory tiles */}
        {!locked && onRemove && (
          <button
            className={styles.removeBadge}
            onClick={(e) => { e.stopPropagation(); onRemove(placement.tileKey); }}
            aria-label={`Remove ${title}`}
            type="button"
          >
            &minus;
          </button>
        )}

        {/* Render the actual tile content (dimmed slightly during drag) */}
        <React.Suspense fallback={<div style={{ minHeight: '60px', padding: '12px', textAlign: 'center' }}>{title}</div>}>
          <TileComponent projectId={projectId} tileKey={placement.tileKey} isLocked={locked} dataSource={dataSourceBadge ?? undefined} />
        </React.Suspense>
      </div>
    );
  }

  // ── View mode rendering ──────────────────────────────────────────────
  return (
    <div data-testid="canvas-tile-card" style={gridStyle}>
      <React.Suspense fallback={<div data-testid="tile-loading">Loading tile...</div>}>
        <TileComponent projectId={projectId} tileKey={placement.tileKey} isLocked={locked} dataSource={dataSourceBadge ?? undefined} />
      </React.Suspense>
    </div>
  );
}
