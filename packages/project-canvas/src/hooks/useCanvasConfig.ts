/**
 * useCanvasConfig — D-SF13-T04, D-03 (persistence), D-02 (role defaults)
 *
 * Loads user canvas config from API, exposes save and reset actions.
 */
import { useState, useEffect, useCallback } from 'react';
import type { ICanvasUserConfig } from '../types/index.js';
import { CanvasApi } from '../api/index.js';
import type { ICanvasPersistenceAdapter } from '../api/index.js';

export function useCanvasConfig(
  userId: string,
  projectId: string,
  persistenceAdapter?: ICanvasPersistenceAdapter,
): {
  config: ICanvasUserConfig | null;
  isLoading: boolean;
  error: Error | null;
  save: (config: ICanvasUserConfig) => Promise<void>;
  reset: (role: string) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [config, setConfig] = useState<ICanvasUserConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = persistenceAdapter
        ? await persistenceAdapter.getConfig(projectId, userId)
        : await CanvasApi.getConfig(userId, projectId);
      setConfig(result);
    } catch (err) {
      // API unavailable (dev mode, network error) — treat as no saved config.
      // useProjectCanvas will fall back to role defaults via useRoleDefaultCanvas.
      setError(err instanceof Error ? err : new Error(String(err)));
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, [persistenceAdapter, userId, projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (newConfig: ICanvasUserConfig) => {
    // Optimistic update — reflect changes immediately in local state.
    setConfig(newConfig);
    setError(null);
    try {
      if (persistenceAdapter) {
        await persistenceAdapter.saveConfig(newConfig);
      } else {
        await CanvasApi.saveConfig(newConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [persistenceAdapter]);

  const reset = useCallback(async (role: string) => {
    setError(null);
    try {
      if (persistenceAdapter) {
        await persistenceAdapter.resetConfig(projectId, userId);
        setConfig(null);
        return;
      }

      const result = await CanvasApi.resetToRoleDefault(userId, projectId, role);
      setConfig(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      // API unavailable — clear config so useProjectCanvas falls back to role defaults.
      setConfig(null);
    }
  }, [persistenceAdapter, projectId, userId]);

  return { config, isLoading, error, save, reset, refresh };
}
