/**
 * P3-E4 public contracts for Financial module.
 * T01: doctrine and authority. T02: budget line identity and import.
 * T03: forecast versioning and checklist. T05: cash flow working model.
 */

// ── Financial Version States ──────────────────────────────────────────

/**
 * Version states specific to the Financial module (T01 §1.4).
 * Domain-specific and intentionally separate from @hbc/versioned-record VersionTag.
 * The financial module maps between these states and VersionTag at the integration boundary.
 */
export type FinancialVersionState =
  | 'Working'
  | 'ConfirmedInternal'
  | 'PublishedMonthly'
  | 'Superseded';

// ── Financial Roles ───────────────────────────────────────────────────

/**
 * Financial module authority roles (T01 §1.3).
 * Domain-scoped roles resolved from the app-level auth context.
 * They do not replace @hbc/auth app roles; they are a financial-specific projection.
 */
export type FinancialAuthorityRole =
  | 'PM'
  | 'PER'
  | 'Leadership';

// ── Access Actions ────────────────────────────────────────────────────

/** Actions that can be performed on a financial version. */
export type FinancialAccessAction =
  | 'read'
  | 'write'
  | 'annotate'
  | 'derive'
  | 'designate-report-candidate';

// ── Access Rule Resolution ────────────────────────────────────────────

export interface IFinancialAccessQuery {
  readonly role: FinancialAuthorityRole;
  readonly versionState: FinancialVersionState;
}

export interface IFinancialAccessResult {
  readonly allowed: ReadonlyArray<FinancialAccessAction>;
  readonly denied: ReadonlyArray<FinancialAccessAction>;
  /** True when the version is not visible at all to this role. */
  readonly hidden: boolean;
}

// ── Integration Boundary Contracts ────────────────────────────────────

/** Direction of data flow at the Financial module integration boundary (T01 §1.5). */
export type FinancialIntegrationDirection = 'inbound' | 'outbound';

export interface IFinancialIntegrationBoundary {
  readonly key: string;
  readonly direction: FinancialIntegrationDirection;
  readonly source: string;
  readonly target: string;
  readonly description: string;
  /** Whether this integration is currently active or planned for future implementation. */
  readonly status: 'active' | 'planned';
}

// ── T02: Budget Line Identity and Import ──────────────────────────────

/** Cost type enumeration (T02 §3.3). */
export type CostType = 'Labor' | 'Material' | 'Equipment' | 'Subcontract' | 'Other';

/** External source system identifier (T02 §2.2). */
export type ExternalSourceSystem = 'procore' | 'manual';

/** Reconciliation condition lifecycle (T02 §2.5). */
export type ReconciliationConditionStatus = 'Pending' | 'Resolved' | 'Dismissed';
export type ReconciliationResolution = 'MergedInto' | 'CreatedNew';

/** Identity resolution outcomes (T02 §2.3). */
export type IdentityResolutionOutcome = 'matched' | 'new' | 'ambiguous';

/**
 * Budget line item — the fundamental unit of financial tracking (T02 §3.1).
 * Imported from Procore CSV; version-scoped within forecast versions.
 */
export interface IBudgetLineItem {
  // Identity (§2.2)
  readonly canonicalBudgetLineId: string;
  readonly externalSourceSystem: ExternalSourceSystem;
  readonly externalSourceLineId: string | null;
  readonly fallbackCompositeMatchKey: string;
  readonly budgetImportRowId: string;

  // Context
  readonly projectId: string;
  readonly importBatchId: string;
  readonly importedAt: string;

  // Cost codes and description
  readonly subJob: string | null;
  readonly costCodeTier1: string;
  readonly costCodeTier2: string | null;
  readonly costCodeTier3: string | null;
  readonly costType: CostType;
  readonly budgetCode: string;
  readonly budgetCodeDescription: string;

  // Budget amounts (USD, 2 decimal places)
  readonly originalBudget: number;
  readonly budgetModifications: number;
  readonly approvedCOs: number;
  readonly revisedBudget: number;           // calculated: original + mods + COs
  readonly pendingBudgetChanges: number;
  readonly projectedBudget: number;         // calculated: revised + pending

  // Cost exposure (USD)
  readonly jobToDateActualCost: number;
  readonly committedCosts: number;
  readonly costExposureToDate: number;      // calculated: actual + committed
  readonly pendingCostChanges: number;
  readonly projectedCosts: number;          // calculated: exposure + pending

