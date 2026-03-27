/**
 * useBuyoutSurface — view-ready data hook for the Buyout surface.
 *
 * Integrates domain services (risk classification, commitment readiness,
 * forecast implications, warnings). Role-aware, state-aware, complexity-aware.
 */

import { useMemo, useState, useCallback } from 'react';

import type { BuyoutLineStatus, BuyoutSavingsDispositionStatus, IBuyoutLineItem } from '../types/index.js';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';
import {
  classifyBuyoutPackageRisks,
  generateForecastImplications,
  explainBuyoutWarnings,
  computeBuyoutSummaryMetrics,
} from '../buyout/index.js';
import type {
  BuyoutPackageRisk,
  BuyoutForecastImplication,
  BuyoutWarningExplanation,
} from '../buyout/index.js';

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
  readonly riskLevel: 'critical' | 'high' | 'standard' | 'none';
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
  readonly packageRisks: readonly BuyoutPackageRisk[];
  readonly forecastImplications: readonly BuyoutForecastImplication[];
  readonly warnings: readonly BuyoutWarningExplanation[];
  readonly selectedLineId: string | null;
  readonly selectedLineDetail: BuyoutLineDetail | null;
  readonly selectLine: (lineId: string | null) => void;
  readonly canEdit: boolean;
  readonly percentComplete: number;
  readonly totalExposure: number;
  readonly undispositionedSavings: number;
}

// ── Mock IBuyoutLineItem data for computors ─────────────────────────

const MOCK_DOMAIN_LINES: IBuyoutLineItem[] = [
  { buyoutLineId: 'bo-1', projectId: 'proj-1', divisionCode: '03', divisionDescription: 'Concrete', lineItemDescription: 'Concrete package', subcontractorVendorName: 'Atlas Concrete LLC', originalBudget: 1200000, contractAmount: 1150000, overUnder: -50000, buyoutSavingsAmount: 50000, savingsDispositionStatus: 'Undispositioned', loiDateToBeSent: '2025-09-15', loiReturnedExecuted: '2025-10-01', contractExecutedDate: '2025-11-15', status: 'ContractExecuted', subcontractChecklistId: 'chk-03', notes: 'Savings from scope optimization', lastEditedBy: 'PM', lastEditedAt: '2026-03-25T14:00:00Z' },
  { buyoutLineId: 'bo-2', projectId: 'proj-1', divisionCode: '05', divisionDescription: 'Steel/Metals', lineItemDescription: 'Steel erection', subcontractorVendorName: 'Southern Steel Erectors', originalBudget: 890000, contractAmount: 920000, overUnder: 30000, buyoutSavingsAmount: 0, savingsDispositionStatus: 'NoSavings', loiDateToBeSent: null, loiReturnedExecuted: null, contractExecutedDate: '2025-12-01', status: 'ContractExecuted', subcontractChecklistId: 'chk-05', notes: null, lastEditedBy: null, lastEditedAt: null },
  { buyoutLineId: 'bo-3', projectId: 'proj-1', divisionCode: '16', divisionDescription: 'Electrical', lineItemDescription: 'Electrical package', subcontractorVendorName: 'Bright Line Electric', originalBudget: 750000, contractAmount: 726600, overUnder: -23400, buyoutSavingsAmount: 23400, savingsDispositionStatus: 'Undispositioned', loiDateToBeSent: '2025-08-20', loiReturnedExecuted: '2025-09-10', contractExecutedDate: '2026-03-22', status: 'ContractExecuted', subcontractChecklistId: 'chk-16', notes: null, lastEditedBy: null, lastEditedAt: null },
  { buyoutLineId: 'bo-4', projectId: 'proj-1', divisionCode: '15', divisionDescription: 'Mechanical/HVAC', lineItemDescription: 'HVAC package', subcontractorVendorName: 'Gulf Coast Mechanical', originalBudget: 680000, contractAmount: null, overUnder: null, buyoutSavingsAmount: 0, savingsDispositionStatus: 'NoSavings', loiDateToBeSent: null, loiReturnedExecuted: null, contractExecutedDate: null, status: 'ContractPending', subcontractChecklistId: null, notes: null, lastEditedBy: null, lastEditedAt: null },
  { buyoutLineId: 'bo-5', projectId: 'proj-1', divisionCode: '07', divisionDescription: 'Waterproofing', lineItemDescription: 'Waterproofing', subcontractorVendorName: 'TBD', originalBudget: 320000, contractAmount: null, overUnder: null, buyoutSavingsAmount: 0, savingsDispositionStatus: 'NoSavings', loiDateToBeSent: null, loiReturnedExecuted: null, contractExecutedDate: null, status: 'LoiPending', subcontractChecklistId: null, notes: null, lastEditedBy: null, lastEditedAt: null },
  { buyoutLineId: 'bo-6', projectId: 'proj-1', divisionCode: '09', divisionDescription: 'Finishes', lineItemDescription: 'Finishes', subcontractorVendorName: 'TBD', originalBudget: 450000, contractAmount: null, overUnder: null, buyoutSavingsAmount: 0, savingsDispositionStatus: 'NoSavings', loiDateToBeSent: null, loiReturnedExecuted: null, contractExecutedDate: null, status: 'NotStarted', subcontractChecklistId: null, notes: null, lastEditedBy: null, lastEditedAt: null },
  { buyoutLineId: 'bo-7', projectId: 'proj-1', divisionCode: '02', divisionDescription: 'Site Work', lineItemDescription: 'Site work', subcontractorVendorName: 'Palm Grading Co.', originalBudget: 195000, contractAmount: 195000, overUnder: 0, buyoutSavingsAmount: 0, savingsDispositionStatus: 'NoSavings', loiDateToBeSent: null, loiReturnedExecuted: null, contractExecutedDate: '2025-06-15', status: 'Complete', subcontractChecklistId: 'chk-02', notes: null, lastEditedBy: null, lastEditedAt: null },
];

