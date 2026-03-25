/**
 * useProjectCanvas — D-SF13-T04, orchestrator hook
 *
 * Composes config, defaults, and mandatory into a single unified hook.
 */
import { useMemo, useCallback } from 'react';
import type { ICanvasTilePlacement } from '../types/index.js';
import type { ICanvasPersistenceAdapter } from '../api/index.js';
import { get } from '../registry/index.js';
import { useCanvasConfig } from './useCanvasConfig.js';
import { useRoleDefaultCanvas } from './useRoleDefaultCanvas.js';
import { useCanvasMandatoryTiles } from './useCanvasMandatoryTiles.js';

export function useProjectCanvas(
  projectId: string,
  userId: string,
  role: string,
  persistenceAdapter?: ICanvasPersistenceAdapter,
): {
  tiles: ICanvasTilePlacement[];
  isLoading: boolean;
  error: Error | null;
  save: (tiles: ICanvasTilePlacement[]) => Promise<void>;
  reset: () => Promise<void>;
  isMandatory: (tileKey: string) => boolean;
  isLocked: (tileKey: string) => boolean;
} {
  const {
    config,
    isLoading: configLoading,
    error: configError,
    reset: configReset,
    save: saveConfig,
  } = useCanvasConfig(userId, projectId, persistenceAdapter);
  const { tiles: defaultTiles, isLoading: defaultsLoading } = useRoleDefaultCanvas(role);
  const {
    mandatoryTiles,
    isLoading: mandatoryLoading,
    error: mandatoryError,
    isMandatory,
    isLocked,
  } = useCanvasMandatoryTiles(role);

  const tiles = useMemo(() => {
    // Gate 5 (P2-D2 §14): Validate saved config against current role-eligible tile set.
    // Remove tiles the user is no longer eligible for after a role change.
    // Append newly eligible mandatory tiles that are missing from the saved config.
    let baseTiles: ICanvasTilePlacement[];
    if (config) {
      baseTiles = config.tiles.filter((placement) => {
        const def = get(placement.tileKey);
        if (!def) return false; // tile no longer registered
        if (def.defaultForRoles.length === 0) return true; // available to all roles
        return def.defaultForRoles.includes(role);
      });
    } else {
      baseTiles = defaultTiles;
    }
    const existingKeys = new Set(baseTiles.map((t) => t.tileKey));
    // Only inject mandatory tiles that belong to this role/zone's default set.
    // Prevents cross-zone injection (e.g. hub:lane-summary into tertiary zone).
    const defaultTileKeys = new Set(defaultTiles.map((t) => t.tileKey));
    const missingMandatory = mandatoryTiles
      .filter((mt) => !existingKeys.has(mt.tileKey))
      .filter((mt) => defaultTileKeys.has(mt.tileKey))
      .map((mt) => ({
        tileKey: mt.tileKey,
        colStart: 1,
        colSpan: mt.defaultColSpan,
        rowStart: (baseTiles.reduce((m, t) => Math.max(m, t.rowStart), 0)) + 1,
        rowSpan: mt.defaultRowSpan,
        isLocked: mt.lockable,
      }));
    return [...baseTiles, ...missingMandatory];
  }, [config, defaultTiles, mandatoryTiles, role]);

  const isLoading = configLoading || defaultsLoading || mandatoryLoading;
  const error = configError ?? mandatoryError ?? null;

  const save = useCallback(async (newTiles: ICanvasTilePlacement[]) => {
    await saveConfig({ userId, projectId, tiles: newTiles });
  }, [projectId, saveConfig, userId]);

  const reset = useCallback(async () => {
    await configReset(role);
  }, [configReset, role]);

  return { tiles, isLoading, error, save, reset, isMandatory, isLocked };
}