  // PM forecast (working version only for edits)
  readonly forecastToComplete: number;
  readonly estimatedCostAtCompletion: number;  // calculated: exposure + FTC
  readonly projectedOverUnder: number;         // calculated: revised - EAC (positive = favorable)

  // Edit provenance
  readonly lastEditedBy: string | null;
  readonly lastEditedAt: string | null;
  readonly priorForecastToComplete: number | null;
  readonly notes: string | null;
}

/** Reconciliation condition record for ambiguous budget line matches (T02 §2.5). */
export interface IBudgetLineReconciliationCondition {
  readonly conditionId: string;
  readonly projectId: string;
  readonly importBatchId: string;
  readonly importRowFallbackKey: string;
  readonly candidateCanonicalLineIds: readonly string[];
  readonly status: ReconciliationConditionStatus;
  readonly resolvedBy?: string;
  readonly resolvedAt?: string;
  readonly resolution?: ReconciliationResolution;
  readonly resolvedCanonicalLineId?: string;
  readonly createdAt: string;
}

/** Raw CSV row before transformation — all values are strings. */
export interface IBudgetImportRow {
  readonly subJob?: string;
  readonly costCodeTier1: string;
  readonly costCodeTier2?: string;
  readonly costCodeTier3?: string;
  readonly costType: string;
  readonly budgetCode: string;
  readonly budgetCodeDescription: string;
  readonly originalBudget: string;
  readonly budgetModifications: string;
  readonly approvedCOs: string;
  readonly pendingBudgetChanges: string;
  readonly jobToDateActualCost: string;
  readonly committedCosts: string;
  readonly pendingCostChanges: string;
  readonly forecastToComplete: string;
}

/** Per-field validation error during budget import. */
export interface IBudgetImportValidationError {
  readonly rowIndex: number;
  readonly field: string;
  readonly value: string;
  readonly message: string;
}

/** Identity resolution result for a single import row (T02 §2.3). */
export interface IIdentityResolutionResult {
  readonly outcome: IdentityResolutionOutcome;
  /** Resolved canonical ID. Null when ambiguous (PM must resolve). */
  readonly canonicalBudgetLineId: string | null;
  /** Populated when outcome is 'ambiguous' — the existing lines that matched. */
  readonly candidateCanonicalLineIds: readonly string[];
}

/** Aggregate result of a budget import operation. */
export interface IBudgetImportResult {
  readonly success: boolean;
  readonly importBatchId: string;
  readonly linesMatched: number;
  readonly linesCreated: number;
  readonly reconciliationConditionsCreated: number;
  readonly validationErrors: readonly IBudgetImportValidationError[];
  readonly lines: readonly IBudgetLineItem[];
  readonly reconciliationConditions: readonly IBudgetLineReconciliationCondition[];
}

// ── T03: Forecast Versioning and Checklist ────────────────────────────

/** Alias for FinancialVersionState — spec alignment with T03 §3.2 terminology. */
export type ForecastVersionType = FinancialVersionState;

/** Why a forecast version was created (T03 §3.3). */
export type ForecastDerivationReason =
  | 'InitialSetup'
  | 'BudgetImport'
  | 'PostConfirmationEdit'
  | 'ScheduleRefresh'
  | 'ManualDerivation';

/** Checklist item grouping (T03 §4.1). */
export type ForecastChecklistGroup =
  | 'RequiredDocuments'
  | 'ProfitForecast'
  | 'Schedule'
  | 'Additional';

/** Forecast version record — one entry in the versioned forecast ledger (T03 §3.3). */
export interface IForecastVersion {
  readonly forecastVersionId: string;
  readonly projectId: string;
  readonly versionType: ForecastVersionType;
  readonly versionNumber: number;
  readonly reportingMonth: string | null;
  readonly derivedFromVersionId: string | null;
  readonly derivationReason: ForecastDerivationReason | null;
  readonly isReportCandidate: boolean;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly confirmedAt: string | null;
  readonly confirmedBy: string | null;
  readonly publishedAt: string | null;
  readonly publishedByRunId: string | null;
  readonly staleBudgetLineCount: number;
  readonly checklistCompletedAt: string | null;
  readonly notes: string | null;
}

