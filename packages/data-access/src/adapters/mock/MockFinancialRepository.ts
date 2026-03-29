/**
 * MockFinancialRepository — mock-backed Financial facade adapter.
 *
 * Satisfies IFinancialRepository with deterministic in-memory data
 * for development, testing, and UI scaffold rendering.
 *
 * Does NOT constitute real data access. Still mock-backed / Stage 3.
 */

import type {
  IFinancialRepository,
  IFinancialModulePosture,
  FinancialOperationResult,
  FinancialPagedResult,
  IFinancialReportingPeriodPort,
  IFinancialPeriodCloseResultPort,
  IFinancialPeriodReopenResultPort,
  IFinancialVersionPort,
  IFinancialReportCandidateResultPort,
  IFinancialChecklistItemPort,
  IFinancialConfirmationGateResultPort,
  IFinancialBudgetLinePort,
  IFinancialReconciliationConditionPort,
  IFinancialForecastSummaryPort,
  IFinancialGCGRLinePort,
  IFinancialGCGRRollupPort,
  IFinancialCashFlowRecordPort,
  IFinancialCashFlowSummaryPort,
  IFinancialBuyoutLinePort,
  IFinancialBuyoutMetricsPort,
  IFinancialCustodyRecordPort,
  IFinancialCustodyTransitionResultPort,
  IFinancialPublicationEligibilityPort,
  IFinancialPublicationRecordPort,
  IFinancialExportRunPort,
  IFinancialAuditEventPort,
  ReviewCustodyStatusPort,
  FinancialAuthorityRolePort,
  FinancialVersionStatePort,
} from '../../ports/IFinancialRepository.js';

// ── Helpers ────────────────────────────────────────────────────────────

function ok<T>(data: T): FinancialOperationResult<T> {
  return { success: true, data, error: null };
}

// ── Mock data ──────────────────────────────────────────────────────────

const MOCK_VERSION: IFinancialVersionPort = {
  forecastVersionId: 'ver-003',
  projectId: 'proj-uuid-001',
  versionNumber: 3,
  versionState: 'Working',
  reportingMonth: '2026-03',
  isReportCandidate: false,
  staleBudgetLineCount: 0,
};

const MOCK_CHECKLIST: IFinancialChecklistItemPort[] = [
  { itemId: 'chk-1', label: 'Procore budget uploaded', group: 'RequiredDocuments', required: true, completed: true, completedBy: 'John Smith' },
  { itemId: 'chk-2', label: 'Forecast summary reviewed', group: 'RequiredDocuments', required: true, completed: true, completedBy: 'John Smith' },
  { itemId: 'chk-3', label: 'GC/GR log current', group: 'RequiredDocuments', required: true, completed: false, completedBy: null },
];

const MOCK_BUDGET_LINES: IFinancialBudgetLinePort[] = [
  { budgetLineId: 'bl-001', canonicalBudgetLineId: 'cbl-001', forecastVersionId: 'ver-003', costCode: '01-10-100', description: 'Site Work', forecastToComplete: 250_000, jobToDateActualCost: 180_000, committedCosts: 45_000 },
  { budgetLineId: 'bl-002', canonicalBudgetLineId: 'cbl-002', forecastVersionId: 'ver-003', costCode: '03-20-200', description: 'Concrete', forecastToComplete: 420_000, jobToDateActualCost: 310_000, committedCosts: 85_000 },
];

const MOCK_GCGR_LINES: IFinancialGCGRLinePort[] = [
  { lineId: 'gcgr-1', divisionCode: '01', divisionDescription: 'Project Management', budgetAmount: 180_000, forecastAmount: 195_000, varianceAmount: 15_000 },
  { lineId: 'gcgr-2', divisionCode: '02', divisionDescription: 'Temporary Facilities', budgetAmount: 120_000, forecastAmount: 110_000, varianceAmount: -10_000 },
];

const MOCK_AUDIT_EVENTS: IFinancialAuditEventPort[] = [
  { eventId: 'evt-1', eventType: 'BudgetImported', category: 'import', actor: 'John Smith', occurredAt: '2026-03-05T10:30:00Z', summary: 'Budget CSV imported — 142 lines' },
  { eventId: 'evt-2', eventType: 'ForecastVersionDerived', category: 'lifecycle', actor: 'John Smith', occurredAt: '2026-03-03T09:00:00Z', summary: 'Version 3 derived from Version 2' },
];

