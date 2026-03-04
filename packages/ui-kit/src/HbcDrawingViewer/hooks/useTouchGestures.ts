/**
 * useTouchGestures — Unified pointer-event handler for pinch-zoom and pan
 * PH4.13 §13.6 | Blueprint §1d
 *
 * Uses PointerEvents for unified mouse+touch handling.
 * Two-finger pinch-to-zoom, one-finger pan. Respects prefers-reduced-motion.
 */
import * as React from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
}

interface TouchGesturesReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  transform: Transform;
  resetTransform: () => void;
  gestureHandlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onWheel: (e: React.WheelEvent) => void;
  };
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 5;
const DEFAULT_TRANSFORM: Transform = { scale: 1, translateX: 0, translateY: 0 };

export function useTouchGestures(): TouchGesturesReturn {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = React.useState<Transform>(DEFAULT_TRANSFORM);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Track active pointers for pinch detection
  const pointersRef = React.useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastPinchDistRef = React.useRef<number | null>(null);
  const isPanningRef = React.useRef(false);
  const lastPanRef = React.useRef<{ x: number; y: number } | null>(null);

  const resetTransform = React.useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
  }, []);

  const clampScale = (s: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (pointersRef.current.size === 1) {
      isPanningRef.current = true;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    const pointers = pointersRef.current;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      // Pinch-to-zoom
      const pts = Array.from(pointers.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDistRef.current !== null) {
        const scaleDelta = dist / lastPinchDistRef.current;
        setTransform((prev) => ({
          ...prev,
          scale: clampScale(prev.scale * scaleDelta),
        }));
      }
      lastPinchDistRef.current = dist;
      isPanningRef.current = false;
    } else if (pointers.size === 1 && isPanningRef.current && lastPanRef.current) {
      // Single-finger pan
      const dx = e.clientX - lastPanRef.current.x;
      const dy = e.clientY - lastPanRef.current.y;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      setTransform((prev) => ({
        ...prev,
        translateX: prev.translateX + dx,
        translateY: prev.translateY + dy,
      }));
    }
  }, []);

  const onPointerUp = React.useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      lastPinchDistRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      isPanningRef.current = false;
      lastPanRef.current = null;
    }
  }, []);

  const onPointerCancel = React.useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    lastPinchDistRef.current = null;
    isPanningRef.current = false;
    lastPanRef.current = null;
  }, []);

  // Mouse wheel zoom (desktop)
  const onWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => ({
      ...prev,
      scale: clampScale(prev.scale * scaleFactor),
    }));
  }, []);

  return {
    containerRef,
    transform: prefersReducedMotion
      ? { ...transform, translateX: 0, translateY: 0 }
      : transform,
    resetTransform,
    gestureHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onWheel,
    },
  };
}
