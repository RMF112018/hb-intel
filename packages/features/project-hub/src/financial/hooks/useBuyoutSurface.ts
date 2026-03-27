/**
 * useBuyoutSurface — view-ready data hook for the Buyout surface.
 *
 * Role-aware, state-aware, complexity-aware.
 * Uses existing buyout computors for metrics.
 * Preserves hybrid authority: external commitment data vs internal financial interpretation.
 */

import { useMemo, useState, useCallback } from 'react';

import type { BuyoutLineStatus, BuyoutSavingsDispositionStatus } from '../types/index.js';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

// ── View-Ready Types ────────────────────────────────────────────────

export type BuyoutSurfaceState = 'working' | 'review' | 'approved';

export interface BuyoutLineRow {
  readonly id: string;
  readonly divisionCode: string;
  readonly divisionDescription: string;
  readonly subcontractorVendorName: string;
  readonly originalBudget: number;
  readonly contractAmount: number | null;
  readonly overUnder: number | null;
  readonly savingsAmount: number;
  readonly status: BuyoutLineStatus;
  readonly savingsDisposition: BuyoutSavingsDispositionStatus;
  readonly hasComplianceGate: boolean;
  readonly gateBlocked: boolean;
  readonly gateBlockReason?: string;
  readonly isEditable: boolean;
  readonly complexity: 'essential' | 'standard' | 'expert';
}

export interface BuyoutLineDetail {
  readonly lineId: string;
  readonly divisionCode: string;
  readonly divisionDescription: string;
  readonly subcontractorVendorName: string;
  readonly originalBudget: number;
  readonly contractAmount: number | null;
  readonly overUnder: number | null;
  readonly savingsAmount: number;
  readonly status: BuyoutLineStatus;
  readonly loiDateToBeSent: string | null;
  readonly loiReturnedExecuted: string | null;
  readonly contractExecutedDate: string | null;
  readonly savingsDisposition: BuyoutSavingsDispositionStatus;
  readonly savingsDestinations: readonly { destination: string; amount: number }[];
  readonly complianceChecklistId: string | null;
  readonly forecastImplications: readonly string[];
  readonly notes: string | null;
  readonly lastEditedBy: string | null;
}

export interface BuyoutExposureKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly severity: 'healthy' | 'watch' | 'at-risk' | 'critical' | 'neutral';
}

export interface BuyoutSurfaceData {
  readonly surfaceState: BuyoutSurfaceState;
  readonly kpis: readonly BuyoutExposureKpi[];
  readonly lines: readonly BuyoutLineRow[];
  readonly selectedLineId: string | null;
  readonly selectedLineDetail: BuyoutLineDetail | null;
  readonly selectLine: (lineId: string | null) => void;
  readonly canEdit: boolean;
  readonly percentComplete: number;
  readonly totalExposure: number;
  readonly undispositionedSavings: number;
}

// ── Mock Data ───────────────────────────────────────────────────────

function buildLines(isEditable: boolean, complexity: FinancialComplexityTier): BuyoutLineRow[] {
  const all: BuyoutLineRow[] = [
    { id: 'bo-1', divisionCode: '03', divisionDescription: 'Concrete', subcontractorVendorName: 'Atlas Concrete LLC', originalBudget: 1200000, contractAmount: 1150000, overUnder: -50000, savingsAmount: 50000, status: 'ContractExecuted', savingsDisposition: 'Undispositioned', hasComplianceGate: true, gateBlocked: false, isEditable, complexity: 'essential' },
    { id: 'bo-2', divisionCode: '05', divisionDescription: 'Steel/Metals', subcontractorVendorName: 'Southern Steel Erectors', originalBudget: 890000, contractAmount: 920000, overUnder: 30000, savingsAmount: 0, status: 'ContractExecuted', savingsDisposition: 'NoSavings', hasComplianceGate: true, gateBlocked: false, isEditable, complexity: 'essential' },
    { id: 'bo-3', divisionCode: '16', divisionDescription: 'Electrical', subcontractorVendorName: 'Bright Line Electric', originalBudget: 750000, contractAmount: 726600, overUnder: -23400, savingsAmount: 23400, status: 'ContractExecuted', savingsDisposition: 'Undispositioned', hasComplianceGate: true, gateBlocked: false, isEditable, complexity: 'essential' },
    { id: 'bo-4', divisionCode: '15', divisionDescription: 'Mechanical/HVAC', subcontractorVendorName: 'Gulf Coast Mechanical', originalBudget: 680000, contractAmount: null, overUnder: null, savingsAmount: 0, status: 'ContractPending', savingsDisposition: 'NoSavings', hasComplianceGate: false, gateBlocked: false, isEditable, complexity: 'standard' },
    { id: 'bo-5', divisionCode: '07', divisionDescription: 'Waterproofing', subcontractorVendorName: 'TBD', originalBudget: 320000, contractAmount: null, overUnder: null, savingsAmount: 0, status: 'LoiPending', savingsDisposition: 'NoSavings', hasComplianceGate: false, gateBlocked: false, isEditable, complexity: 'standard' },
    { id: 'bo-6', divisionCode: '09', divisionDescription: 'Finishes', subcontractorVendorName: 'TBD', originalBudget: 450000, contractAmount: null, overUnder: null, savingsAmount: 0, status: 'NotStarted', savingsDisposition: 'NoSavings', hasComplianceGate: false, gateBlocked: false, isEditable, complexity: 'standard' },
    { id: 'bo-7', divisionCode: '02', divisionDescription: 'Site Work', subcontractorVendorName: 'Palm Grading Co.', originalBudget: 195000, contractAmount: 195000, overUnder: 0, savingsAmount: 0, status: 'Complete', savingsDisposition: 'NoSavings', hasComplianceGate: true, gateBlocked: false, isEditable: false, complexity: 'expert' },
  ];
  if (complexity === 'essential') return all.filter(l => l.complexity === 'essential');
  if (complexity === 'standard') return all.filter(l => l.complexity !== 'expert');
  return all;
}

