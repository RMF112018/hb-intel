import { useMemo } from 'react';

/**
 * Watchlist item — a project or signal requiring leadership attention.
 */
export interface WatchlistItem {
  readonly id: string;
  readonly projectName: string;
  readonly signalType: 'aging-decision' | 'forecast-drift' | 'milestone-risk' | 'blocked-readiness' | 'closeout-lag' | 'quality-safety-concern';
  readonly severity: 'critical' | 'high' | 'medium';
  readonly ageDays: number;
  readonly trend: 'worsening' | 'stable' | 'improving';
  readonly owner: string;
  readonly projectId: string;
}

export interface WatchlistSummary {
  readonly items: readonly WatchlistItem[];
  readonly criticalCount: number;
  readonly highCount: number;
}

const SIGNAL_TYPE_LABELS: Record<WatchlistItem['signalType'], string> = {
  'aging-decision': 'Aging Decision',
  'forecast-drift': 'Forecast Drift',
  'milestone-risk': 'Milestone Risk',
  'blocked-readiness': 'Blocked Readiness',
  'closeout-lag': 'Closeout Lag',
  'quality-safety-concern': 'Quality / Safety',
};

export { SIGNAL_TYPE_LABELS as WATCHLIST_SIGNAL_TYPE_LABELS };

/**
 * Returns a mock watchlist summary for the executive cockpit.
 * Will be replaced by real health-pulse aggregation in a follow-on.
 */
export function useWatchlistSummary(): WatchlistSummary {
  return useMemo(() => {
    const items: WatchlistItem[] = [
      { id: 'wl-1', projectName: 'Palm Beach Luxury Estate', signalType: 'forecast-drift', severity: 'critical', ageDays: 12, trend: 'worsening', owner: 'PM — Wanda', projectId: 'proj-1' },
      { id: 'wl-2', projectName: 'Tropical World Nursery', signalType: 'milestone-risk', severity: 'critical', ageDays: 8, trend: 'worsening', owner: 'Superintendent — Carlos', projectId: 'proj-2' },
      { id: 'wl-3', projectName: 'Valencia at Palm Beaches', signalType: 'aging-decision', severity: 'high', ageDays: 21, trend: 'stable', owner: 'PM — Tanya', projectId: 'proj-3' },
      { id: 'wl-4', projectName: 'Palm Beach Luxury Estate', signalType: 'blocked-readiness', severity: 'high', ageDays: 5, trend: 'stable', owner: 'PM — Wanda', projectId: 'proj-1' },
      { id: 'wl-5', projectName: 'Palm Olympus', signalType: 'closeout-lag', severity: 'medium', ageDays: 30, trend: 'improving', owner: 'PM — Monica', projectId: 'proj-4' },
      { id: 'wl-6', projectName: 'Tropical World Nursery', signalType: 'quality-safety-concern', severity: 'high', ageDays: 3, trend: 'worsening', owner: 'Safety Lead — James', projectId: 'proj-2' },
    ];
    return {
      items,
      criticalCount: items.filter((i) => i.severity === 'critical').length,
      highCount: items.filter((i) => i.severity === 'high').length,
    };
  }, []);
}
