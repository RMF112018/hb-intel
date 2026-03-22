/**
 * useCanvasMandatoryTiles — D-SF13-T04, D-05 (mandatory governance)
 *
 * Resolves mandatory tiles for a role and provides enforcement helpers.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ICanvasTileDefinition } from '../types/index.js';
import { CanvasApi } from '../api/index.js';
import { getAll } from '../registry/index.js';

export function useCanvasMandatoryTiles(role: string): {
  mandatoryTiles: ICanvasTileDefinition[];
  isLoading: boolean;
  error: Error | null;
  isMandatory: (tileKey: string) => boolean;
  isLocked: (tileKey: string) => boolean;
  applyToAllProjects: () => Promise<void>;
} {
  const [mandatoryTiles, setMandatoryTiles] = useState<ICanvasTileDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    CanvasApi.getRoleMandatoryTiles(role)
      .then((tiles) => {
        if (!cancelled) {
          setMandatoryTiles(tiles);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // API unavailable (dev mode, network error) — derive mandatory tiles
          // from local registry. Covers dev mode and degraded-network scenarios.
          const allTiles = getAll();
          const localMandatory = allTiles.filter((t) => t.mandatory);
          setMandatoryTiles(localMandatory);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [role]);

  const mandatoryKeySet = useMemo(
    () => new Set(mandatoryTiles.map((t) => t.tileKey)),
    [mandatoryTiles],
  );

  const lockableKeySet = useMemo(
    () => new Set(mandatoryTiles.filter((t) => t.lockable).map((t) => t.tileKey)),
    [mandatoryTiles],
  );

  const isMandatory = useCallback(
    (tileKey: string) => mandatoryKeySet.has(tileKey),
    [mandatoryKeySet],
  );

  const isLocked = useCallback(
    (tileKey: string) => mandatoryKeySet.has(tileKey) && lockableKeySet.has(tileKey),
    [mandatoryKeySet, lockableKeySet],
  );

  const applyToAllProjects = useCallback(async () => {
    setError(null);
    try {
      await CanvasApi.applyMandatoryTilesToAllProjects(role);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [role]);

  return { mandatoryTiles, isLoading, error, isMandatory, isLocked, applyToAllProjects };
}