/** Checklist item record for a specific forecast version (T03 §4.2). */
export interface IForecastChecklistItem {
  readonly checklistId: string;
  readonly forecastVersionId: string;
  readonly itemId: string;
  readonly group: ForecastChecklistGroup;
  readonly label: string;
  readonly completed: boolean;
  readonly completedBy: string | null;
  readonly completedAt: string | null;
  readonly notes: string | null;
  readonly required: boolean;
}

/** Static template entry for checklist generation (T03 §4.1). */
export interface IForecastChecklistTemplateEntry {
  readonly itemId: string;
  readonly group: ForecastChecklistGroup;
  readonly label: string;
  readonly required: boolean;
}

/** Confirmation gate validation result (T03 §4.3). */
export interface IConfirmationGateResult {
  readonly canConfirm: boolean;
  readonly blockers: readonly string[];
}

/** Result of designating a report candidate (T03 §3.6). */
export interface IReportCandidateDesignationResult {
  readonly designated: IForecastVersion;
  readonly cleared: IForecastVersion | null;
}

// ── T05: Cash Flow Working Model ──────────────────────────────────────

/** Cash flow record discriminator (T05 §7.1–§7.2). */
export type CashFlowRecordType = 'Actual' | 'Forecast';

/** Monthly actual cash flow record — read-only on all versions (T05 §7.1). */
export interface ICashFlowActualRecord {
  readonly monthlyRecordId: string;
  readonly forecastVersionId: string;
  readonly projectId: string;
  readonly periodMonth: number;
  readonly calendarDate: string;
  readonly recordType: 'Actual';
  readonly inflowOwnerPayments: number;
  readonly inflowOtherInflows: number;
  readonly totalInflows: number;                 // calculated
  readonly outflowSubcontractorPayments: number;
  readonly outflowMaterialCosts: number;
  readonly outflowLaborCosts: number;
  readonly outflowOverhead: number;
  readonly outflowEquipment: number;
  readonly totalOutflows: number;                // calculated
  readonly netCashFlow: number;                  // calculated
  readonly cumulativeCashFlow: number;           // calculated
  readonly workingCapital: number | null;
  readonly retentionHeld: number;
  readonly forecastAccuracy: number | null;
  readonly recordedAt: string;
  readonly notes: string | null;
}

/** Monthly forecast cash flow record — PM-editable on working version only (T05 §7.2). */
export interface ICashFlowForecastRecord {
  readonly monthlyRecordId: string;
  readonly forecastVersionId: string;
  readonly projectId: string;
  readonly periodMonth: number;
  readonly calendarDate: string;
  readonly recordType: 'Forecast';
  readonly projectedInflows: number;
  readonly projectedOutflows: number;
  readonly projectedNetCashFlow: number;          // calculated
  readonly projectedCumulativeCashFlow: number;   // calculated
  readonly confidenceScore: number;
  readonly notes: string | null;
  readonly lastEditedBy: string | null;
  readonly lastEditedAt: string | null;
}

/** Cash flow summary aggregate over all months (T05 §7.3). */
export interface ICashFlowSummary {
  readonly summaryId: string;
  readonly forecastVersionId: string;
  readonly projectId: string;
  readonly totalActualInflows: number;
  readonly totalActualOutflows: number;
  readonly totalActualNetCashFlow: number;
  readonly totalForecastedInflows: number;
  readonly totalForecastedOutflows: number;
  readonly totalForecastedNetCashFlow: number;
  readonly combinedNetCashFlow: number;
  readonly peakCashRequirement: number;
  readonly cashFlowAtRisk: number;
  readonly computedAt: string;
  readonly lastUpdated: string;
}

/** Project-level retention configuration (T05 §7.4). */
export interface IRetentionConfig {
  readonly retainageRate: number;
  readonly releaseSchedule: string | null;
}

/** A/R aging record — read-only, sourced from ERP daily sync (T05 §7.5). */
export interface IARAgingRecord {
  readonly arAgeId: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly projectManager: string;
  readonly percentComplete: number;
  readonly balanceToFinish: number;
  readonly retainage: number;
  readonly totalAR: number;
  readonly current0To30: number;
  readonly current30To60: number;
  readonly current60To90: number;
  readonly current90Plus: number;
  readonly comments: string | null;
  readonly refreshedAt: string;
}