const MOCK_DETAILS: Record<string, BuyoutLineDetail> = {
  'bo-1': { lineId: 'bo-1', divisionCode: '03', divisionDescription: 'Concrete', subcontractorVendorName: 'Atlas Concrete LLC', originalBudget: 1200000, contractAmount: 1150000, overUnder: -50000, savingsAmount: 50000, status: 'ContractExecuted', loiDateToBeSent: '2025-09-15', loiReturnedExecuted: '2025-10-01', contractExecutedDate: '2025-11-15', savingsDisposition: 'Undispositioned', savingsDestinations: [], complianceChecklistId: 'chk-03', forecastImplications: ['Forecast Summary — EAC reduction if savings applied', 'Contingency — increase if held in contingency'], notes: 'Concrete savings from scope optimization. Awaiting PE direction on disposition.', lastEditedBy: 'PM — Alex Rivera' },
  'bo-3': { lineId: 'bo-3', divisionCode: '16', divisionDescription: 'Electrical', subcontractorVendorName: 'Bright Line Electric', originalBudget: 750000, contractAmount: 726600, overUnder: -23400, savingsAmount: 23400, status: 'ContractExecuted', loiDateToBeSent: '2025-08-20', loiReturnedExecuted: '2025-09-10', contractExecutedDate: '2026-03-22', savingsDisposition: 'Undispositioned', savingsDestinations: [], complianceChecklistId: 'chk-16', forecastImplications: ['Forecast Summary — $23,400 pending disposition', 'Financial Control Center — buyout savings undispositioned alert'], notes: null, lastEditedBy: null },
};

const MOCK_KPIS: BuyoutExposureKpi[] = [
  { id: 'completion', label: 'Dollar-Weighted Completion', value: '72%', severity: 'watch' },
  { id: 'total-budget', label: 'Total Active Budget', value: '$4.49M', severity: 'neutral' },
  { id: 'contracted', label: 'Total Contracted', value: '$2.99M', severity: 'neutral' },
  { id: 'savings', label: 'Undispositioned Savings', value: '$73,400', severity: 'watch' },
  { id: 'over-budget', label: 'Over Budget Lines', value: '1 ($30K)', severity: 'at-risk' },
];

// ── Hook ─────────────────────────────────────────────────────────────

export interface UseBuyoutSurfaceOptions {
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
}

export function useBuyoutSurface(options?: UseBuyoutSurfaceOptions): BuyoutSurfaceData {
  const viewerRole = options?.viewerRole ?? 'pm';
  const complexity = options?.complexityTier ?? 'standard';

  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const surfaceState: BuyoutSurfaceState = viewerRole === 'pm' ? 'working' : 'review';
  const canEdit = surfaceState === 'working' && viewerRole === 'pm';

  const selectLine = useCallback((lineId: string | null) => {
    setSelectedLineId((prev) => (prev === lineId ? null : lineId));
  }, []);

  const lines = useMemo(() => buildLines(canEdit, complexity), [canEdit, complexity]);
  const selectedLineDetail = selectedLineId ? MOCK_DETAILS[selectedLineId] ?? null : null;
  const filteredKpis = complexity === 'essential' ? MOCK_KPIS.slice(0, 3) : MOCK_KPIS;

  return useMemo(
    () => ({
      surfaceState,
      kpis: filteredKpis,
      lines,
      selectedLineId,
      selectedLineDetail,
      selectLine,
      canEdit,
      percentComplete: 72,
      totalExposure: 30000,
      undispositionedSavings: 73400,
    }),
    [surfaceState, filteredKpis, lines, selectedLineId, selectedLineDetail, selectLine, canEdit],
  );
}