function buildViewLines(isEditable: boolean, complexity: FinancialComplexityTier, risks: readonly BuyoutPackageRisk[]): BuyoutLineRow[] {
  const riskMap = new Map(risks.map(r => [r.lineId, r.risk]));
  const all: BuyoutLineRow[] = MOCK_DOMAIN_LINES.map((dl, i) => ({
    id: dl.buyoutLineId,
    divisionCode: dl.divisionCode,
    divisionDescription: dl.divisionDescription,
    subcontractorVendorName: dl.subcontractorVendorName,
    originalBudget: dl.originalBudget,
    contractAmount: dl.contractAmount,
    overUnder: dl.overUnder,
    savingsAmount: dl.buyoutSavingsAmount,
    status: dl.status,
    savingsDisposition: dl.savingsDispositionStatus,
    hasComplianceGate: dl.subcontractChecklistId !== null,
    gateBlocked: false,
    isEditable: isEditable && dl.status !== 'Complete' && dl.status !== 'Void',
    complexity: i < 3 ? 'essential' as const : i < 6 ? 'standard' as const : 'expert' as const,
    riskLevel: riskMap.get(dl.buyoutLineId) ?? 'none',
  }));
  if (complexity === 'essential') return all.filter(l => l.complexity === 'essential');
  if (complexity === 'standard') return all.filter(l => l.complexity !== 'expert');
  return all;
}

