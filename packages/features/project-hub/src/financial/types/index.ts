/**
 * P3-E4 public contracts for Financial module.
 * T01: doctrine and authority. T02: budget line identity and import.
 * T03: forecast versioning and checklist. T05: cash flow working model.
 * T06: buyout sub-domain. T07: business rules and calculations.
 * T08: platform integration and annotation scope.
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

// ── T04: Forecast Summary and GC/GR Field-Level Specification ─────────

/**
 * Financial Forecast Summary record (T04 §5).
 *
 * The core PM working surface for each reporting period.
 * Editable fields are PM-writable on Working version only.
 * Derived fields are recomputed automatically and must never be edited directly.
 */
export interface IFinancialForecastSummary {
  readonly summaryId: string;
  readonly forecastVersionId: string;
  readonly projectId: string;
  readonly reportingPeriod: string;

  // ── Project metadata (PM-editable) ─────────────────────────────────
  readonly projectName: string;
  readonly projectNumber: string;
  readonly projectManager: string;
  readonly contractType: string;
  readonly clientName: string;

  // ── Schedule context (PM-editable) ─────────────────────────────────
  readonly scheduledCompletionDate: string | null;
  readonly revisedCompletionDate: string | null;
  readonly percentComplete: number;
  readonly monthsRemaining: number;

  // ── Financial summary — editable fields (PM-writable on Working) ───
  readonly originalContractAmount: number;
  readonly approvedChangeOrders: number;
  readonly pendingChangeOrders: number;
  readonly contingencyBudget: number;
  readonly contingencyUsedToDate: number;
  readonly forecastToComplete: number;
  readonly pmNarrative: string;

  // ── Financial summary — derived fields (computed, never edited) ─────
  readonly revisedContractAmount: number;         // original + approved COs
  readonly totalContractWithPending: number;      // revised + pending COs
  readonly estimatedCostAtCompletion: number;     // derived from budget lines
  readonly jobToDateActualCost: number;           // synced from ERP/actuals
  readonly committedCosts: number;                // synced from commitments
  readonly costExposureToDate: number;            // actuals + committed
  readonly currentProfit: number;                 // revisedContract - estimatedCostAtCompletion
  readonly profitMargin: number;                  // currentProfit / revisedContract (%)
  readonly projectedOverUnder: number;            // budget - estimatedCostAtCompletion
  readonly contingencyRemaining: number;          // budget - usedToDate
  readonly expectedContingencyUse: number;        // projected from current draw rate
  readonly gcgrTotalVariance: number;             // rolled up from GC/GR lines

  // ── Metadata ───────────────────────────────────────────────────────
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastEditedBy: string;
}

/**
 * Forecast Summary field editability contract (T04 §5.1).
 *
 * Separates PM-editable fields from derived/computed fields.
 * Repository implementations must enforce: editable fields writable only
 * on Working version; derived fields recomputed on read, never written directly.
 */
export type ForecastSummaryEditableField =
  | 'projectName'
  | 'projectNumber'
  | 'projectManager'
  | 'contractType'
  | 'clientName'
  | 'scheduledCompletionDate'
  | 'revisedCompletionDate'
  | 'percentComplete'
  | 'monthsRemaining'
  | 'originalContractAmount'
  | 'approvedChangeOrders'
  | 'pendingChangeOrders'
  | 'contingencyBudget'
  | 'contingencyUsedToDate'
  | 'forecastToComplete'
  | 'pmNarrative';

export type ForecastSummaryDerivedField =
  | 'revisedContractAmount'
  | 'totalContractWithPending'
  | 'estimatedCostAtCompletion'
  | 'jobToDateActualCost'
  | 'committedCosts'
  | 'costExposureToDate'
  | 'currentProfit'
  | 'profitMargin'
  | 'projectedOverUnder'
  | 'contingencyRemaining'
  | 'expectedContingencyUse'
  | 'gcgrTotalVariance';

/**
 * Forecast Summary validation result (T04 §5.2).
 */
