/**
 * useForecastSummary — view-ready data hook for the Forecast Summary surface.
 *
 * Returns mock data initially. Will wire to IFinancialRepository when
 * the data-access factory registration is complete.
 */

import { useMemo } from 'react';

import type { FinancialVersionState } from '../types/index.js';

// ── View-Ready Types ────────────────────────────────────────────────

export interface ForecastVersionContext {
  readonly reportingMonth: string;
  readonly versionState: FinancialVersionState;
  readonly versionNumber: number;
  readonly custodyOwner: string;
  readonly custodyRole: string;
  readonly isEditable: boolean;
  readonly compareTarget: string | null;
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

export interface ForecastSummaryData {
  readonly version: ForecastVersionContext;
  readonly kpis: readonly ForecastKpiMetric[];
  readonly sections: readonly ForecastFormSection[];
  readonly priorComparison: readonly ForecastDeltaEntry[];
  readonly commentary: readonly ForecastCommentaryEntry[];
  readonly exposureItems: readonly ForecastExposureItem[];
}

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_KPIS: ForecastKpiMetric[] = [
  { id: 'contract-value', label: 'Contract Value', value: '$8,247,500', trend: 'flat', trendLabel: 'No change', severity: 'neutral' },
  { id: 'current-profit', label: 'Current Profit', value: '$142,500', trend: 'down', trendLabel: '-$18,200 from V3', severity: 'watch' },
  { id: 'profit-margin', label: 'Profit Margin', value: '1.7%', trend: 'down', trendLabel: '-0.2pp from V3', severity: 'at-risk' },
  { id: 'cost-exposure', label: 'Cost Exposure', value: '$87,500', trend: 'up', trendLabel: '+$12,400 from V3', severity: 'watch' },
  { id: 'collection-risk', label: 'Collection Risk', value: '$114,144', trend: 'flat', trendLabel: 'A/R aging stable', severity: 'healthy' },
  { id: 'contingency', label: 'Contingency', value: '$165,000', trend: 'down', trendLabel: '-$23,400 pending disposition', severity: 'watch' },
];

const MOCK_SECTIONS: ForecastFormSection[] = [
  {
    id: 'contract-revenue',
    title: 'Contract / Revenue',
    fields: [
      { id: 'original-contract', label: 'Original Contract Value', value: '$8,100,000', editable: false, type: 'currency', changedFromPrior: false },
      { id: 'approved-cos', label: 'Approved Change Orders', value: '$147,500', editable: false, type: 'currency', changedFromPrior: false },
      { id: 'current-contract', label: 'Current Contract Value', value: '$8,247,500', editable: true, type: 'currency', changedFromPrior: false },
      { id: 'contract-type', label: 'Contract Type', value: 'GMP', editable: true, type: 'text', changedFromPrior: false },
    ],
  },
  {
    id: 'cost-margin',
    title: 'Cost / Margin',
    fields: [
      { id: 'estimated-cost', label: 'Estimated Cost at Completion', value: '$8,105,000', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$8,086,800' },
      { id: 'current-profit', label: 'Current Profit', value: '$142,500', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$160,700' },
      { id: 'profit-margin', label: 'Profit Margin', value: '1.7%', editable: false, type: 'percentage', changedFromPrior: true, priorValue: '1.9%', validationMessage: 'Below 5% warning threshold' },
      { id: 'gc-eac', label: 'GC Estimate at Completion', value: '$1,245,000', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$1,232,600' },
    ],
  },
  {
    id: 'exposure-risk',
    title: 'Exposure / Risk',
    fields: [
      { id: 'total-exposure', label: 'Total Cost Exposure', value: '$87,500', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$75,100' },
      { id: 'pending-cos', label: 'Pending Change Orders', value: '$32,000', editable: false, type: 'currency', changedFromPrior: false },
      { id: 'unresolved-reconciliation', label: 'Unresolved Reconciliation Items', value: '2', editable: false, type: 'number', changedFromPrior: false },
    ],
  },
  {
    id: 'receivables-cash',
    title: 'Receivables / Cash',
    fields: [
      { id: 'total-ar', label: 'Total A/R', value: '$114,144', editable: false, type: 'currency', changedFromPrior: false },
      { id: 'ar-aging-60plus', label: 'A/R 60+ Days', value: '$20,000', editable: false, type: 'currency', changedFromPrior: false },
      { id: 'retention-held', label: 'Retention Held', value: '$22,470', editable: false, type: 'currency', changedFromPrior: false },
      { id: 'peak-cash-req', label: 'Peak Cash Requirement', value: '-$132,675', editable: false, type: 'currency', changedFromPrior: false },
    ],
  },
  {
    id: 'contingency-savings',
    title: 'Contingency / Savings',
    fields: [
      { id: 'original-contingency', label: 'Original Contingency', value: '$200,000', editable: false, type: 'currency', changedFromPrior: false },
      { id: 'current-contingency', label: 'Current Contingency', value: '$165,000', editable: true, type: 'currency', changedFromPrior: true, priorValue: '$188,400' },
      { id: 'expected-at-completion', label: 'Expected at Completion', value: '$140,000', editable: true, type: 'currency', changedFromPrior: false },
      { id: 'buyout-savings', label: 'Realized Buyout Savings', value: '$23,400', editable: false, type: 'currency', changedFromPrior: true, priorValue: '$0' },
    ],
  },
  {
    id: 'executive-summary',
    title: 'Executive Summary / Outlook',
    fields: [
      { id: 'damage-clause', label: 'Damage Clause / LDs', value: 'N/A — no LD clause in current contract', editable: true, type: 'text', changedFromPrior: false },
      { id: 'schedule-completion', label: 'Revised Contract Completion', value: '2026-11-15', editable: true, type: 'date', changedFromPrior: false },
      { id: 'approved-extensions', label: 'Approved Days Extensions', value: '14', editable: true, type: 'number', changedFromPrior: false },
    ],
  },
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

// ── Hook ─────────────────────────────────────────────────────────────

export function useForecastSummary(): ForecastSummaryData {
  return useMemo(
    () => ({
      version: {
        reportingMonth: 'February 2026',
        versionState: 'Working' as const,
        versionNumber: 4,
        custodyOwner: 'Alex Rivera',
        custodyRole: 'PM',
        isEditable: true,
        compareTarget: 'V3 — Confirmed Internal',
      },
      kpis: MOCK_KPIS,
      sections: MOCK_SECTIONS,
      priorComparison: MOCK_DELTAS,
      commentary: MOCK_COMMENTARY,
      exposureItems: MOCK_EXPOSURE,
    }),
    [],
  );
}
