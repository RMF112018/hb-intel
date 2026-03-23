import type {
  BuyoutLineStatus,
  BuyoutSavingsDestination,
  BuyoutSavingsDispositionStatus,
  CostType,
  ExternalSourceSystem,
  FinancialAccessAction,
  FinancialAuthorityRole,
  FinancialVersionState,
  ForecastChecklistGroup,
  ForecastDerivationReason,
  IFinancialIntegrationBoundary,
  IForecastChecklistTemplateEntry,
  ISignConventionRule,
  ReconciliationConditionStatus,
  ReconciliationResolution,
} from '../types/index.js';

/**
 * P3-E4 contract constants.
 * T01: doctrine and authority. T02: budget line identity and import. T03: forecast versioning and checklist.
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

// ── T03: Forecast Versioning and Checklist ────────────────────────────

export const FORECAST_DERIVATION_REASONS = [
  'InitialSetup',
  'BudgetImport',
  'PostConfirmationEdit',
  'ScheduleRefresh',
  'ManualDerivation',
] as const satisfies ReadonlyArray<ForecastDerivationReason>;

export const FORECAST_CHECKLIST_GROUPS = [
  'RequiredDocuments',
  'ProfitForecast',
  'Schedule',
  'Additional',
] as const satisfies ReadonlyArray<ForecastChecklistGroup>;

/**
 * Canonical forecast checklist template — 19 items from T03 §4.1.
 * Used to generate checklist instances for each new working version.
 */
export const FORECAST_CHECKLIST_TEMPLATE: ReadonlyArray<IForecastChecklistTemplateEntry> = [
  { itemId: 'doc_procore_budget', group: 'RequiredDocuments', label: 'Procore Budget export attached', required: true },
  { itemId: 'doc_forecast_summary', group: 'RequiredDocuments', label: 'Forecast Summary completed', required: true },
  { itemId: 'doc_gc_gr_log', group: 'RequiredDocuments', label: 'GC/GR Log completed', required: true },
  { itemId: 'doc_cash_flow', group: 'RequiredDocuments', label: 'Cash Flow projection completed', required: true },
  { itemId: 'doc_sdi_log', group: 'RequiredDocuments', label: 'SDI Log attached', required: true },
  { itemId: 'doc_buyout_log', group: 'RequiredDocuments', label: 'Buyout Log completed', required: true },
  { itemId: 'profit_changes_noted', group: 'ProfitForecast', label: 'Profit changes noted in working files', required: true },
  { itemId: 'profit_negative_flagged', group: 'ProfitForecast', label: 'Negative profit values flagged for review', required: true },
  { itemId: 'profit_gc_savings_confirmed', group: 'ProfitForecast', label: 'GC/buyout savings confirmed', required: true },
  { itemId: 'profit_events_documented', group: 'ProfitForecast', label: 'Projected events documented', required: true },
  { itemId: 'schedule_status_current', group: 'Schedule', label: 'Schedule status current (within 7 days)', required: true },
  { itemId: 'schedule_brewing_items_noted', group: 'Schedule', label: 'Brewing issues noted', required: true },
  { itemId: 'schedule_gc_gr_confirmed', group: 'Schedule', label: 'GC/GR schedule confirmed', required: true },
  { itemId: 'schedule_delay_notices_sent', group: 'Schedule', label: 'Delay notices sent (if applicable)', required: false },
  { itemId: 'reserve_contingency_confirmed', group: 'Additional', label: 'Contingency reserve confirmed', required: true },
  { itemId: 'reserve_gc_confirmed', group: 'Additional', label: 'GC estimate at completion confirmed', required: true },
  { itemId: 'ar_aging_reviewed', group: 'Additional', label: 'A/R aging reviewed (cash flow impact)', required: true },
  { itemId: 'buyout_savings_dispositioned', group: 'Additional', label: 'Buyout savings dispositioned (if undispositioned savings exist)', required: false },
  { itemId: 'executive_approval_noted', group: 'Additional', label: 'Executive review completed (optional)', required: false },
] as const;

// ── T05: Cash Flow Working Model ──────────────────────────────────────

export const CASH_FLOW_RECORD_TYPES = ['Actual', 'Forecast'] as const;

/** Number of historical actual months displayed (T05 §7). */
export const CASH_FLOW_ACTUAL_MONTHS = 13;

/** Number of forward projection months (T05 §7). */
export const CASH_FLOW_FORECAST_MONTHS = 18;

/** Default retainage rate — configurable per project (T05 §7.4). */
export const DEFAULT_RETAINAGE_RATE = 0.10;

/** A/R aging bucket field names (T05 §7.5). */
export const AR_AGING_BUCKETS = [
  'current0To30',
  'current30To60',
  'current60To90',
  'current90Plus',
] as const;

// ── T06: Buyout Sub-Domain ────────────────────────────────────────────

export const BUYOUT_LINE_STATUSES = [
  'NotStarted',
  'LoiPending',
  'LoiExecuted',
  'ContractPending',
  'ContractExecuted',
  'Complete',
  'Void',
] as const satisfies ReadonlyArray<BuyoutLineStatus>;

export const BUYOUT_SAVINGS_DESTINATIONS = [
  'AppliedToForecast',
  'HeldInContingency',
  'ReleasedToGoverned',
] as const satisfies ReadonlyArray<BuyoutSavingsDestination>;