export interface IForecastSummaryValidation {
  readonly isValid: boolean;
  readonly errors: readonly ForecastSummaryValidationError[];
}

export interface ForecastSummaryValidationError {
  readonly field: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

/**
 * GC/GR line item record (T04 §6).
 *
 * Version-scoped division-level cost projection.
 * Editable on Working version only; immutable after confirmation.
 */
export interface IGCGRLine {
  readonly lineId: string;
  readonly forecastVersionId: string;
  readonly projectId: string;

  // ── Division identity ──────────────────────────────────────────────
  readonly divisionCode: string;
  readonly divisionDescription: string;
  readonly category: GCGRCategory;

  // ── Budget baseline (imported, not PM-editable) ────────────────────
  readonly budgetAmount: number;

  // ── Forecast values (PM-editable on Working) ───────────────────────
  readonly forecastAmount: number;
  readonly adjustmentAmount: number;
  readonly adjustmentNotes: string;

  // ── Derived / computed fields (never edited directly) ──────────────
  readonly varianceAmount: number;          // forecastAmount - budgetAmount
  readonly variancePercent: number;         // variance / budget (%)
  readonly isOverBudget: boolean;           // varianceAmount > 0

  // ── Metadata ───────────────────────────────────────────────────────
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastEditedBy: string;
}

/**
 * GC/GR division categories (T04 §6.1).
 */
export type GCGRCategory =
  | 'GeneralConditions'
  | 'GeneralRequirements'
  | 'Other';

/**
 * GC/GR editable field contract (T04 §6.2).
 */
export type GCGREditableField =
  | 'forecastAmount'
  | 'adjustmentAmount'
  | 'adjustmentNotes';

export type GCGRDerivedField =
  | 'varianceAmount'
  | 'variancePercent'
  | 'isOverBudget';

/**
 * GC/GR summary rollup (T04 §6.3).
 * Aggregation output that feeds into IFinancialForecastSummary.gcgrTotalVariance.
 */
export interface IGCGRSummaryRollup {
  readonly totalBudget: number;
  readonly totalForecast: number;
  readonly totalVariance: number;
  readonly totalAdjustment: number;
  readonly lineCount: number;
  readonly overBudgetLineCount: number;
  readonly gcSubtotal: number;
  readonly grSubtotal: number;
}

/**
 * GC/GR line validation result (T04 §6.4).
 */
export interface IGCGRLineValidation {
  readonly isValid: boolean;
  readonly errors: readonly GCGRLineValidationError[];
}

export interface GCGRLineValidationError {
  readonly lineId: string;
  readonly field: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
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

// ── T06: Buyout Sub-Domain ────────────────────────────────────────────

/** Buyout procurement lifecycle status (T06 §8.2). */
export type BuyoutLineStatus =
  | 'NotStarted'
  | 'LoiPending'
  | 'LoiExecuted'
  | 'ContractPending'
  | 'ContractExecuted'
  | 'Complete'
  | 'Void';

/** Buyout savings disposition destination (T06 §8.5). */
export type BuyoutSavingsDestination =
  | 'AppliedToForecast'
  | 'HeldInContingency'
  | 'ReleasedToGoverned';

/** Buyout savings disposition lifecycle (T06 §8.5). */
export type BuyoutSavingsDispositionStatus =
  | 'NoSavings'
  | 'Undispositioned'
  | 'PartiallyDispositioned'
  | 'FullyDispositioned';

/** Buyout line item — procurement/commitment-control record (T06 §8.1). */
export interface IBuyoutLineItem {
  readonly buyoutLineId: string;
  readonly projectId: string;
  readonly divisionCode: string;
  readonly divisionDescription: string;
  readonly lineItemDescription: string;
  readonly subcontractorVendorName: string;
  readonly originalBudget: number;
  readonly contractAmount: number | null;
  readonly overUnder: number | null;                      // calculated when contractAmount non-null
  readonly buyoutSavingsAmount: number;                   // calculated
  readonly savingsDispositionStatus: BuyoutSavingsDispositionStatus;
  readonly loiDateToBeSent: string | null;
  readonly loiReturnedExecuted: string | null;
  readonly contractExecutedDate: string | null;
  readonly status: BuyoutLineStatus;
  readonly subcontractChecklistId: string | null;
  readonly notes: string | null;
  readonly lastEditedBy: string | null;
  readonly lastEditedAt: string | null;
}

/** Dollar-weighted buyout summary metrics (T06 §8.4). */
export interface IBuyoutSummaryMetrics {
  readonly totalBudget: number;
  readonly totalContractAmount: number;
  readonly totalOverUnder: number;
  readonly totalRealizedBuyoutSavings: number;
  readonly totalUndispositionedSavings: number;
  readonly percentBuyoutCompleteDollarWeighted: number;
  readonly linesNotStarted: number;
  readonly linesInProgress: number;
  readonly linesComplete: number;
  readonly linesVoid: number;
  readonly totalLinesActive: number;
}

/** Buyout savings disposition record (T06 §8.5). */
export interface IBuyoutSavingsDisposition {
  readonly dispositionId: string;
  readonly buyoutLineId: string;
  readonly projectId: string;
  readonly totalSavingsAmount: number;
  readonly dispositionedAmount: number;
  readonly undispositionedAmount: number;
  readonly dispositionItems: readonly IBuyoutSavingsDispositionItem[];
  readonly createdAt: string;
  readonly lastUpdatedAt: string;
}

/** Individual savings disposition action (T06 §8.5). */
export interface IBuyoutSavingsDispositionItem {
  readonly itemId: string;
  readonly destination: BuyoutSavingsDestination;
  readonly amount: number;
  readonly dispositionedBy: string;
  readonly dispositionedAt: string;
  readonly notes: string | null;
  readonly linkedForecastVersionId: string | null;
}

/** ContractExecuted gate validation result (T06 §8.3). */
export interface IContractExecutedGateResult {
  readonly canTransition: boolean;
  readonly blockers: readonly string[];
}

/** Buyout-to-budget reconciliation result (T06 §8.7). */
export interface IBuyoutReconciliationResult {
  readonly variance: number;
  readonly variancePercent: number;
  readonly withinTolerance: boolean;
}

// ── T07: Business Rules and Calculations ──────────────────────────────

/**
 * Sign convention direction (T07 §9).
 * budget-minus-cost: positive = favorable (used for budget line projectedOverUnder, profit).
 * cost-minus-budget: positive = unfavorable (used for GC/GR variance, buyout overUnder).
 */
export type SignConventionDirection = 'budget-minus-cost' | 'cost-minus-budget';

/** Financial alert severity (T07 §9.4, §10.2). */
export type FinancialAlertSeverity = 'none' | 'warning' | 'critical';

/** Financial domain identifiers for sign convention lookup. */
export type FinancialDomain = 'budgetLine' | 'gcgr' | 'buyout' | 'profit' | 'cashFlow';

/** Sign convention rule for a financial domain (T07 §9.1–§9.5). */
export interface ISignConventionRule {
  readonly domain: FinancialDomain;
  readonly direction: SignConventionDirection;
  readonly positiveInterpretation: string;
  readonly negativeInterpretation: string;
  readonly positiveColor: 'green' | 'red';
  readonly negativeColor: 'green' | 'red';
}

/** Financial alert for threshold-based warnings (T07 §10.2, §9.4). */
export interface IFinancialAlert {
  readonly field: string;
  readonly severity: FinancialAlertSeverity;
  readonly message: string;
}

/** FTC validation result (T07 §10.2). */
export interface IForecastToCompleteValidation {
  readonly isValid: boolean;
  readonly alerts: readonly IFinancialAlert[];
}

/** Profit margin assessment (T07 §9.4, §10.3). */
export interface IProfitMarginAssessment {
  readonly currentProfit: number;
  readonly profitMargin: number;
  readonly severity: FinancialAlertSeverity;
  readonly alert: IFinancialAlert | null;
}

/** GC/GR variance result (T07 §10.4). */
export interface IGCGRVarianceResult {
  readonly gcVariance: number;
  readonly grVariance: number;
  readonly totalVariance: number;
}

/** Forecast summary calculations result (T07 §10.3). */
export interface IForecastSummaryCalculations {
  readonly revisedContractCompletion: number;
  readonly estimatedCostAtCompletion: number;
  readonly currentProfit: number;
  readonly profitMargin: number;
  readonly expectedContingencyUse: number;
}

// ── Publication / Export Contracts (B-FIN-03 closure) ─────────────────

/**
 * Publication eligibility evaluation result.
 *
 * Determines whether a version can be promoted to PublishedMonthly.
 * Must be evaluated at the service layer, not UI-only.
 */
export interface IPublicationEligibilityResult {
  readonly isEligible: boolean;
  readonly forecastVersionId: string;
  readonly versionNumber: number;
  readonly versionState: FinancialVersionState;
  readonly isReportCandidate: boolean;
  readonly blockers: readonly PublicationBlocker[];
}

export interface PublicationBlocker {
  readonly code: PublicationBlockerCode;
  readonly message: string;
}

export type PublicationBlockerCode =
  | 'not-confirmed'
  | 'not-report-candidate'
  | 'period-closed'
  | 'already-published'
  | 'review-not-approved';

/**
 * Publication record — immutable artifact created when a version is
 * promoted to PublishedMonthly via P3-F1 handoff.
 *
 * At most one PublishedMonthly per project per reporting period.
 * Prior PublishedMonthly for the same period becomes Superseded.
 */
export interface IFinancialPublicationRecord {
  readonly publicationId: string;
  readonly projectId: string;
  readonly forecastVersionId: string;
  readonly versionNumber: number;
  readonly reportingPeriod: string;
  readonly publishedAt: string;
  readonly publishedBy: string;
  readonly status: PublicationRecordStatus;
  readonly supersededAt: string | null;
  readonly supersededByPublicationId: string | null;
  readonly handoffResult: IPublicationHandoffResult | null;
}

export type PublicationRecordStatus = 'Published' | 'Superseded';

/**
 * P3-F1 publication handoff result.
 *
 * Records the outcome of the downstream handoff to the Reports module.
 */
export interface IPublicationHandoffResult {
  readonly handoffId: string;
  readonly triggeredAt: string;
  readonly targetSystem: string;
  readonly status: PublicationHandoffStatus;
  readonly errorMessage: string | null;
  readonly completedAt: string | null;
}

export type PublicationHandoffStatus = 'Pending' | 'InProgress' | 'Complete' | 'Failed';

/**
 * Export run record — append-only artifact for cutover/retirement evidence.
 *
 * Each export run produces one or more artifacts (CSV, PDF, snapshot).
 */
export interface IFinancialExportRun {
  readonly exportRunId: string;
  readonly projectId: string;
  readonly forecastVersionId: string;
  readonly versionNumber: number;
  readonly reportingPeriod: string;
  readonly exportType: FinancialExportType;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly status: ExportRunStatus;
  readonly artifactCount: number;
  readonly artifacts: readonly IExportArtifact[];
  readonly errorMessage: string | null;
  readonly completedAt: string | null;
}

export type FinancialExportType =
  | 'BudgetCSV'
  | 'GCGRCsv'
  | 'CashFlowCSV'
  | 'BuyoutCSV'
  | 'ForecastSummaryPDF'
  | 'ForecastSummarySnapshot';

export type ExportRunStatus = 'InProgress' | 'Complete' | 'Failed';

/**
 * Export artifact metadata.
 */
export interface IExportArtifact {
  readonly artifactId: string;
  readonly exportRunId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly createdAt: string;
  readonly downloadUrl: string | null;
}

/**
 * Publication history query result — for the publication/history surface.
 */
export interface IPublicationHistoryEntry {
  readonly publicationId: string;
  readonly versionNumber: number;
  readonly reportingPeriod: string;
  readonly publishedAt: string;
  readonly publishedBy: string;
  readonly status: PublicationRecordStatus;
  readonly exportRuns: readonly IFinancialExportRun[];
}

/**
 * Publication failure/recovery posture.
 *
 * When a publication or export fails, this contract describes the
 * sanctioned recovery path.
 */
export interface IPublicationRecoveryPosture {
  readonly failedOperation: 'publication-handoff' | 'export-run';
  readonly failureReason: string;
  readonly canRetry: boolean;
  readonly retryDescription: string;
  readonly requiresNewDesignation: boolean;
}

// ── T08: Platform Integration and Annotation Scope ────────────────────

/** Activity spine event types for the Financial module (T08 §14.1). */
export type FinancialActivityEventType =
  | 'BudgetImported'
  | 'ForecastVersionConfirmed'
  | 'ForecastVersionDerived'
  | 'ReportCandidateDesignated'
  | 'ForecastVersionPublished'
  | 'GCGRUpdated'
  | 'BuyoutLineExecuted'
  | 'BuyoutSavingsDispositioned'
  | 'CashFlowProjectionUpdated'
  | 'ReconciliationConditionResolved';

/** Activity spine event record (T08 §14.1). */
export interface IFinancialActivityEvent {
  readonly eventType: FinancialActivityEventType;
  readonly projectId: string;
  readonly timestamp: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

/** Health spine metric keys for the Financial module (T08 §14.2). */
export type FinancialHealthMetricKey =
  | 'projectedOverUnder'
  | 'profitMargin'
  | 'estimatedCostAtCompletion'
  | 'totalCostExposureToDate'
  | 'percentBuyoutCompleteDollarWeighted'
  | 'totalRealizedBuyoutSavings'
  | 'totalUndispositionedSavings'
  | 'peakCashRequirement'
  | 'cashFlowAtRisk'
  | 'buyoutToCommittedCostsReconciliation';

/** Health spine metric record (T08 §14.2). */
export interface IFinancialHealthMetric {
  readonly key: FinancialHealthMetricKey;
  readonly value: number;
  readonly unit: 'usd' | 'percent';
  readonly updatedAt: string;
  readonly updatedOn: string;
}

/** Work queue item types for the Financial module (T08 §14.3). */
export type FinancialWorkQueueItemType =
  | 'BudgetReconciliationRequired'
  | 'ForecastChecklistIncomplete'
  | 'BudgetLineOverbudget'
  | 'NegativeProfitForecast'
  | 'CashFlowDeficit'
  | 'BuyoutOverbudget'
  | 'UndispositionedBuyoutSavings'
  | 'BuyoutComplianceGateBlocked';

/** Work queue item record (T08 §14.3). */
export interface IFinancialWorkQueueItem {
  readonly itemType: FinancialWorkQueueItemType;
  readonly projectId: string;
  readonly assignedTo: string;
  readonly message: string;
  readonly context: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

/** Annotation anchor type discriminator (T08 §15.4). */
export type FinancialAnnotationAnchorType = 'field' | 'section' | 'block';

/** Version-aware annotation anchor for executive review (T08 §15.4). */
export interface IFinancialAnnotationAnchor {
  readonly forecastVersionId: string;
  readonly anchorType: FinancialAnnotationAnchorType;
  readonly canonicalBudgetLineId?: string;
  readonly fieldKey?: string;
  readonly sectionKey?: string;
  readonly blockKey?: string;
}

/** PM disposition status for carried-forward annotations (T08 §15.5). */
export type PMAnnotationDispositionStatus =
  | 'Pending'
  | 'Addressed'
  | 'StillApplicable'
  | 'NeedsReviewerAttention';

/** Carried-forward annotation record on version derivation (T08 §15.5). */
export interface ICarriedForwardAnnotation {
  readonly newAnnotationId: string;
  readonly sourceAnnotationId: string;
  readonly sourceForecastVersionId: string;
  readonly targetForecastVersionId: string;
  readonly inheritanceStatus: 'Inherited';
  readonly pmDispositionStatus: PMAnnotationDispositionStatus;
  readonly valueChangedFlag: boolean;
}
