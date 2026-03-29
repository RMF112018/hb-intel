/**
 * useBudgetSurface — view-ready data hook for the Budget surface.
 *
 * Wave 3C.1: facade-aware — sources budget lines, reconciliation
 * conditions, and import posture from BudgetImportService via
 * IFinancialRepository.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useFinancialRepository } from './useFinancialRepository.js';
import { BudgetImportService } from '../services/BudgetImportService.js';
import type { BudgetImportLoadResult } from '../services/BudgetImportService.js';

import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

// ── View-Ready Types ────────────────────────────────────────────────

export type BudgetSurfaceState = 'working' | 'review' | 'approved' | 'closed';

export interface BudgetSnapshotInfo {
  readonly snapshotId: string;
  readonly sourceSystem: string;
  readonly importBatchId: string;
  readonly lockTimestamp: string;
  readonly lineCount: number;
  readonly isRefreshAvailable: boolean;
  readonly isRefreshAllowed: boolean;
  readonly refreshBlockReason?: string;
  readonly surfaceState: BudgetSurfaceState;
}

export interface BudgetFreshnessState {
  readonly sourceNewer: boolean;
  readonly sourceNewerLabel: string;
  readonly forecastStale: boolean;
  readonly staleLabel: string;
  readonly reconciliationIssues: number;
  readonly reconciliationLabel: string;
  readonly downstreamImpactSummary: string;
  readonly refreshConsequences: readonly string[];
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
  readonly complexity: 'essential' | 'standard' | 'expert';
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
  readonly importLineage?: string;
  readonly diffRule?: string;
}

export interface BudgetImportEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly type: 'import' | 'reconciliation' | 'ftc-edit' | 'refresh' | 'override';
  readonly title: string;
  readonly actor: string | null;
  readonly complexity: 'essential' | 'standard' | 'expert';
}

export interface BudgetReconciliationItem {
  readonly id: string;
  readonly lineId: string;
  readonly costCode: string;
  readonly issue: string;
  readonly severity: 'critical' | 'high' | 'standard';
  readonly actionable: boolean;
}

export interface BudgetSurfaceData {
  readonly snapshot: BudgetSnapshotInfo;
  readonly freshness: BudgetFreshnessState;
  readonly lines: readonly BudgetLineRow[];
  readonly reconciliationItems: readonly BudgetReconciliationItem[];
  readonly selectedLineId: string | null;
  readonly selectedLineDetail: BudgetLineDetail | null;
  readonly importEvents: readonly BudgetImportEvent[];
  readonly selectLine: (lineId: string | null) => void;
  readonly canEditFTC: boolean;
  readonly editFTC: (lineId: string, value: number) => void;
  readonly dirtyLines: ReadonlySet<string>;
  readonly hasUnsavedChanges: boolean;
}

// ── Mock Data ───────────────────────────────────────────────────────

function buildLines(isEditable: boolean, complexity: FinancialComplexityTier): BudgetLineRow[] {
  const allLines: BudgetLineRow[] = [
    { id: 'bl-1', costCode: '10-01-318', costDescription: 'Project Manager — Labor', costType: 'LAB', revisedBudget: 288969, actualCostToDate: 52792, forecastToComplete: 236177, estimatedCostAtCompletion: 288969, projectedOverUnder: 0, isEditable, hasReconciliationFlag: false, isStale: false, layer: 'working', complexity: 'essential' },
    { id: 'bl-2', costCode: '10-01-312', costDescription: 'Superintendent 1 — Labor', costType: 'LAB', revisedBudget: 199337, actualCostToDate: 3173, forecastToComplete: 196163, estimatedCostAtCompletion: 199337, projectedOverUnder: 0, isEditable, hasReconciliationFlag: false, isStale: false, layer: 'working', complexity: 'essential' },
    { id: 'bl-3', costCode: '10-01-314', costDescription: 'Superintendent 2 — Labor', costType: 'LAB', revisedBudget: 348862, actualCostToDate: 71376, forecastToComplete: 277486, estimatedCostAtCompletion: 348862, projectedOverUnder: 0, isEditable, hasReconciliationFlag: false, isStale: false, layer: 'working', complexity: 'standard' },
    { id: 'bl-4', costCode: '10-01-521', costDescription: 'Field Offices & Sheds — Materials', costType: 'MAT', revisedBudget: 82628, actualCostToDate: 22566, forecastToComplete: 60062, estimatedCostAtCompletion: 82628, projectedOverUnder: 0, isEditable, hasReconciliationFlag: false, isStale: false, layer: 'working', complexity: 'standard' },
    { id: 'bl-5', costCode: '10-01-531', costDescription: 'Computer Software — Materials', costType: 'MAT', revisedBudget: 137500, actualCostToDate: 5183, forecastToComplete: 132317, estimatedCostAtCompletion: 137500, projectedOverUnder: 0, isEditable, hasReconciliationFlag: false, isStale: false, layer: 'working', complexity: 'standard' },
    { id: 'bl-6', costCode: '10-01-544', costDescription: 'Equipment Rental — Materials', costType: 'MAT', revisedBudget: 45000, actualCostToDate: 1169, forecastToComplete: 43831, estimatedCostAtCompletion: 45000, projectedOverUnder: 0, isEditable, hasReconciliationFlag: true, isStale: false, layer: 'working', complexity: 'essential' },
    { id: 'bl-7', costCode: '15-01-426', costDescription: 'Survey — Materials', costType: 'MAT', revisedBudget: 60000, actualCostToDate: 0, forecastToComplete: 60000, estimatedCostAtCompletion: 60000, projectedOverUnder: 0, isEditable, hasReconciliationFlag: false, isStale: true, layer: 'snapshot', complexity: 'expert' },
    { id: 'bl-8', costCode: '10-01-025', costDescription: 'Plan Copy Expense — Materials', costType: 'MAT', revisedBudget: 8500, actualCostToDate: 294, forecastToComplete: 8206, estimatedCostAtCompletion: 8500, projectedOverUnder: 0, isEditable, hasReconciliationFlag: false, isStale: false, layer: 'working', complexity: 'expert' },
  ];

  if (complexity === 'essential') return allLines.filter(l => l.complexity === 'essential');
  if (complexity === 'standard') return allLines.filter(l => l.complexity !== 'expert');
  return allLines;
}

const MOCK_LINE_DETAILS: Record<string, BudgetLineDetail> = {
  'bl-1': { lineId: 'bl-1', costCode: '10-01-318', costDescription: 'Project Manager — Labor', sourceValue: 288969, snapshotValue: 288969, workingFTC: 236177, computedEAC: 288969, computedOverUnder: 0, priorFTC: 240000, lastEditedBy: 'PM — Alex Rivera', lastEditedAt: '2026-03-25T14:00:00Z', downstreamImpacts: ['Forecast Summary — EAC', 'GC/GR — Personnel category'], importLineage: 'Procore batch-247, line 31', diffRule: 'Composite key match: 10-01-318.LAB' },
  'bl-6': { lineId: 'bl-6', costCode: '10-01-544', costDescription: 'Equipment Rental — Materials', sourceValue: 45000, snapshotValue: 45000, workingFTC: 43831, computedEAC: 45000, computedOverUnder: 0, priorFTC: null, lastEditedBy: null, lastEditedAt: null, downstreamImpacts: ['Forecast Summary — EAC'], importLineage: 'Procore batch-247, ambiguous match pending', diffRule: 'Composite key match: 10-01-544.MAT — reconciliation condition created' },
};

const MOCK_RECONCILIATION: BudgetReconciliationItem[] = [
  { id: 'recon-1', lineId: 'bl-6', costCode: '10-01-544', issue: 'Ambiguous composite key match — Equipment Rental line may have changed cost code structure in Procore', severity: 'high', actionable: true },
];

function buildEvents(complexity: FinancialComplexityTier): BudgetImportEvent[] {
  const all: BudgetImportEvent[] = [
    { id: 'ie-1', timestamp: '2026-03-23T10:15:00Z', type: 'import', title: 'Procore CSV import — 247 lines, 3 new, 0 ambiguous', actor: 'System', complexity: 'essential' },
    { id: 'ie-2', timestamp: '2026-03-25T14:00:00Z', type: 'ftc-edit', title: 'FTC updated: 10-01-318 PM Labor ($240,000 → $236,177)', actor: 'PM — Alex Rivera', complexity: 'standard' },
    { id: 'ie-3', timestamp: '2026-03-22T09:00:00Z', type: 'import', title: 'Procore CSV import — 244 lines, 0 new', actor: 'System', complexity: 'standard' },
    { id: 'ie-4', timestamp: '2026-03-20T11:00:00Z', type: 'reconciliation', title: 'Reconciliation: 1 ambiguous match flagged for PM resolution', actor: 'System', complexity: 'expert' },
  ];
  if (complexity === 'essential') return all.filter(e => e.complexity === 'essential');
  if (complexity === 'standard') return all.filter(e => e.complexity !== 'expert');
  return all;
}

// ── State Resolution ────────────────────────────────────────────────

function resolveSurfaceState(viewerRole: FinancialViewerRole): BudgetSurfaceState {
  if (viewerRole === 'pm') return 'working';
  if (viewerRole === 'pe' || viewerRole === 'leadership') return 'review';
  return 'working';
}

function resolveEditability(state: BudgetSurfaceState, viewerRole: FinancialViewerRole): boolean {
  return state === 'working' && viewerRole === 'pm';
}

function resolveRefreshAllowed(state: BudgetSurfaceState, viewerRole: FinancialViewerRole): boolean {
  return state === 'working' && viewerRole === 'pm';
}

// ── Hook ─────────────────────────────────────────────────────────────

export interface UseBudgetSurfaceOptions {
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
}

export function useBudgetSurface(options?: UseBudgetSurfaceOptions): BudgetSurfaceData {
  const viewerRole = options?.viewerRole ?? 'pm';
  const complexity = options?.complexityTier ?? 'standard';

  // ── Facade consumption (Wave 3C.1) ─────────────────────────────────
  const repo = useFinancialRepository();
  const [facadeResult, setFacadeResult] = useState<BudgetImportLoadResult | null>(null);

  useEffect(() => {
    const service = new BudgetImportService(repo);
    service.load('proj-uuid-001', '2026-03').then(setFacadeResult).catch(() => {});
  }, [repo]);

  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [dirtyLineMap, setDirtyLineMap] = useState<Map<string, number>>(new Map());

  const surfaceState = resolveSurfaceState(viewerRole);
  const canEditFTC = resolveEditability(surfaceState, viewerRole);
  const refreshAllowed = resolveRefreshAllowed(surfaceState, viewerRole);

  const selectLine = useCallback((lineId: string | null) => {
    setSelectedLineId((prev) => (prev === lineId ? null : lineId));
  }, []);

  const editFTC = useCallback((lineId: string, value: number) => {
    if (!canEditFTC) return;
    setDirtyLineMap((prev) => {
      const next = new Map(prev);
      next.set(lineId, value);
      return next;
    });
  }, [canEditFTC]);

  const selectedLineDetail = selectedLineId ? MOCK_LINE_DETAILS[selectedLineId] ?? null : null;
  const lines = useMemo(() => buildLines(canEditFTC, complexity), [canEditFTC, complexity]);
  const events = useMemo(() => buildEvents(complexity), [complexity]);
  const dirtyLines = useMemo(() => new Set(dirtyLineMap.keys()), [dirtyLineMap]);

  // Reconciliation items only actionable in working state
  const reconciliation = surfaceState === 'working'
    ? MOCK_RECONCILIATION
    : MOCK_RECONCILIATION.map(r => ({ ...r, actionable: false }));

  return useMemo(
    () => ({
      snapshot: {
        snapshotId: 'snap-2026-03-23',
        sourceSystem: 'Procore',
        importBatchId: 'batch-247',
        lockTimestamp: '2026-03-23T10:15:00Z',
        lineCount: lines.length,
        isRefreshAvailable: false,
        isRefreshAllowed: refreshAllowed,
        refreshBlockReason: refreshAllowed ? undefined : surfaceState !== 'working' ? 'Refresh blocked — version not in working state' : 'No newer Procore export available',
        surfaceState,
      },
      freshness: {
        sourceNewer: false,
        sourceNewerLabel: 'Source current — last import 4 days ago',
        forecastStale: false,
        staleLabel: 'Forecast current',
        reconciliationIssues: reconciliation.length,
        reconciliationLabel: reconciliation.length > 0 ? `${reconciliation.length} ambiguous match pending PM resolution` : 'No reconciliation issues',
        downstreamImpactSummary: 'No downstream refresh impact',
        refreshConsequences: [],
      },
      lines,
      reconciliationItems: reconciliation,
      selectedLineId,
      selectedLineDetail,
      importEvents: events,
      selectLine,
      canEditFTC,
      editFTC,
      dirtyLines,
      hasUnsavedChanges: dirtyLineMap.size > 0,
    }),
    [surfaceState, refreshAllowed, lines, reconciliation, selectedLineId, selectedLineDetail, events, selectLine, canEditFTC, editFTC, dirtyLines, dirtyLineMap.size],
  );
}