export const BUYOUT_SAVINGS_DISPOSITION_STATUSES = [
  'NoSavings',
  'Undispositioned',
  'PartiallyDispositioned',
  'FullyDispositioned',
] as const satisfies ReadonlyArray<BuyoutSavingsDispositionStatus>;

/** Statuses considered "in progress" for count metrics (T06 §8.4). */
export const BUYOUT_IN_PROGRESS_STATUSES: ReadonlyArray<BuyoutLineStatus> = [
  'LoiPending',
  'LoiExecuted',
  'ContractPending',
  'ContractExecuted',
] as const;

/** Acceptable variance between buyout contracts and committed costs (T06 §8.7). */
export const BUYOUT_RECONCILIATION_TOLERANCE = 0.05;

// ── T07: Business Rules and Calculations ──────────────────────────────

/** Sign convention rules for each financial domain (T07 §9.1–§9.5). */
export const SIGN_CONVENTION_RULES: ReadonlyArray<ISignConventionRule> = [
  { domain: 'budgetLine', direction: 'budget-minus-cost', positiveInterpretation: 'Under budget (favorable)', negativeInterpretation: 'Over budget (unfavorable)', positiveColor: 'green', negativeColor: 'red' },
  { domain: 'gcgr', direction: 'cost-minus-budget', positiveInterpretation: 'Cost overrun (unfavorable)', negativeInterpretation: 'Cost savings (favorable)', positiveColor: 'red', negativeColor: 'green' },
  { domain: 'buyout', direction: 'cost-minus-budget', positiveInterpretation: 'Over budget (unfavorable)', negativeInterpretation: 'Under budget (favorable)', positiveColor: 'red', negativeColor: 'green' },
  { domain: 'profit', direction: 'budget-minus-cost', positiveInterpretation: 'Forecasting profit', negativeInterpretation: 'Forecasting loss', positiveColor: 'green', negativeColor: 'red' },
  { domain: 'cashFlow', direction: 'budget-minus-cost', positiveInterpretation: 'Cash surplus', negativeInterpretation: 'Cash deficit', positiveColor: 'green', negativeColor: 'red' },
] as const;

/** Display precision for currency fields (T07 §9.6). */
export const DISPLAY_PRECISION_CURRENCY = 2;

/** Display precision for percentage fields (T07 §9.6). */
export const DISPLAY_PRECISION_PERCENT = 2;

/** EAC exceeds revisedBudget × this factor → warning (T07 §10.2). */
export const FTC_OVER_BUDGET_WARNING_THRESHOLD = 1.10;

/** Profit margin below this → warning alert (T07 §9.4). */
export const PROFIT_MARGIN_WARNING_THRESHOLD = 5;

/** Profit margin below this → critical alert requiring PE visibility (T07 §9.4). */
export const PROFIT_MARGIN_CRITICAL_THRESHOLD = 0;

// ── T08: Platform Integration and Annotation Scope ────────────────────

export const FINANCIAL_ACTIVITY_EVENT_TYPES = [
  'BudgetImported',
  'ForecastVersionConfirmed',
  'ForecastVersionDerived',
  'ReportCandidateDesignated',
  'ForecastVersionPublished',
  'GCGRUpdated',
  'BuyoutLineExecuted',
  'BuyoutSavingsDispositioned',
  'CashFlowProjectionUpdated',
  'ReconciliationConditionResolved',
] as const;

export const FINANCIAL_HEALTH_METRIC_KEYS = [
  'projectedOverUnder',
  'profitMargin',
  'estimatedCostAtCompletion',
  'totalCostExposureToDate',
  'percentBuyoutCompleteDollarWeighted',
  'totalRealizedBuyoutSavings',
  'totalUndispositionedSavings',
  'peakCashRequirement',
  'cashFlowAtRisk',
  'buyoutToCommittedCostsReconciliation',
] as const;

export const FINANCIAL_WORK_QUEUE_ITEM_TYPES = [
  'BudgetReconciliationRequired',
  'ForecastChecklistIncomplete',
  'BudgetLineOverbudget',
  'NegativeProfitForecast',
  'CashFlowDeficit',
  'BuyoutOverbudget',
  'UndispositionedBuyoutSavings',
  'BuyoutComplianceGateBlocked',
] as const;

export const FINANCIAL_ANNOTATION_ANCHOR_TYPES = [
  'field',
  'section',
  'block',
] as const;

export const PM_ANNOTATION_DISPOSITION_STATUSES = [
  'Pending',
  'Addressed',
  'StillApplicable',
  'NeedsReviewerAttention',
] as const;

/** Budget line field keys that PER can annotate (T08 §15.2). */
export const FINANCIAL_ANNOTATABLE_FIELD_KEYS = [
  'forecastToComplete',
  'estimatedCostAtCompletion',
  'projectedOverUnder',
  'notes',
] as const;

/** Section-level anchor keys for PER annotations (T08 §15.2). */
export const FINANCIAL_ANNOTATABLE_SECTION_KEYS = [
  'cost-summary',
  'contingency-summary',
  'profit-summary',
  'gcgr-section',
  'buyout-section',
] as const;
