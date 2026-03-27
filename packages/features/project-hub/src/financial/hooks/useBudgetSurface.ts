/**
 * useBudgetSurface — view-ready data hook for the Budget surface.
 *
 * Returns mock data. The three-layer distinction (source / snapshot / working)
 * is the core design principle: the UI must make it unmistakable which layer
 * each value belongs to.
 */

import { useMemo, useState, useCallback } from 'react';

// ── View-Ready Types ────────────────────────────────────────────────

export interface BudgetSnapshotInfo {
  readonly snapshotId: string;
  readonly sourceSystem: string;
  readonly importBatchId: string;
  readonly lockTimestamp: string;
  readonly lineCount: number;
  readonly isRefreshAvailable: boolean;
  readonly refreshBlockReason?: string;
}

export interface BudgetFreshnessState {
  readonly sourceNewer: boolean;
  readonly sourceNewerLabel: string;
  readonly forecastStale: boolean;
  readonly staleLabel: string;
  readonly reconciliationIssues: number;
  readonly reconciliationLabel: string;
  readonly downstreamImpactSummary: string;
}

export interface BudgetLineRow {
  readonly id: string;
  readonly costCode: string;
  readonly costDescription: string;
  readonly costType: string;
  readonly revisedBudget: number;
  readonly actualCostToDate: number;
  readonly forecastToComplete: number;
  readonly estimatedCostAtCompletion: number;
  readonly projectedOverUnder: number;
  readonly isEditable: boolean;
  readonly hasReconciliationFlag: boolean;
  readonly isStale: boolean;
  readonly layer: 'source' | 'snapshot' | 'working';
}

export interface BudgetLineDetail {
  readonly lineId: string;
  readonly costCode: string;
  readonly costDescription: string;
  readonly sourceValue: number;
  readonly snapshotValue: number;
  readonly workingFTC: number;
  readonly computedEAC: number;
  readonly computedOverUnder: number;
  readonly priorFTC: number | null;
  readonly lastEditedBy: string | null;
  readonly lastEditedAt: string | null;
  readonly downstreamImpacts: readonly string[];
}

export interface BudgetImportEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly type: 'import' | 'reconciliation' | 'ftc-edit' | 'refresh';
  readonly title: string;
  readonly actor: string | null;
}

export interface BudgetSurfaceData {
  readonly snapshot: BudgetSnapshotInfo;
  readonly freshness: BudgetFreshnessState;
  readonly lines: readonly BudgetLineRow[];
  readonly selectedLineId: string | null;
  readonly selectedLineDetail: BudgetLineDetail | null;
  readonly importEvents: readonly BudgetImportEvent[];
  readonly selectLine: (lineId: string | null) => void;
}

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_LINES: BudgetLineRow[] = [
  { id: 'bl-1', costCode: '10-01-318', costDescription: 'Project Manager — Labor', costType: 'LAB', revisedBudget: 288969, actualCostToDate: 52792, forecastToComplete: 236177, estimatedCostAtCompletion: 288969, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: false, isStale: false, layer: 'working' },
  { id: 'bl-2', costCode: '10-01-312', costDescription: 'Superintendent 1 — Labor', costType: 'LAB', revisedBudget: 199337, actualCostToDate: 3173, forecastToComplete: 196163, estimatedCostAtCompletion: 199337, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: false, isStale: false, layer: 'working' },
  { id: 'bl-3', costCode: '10-01-314', costDescription: 'Superintendent 2 — Labor', costType: 'LAB', revisedBudget: 348862, actualCostToDate: 71376, forecastToComplete: 277486, estimatedCostAtCompletion: 348862, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: false, isStale: false, layer: 'working' },
  { id: 'bl-4', costCode: '10-01-521', costDescription: 'Field Offices & Sheds — Materials', costType: 'MAT', revisedBudget: 82628, actualCostToDate: 22566, forecastToComplete: 60062, estimatedCostAtCompletion: 82628, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: false, isStale: false, layer: 'working' },
  { id: 'bl-5', costCode: '10-01-531', costDescription: 'Computer Software — Materials', costType: 'MAT', revisedBudget: 137500, actualCostToDate: 5183, forecastToComplete: 132317, estimatedCostAtCompletion: 137500, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: false, isStale: false, layer: 'working' },
  { id: 'bl-6', costCode: '10-01-544', costDescription: 'Equipment Rental — Materials', costType: 'MAT', revisedBudget: 45000, actualCostToDate: 1169, forecastToComplete: 43831, estimatedCostAtCompletion: 45000, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: true, isStale: false, layer: 'working' },
  { id: 'bl-7', costCode: '15-01-426', costDescription: 'Survey — Materials', costType: 'MAT', revisedBudget: 60000, actualCostToDate: 0, forecastToComplete: 60000, estimatedCostAtCompletion: 60000, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: false, isStale: true, layer: 'snapshot' },
  { id: 'bl-8', costCode: '10-01-025', costDescription: 'Plan Copy Expense — Materials', costType: 'MAT', revisedBudget: 8500, actualCostToDate: 294, forecastToComplete: 8206, estimatedCostAtCompletion: 8500, projectedOverUnder: 0, isEditable: true, hasReconciliationFlag: false, isStale: false, layer: 'working' },
];

