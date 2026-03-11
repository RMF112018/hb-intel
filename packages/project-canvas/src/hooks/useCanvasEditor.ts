/**
 * useCanvasEditor — D-SF13-T04, D-04 (editor constraints), D-05 (governance)
 *
 * Full editor hook with add/remove/reorder/resize and constraint enforcement.
 */
import { useState, useRef, useCallback, useMemo } from 'react';
import type { ICanvasTilePlacement } from '../types/index.js';
import {
  CANVAS_GRID_COLUMNS,
  MIN_COL_SPAN,
  MAX_COL_SPAN,
  MIN_ROW_SPAN,
  MAX_ROW_SPAN,
  DEFAULT_COL_SPAN,
  DEFAULT_ROW_SPAN,
} from '../constants/index.js';
import { get } from '../registry/index.js';

interface EditorOptions {
  isMandatory: (tileKey: string) => boolean;
  isLocked: (tileKey: string) => boolean;
}

function tilesEqual(a: ICanvasTilePlacement[], b: ICanvasTilePlacement[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((tile, i) => {
    const other = b[i];
    return (
      tile.tileKey === other.tileKey &&
      tile.colStart === other.colStart &&
      tile.colSpan === other.colSpan &&
      tile.rowStart === other.rowStart &&
      tile.rowSpan === other.rowSpan &&
      (tile.isLocked ?? false) === (other.isLocked ?? false)
    );
  });
}

export function useCanvasEditor(
  initialTiles: ICanvasTilePlacement[],
  options: EditorOptions,
): {
  tiles: ICanvasTilePlacement[];
  hasUnsavedChanges: boolean;
  addTile: (tileKey: string) => void;
  removeTile: (tileKey: string) => void;
  moveTile: (tileKey: string, newColStart: number, newRowStart: number) => void;
  resizeTile: (tileKey: string, colSpan: number, rowSpan: number) => void;
  reorderTiles: (fromIndex: number, toIndex: number) => void;
  cancel: () => void;
  getEditableTiles: () => ICanvasTilePlacement[];
} {
  const [tiles, setTiles] = useState<ICanvasTilePlacement[]>(initialTiles);
  const snapshotRef = useRef<ICanvasTilePlacement[]>(initialTiles);

  const hasUnsavedChanges = useMemo(
    () => !tilesEqual(tiles, snapshotRef.current),
    [tiles],
  );

  const addTile = useCallback((tileKey: string) => {
    setTiles((prev) => {
      if (prev.some((t) => t.tileKey === tileKey)) return prev;
      const def = get(tileKey);
      const colSpan = def?.defaultColSpan ?? DEFAULT_COL_SPAN;
      const rowSpan = def?.defaultRowSpan ?? DEFAULT_ROW_SPAN;
      const maxRow = prev.reduce((m, t) => Math.max(m, t.rowStart), 0);
      return [
        ...prev,
        { tileKey, colStart: 1, colSpan, rowStart: maxRow + 1, rowSpan },
      ];
    });
  }, []);

  const removeTile = useCallback((tileKey: string) => {
    if (options.isMandatory(tileKey) || options.isLocked(tileKey)) return;
    setTiles((prev) => prev.filter((t) => t.tileKey !== tileKey));
  }, [options]);

  const moveTile = useCallback((tileKey: string, newColStart: number, newRowStart: number) => {
    if (options.isLocked(tileKey)) return;
    setTiles((prev) =>
      prev.map((t) => {
        if (t.tileKey !== tileKey) return t;
        if (newColStart + t.colSpan - 1 > CANVAS_GRID_COLUMNS) return t;
        return { ...t, colStart: newColStart, rowStart: newRowStart };
      }),
    );
  }, [options]);

  const resizeTile = useCallback((tileKey: string, colSpan: number, rowSpan: number) => {
    setTiles((prev) =>
      prev.map((t) => {
        if (t.tileKey !== tileKey) return t;
        const clampedCol = Math.min(Math.max(colSpan, MIN_COL_SPAN), MAX_COL_SPAN);
        const clampedRow = Math.min(Math.max(rowSpan, MIN_ROW_SPAN), MAX_ROW_SPAN);
        if (t.colStart + clampedCol - 1 > CANVAS_GRID_COLUMNS) return t;
        return { ...t, colSpan: clampedCol, rowSpan: clampedRow };
      }),
    );
  }, []);

  const reorderTiles = useCallback((fromIndex: number, toIndex: number) => {
    setTiles((prev) => {
      if (
        fromIndex < 0 || fromIndex >= prev.length ||
        toIndex < 0 || toIndex >= prev.length
      ) return prev;
      if (options.isLocked(prev[fromIndex].tileKey) || options.isLocked(prev[toIndex].tileKey)) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, [options]);

  const cancel = useCallback(() => {
    setTiles(snapshotRef.current);
  }, []);

  const getEditableTiles = useCallback(
    () => tiles.filter((t) => !options.isMandatory(t.tileKey) && !options.isLocked(t.tileKey)),
    [tiles, options],
  );

  return {
    tiles,
    hasUnsavedChanges,
    addTile,
    removeTile,
    moveTile,
    resizeTile,
    reorderTiles,
    cancel,
    getEditableTiles,
  };
}
