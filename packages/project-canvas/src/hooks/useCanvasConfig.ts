/**
 * useCanvasConfig — D-SF13-T04, D-03 (persistence), D-02 (role defaults)
 *
 * Loads user canvas config from API, exposes save and reset actions.
 */
import { useState, useEffect, useCallback } from 'react';
import type { ICanvasUserConfig } from '../types/index.js';
import { CanvasApi } from '../api/index.js';

export function useCanvasConfig(userId: string, projectId: string): {
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
      const result = await CanvasApi.getConfig(userId, projectId);
      setConfig(result);
    } catch {
      // API unavailable (dev mode, network error) — treat as no saved config.
      // useProjectCanvas will fall back to role defaults via useRoleDefaultCanvas.
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (newConfig: ICanvasUserConfig) => {
    setError(null);
    try {
      await CanvasApi.saveConfig(newConfig);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [refresh]);

  const reset = useCallback(async (role: string) => {
    setError(null);
    try {
      const result = await CanvasApi.resetToRoleDefault(userId, projectId, role);
      setConfig(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [userId, projectId]);

  return { config, isLoading, error, save, reset, refresh };
}
