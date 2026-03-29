/**
 * useForecastSummary — view-ready data hook for the Forecast Summary surface.
 *
 * Role-aware: shapes behavior based on viewer role (PM edits, PE reviews).
 * State-aware: respects version lifecycle (Working/ConfirmedInternal/Published/Stale).
 * Complexity-aware: supports Essential/Standard/Expert progressive disclosure.
 *
 * Wave 3A.1: facade-aware — sources summary data from ForecastSummaryService
 * via IFinancialRepository. Falls back to inline mock for view-model fields
 * not yet exposed through the service.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';

import type { FinancialVersionState } from '../types/index.js';
import { useFinancialRepository } from './useFinancialRepository.js';
import { ForecastSummaryService } from '../services/ForecastSummaryService.js';
import type { ForecastSummaryLoadResult } from '../services/ForecastSummaryService.js';
import type { FinancialViewerRole, FinancialComplexityTier } from './useFinancialControlCenter.js';

// ── View-Ready Types ────────────────────────────────────────────────

export type ForecastSurfaceState = 'editing' | 'comparing' | 'reviewing' | 'read-only';

export interface ForecastVersionContext {
  readonly reportingMonth: string;
  readonly versionState: FinancialVersionState;
  readonly versionNumber: number;
  readonly custodyOwner: string;
  readonly custodyRole: string;
  readonly isEditable: boolean;
  readonly isStale: boolean;
  readonly staleReason?: string;
  readonly compareTarget: string | null;
  readonly surfaceState: ForecastSurfaceState;
}

export interface ForecastKpiMetric {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly trend: 'up' | 'down' | 'flat';
  readonly trendLabel: string;
  readonly severity: 'healthy' | 'watch' | 'at-risk' | 'critical' | 'neutral';
}

export interface ForecastFormField {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly editable: boolean;
  readonly type: 'currency' | 'percentage' | 'number' | 'date' | 'text';
  readonly changedFromPrior: boolean;
  readonly priorValue?: string;
  readonly validationMessage?: string;
  readonly provenance?: string;
  readonly complexity: 'essential' | 'standard' | 'expert';
}

export interface ForecastFormSection {
  readonly id: string;
  readonly title: string;
  readonly fields: readonly ForecastFormField[];
}

export interface ForecastDeltaEntry {
  readonly id: string;
  readonly fieldLabel: string;
  readonly priorValue: string;
  readonly currentValue: string;
  readonly direction: 'increase' | 'decrease' | 'unchanged';
  readonly material: boolean;
  readonly explanation?: string;
}

export interface ForecastCommentaryEntry {
  readonly id: string;
  readonly author: string;
  readonly role: string;
  readonly timestamp: string;
  readonly text: string;
  readonly disposition?: 'pending' | 'addressed' | 'still-applicable';
}

export interface ForecastExposureItem {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly amount: string;
  readonly severity: 'critical' | 'high' | 'standard';
}

export interface ForecastStaleBanner {
  readonly visible: boolean;
  readonly message: string;
  readonly sources: readonly string[];
}

export interface ForecastSummaryData {
  readonly version: ForecastVersionContext;
  readonly kpis: readonly ForecastKpiMetric[];
  readonly sections: readonly ForecastFormSection[];
  readonly priorComparison: readonly ForecastDeltaEntry[];
  readonly commentary: readonly ForecastCommentaryEntry[];
  readonly exposureItems: readonly ForecastExposureItem[];
  readonly staleBanner: ForecastStaleBanner;
  readonly dirtyFields: ReadonlySet<string>;
  readonly editField: (fieldId: string, value: string) => void;
  readonly saveChanges: () => void;
  readonly toggleCompareMode: () => void;
  readonly isCompareMode: boolean;
  readonly isSaving: boolean;
  readonly hasUnsavedChanges: boolean;
}

// ── Mock Data ───────────────────────────────────────────────────────

function buildSections(
  isEditable: boolean,
  complexity: FinancialComplexityTier,
): ForecastFormSection[] {
  const allSections: ForecastFormSection[] = [
    {
      id: 'contract-revenue',
      title: 'Contract / Revenue',
      fields: [
        { id: 'original-contract', label: 'Original Contract Value', value: '$8,100,000', editable: false, type: 'currency', changedFromPrior: false, complexity: 'essential' },
        { id: 'approved-cos', label: 'Approved Change Orders', value: '$147,500', editable: false, type: 'currency', changedFromPrior: false, complexity: 'standard' },
        { id: 'current-contract', label: 'Current Contract Value', value: '$8,247,500', editable: isEditable, type: 'currency', changedFromPrior: false, complexity: 'essential' },
        { id: 'contract-type', label: 'Contract Type', value: 'GMP', editable: isEditable, type: 'text', changedFromPrior: false, complexity: 'standard' },
      ],
    },
    {
      id: 'cost-margin',
      title: 'Cost / Margin',
      fields: [
        { id: 'estimated-cost', label: 'Estimated Cost at Completion', value: '$8,105,000', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$8,086,800', complexity: 'essential', provenance: 'Derived from budget line EACs + GC EAC' },
        { id: 'current-profit', label: 'Current Profit', value: '$142,500', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$160,700', complexity: 'essential' },
        { id: 'profit-margin', label: 'Profit Margin', value: '1.7%', editable: false, type: 'percentage', changedFromPrior: true, priorValue: '1.9%', validationMessage: 'Below 5% warning threshold', complexity: 'essential' },
        { id: 'gc-eac', label: 'GC Estimate at Completion', value: '$1,245,000', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$1,232,600', complexity: 'standard', provenance: 'Aggregated from GC/GR lines' },
      ],
    },
    {
      id: 'exposure-risk',
      title: 'Exposure / Risk',
      fields: [
        { id: 'total-exposure', label: 'Total Cost Exposure', value: '$87,500', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$75,100', complexity: 'essential' },
        { id: 'pending-cos', label: 'Pending Change Orders', value: '$32,000', editable: false, type: 'currency', changedFromPrior: false, complexity: 'standard' },
        { id: 'unresolved-reconciliation', label: 'Unresolved Reconciliation Items', value: '2', editable: false, type: 'number', changedFromPrior: false, complexity: 'expert' },
      ],
    },
    {
      id: 'receivables-cash',
      title: 'Receivables / Cash',
      fields: [
        { id: 'total-ar', label: 'Total A/R', value: '$114,144', editable: false, type: 'currency', changedFromPrior: false, complexity: 'standard' },
        { id: 'ar-aging-60plus', label: 'A/R 60+ Days', value: '$20,000', editable: false, type: 'currency', changedFromPrior: false, complexity: 'standard' },
        { id: 'retention-held', label: 'Retention Held', value: '$22,470', editable: false, type: 'currency', changedFromPrior: false, complexity: 'expert' },
        { id: 'peak-cash-req', label: 'Peak Cash Requirement', value: '-$132,675', editable: false, type: 'currency', changedFromPrior: false, complexity: 'expert' },
      ],
    },
    {
      id: 'contingency-savings',
      title: 'Contingency / Savings',
      fields: [
        { id: 'original-contingency', label: 'Original Contingency', value: '$200,000', editable: false, type: 'currency', changedFromPrior: false, complexity: 'standard' },
        { id: 'current-contingency', label: 'Current Contingency', value: '$165,000', editable: isEditable, type: 'currency', changedFromPrior: true, priorValue: '$188,400', complexity: 'essential' },
        { id: 'expected-at-completion', label: 'Expected at Completion', value: '$140,000', editable: isEditable, type: 'currency', changedFromPrior: false, complexity: 'standard' },
        { id: 'buyout-savings', label: 'Realized Buyout Savings', value: '$23,400', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$0', complexity: 'standard', provenance: 'From buyout ContractExecuted events' },
      ],
    },
    {
      id: 'executive-summary',
      title: 'Executive Summary / Outlook',
      fields: [
        { id: 'damage-clause', label: 'Damage Clause / LDs', value: 'N/A — no LD clause in current contract', editable: isEditable, type: 'text', changedFromPrior: false, complexity: 'standard' },
        { id: 'schedule-completion', label: 'Revised Contract Completion', value: '2026-11-15', editable: isEditable, type: 'date', changedFromPrior: false, complexity: 'essential' },
        { id: 'approved-extensions', label: 'Approved Days Extensions', value: '14', editable: isEditable, type: 'number', changedFromPrior: false, complexity: 'standard' },
      ],
    },
  ];

  // Filter fields by complexity tier
  if (complexity === 'essential') {
    return allSections
      .map((s) => ({ ...s, fields: s.fields.filter((f) => f.complexity === 'essential') }))
      .filter((s) => s.fields.length > 0);
  }
  if (complexity === 'standard') {
    return allSections
      .map((s) => ({ ...s, fields: s.fields.filter((f) => f.complexity !== 'expert') }))
      .filter((s) => s.fields.length > 0);
  }
  return allSections; // expert: all fields
}

const MOCK_KPIS: ForecastKpiMetric[] = [
  { id: 'contract-value', label: 'Contract Value', value: '$8,247,500', trend: 'flat', trendLabel: 'No change', severity: 'neutral' },
  { id: 'current-profit', label: 'Current Profit', value: '$142,500', trend: 'down', trendLabel: '-$18,200 from V3', severity: 'watch' },
  { id: 'profit-margin', label: 'Profit Margin', value: '1.7%', trend: 'down', trendLabel: '-0.2pp from V3', severity: 'at-risk' },
  { id: 'cost-exposure', label: 'Cost Exposure', value: '$87,500', trend: 'up', trendLabel: '+$12,400 from V3', severity: 'watch' },
  { id: 'collection-risk', label: 'Collection Risk', value: '$114,144', trend: 'flat', trendLabel: 'A/R aging stable', severity: 'healthy' },
  { id: 'contingency', label: 'Contingency', value: '$165,000', trend: 'down', trendLabel: '-$23,400 pending disposition', severity: 'watch' },
];

const MOCK_DELTAS: ForecastDeltaEntry[] = [
  { id: 'd-1', fieldLabel: 'Estimated Cost at Completion', priorValue: '$8,086,800', currentValue: '$8,105,000', direction: 'increase', material: true, explanation: 'GC labor variance increased $12,400 from superintendent overtime' },
  { id: 'd-2', fieldLabel: 'Current Profit', priorValue: '$160,700', currentValue: '$142,500', direction: 'decrease', material: true, explanation: 'Cost increase without offsetting revenue change' },
  { id: 'd-3', fieldLabel: 'Profit Margin', priorValue: '1.9%', currentValue: '1.7%', direction: 'decrease', material: true, explanation: 'Below 5% warning threshold — review recommended' },
  { id: 'd-4', fieldLabel: 'Current Contingency', priorValue: '$188,400', currentValue: '$165,000', direction: 'decrease', material: true, explanation: 'Buyout savings ($23,400) pending disposition' },
  { id: 'd-5', fieldLabel: 'Realized Buyout Savings', priorValue: '$0', currentValue: '$23,400', direction: 'increase', material: false, explanation: 'Electrical scope contract executed below budget' },
  { id: 'd-6', fieldLabel: 'Total Cost Exposure', priorValue: '$75,100', currentValue: '$87,500', direction: 'increase', material: true, explanation: 'GC variance driving exposure increase' },
];

const MOCK_COMMENTARY: ForecastCommentaryEntry[] = [
  { id: 'c-1', author: 'Alex Rivera', role: 'PM', timestamp: '2026-03-25T14:30:00Z', text: 'GC/GR variance is driving the margin decrease. Superintendent overtime should normalize next month. Recommend holding buyout savings in contingency pending PE review.' },
  { id: 'c-2', author: 'Jordan Wells', role: 'PE', timestamp: '2026-03-24T10:00:00Z', text: 'Confirm GC labor variance is within acceptable range before submission. Need to see the recovery plan for superintendent costs.', disposition: 'pending' },
];

const MOCK_EXPOSURE: ForecastExposureItem[] = [
  { id: 'e-1', title: 'GC labor overrun risk', source: 'GC/GR', amount: '$67,200', severity: 'high' },
  { id: 'e-2', title: 'Pending change order exposure', source: 'Budget', amount: '$32,000', severity: 'standard' },
  { id: 'e-3', title: 'Undispositioned buyout savings', source: 'Buyout', amount: '$23,400', severity: 'standard' },
];

// ── State-Model Resolution ──────────────────────────────────────────

function resolveSurfaceState(
  versionState: FinancialVersionState,
  viewerRole: FinancialViewerRole,
  isCompareMode: boolean,
): ForecastSurfaceState {
  if (versionState === 'PublishedMonthly' || versionState === 'Superseded') return 'read-only';
  if (versionState === 'ConfirmedInternal') {
    return viewerRole === 'pe' || viewerRole === 'leadership' ? 'reviewing' : 'read-only';
  }
  // Working
  if (viewerRole === 'pm') return isCompareMode ? 'comparing' : 'editing';
  return 'comparing'; // non-PM roles see compare mode on working versions
}

function resolveEditability(
  versionState: FinancialVersionState,
  viewerRole: FinancialViewerRole,
): boolean {
  return versionState === 'Working' && viewerRole === 'pm';
}

// ── Hook ─────────────────────────────────────────────────────────────

export interface UseForecastSummaryOptions {
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
}

export function useForecastSummary(
  options?: UseForecastSummaryOptions,
): ForecastSummaryData {
  const viewerRole = options?.viewerRole ?? 'pm';
  const complexity = options?.complexityTier ?? 'standard';

  // ── Facade consumption (Wave 3A.1) ─────────────────────────────────
  const repo = useFinancialRepository();
  const [facadeResult, setFacadeResult] = useState<ForecastSummaryLoadResult | null>(null);

  useEffect(() => {
    const service = new ForecastSummaryService(repo);
    service.load('proj-uuid-001', '2026-03').then(setFacadeResult).catch(() => {});
  }, [repo]);

  const [isCompareMode, setIsCompareMode] = useState(viewerRole !== 'pm');
  const [dirtyFieldMap, setDirtyFieldMap] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Use facade posture when available, fall back to inline defaults
  const versionState: FinancialVersionState = (facadeResult?.posture.currentVersionState as FinancialVersionState | undefined) ?? 'Working';
  const isEditable = facadeResult ? facadeResult.isEditable : resolveEditability(versionState, viewerRole);
  const surfaceState = resolveSurfaceState(versionState, viewerRole, isCompareMode);

  const editField = useCallback((fieldId: string, value: string) => {
    if (!isEditable) return;
    setDirtyFieldMap((prev) => {
      const next = new Map(prev);
      next.set(fieldId, value);
      return next;
    });
  }, [isEditable]);

  const saveChanges = useCallback(() => {
    if (dirtyFieldMap.size === 0) return;
    setIsSaving(true);
    // Wave 3A.2: persist edits through ForecastSummaryService facade
    const service = new ForecastSummaryService(repo);
    const savePromises = Array.from(dirtyFieldMap.entries()).map(([fieldId, value]) =>
      service.editField('ver-003', fieldId as any, value, 'current-user'),
    );
    Promise.all(savePromises).then(() => {
      setDirtyFieldMap(new Map());
      setIsSaving(false);
    }).catch(() => {
      setIsSaving(false);
    });
  }, [dirtyFieldMap, repo]);

  const toggleCompareMode = useCallback(() => {
    if (viewerRole === 'pm') {
      setIsCompareMode((prev) => !prev);
    }
  }, [viewerRole]);

  // Wave 3A.2: build sections from facade summary when available
  const sections = useMemo(() => {
    if (facadeResult?.summary) {
      const service = new ForecastSummaryService(repo);
      const fieldsWithValues = service.getFieldsWithValues(facadeResult.summary);
      // Group by worksheet-aligned field groups → map to ForecastFormSection shape
      const groupOrder: string[] = ['project-info', 'schedule', 'contract', 'cost', 'profit', 'contingency', 'gcgr', 'narrative'];
      const groupLabels: Record<string, string> = {
        'project-info': 'Project Information',
        'schedule': 'Schedule',
        'contract': 'Contract / Revenue',
        'cost': 'Cost / Margin',
        'profit': 'Profit & Projections',
        'contingency': 'Contingency / Savings',
        'gcgr': 'GC/GR',
        'narrative': 'Executive Summary / Outlook',
      };
      return groupOrder
        .map((group) => {
          const groupFields = fieldsWithValues.filter((f) => f.group === group);
          return {
            id: group,
            title: groupLabels[group] ?? group,
            fields: groupFields.map((f) => ({
              id: f.field,
              label: f.label,
              value: f.value != null ? String(f.value) : '',
              editable: f.editable && isEditable,
              type: f.type,
              changedFromPrior: false,
              complexity: 'essential' as const,
            })),
          };
        })
        .filter((s) => s.fields.length > 0);
    }
    // Fallback to inline mock sections
    return buildSections(isEditable, complexity);
  }, [isEditable, complexity, facadeResult, repo]);

  const dirtyFields = useMemo(
    () => new Set(dirtyFieldMap.keys()),
    [dirtyFieldMap],
  );

  // Wave 3A.2: build KPIs from facade summary when available
  const filteredKpis = useMemo(() => {
    if (facadeResult?.summary) {
      const s = facadeResult.summary;
      const kpis: ForecastKpiMetric[] = [
        { id: 'contract-value', label: 'Contract Value', value: `$${(s.revisedContractAmount / 1_000_000).toFixed(1)}M`, trend: 'flat', trendLabel: 'Revised', severity: 'neutral' },
        { id: 'current-profit', label: 'Current Profit', value: `$${(s.currentProfit / 1_000).toFixed(0)}K`, trend: s.currentProfit > 0 ? 'up' : 'down', trendLabel: s.currentProfit > 0 ? 'Positive' : 'Loss', severity: s.profitMargin >= 5 ? 'healthy' : s.profitMargin >= 0 ? 'watch' : 'critical' },
        { id: 'profit-margin', label: 'Profit Margin', value: `${s.profitMargin.toFixed(1)}%`, trend: s.profitMargin >= 5 ? 'flat' : 'down', trendLabel: s.profitMargin >= 5 ? 'On target' : 'Below threshold', severity: s.profitMargin >= 5 ? 'healthy' : 'at-risk' },
        { id: 'contingency', label: 'Contingency', value: `$${(s.contingencyRemaining / 1_000).toFixed(0)}K`, trend: 'flat', trendLabel: 'Remaining', severity: 'neutral' },
      ];
      return complexity === 'essential' ? kpis.slice(0, 3) : kpis;
    }
    return complexity === 'essential' ? MOCK_KPIS.slice(0, 3) : MOCK_KPIS;
  }, [facadeResult, complexity]);

  return useMemo(
    () => ({
      version: {
        reportingMonth: facadeResult?.posture.reportingPeriod ?? 'February 2026',
        versionState,
        versionNumber: facadeResult?.posture.currentVersionNumber ?? 4,
        custodyOwner: 'Alex Rivera',
        custodyRole: 'PM',
        isEditable,
        isStale: facadeResult?.isStale ?? false,
        staleReason: facadeResult?.blockers[0],
        compareTarget: 'V3 — Confirmed Internal',
        surfaceState,
      },
      kpis: filteredKpis,
      sections,
      priorComparison: MOCK_DELTAS,
      commentary: viewerRole === 'pe' || viewerRole === 'leadership'
        ? MOCK_COMMENTARY
        : MOCK_COMMENTARY.filter((c) => c.role === 'PM'),
      exposureItems: MOCK_EXPOSURE,
      staleBanner: {
        visible: facadeResult?.isStale ?? false,
        message: facadeResult?.blockers[0] ?? '',
        sources: facadeResult?.blockers ?? [],
      },
      dirtyFields,
      editField,
      saveChanges,
      toggleCompareMode,
      isCompareMode,
      isSaving,
      hasUnsavedChanges: dirtyFieldMap.size > 0,
    }),
    [viewerRole, versionState, isEditable, surfaceState, filteredKpis, sections, dirtyFields, editField, saveChanges, toggleCompareMode, isCompareMode, isSaving, dirtyFieldMap.size],
  );
}
