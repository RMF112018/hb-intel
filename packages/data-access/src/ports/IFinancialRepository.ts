/**
 * IFinancialRepository — canonical Financial module repository facade.
 *
 * Port interface defining the data-access contract for Financial.
 * UI hooks consume only this facade, never sub-domain repositories directly.
 *
 * Types are defined inline to avoid circular dependency with @hbc/features-project-hub.
 * The adapter implementation bridges between these port types and the domain types.
 *
 * Governing doctrine:
 * - Financial-RGC §3 (12 sub-domain repositories)
 * - Financial-SOTEC §3 (22 persistence families, ownership tiers)
 * - Financial-LMG §2 (version lifecycle), §4 (access control)
 * - Financial-ABMC §2 (role×state permissions)
 */

// ── Shared result types ────────────────────────────────────────────────

export interface FinancialOperationResult<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
}

export interface FinancialPagedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

// ── Financial version state (mirrors domain type) ──────────────────────

export type FinancialVersionStatePort =
  | 'Working'
  | 'ConfirmedInternal'
  | 'PublishedMonthly'
  | 'Superseded';

export type FinancialAuthorityRolePort = 'PM' | 'PER' | 'Leadership';

export type ReviewCustodyStatusPort =
  | 'PmCourt'
  | 'SubmittedForReview'
  | 'InReview'
  | 'ReturnedForRevision'
  | 'Approved';

export type ReportingPeriodStatusPort = 'Open' | 'Closed' | 'Reopened';

// ── Module posture ─────────────────────────────────────────────────────

export interface IFinancialModulePosture {
  readonly projectId: string;
  readonly reportingPeriod: string;
  readonly currentVersionId: string | null;
  readonly currentVersionState: FinancialVersionStatePort | null;
  readonly currentVersionNumber: number | null;
  readonly isReportCandidate: boolean;
  readonly staleBudgetLineCount: number;
  readonly checklistCompleted: number;
  readonly checklistRequired: number;
  readonly checklistTotal: number;
  readonly confirmationGateCanPass: boolean;
  readonly reviewCustodyStatus: ReviewCustodyStatusPort | null;
  readonly periodStatus: ReportingPeriodStatusPort;
  readonly hasPublishedVersion: boolean;
  readonly lastPublishedAt: string | null;
  readonly blockerCount: number;
  readonly nextAction: string | null;
  readonly nextActionOwner: string | null;
}

// ── Canonical facade ───────────────────────────────────────────────────

export interface IFinancialRepository {

  // ── Module posture ─────────────────────────────────────────────────

  /** Get the Financial module operational posture for a project + period. */
  getModulePosture(projectId: string, reportingPeriod: string): Promise<IFinancialModulePosture>;

  // ── Reporting Period ───────────────────────────────────────────────

  getReportingPeriods(projectId: string): Promise<readonly IFinancialReportingPeriodPort[]>;
  closePeriod(projectId: string, periodId: string, closedBy: string): Promise<FinancialOperationResult<IFinancialPeriodCloseResultPort>>;
  reopenPeriod(projectId: string, periodId: string, requestedBy: string, role: FinancialAuthorityRolePort, reason: string): Promise<FinancialOperationResult<IFinancialPeriodReopenResultPort>>;

  // ── Forecast Versioning ────────────────────────────────────────────

  getCurrentWorkingVersion(projectId: string): Promise<IFinancialVersionPort | null>;
  getVersionHistory(projectId: string): Promise<readonly IFinancialVersionPort[]>;
  deriveWorkingVersion(projectId: string, sourceVersionId: string, reason: string, derivedBy: string): Promise<FinancialOperationResult<IFinancialVersionPort>>;
  confirmVersion(forecastVersionId: string, confirmedBy: string): Promise<FinancialOperationResult<IFinancialVersionPort>>;
  designateReportCandidate(forecastVersionId: string): Promise<FinancialOperationResult<IFinancialReportCandidateResultPort>>;

  // ── Forecast Checklist ─────────────────────────────────────────────

  getChecklist(forecastVersionId: string): Promise<readonly IFinancialChecklistItemPort[]>;
  toggleChecklistItem(forecastVersionId: string, itemId: string, completed: boolean, completedBy: string): Promise<FinancialOperationResult<IFinancialChecklistItemPort>>;
  evaluateConfirmationGate(forecastVersionId: string): Promise<IFinancialConfirmationGateResultPort>;

  // ── Budget Import ──────────────────────────────────────────────────

