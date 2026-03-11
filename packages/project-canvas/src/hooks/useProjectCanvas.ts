/**
 * useProjectCanvas — D-SF13-T04, orchestrator hook
 *
 * Composes config, defaults, and mandatory into a single unified hook.
 */
import { useMemo, useCallback } from 'react';
import type { ICanvasTilePlacement } from '../types/index.js';
import { CanvasApi } from '../api/index.js';
import { useCanvasConfig } from './useCanvasConfig.js';
import { useRoleDefaultCanvas } from './useRoleDefaultCanvas.js';
import { useCanvasMandatoryTiles } from './useCanvasMandatoryTiles.js';

export function useProjectCanvas(projectId: string, userId: string, role: string): {
  tiles: ICanvasTilePlacement[];
  isLoading: boolean;
  error: Error | null;
  save: (tiles: ICanvasTilePlacement[]) => Promise<void>;
  reset: () => Promise<void>;
  isMandatory: (tileKey: string) => boolean;
  isLocked: (tileKey: string) => boolean;
} {
  const { config, isLoading: configLoading, error: configError, reset: configReset } = useCanvasConfig(userId, projectId);
  const { tiles: defaultTiles, isLoading: defaultsLoading } = useRoleDefaultCanvas(role);
  const {
    mandatoryTiles,
    isLoading: mandatoryLoading,
    error: mandatoryError,
    isMandatory,
    isLocked,
  } = useCanvasMandatoryTiles(role);

  const tiles = useMemo(() => {
    const baseTiles = config ? config.tiles : defaultTiles;
    const existingKeys = new Set(baseTiles.map((t) => t.tileKey));
    const missingMandatory = mandatoryTiles
      .filter((mt) => !existingKeys.has(mt.tileKey))
      .map((mt) => ({
        tileKey: mt.tileKey,
        colStart: 1,
        colSpan: mt.defaultColSpan,
        rowStart: (baseTiles.reduce((m, t) => Math.max(m, t.rowStart), 0)) + 1,
        rowSpan: mt.defaultRowSpan,
        isLocked: mt.lockable,
      }));
    return [...baseTiles, ...missingMandatory];
  }, [config, defaultTiles, mandatoryTiles]);

  const isLoading = configLoading || defaultsLoading || mandatoryLoading;
  const error = configError ?? mandatoryError ?? null;

  const save = useCallback(async (newTiles: ICanvasTilePlacement[]) => {
    await CanvasApi.saveConfig({ userId, projectId, tiles: newTiles });
  }, [userId, projectId]);

  const reset = useCallback(async () => {
    await configReset(role);
  }, [configReset, role]);

  return { tiles, isLoading, error, save, reset, isMandatory, isLocked };
}