// ── Implementation ─────────────────────────────────────────────────────

export class MockFinancialRepository implements IFinancialRepository {

  // ── Module posture ─────────────────────────────────────────────────

  async getModulePosture(projectId: string, reportingPeriod: string): Promise<IFinancialModulePosture> {
    return {
      projectId,
      reportingPeriod,
      currentVersionId: MOCK_VERSION.forecastVersionId,
      currentVersionState: MOCK_VERSION.versionState,
      currentVersionNumber: MOCK_VERSION.versionNumber,
      isReportCandidate: false,
      staleBudgetLineCount: 0,
      checklistCompleted: 2,
      checklistRequired: 15,
      checklistTotal: 19,
      confirmationGateCanPass: false,
      reviewCustodyStatus: 'PmCourt',
      periodStatus: 'Open',
      hasPublishedVersion: false,
      lastPublishedAt: null,
      blockerCount: 1,
      nextAction: 'Complete forecast checklist',
      nextActionOwner: 'Project Manager',
    };
  }

  // ── Reporting Period ───────────────────────────────────────────────

  async getReportingPeriods(projectId: string): Promise<readonly IFinancialReportingPeriodPort[]> {
    return [
      { periodId: 'per-2026-03', projectId, reportingMonth: '2026-03', status: 'Open' },
      { periodId: 'per-2026-02', projectId, reportingMonth: '2026-02', status: 'Closed' },
    ];
  }

  async closePeriod(_projectId: string, periodId: string, _closedBy: string): Promise<FinancialOperationResult<IFinancialPeriodCloseResultPort>> {
    return ok({ periodId, disposition: 'auto-confirmed' });
  }

  async reopenPeriod(_projectId: string, periodId: string, _requestedBy: string, _role: FinancialAuthorityRolePort, _reason: string): Promise<FinancialOperationResult<IFinancialPeriodReopenResultPort>> {
    return ok({ allowed: false, periodId, blockers: ['Reopen requires PE approval'] });
  }

  // ── Forecast Versioning ────────────────────────────────────────────

  async getCurrentWorkingVersion(_projectId: string): Promise<IFinancialVersionPort | null> {
    return MOCK_VERSION;
  }

  async getVersionHistory(_projectId: string): Promise<readonly IFinancialVersionPort[]> {
    return [
      MOCK_VERSION,
      { ...MOCK_VERSION, forecastVersionId: 'ver-002', versionNumber: 2, versionState: 'PublishedMonthly' as FinancialVersionStatePort, reportingMonth: '2026-02', isReportCandidate: false },
    ];
  }

  async deriveWorkingVersion(_projectId: string, _sourceVersionId: string, _reason: string, _derivedBy: string): Promise<FinancialOperationResult<IFinancialVersionPort>> {
    return ok({ ...MOCK_VERSION, forecastVersionId: 'ver-004', versionNumber: 4 });
  }

  async confirmVersion(_forecastVersionId: string, _confirmedBy: string): Promise<FinancialOperationResult<IFinancialVersionPort>> {
    return ok({ ...MOCK_VERSION, versionState: 'ConfirmedInternal' as FinancialVersionStatePort });
  }

  async designateReportCandidate(_forecastVersionId: string): Promise<FinancialOperationResult<IFinancialReportCandidateResultPort>> {
    return ok({ designated: { ...MOCK_VERSION, isReportCandidate: true }, cleared: null });
  }

  // ── Forecast Checklist ─────────────────────────────────────────────

  async getChecklist(_forecastVersionId: string): Promise<readonly IFinancialChecklistItemPort[]> {
    return MOCK_CHECKLIST;
  }

  async toggleChecklistItem(_forecastVersionId: string, itemId: string, completed: boolean, completedBy: string): Promise<FinancialOperationResult<IFinancialChecklistItemPort>> {
    const item = MOCK_CHECKLIST.find((i) => i.itemId === itemId);
    if (!item) return { success: false, data: null, error: 'Item not found' };
    return ok({ ...item, completed, completedBy: completed ? completedBy : null });
  }

