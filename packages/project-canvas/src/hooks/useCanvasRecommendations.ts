/**
 * useCanvasRecommendations — D-SF13-T04, D-02 (PH Pulse, phase, usage)
 *
 * Fetches and exposes recommendation signals for a user/project.
 */
import { useState, useEffect, useCallback } from 'react';
import type { RecommendationSignal } from '../constants/index.js';
import { RECOMMENDATION_SIGNALS } from '../constants/index.js';
import { CanvasApi } from '../api/index.js';

interface Recommendation {
  tileKey: string;
  signal: RecommendationSignal;
  reason: string;
}

export function useCanvasRecommendations(userId: string, projectId: string): {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await CanvasApi.getCanvasRecommendations(userId, projectId);
      const signalOrder = RECOMMENDATION_SIGNALS as readonly string[];
      const sorted = [...result].sort(
        (a, b) => signalOrder.indexOf(a.signal) - signalOrder.indexOf(b.signal),
      );
      setRecommendations(sorted);
    } catch {
      // API unavailable (dev mode, network error) — no recommendations.
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { recommendations, isLoading, error, refresh };
}