  getBudgetLines(forecastVersionId: string): Promise<readonly IFinancialBudgetLinePort[]>;
  getReconciliationConditions(forecastVersionId: string): Promise<readonly IFinancialReconciliationConditionPort[]>;
  resolveReconciliationCondition(conditionId: string, resolution: 'MergedInto' | 'CreatedNew', resolvedBy: string): Promise<FinancialOperationResult<IFinancialReconciliationConditionPort>>;
  updateBudgetLineFTC(forecastVersionId: string, budgetLineId: string, forecastToComplete: number, editedBy: string): Promise<FinancialOperationResult<IFinancialBudgetLinePort>>;

  // ── Forecast Summary ───────────────────────────────────────────────

  getForecastSummary(forecastVersionId: string): Promise<IFinancialForecastSummaryPort | null>;
  updateForecastSummaryField(forecastVersionId: string, field: string, value: unknown, editedBy: string): Promise<FinancialOperationResult<IFinancialForecastSummaryPort>>;

  // ── GC/GR ──────────────────────────────────────────────────────────

  getGCGRLines(forecastVersionId: string): Promise<readonly IFinancialGCGRLinePort[]>;
  getGCGRSummaryRollup(forecastVersionId: string): Promise<IFinancialGCGRRollupPort>;
  updateGCGRLine(forecastVersionId: string, lineId: string, forecastAmount: number, adjustmentAmount: number, adjustmentNotes: string, editedBy: string): Promise<FinancialOperationResult<IFinancialGCGRLinePort>>;

  // ── Cash Flow ──────────────────────────────────────────────────────

  getCashFlowActuals(projectId: string): Promise<readonly IFinancialCashFlowRecordPort[]>;
  getCashFlowForecasts(forecastVersionId: string): Promise<readonly IFinancialCashFlowRecordPort[]>;
  getCashFlowSummary(forecastVersionId: string): Promise<IFinancialCashFlowSummaryPort | null>;
  updateCashFlowForecastMonth(forecastVersionId: string, monthKey: string, inflows: number, outflows: number, editedBy: string): Promise<FinancialOperationResult<IFinancialCashFlowRecordPort>>;

  // ── Buyout ─────────────────────────────────────────────────────────

  getBuyoutLines(projectId: string): Promise<readonly IFinancialBuyoutLinePort[]>;
  getBuyoutSummaryMetrics(projectId: string): Promise<IFinancialBuyoutMetricsPort>;
  advanceBuyoutStatus(projectId: string, lineId: string, targetStatus: string, editedBy: string): Promise<FinancialOperationResult<IFinancialBuyoutLinePort>>;

  // ── Review / PER ───────────────────────────────────────────────────

  getReviewCustodyHistory(forecastVersionId: string): Promise<readonly IFinancialCustodyRecordPort[]>;
  getCurrentCustodyStatus(forecastVersionId: string): Promise<ReviewCustodyStatusPort>;
  transitionCustody(forecastVersionId: string, targetStatus: ReviewCustodyStatusPort, actor: string, actorRole: FinancialAuthorityRolePort, reason?: string): Promise<FinancialOperationResult<IFinancialCustodyTransitionResultPort>>;

  // ── Publication / Export ────────────────────────────────────────────

  evaluatePublicationEligibility(forecastVersionId: string): Promise<IFinancialPublicationEligibilityPort>;
  getPublicationHistory(projectId: string): Promise<readonly IFinancialPublicationRecordPort[]>;
  getExportRuns(projectId: string): Promise<readonly IFinancialExportRunPort[]>;
  createExportRun(forecastVersionId: string, exportType: string, createdBy: string): Promise<FinancialOperationResult<IFinancialExportRunPort>>;

  // ── Audit / History ────────────────────────────────────────────────

  getAuditEvents(projectId: string, options?: { limit?: number; offset?: number }): Promise<FinancialPagedResult<IFinancialAuditEventPort>>;
}

// ── Port-level record shapes ───────────────────────────────────────────
// Minimal shapes sufficient for the facade contract. Adapter implementations
// map between these and the full domain types in @hbc/features-project-hub.

export interface IFinancialReportingPeriodPort {
  readonly periodId: string;
  readonly projectId: string;
  readonly reportingMonth: string;
  readonly status: ReportingPeriodStatusPort;
}

export interface IFinancialPeriodCloseResultPort {
  readonly periodId: string;
  readonly disposition: 'auto-confirmed' | 'superseded-unconfirmed';
}