const MOCK_LINE_DETAILS: Record<string, BudgetLineDetail> = {
  'bl-1': { lineId: 'bl-1', costCode: '10-01-318', costDescription: 'Project Manager — Labor', sourceValue: 288969, snapshotValue: 288969, workingFTC: 236177, computedEAC: 288969, computedOverUnder: 0, priorFTC: 240000, lastEditedBy: 'PM — Alex Rivera', lastEditedAt: '2026-03-25T14:00:00Z', downstreamImpacts: ['Forecast Summary — EAC', 'GC/GR — Personnel category'] },
  'bl-6': { lineId: 'bl-6', costCode: '10-01-544', costDescription: 'Equipment Rental — Materials', sourceValue: 45000, snapshotValue: 45000, workingFTC: 43831, computedEAC: 45000, computedOverUnder: 0, priorFTC: null, lastEditedBy: null, lastEditedAt: null, downstreamImpacts: ['Forecast Summary — EAC', 'Reconciliation — ambiguous match pending'] },
};

const MOCK_EVENTS: BudgetImportEvent[] = [
  { id: 'ie-1', timestamp: '2026-03-23T10:15:00Z', type: 'import', title: 'Procore CSV import — 247 lines, 3 new, 0 ambiguous', actor: 'System' },
  { id: 'ie-2', timestamp: '2026-03-25T14:00:00Z', type: 'ftc-edit', title: 'FTC updated: 10-01-318 PM Labor ($240,000 → $236,177)', actor: 'PM — Alex Rivera' },
  { id: 'ie-3', timestamp: '2026-03-22T09:00:00Z', type: 'import', title: 'Procore CSV import — 244 lines, 0 new', actor: 'System' },
];

// ── Hook ─────────────────────────────────────────────────────────────

export function useBudgetSurface(): BudgetSurfaceData {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const selectLine = useCallback((lineId: string | null) => {
    setSelectedLineId((prev) => (prev === lineId ? null : lineId));
  }, []);

  const selectedLineDetail = selectedLineId
    ? MOCK_LINE_DETAILS[selectedLineId] ?? null
    : null;

  return useMemo(
    () => ({
      snapshot: {
        snapshotId: 'snap-2026-03-23',
        sourceSystem: 'Procore',
        importBatchId: 'batch-247',
        lockTimestamp: '2026-03-23T10:15:00Z',
        lineCount: 247,
        isRefreshAvailable: false,
        refreshBlockReason: 'No newer Procore export available',
      },
      freshness: {
        sourceNewer: false,
        sourceNewerLabel: 'Source current — last import 4 days ago',
        forecastStale: false,
        staleLabel: 'Forecast current',
        reconciliationIssues: 1,
        reconciliationLabel: '1 ambiguous match pending PM resolution',
        downstreamImpactSummary: 'No downstream refresh impact',
      },
      lines: MOCK_LINES,
      selectedLineId,
      selectedLineDetail,
      importEvents: MOCK_EVENTS,
      selectLine,
    }),
    [selectedLineId, selectedLineDetail, selectLine],
  );
}
