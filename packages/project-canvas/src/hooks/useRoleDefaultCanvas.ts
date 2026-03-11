/**
 * useRoleDefaultCanvas — D-SF13-T04, D-02 (role defaults), D-06 (complexity)
 *
 * Resolves role-default tile set into ICanvasTilePlacement[] using
 * ROLE_DEFAULT_TILES and registry data with auto-layout.
 */
import { useMemo } from 'react';
import type { ICanvasTilePlacement } from '../types/index.js';
import { ROLE_DEFAULT_TILES, CANVAS_GRID_COLUMNS, DEFAULT_COL_SPAN, DEFAULT_ROW_SPAN } from '../constants/index.js';
import { get } from '../registry/index.js';

export function useRoleDefaultCanvas(role: string): {
  tiles: ICanvasTilePlacement[];
  isLoading: boolean;
} {
  const tiles = useMemo(() => {
    const tileKeys = ROLE_DEFAULT_TILES[role];
    if (!tileKeys) return [];

    const placements: ICanvasTilePlacement[] = [];
    let currentCol = 1;
    let currentRow = 1;

    for (const tileKey of tileKeys) {
      const def = get(tileKey);
      const colSpan = def?.defaultColSpan ?? DEFAULT_COL_SPAN;
      const rowSpan = def?.defaultRowSpan ?? DEFAULT_ROW_SPAN;

      if (currentCol + colSpan - 1 > CANVAS_GRID_COLUMNS) {
        currentRow++;
        currentCol = 1;
      }

      placements.push({
        tileKey,
        colStart: currentCol,
        colSpan,
        rowStart: currentRow,
        rowSpan,
      });

      currentCol += colSpan;
    }

    return placements;
  }, [role]);

  return { tiles, isLoading: false };
}
