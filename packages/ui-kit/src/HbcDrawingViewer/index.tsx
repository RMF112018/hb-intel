/**
 * HbcDrawingViewer — 3-layer PDF viewer with markup overlay
 * PH4.13 §13.6 | Blueprint §1d
 *
 * Architecture:
 *   Bottom: <canvas> for PDF rendering (via pdfjs-dist, lazy-loaded)
 *   Middle: <svg> overlay for markup annotations
 *   Top: invisible pointer-event capture div for gestures
 *
 * Both SVG and canvas share the same CSS transform matrix for pixel alignment.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_ACCENT_ORANGE, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { usePdfRenderer } from './hooks/usePdfRenderer.js';
import { useTouchGestures } from './hooks/useTouchGestures.js';
import { useMarkupState } from './hooks/useMarkupState.js';
import { HbcMarkupToolbar } from './HbcMarkupToolbar.js';
import type { DrawingMarkup, HbcDrawingViewerProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '48px',
    paddingLeft: '12px',
    paddingRight: '12px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    flexWrap: 'wrap',
  },
  headerSelect: {
    height: '32px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: '6px',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    fontSize: '0.8125rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  headerSpacer: {
    flex: 1,
  },
  markupToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '32px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  markupToggleActive: {
    backgroundColor: `${HBC_ACCENT_ORANGE}20`,
    color: HBC_ACCENT_ORANGE,
  },
  viewport: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
    minHeight: '400px',
    touchAction: 'none',
    cursor: 'grab',
  },
  viewportMarkup: {
    cursor: 'crosshair',
  },
  canvas: {
    display: 'block',
    transformOrigin: '0 0',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    transformOrigin: '0 0',
  },
  gestureLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  errorOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    paddingLeft: '24px',
    paddingRight: '24px',
    textAlign: 'center',
  },
  resetButton: {
    height: '32px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '6px',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  pageNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  pageButton: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function renderMarkupSvg(markup: DrawingMarkup | Partial<DrawingMarkup>): React.ReactNode {
  const { type, points, bounds, color } = markup;
  if (!points || points.length === 0) return null;

  const strokeProps = {
    stroke: color ?? '#FF4D4D',
    strokeWidth: 2,
    fill: 'none',
  };

  switch (type) {
    case 'freehand': {
      const d = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
      return <path d={d} {...strokeProps} />;
    }
    case 'rectangle':
      if (bounds) {
        return (
          <rect
            x={bounds.x}
            y={bounds.y}
            width={bounds.width}
            height={bounds.height}
            {...strokeProps}
          />
        );
      }
      return null;
    case 'ellipse':
      if (bounds) {
        return (
          <ellipse
            cx={bounds.x + bounds.width / 2}
            cy={bounds.y + bounds.height / 2}
            rx={bounds.width / 2}
            ry={bounds.height / 2}
            {...strokeProps}
          />
        );
      }
      return null;
    case 'cloud':
      if (bounds) {
        // Simplified cloud as rounded rect with dashed stroke
        return (
          <rect
            x={bounds.x}
            y={bounds.y}
            width={bounds.width}
            height={bounds.height}
            rx={8}
            ry={8}
            {...strokeProps}
            strokeDasharray="4 4"
          />
        );
      }
      return null;
    case 'line':
    case 'arrow':
      if (points.length >= 2) {
        const start = points[0];
        const end = points[points.length - 1];
        return (
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            {...strokeProps}
            markerEnd={type === 'arrow' ? 'url(#arrowhead)' : undefined}
          />
        );
      }
      return null;
    case 'pin':
      if (points.length > 0) {
        return (
          <circle
            cx={points[0].x}
            cy={points[0].y}
            r={6}
            fill={color ?? '#FF4D4D'}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        );
      }
      return null;
    default:
      return null;
  }
}

export function HbcDrawingViewer({
  pdfUrl,
  currentSheet,
  currentRevision,
  markups = [],
  enableMarkup = false,
  sheetOptions = [],
  revisionOptions = [],
  onSheetChange,
  onRevisionChange,
  onMarkupCreate,
  onMarkupDelete: _onMarkupDelete,
  className,
}: HbcDrawingViewerProps): React.JSX.Element {
  const styles = useStyles();
  const [markupEnabled, setMarkupEnabled] = React.useState(enableMarkup);

  const { canvasRef, isLoading, error, pageCount, currentPage, renderPage } =
    usePdfRenderer(pdfUrl);

  const { containerRef, transform, resetTransform, gestureHandlers } =
    useTouchGestures();

  const {
    activeTool,
    setActiveTool,
    currentMarkup,
    handlers: markupHandlers,
  } = useMarkupState(containerRef, onMarkupCreate);

  const transformStyle = `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`;

  // Decide whether gesture layer handles markup or pan/zoom
  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (markupEnabled && activeTool !== 'select') {
        markupHandlers.onPointerDown(e, transform);
      } else {
        gestureHandlers.onPointerDown(e);
      }
    },
    [markupEnabled, activeTool, markupHandlers, gestureHandlers, transform],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (markupEnabled && activeTool !== 'select') {
        markupHandlers.onPointerMove(e, transform);
      } else {
        gestureHandlers.onPointerMove(e);
      }
    },
    [markupEnabled, activeTool, markupHandlers, gestureHandlers, transform],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (markupEnabled && activeTool !== 'select') {
        markupHandlers.onPointerUp(e, transform);
      }
      gestureHandlers.onPointerUp(e);
    },
    [markupEnabled, activeTool, markupHandlers, gestureHandlers, transform],
  );

  return (
    <div data-hbc-ui="drawing-viewer" className={mergeClasses(styles.root, className)}>
      {/* Header toolbar */}
      <div className={styles.header}>
        {sheetOptions.length > 0 && (
          <select
            className={styles.headerSelect}
            value={currentSheet}
            onChange={(e) => onSheetChange?.(e.target.value)}
            aria-label="Sheet"
          >
            {sheetOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {revisionOptions.length > 0 && (
          <select
            className={styles.headerSelect}
            value={currentRevision}
            onChange={(e) => onRevisionChange?.(e.target.value)}
            aria-label="Revision"
          >
            {revisionOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        <div className={styles.headerSpacer} />

        {/* Page navigation */}
        {pageCount > 1 && (
          <div className={styles.pageNav}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={currentPage <= 1}
              onClick={() => renderPage(currentPage - 1)}
              aria-label="Previous page"
            >
              &#8249;
            </button>
            <span>
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              className={styles.pageButton}
              disabled={currentPage >= pageCount}
              onClick={() => renderPage(currentPage + 1)}
              aria-label="Next page"
            >
              &#8250;
            </button>
          </div>
        )}

        <button
          type="button"
          className={styles.resetButton}
          onClick={resetTransform}
          title="Reset zoom"
        >
          Reset
        </button>

        <button
          type="button"
          className={mergeClasses(
            styles.markupToggle,
            markupEnabled ? styles.markupToggleActive : undefined,
          )}
          onClick={() => setMarkupEnabled((prev) => !prev)}
          aria-pressed={markupEnabled}
        >
          Markup {markupEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Markup toolbar */}
      {markupEnabled && (
        <HbcMarkupToolbar activeTool={activeTool} onToolChange={setActiveTool} />
      )}

      {/* Viewport: 3-layer stack */}
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={mergeClasses(
          styles.viewport,
          markupEnabled && activeTool !== 'select' ? styles.viewportMarkup : undefined,
        )}
      >
        {/* Layer 1: PDF canvas */}
        <canvas
          ref={canvasRef as React.RefObject<HTMLCanvasElement>}
          className={styles.canvas}
          style={{ transform: transformStyle }}
        />

        {/* Layer 2: SVG markup overlay */}
        <svg
          className={styles.svgOverlay}
          style={{
            transform: transformStyle,
            width: canvasRef.current?.width ?? '100%',
            height: canvasRef.current?.height ?? '100%',
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#FF4D4D" />
            </marker>
          </defs>
          {markups.map((m) => (
            <g key={m.id}>{renderMarkupSvg(m)}</g>
          ))}
          {currentMarkup && <g>{renderMarkupSvg(currentMarkup)}</g>}
        </svg>

        {/* Layer 3: Gesture capture */}
        <div
          className={styles.gestureLayer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={gestureHandlers.onPointerCancel}
          onWheel={gestureHandlers.onWheel}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>Loading PDF...</div>
        )}

        {/* Error overlay */}
        {error && !isLoading && (
          <div className={styles.errorOverlay}>
            <span>{error}</span>
            <small>
              Ensure <code>pdfjs-dist</code> is installed as a peer dependency.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export type {
  HbcDrawingViewerProps,
  DrawingMarkup,
  MarkupTool,
  MarkupShapeType,
  SheetOption,
  RevisionOption,
} from './types.js';
