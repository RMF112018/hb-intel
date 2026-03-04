/**
 * useMarkupState — State machine for drawing markup annotations
 * PH4.13 §13.6 | Blueprint §1d
 *
 * Manages active tool selection, current drawing operation (pointer down/move/up),
 * and produces markup shapes on the SVG overlay.
 */
import * as React from 'react';
import type { DrawingMarkup, MarkupShapeType } from '../types.js';
import type { Transform } from './useTouchGestures.js';

type ActiveTool = MarkupShapeType | 'select';

interface MarkupStateReturn {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  currentMarkup: Partial<DrawingMarkup> | null;
  handlers: {
    onPointerDown: (e: React.PointerEvent, transform: Transform) => void;
    onPointerMove: (e: React.PointerEvent, transform: Transform) => void;
    onPointerUp: (e: React.PointerEvent, transform: Transform) => void;
  };
}

function clientToSvg(
  e: React.PointerEvent,
  container: HTMLElement | null,
  transform: Transform,
): { x: number; y: number } {
  if (!container) return { x: 0, y: 0 };
  const rect = container.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - transform.translateX) / transform.scale,
    y: (e.clientY - rect.top - transform.translateY) / transform.scale,
  };
}

export function useMarkupState(
  containerRef: React.RefObject<HTMLElement | null>,
  onMarkupCreate?: (markup: Omit<DrawingMarkup, 'id'>) => void,
  defaultColor = '#FF4D4D',
): MarkupStateReturn {
  const [activeTool, setActiveTool] = React.useState<ActiveTool>('select');
  const [currentMarkup, setCurrentMarkup] = React.useState<Partial<DrawingMarkup> | null>(null);
  const isDrawingRef = React.useRef(false);
  const pointsRef = React.useRef<Array<{ x: number; y: number }>>([]);
  const startPointRef = React.useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent, transform: Transform) => {
      if (activeTool === 'select') return;
      const point = clientToSvg(e, containerRef.current, transform);
      isDrawingRef.current = true;
      startPointRef.current = point;
      pointsRef.current = [point];

      setCurrentMarkup({
        type: activeTool,
        points: [point],
        color: defaultColor,
      });
    },
    [activeTool, containerRef, defaultColor],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent, transform: Transform) => {
      if (!isDrawingRef.current || activeTool === 'select') return;
      const point = clientToSvg(e, containerRef.current, transform);
      pointsRef.current.push(point);

      const start = startPointRef.current!;
      if (
        activeTool === 'rectangle' ||
        activeTool === 'ellipse' ||
        activeTool === 'cloud'
      ) {
        setCurrentMarkup({
          type: activeTool,
          points: [start, point],
          bounds: {
            x: Math.min(start.x, point.x),
            y: Math.min(start.y, point.y),
            width: Math.abs(point.x - start.x),
            height: Math.abs(point.y - start.y),
          },
          color: defaultColor,
        });
      } else if (activeTool === 'line' || activeTool === 'arrow') {
        setCurrentMarkup({
          type: activeTool,
          points: [start, point],
          color: defaultColor,
        });
      } else {
        // Freehand, measurement, etc.
        setCurrentMarkup({
          type: activeTool,
          points: [...pointsRef.current],
          color: defaultColor,
        });
      }
    },
    [activeTool, containerRef, defaultColor],
  );

  const onPointerUp = React.useCallback(
    (_e: React.PointerEvent, _transform: Transform) => {
      if (!isDrawingRef.current || activeTool === 'select') return;
      isDrawingRef.current = false;

      if (currentMarkup && onMarkupCreate && pointsRef.current.length > 1) {
        onMarkupCreate({
          type: activeTool,
          points: [...pointsRef.current],
          bounds: currentMarkup.bounds,
          color: defaultColor,
        });
      }

      setCurrentMarkup(null);
      pointsRef.current = [];
      startPointRef.current = null;
    },
    [activeTool, currentMarkup, defaultColor, onMarkupCreate],
  );

  return {
    activeTool,
    setActiveTool,
    currentMarkup,
    handlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
