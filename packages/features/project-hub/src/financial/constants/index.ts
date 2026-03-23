import type {
  CostType,
  ExternalSourceSystem,
  FinancialAccessAction,
  FinancialAuthorityRole,
  FinancialVersionState,
  IFinancialIntegrationBoundary,
  ReconciliationConditionStatus,
  ReconciliationResolution,
} from '../types/index.js';

/**
 * P3-E4 contract constants.
 * T01: doctrine and authority. T02: budget line identity and import.
 * Values are locked for contract stability.
 */

export const FINANCIAL_MODULE_SCOPE = 'financial' as const;

export const FINANCIAL_VERSION_STATES = [
  'Working',
  'ConfirmedInternal',
  'PublishedMonthly',
  'Superseded',
] as const satisfies ReadonlyArray<FinancialVersionState>;

export const FINANCIAL_AUTHORITY_ROLES = [
  'PM',
  'PER',
  'Leadership',
] as const satisfies ReadonlyArray<FinancialAuthorityRole>;

export const FINANCIAL_ACCESS_ACTIONS = [
  'read',
  'write',
  'annotate',
  'derive',
  'designate-report-candidate',
] as const satisfies ReadonlyArray<FinancialAccessAction>;

/**
 * Integration boundaries declared by T01 §1.5.
 * Each entry describes a directional data flow contract.
 */
export const FINANCIAL_INTEGRATION_BOUNDARIES: ReadonlyArray<IFinancialIntegrationBoundary> = [
  {
    key: 'procore-budget-import',
    direction: 'inbound',
    source: 'Procore',
    target: 'Financial',
    description: 'Budget line import (CSV today; direct API in future); actuals and committed costs',
    status: 'active',
  },
  {
    key: 'erp-ar-aging',
    direction: 'inbound',
    source: 'ERP',
    target: 'Financial',
    description: 'A/R aging data via daily sync; read-only display',
    status: 'planned',
  },
  {
    key: 'financial-to-reports',
    direction: 'outbound',
    source: 'Financial',
    target: 'Reports (P3-F1)',
    description: 'Confirmed snapshot designated as report candidate; published version on finalization',
    status: 'planned',
  },
  {
    key: 'financial-to-health-spine',
    direction: 'outbound',
    source: 'Financial',
    target: 'Health spine',
    description: 'Project financial health metrics on confirmation (T08 §8.2)',
    status: 'planned',
  },
  {
    key: 'financial-to-work-queue',
    direction: 'outbound',
    source: 'Financial',
    target: 'Work Queue',
    description: 'Action items for PM on reconciliation, overbudget conditions, savings disposition (T08 §8.3)',
    status: 'planned',
  },
] as const;

// ── T02: Budget Line Identity and Import ──────────────────────────────

export const COST_TYPES = [
  'Labor',
  'Material',
  'Equipment',
  'Subcontract',
  'Other',
] as const satisfies ReadonlyArray<CostType>;

export const EXTERNAL_SOURCE_SYSTEMS = [
  'procore',
  'manual',
] as const satisfies ReadonlyArray<ExternalSourceSystem>;

export const RECONCILIATION_CONDITION_STATUSES = [
  'Pending',
  'Resolved',
  'Dismissed',
] as const satisfies ReadonlyArray<ReconciliationConditionStatus>;

export const RECONCILIATION_RESOLUTIONS = [
  'MergedInto',
  'CreatedNew',
] as const satisfies ReadonlyArray<ReconciliationResolution>;

/** Required columns in Procore budget CSV that must be non-empty. */
export const BUDGET_LINE_REQUIRED_CSV_COLUMNS = [
  'budgetCode',
  'budgetCodeDescription',
  'costType',
  'costCodeTier1',
  'originalBudget',
] as const;

/** Maps Procore CSV column headers to IBudgetImportRow field names. */
export const PROCORE_CSV_COLUMN_MAP: Readonly<Record<string, string>> = {
  'Sub Job': 'subJob',
  'Cost Code Tier 1': 'costCodeTier1',
  'Cost Code Tier 2': 'costCodeTier2',
  'Cost Code Tier 3': 'costCodeTier3',
  'Cost Type': 'costType',
  'Budget Code': 'budgetCode',
  'Budget Code Description': 'budgetCodeDescription',
  'Original Budget Amount': 'originalBudget',
  'Budget Modifications': 'budgetModifications',
  'Approved COs': 'approvedCOs',
  'Pending Budget Changes': 'pendingBudgetChanges',
  'Direct Costs': 'jobToDateActualCost',
  'Committed Costs': 'committedCosts',
  'Pending Cost Changes': 'pendingCostChanges',
  'Forecast To Complete': 'forecastToComplete',
} as const;

/**
 * Maps Procore CSV cost type prefixes (before ' - ') to canonical CostType values.
 * Real CSV values: 'MAT - Materials', 'LAB - Labor', 'LBN - Labor Burden', etc.
 */
export const PROCORE_COST_TYPE_MAP: Readonly<Record<string, CostType>> = {
  'LAB': 'Labor',
  'LBN': 'Labor',
  'MAT': 'Material',
  'EQU': 'Equipment',
  'SUB': 'Subcontract',
  'OTH': 'Other',
} as const;