  async evaluateConfirmationGate(_forecastVersionId: string): Promise<IFinancialConfirmationGateResultPort> {
    return { canConfirm: false, blockers: ['1 required checklist item incomplete'] };
  }

  // ── Budget Import ──────────────────────────────────────────────────

  async getBudgetLines(_forecastVersionId: string): Promise<readonly IFinancialBudgetLinePort[]> {
    return MOCK_BUDGET_LINES;
  }

  async getReconciliationConditions(_forecastVersionId: string): Promise<readonly IFinancialReconciliationConditionPort[]> {
    return [];
  }

  async resolveReconciliationCondition(conditionId: string, resolution: 'MergedInto' | 'CreatedNew', _resolvedBy: string): Promise<FinancialOperationResult<IFinancialReconciliationConditionPort>> {
    return ok({ conditionId, forecastVersionId: 'ver-003', status: 'Resolved', resolution });
  }

  async updateBudgetLineFTC(_forecastVersionId: string, budgetLineId: string, forecastToComplete: number, _editedBy: string): Promise<FinancialOperationResult<IFinancialBudgetLinePort>> {
    const line = MOCK_BUDGET_LINES.find((l) => l.budgetLineId === budgetLineId);
    if (!line) return { success: false, data: null, error: 'Line not found' };
    return ok({ ...line, forecastToComplete });
  }

  // ── Forecast Summary ───────────────────────────────────────────────

  async getForecastSummary(_forecastVersionId: string): Promise<IFinancialForecastSummaryPort | null> {
    return {
      summaryId: 'sum-001',
      forecastVersionId: 'ver-003',
      originalContractAmount: 50_000_000,
      revisedContractAmount: 52_500_000,
      estimatedCostAtCompletion: 49_800_000,
      currentProfit: 2_700_000,
      profitMargin: 5.14,
      contingencyRemaining: 2_200_000,
    };
  }

  async updateForecastSummaryField(_forecastVersionId: string, _field: string, _value: unknown, _editedBy: string): Promise<FinancialOperationResult<IFinancialForecastSummaryPort>> {
    return ok(await this.getForecastSummary(_forecastVersionId) as IFinancialForecastSummaryPort);
  }

  // ── GC/GR ──────────────────────────────────────────────────────────

  async getGCGRLines(_forecastVersionId: string): Promise<readonly IFinancialGCGRLinePort[]> {
    return MOCK_GCGR_LINES;
  }

  async getGCGRSummaryRollup(_forecastVersionId: string): Promise<IFinancialGCGRRollupPort> {
    return { totalBudget: 300_000, totalForecast: 305_000, totalVariance: 5_000, lineCount: 2, overBudgetLineCount: 1 };
  }

  async updateGCGRLine(_forecastVersionId: string, lineId: string, forecastAmount: number, _adjustmentAmount: number, _adjustmentNotes: string, _editedBy: string): Promise<FinancialOperationResult<IFinancialGCGRLinePort>> {
    const line = MOCK_GCGR_LINES.find((l) => l.lineId === lineId);
    if (!line) return { success: false, data: null, error: 'Line not found' };
    return ok({ ...line, forecastAmount, varianceAmount: forecastAmount - line.budgetAmount });
  }

  // ── Cash Flow ──────────────────────────────────────────────────────

  async getCashFlowActuals(_projectId: string): Promise<readonly IFinancialCashFlowRecordPort[]> {
    return [
      { monthKey: '2026-01', inflows: 3_200_000, outflows: 2_800_000, netCashFlow: 400_000 },
      { monthKey: '2026-02', inflows: 3_500_000, outflows: 3_100_000, netCashFlow: 400_000 },
    ];
  }

  async getCashFlowForecasts(_forecastVersionId: string): Promise<readonly IFinancialCashFlowRecordPort[]> {
    return [
      { monthKey: '2026-03', inflows: 3_000_000, outflows: 3_200_000, netCashFlow: -200_000 },
      { monthKey: '2026-04', inflows: 3_400_000, outflows: 3_000_000, netCashFlow: 400_000 },
    ];
  }