const MOCK_DETAILS: Record<string, BuyoutLineDetail> = {
  'bo-1': { lineId: 'bo-1', divisionCode: '03', divisionDescription: 'Concrete', subcontractorVendorName: 'Atlas Concrete LLC', originalBudget: 1200000, contractAmount: 1150000, overUnder: -50000, savingsAmount: 50000, status: 'ContractExecuted', loiDateToBeSent: '2025-09-15', loiReturnedExecuted: '2025-10-01', contractExecutedDate: '2025-11-15', savingsDisposition: 'Undispositioned', savingsDestinations: [], complianceChecklistId: 'chk-03', forecastImplications: ['Forecast Summary — EAC reduction if savings applied', 'Contingency — increase if held in contingency'], notes: 'Concrete savings from scope optimization. Awaiting PE direction on disposition.', lastEditedBy: 'PM — Alex Rivera' },
  'bo-3': { lineId: 'bo-3', divisionCode: '16', divisionDescription: 'Electrical', subcontractorVendorName: 'Bright Line Electric', originalBudget: 750000, contractAmount: 726600, overUnder: -23400, savingsAmount: 23400, status: 'ContractExecuted', loiDateToBeSent: '2025-08-20', loiReturnedExecuted: '2025-09-10', contractExecutedDate: '2026-03-22', savingsDisposition: 'Undispositioned', savingsDestinations: [], complianceChecklistId: 'chk-16', forecastImplications: ['Forecast Summary — $23,400 pending disposition', 'Financial Control Center — buyout savings undispositioned alert'], notes: null, lastEditedBy: null },
};

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

  // Domain service integration
  const metrics = useMemo(() => computeBuyoutSummaryMetrics(MOCK_DOMAIN_LINES), []);
  const packageRisks = useMemo(() => classifyBuyoutPackageRisks(MOCK_DOMAIN_LINES), []);
  const forecastImplications = useMemo(() => generateForecastImplications(metrics), [metrics]);
  const warnings = useMemo(() => explainBuyoutWarnings(metrics), [metrics]);

  const lines = useMemo(
    () => buildViewLines(canEdit, complexity, packageRisks),
    [canEdit, complexity, packageRisks],
  );

  const selectedLineDetail = selectedLineId ? MOCK_DETAILS[selectedLineId] ?? null : null;

  const kpis: BuyoutExposureKpi[] = useMemo(() => {
    const base: BuyoutExposureKpi[] = [
      { id: 'completion', label: 'Dollar-Weighted Completion', value: `${metrics.percentBuyoutCompleteDollarWeighted.toFixed(0)}%`, severity: metrics.percentBuyoutCompleteDollarWeighted < 60 ? 'at-risk' : metrics.percentBuyoutCompleteDollarWeighted < 80 ? 'watch' : 'healthy' },
      { id: 'total-budget', label: 'Total Active Budget', value: `$${(metrics.totalBudget / 1_000_000).toFixed(2)}M`, severity: 'neutral' },
      { id: 'contracted', label: 'Total Contracted', value: `$${(metrics.totalContractAmount / 1_000_000).toFixed(2)}M`, severity: 'neutral' },
      { id: 'savings', label: 'Undispositioned Savings', value: `$${metrics.totalUndispositionedSavings.toLocaleString()}`, severity: metrics.totalUndispositionedSavings > 50000 ? 'at-risk' : metrics.totalUndispositionedSavings > 0 ? 'watch' : 'healthy' },
      { id: 'over-budget', label: 'Over Budget Exposure', value: metrics.totalOverUnder > 0 ? `$${metrics.totalOverUnder.toLocaleString()}` : 'None', severity: metrics.totalOverUnder > 100000 ? 'critical' : metrics.totalOverUnder > 0 ? 'at-risk' : 'healthy' },
      { id: 'at-risk-packages', label: 'Packages at Risk', value: `${packageRisks.length}`, severity: packageRisks.some(r => r.risk === 'critical') ? 'critical' : packageRisks.length > 0 ? 'watch' : 'healthy' },
    ];
    return complexity === 'essential' ? base.slice(0, 3) : base;
  }, [metrics, packageRisks, complexity]);

  return useMemo(
    () => ({
      surfaceState,
      kpis,
      lines,
      packageRisks,
      forecastImplications,
      warnings,
      selectedLineId,
      selectedLineDetail,
      selectLine,
      canEdit,
      percentComplete: metrics.percentBuyoutCompleteDollarWeighted,
      totalExposure: metrics.totalOverUnder > 0 ? metrics.totalOverUnder : 0,
      undispositionedSavings: metrics.totalUndispositionedSavings,
    }),
    [surfaceState, kpis, lines, packageRisks, forecastImplications, warnings, selectedLineId, selectedLineDetail, selectLine, canEdit, metrics],
  );
}