export interface IFinancialPeriodReopenResultPort {
  readonly allowed: boolean;
  readonly periodId: string;
  readonly blockers: readonly string[];
}

export interface IFinancialVersionPort {
  readonly forecastVersionId: string;
  readonly projectId: string;
  readonly versionNumber: number;
  readonly versionState: FinancialVersionStatePort;
  readonly reportingMonth: string | null;
  readonly isReportCandidate: boolean;
  readonly staleBudgetLineCount: number;
}

export interface IFinancialReportCandidateResultPort {
  readonly designated: IFinancialVersionPort;
  readonly cleared: IFinancialVersionPort | null;
}

export interface IFinancialChecklistItemPort {
  readonly itemId: string;
  readonly label: string;
  readonly group: string;
  readonly required: boolean;
  readonly completed: boolean;
  readonly completedBy: string | null;
}

export interface IFinancialConfirmationGateResultPort {
  readonly canConfirm: boolean;
  readonly blockers: readonly string[];
}

export interface IFinancialBudgetLinePort {
  readonly budgetLineId: string;
  readonly canonicalBudgetLineId: string;
  readonly forecastVersionId: string;
  readonly costCode: string;
  readonly description: string;
  readonly forecastToComplete: number;
  readonly jobToDateActualCost: number;
  readonly committedCosts: number;
}

export interface IFinancialReconciliationConditionPort {
  readonly conditionId: string;
  readonly forecastVersionId: string;
  readonly status: 'Pending' | 'Resolved' | 'Dismissed';
  readonly resolution: 'MergedInto' | 'CreatedNew' | null;
}

export interface IFinancialForecastSummaryPort {
  readonly summaryId: string;
  readonly forecastVersionId: string;
  readonly originalContractAmount: number;
  readonly revisedContractAmount: number;
  readonly estimatedCostAtCompletion: number;
  readonly currentProfit: number;
  readonly profitMargin: number;
  readonly contingencyRemaining: number;
}

export interface IFinancialGCGRLinePort {
  readonly lineId: string;
  readonly divisionCode: string;
  readonly divisionDescription: string;
  readonly budgetAmount: number;
  readonly forecastAmount: number;
  readonly varianceAmount: number;
}

export interface IFinancialGCGRRollupPort {
  readonly totalBudget: number;
  readonly totalForecast: number;
  readonly totalVariance: number;
  readonly lineCount: number;
  readonly overBudgetLineCount: number;
}

export interface IFinancialCashFlowRecordPort {
  readonly monthKey: string;
  readonly inflows: number;
  readonly outflows: number;
  readonly netCashFlow: number;
}

export interface IFinancialCashFlowSummaryPort {
  readonly totalNetCashFlow: number;
  readonly peakCashRequirement: number;
  readonly cashFlowAtRisk: number;
}

export interface IFinancialBuyoutLinePort {
  readonly lineId: string;
  readonly divisionCode: string;
  readonly description: string;
  readonly budgetAmount: number;
  readonly contractAmount: number | null;
  readonly status: string;
}

export interface IFinancialBuyoutMetricsPort {
  readonly dollarWeightedCompletion: number;
  readonly totalBudget: number;
  readonly totalContracted: number;
  readonly totalSavings: number;
}

export interface IFinancialCustodyRecordPort {
  readonly custodyRecordId: string;
  readonly fromStatus: ReviewCustodyStatusPort | null;
  readonly toStatus: ReviewCustodyStatusPort;
  readonly transitionedAt: string;
  readonly transitionedBy: string;
}

export interface IFinancialCustodyTransitionResultPort {
  readonly allowed: boolean;
  readonly blockers: readonly string[];
}

export interface IFinancialPublicationEligibilityPort {
  readonly isEligible: boolean;
  readonly blockers: readonly string[];
}

export interface IFinancialPublicationRecordPort {
  readonly publicationId: string;
  readonly versionNumber: number;
  readonly reportingPeriod: string;
  readonly publishedAt: string;
  readonly status: 'Published' | 'Superseded';
}

export interface IFinancialExportRunPort {
  readonly exportRunId: string;
  readonly exportType: string;
  readonly createdAt: string;
  readonly status: 'InProgress' | 'Complete' | 'Failed';
  readonly artifactCount: number;
}

export interface IFinancialAuditEventPort {
  readonly eventId: string;
  readonly eventType: string;
  readonly category: string;
  readonly actor: string;
  readonly occurredAt: string;
  readonly summary: string;
}