  async getCashFlowSummary(_forecastVersionId: string): Promise<IFinancialCashFlowSummaryPort | null> {
    return { totalNetCashFlow: 1_000_000, peakCashRequirement: 3_200_000, cashFlowAtRisk: 200_000 };
  }

  async updateCashFlowForecastMonth(_forecastVersionId: string, monthKey: string, inflows: number, outflows: number, _editedBy: string): Promise<FinancialOperationResult<IFinancialCashFlowRecordPort>> {
    return ok({ monthKey, inflows, outflows, netCashFlow: inflows - outflows });
  }

  // ── Buyout ─────────────────────────────────────────────────────────

  async getBuyoutLines(_projectId: string): Promise<readonly IFinancialBuyoutLinePort[]> {
    return [
      { lineId: 'buy-1', divisionCode: '09', description: 'Drywall / Finishes', budgetAmount: 850_000, contractAmount: 780_000, status: 'ContractExecuted' },
      { lineId: 'buy-2', divisionCode: '15', description: 'Mechanical', budgetAmount: 1_200_000, contractAmount: null, status: 'LoiPending' },
    ];
  }

  async getBuyoutSummaryMetrics(_projectId: string): Promise<IFinancialBuyoutMetricsPort> {
    return { dollarWeightedCompletion: 42, totalBudget: 2_050_000, totalContracted: 780_000, totalSavings: 70_000 };
  }

  async advanceBuyoutStatus(_projectId: string, lineId: string, targetStatus: string, _editedBy: string): Promise<FinancialOperationResult<IFinancialBuyoutLinePort>> {
    return ok({ lineId, divisionCode: '09', description: 'Drywall / Finishes', budgetAmount: 850_000, contractAmount: 780_000, status: targetStatus });
  }

  // ── Review / PER ───────────────────────────────────────────────────

  async getReviewCustodyHistory(_forecastVersionId: string): Promise<readonly IFinancialCustodyRecordPort[]> {
    return [];
  }

  async getCurrentCustodyStatus(_forecastVersionId: string): Promise<ReviewCustodyStatusPort> {
    return 'PmCourt';
  }

  async transitionCustody(_forecastVersionId: string, _targetStatus: ReviewCustodyStatusPort, _actor: string, _actorRole: FinancialAuthorityRolePort, _reason?: string): Promise<FinancialOperationResult<IFinancialCustodyTransitionResultPort>> {
    return ok({ allowed: true, blockers: [] });
  }

  // ── Publication / Export ────────────────────────────────────────────

  async evaluatePublicationEligibility(_forecastVersionId: string): Promise<IFinancialPublicationEligibilityPort> {
    return { isEligible: false, blockers: ['No report candidate designated'] };
  }

  async getPublicationHistory(_projectId: string): Promise<readonly IFinancialPublicationRecordPort[]> {
    return [
      { publicationId: 'pub-1', versionNumber: 2, reportingPeriod: '2026-02', publishedAt: '2026-02-28T18:00:00Z', status: 'Published' },
    ];
  }

  async getExportRuns(_projectId: string): Promise<readonly IFinancialExportRunPort[]> {
    return [
      { exportRunId: 'exp-1', exportType: 'BudgetCSV', createdAt: '2026-02-28T18:05:00Z', status: 'Complete', artifactCount: 1 },
    ];
  }

  async createExportRun(_forecastVersionId: string, exportType: string, _createdBy: string): Promise<FinancialOperationResult<IFinancialExportRunPort>> {
    return ok({ exportRunId: 'exp-new', exportType, createdAt: new Date().toISOString(), status: 'Complete', artifactCount: 1 });
  }

  // ── Audit / History ────────────────────────────────────────────────

  async getAuditEvents(_projectId: string, options?: { limit?: number; offset?: number }): Promise<FinancialPagedResult<IFinancialAuditEventPort>> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const items = MOCK_AUDIT_EVENTS.slice(offset, offset + limit);
    return { items, total: MOCK_AUDIT_EVENTS.length, page: Math.floor(offset / limit) + 1, pageSize: limit };
  }
}
