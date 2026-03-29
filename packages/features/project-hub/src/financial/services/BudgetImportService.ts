/**
 * BudgetImportService — domain service for Budget Import operations.
 *
 * Composes the Financial repository facade methods for Budget Import
 * into domain-level operations: create session, parse CSV, normalize
 * rows, validate, resolve identity, persist reconciliation state.
 *
 * Wave 3C.1: third repository-backed Financial domain service.
 * Source shape informed by Procore_Budget.csv column structure;
 * governed by BIP-01 through BIP-05 contracts.
 */

import type {
  IFinancialRepository,
  IFinancialBudgetLinePort,
  IFinancialReconciliationConditionPort,
  IFinancialModulePosture,
  FinancialOperationResult,
} from '@hbc/data-access';
import type { IdentityResolutionOutcome } from '../types/index.js';

// ── Service types ──────────────────────────────────────────────────────

/**
 * Procore Budget CSV column mapping (informed by Procore_Budget.csv).
 *
 * Columns: Sub Job, Cost Code Tier 1-3, Cost Type, Budget Code,
 * Budget Code Description, Original Budget Amount, Budget Modifications,
 * Approved COs, Revised Budget, Pending Budget Changes, Projected Budget,
 * Committed Costs, Direct Costs, Job to Date Costs, Pending Cost Changes,
 * Projected Costs, Forecast To Complete, Estimated Cost at Completion,
 * Projected over Under
 */
export interface ProcreBudgetCsvRow {
  readonly subJob: string;
  readonly costCodeTier1: string;
  readonly costCodeTier2: string;
  readonly costCodeTier3: string;
  readonly costType: string;
  readonly budgetCode: string;
  readonly budgetCodeDescription: string;
  readonly originalBudgetAmount: number;
  readonly budgetModifications: number;
  readonly approvedCOs: number;
  readonly revisedBudget: number;
  readonly committedCosts: number;
  readonly jobToDateCosts: number;
  readonly forecastToComplete: number;
  readonly estimatedCostAtCompletion: number;
  readonly projectedOverUnder: number;
}

export interface ImportSession {
  readonly sessionId: string;
  readonly projectId: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly status: ImportSessionStatus;
  readonly sourceFileName: string;
  readonly totalRows: number;
  readonly processedRows: number;
  readonly matchedCount: number;
  readonly newCount: number;
  readonly ambiguousCount: number;
  readonly errorCount: number;
}

export type ImportSessionStatus = 'parsing' | 'validating' | 'resolving' | 'ready' | 'executed' | 'failed';

export interface ImportValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ImportValidationError[];
  readonly warnings: readonly ImportValidationWarning[];
}

export interface ImportValidationError {
  readonly row: number;
  readonly field: string;
  readonly message: string;
}

export interface ImportValidationWarning {
  readonly row: number;
  readonly field: string;
  readonly message: string;
}

export interface ImportRowOutcome {
  readonly rowIndex: number;
  readonly budgetCode: string;
  readonly costType: string;
  readonly resolution: IdentityResolutionOutcome;
  readonly canonicalBudgetLineId: string | null;
  readonly reconciliationConditionId: string | null;
}

export interface BudgetImportLoadResult {
  readonly lines: readonly IFinancialBudgetLinePort[];
  readonly reconciliationConditions: readonly IFinancialReconciliationConditionPort[];
  readonly posture: IFinancialModulePosture;
  readonly staleBudgetLineCount: number;
  readonly pendingConditionCount: number;
  readonly isImportBlocked: boolean;
  readonly blockReason: string | null;
}

// ── CSV Parser ─────────────────────────────────────────────────────────

/**
 * Parse a Procore Budget CSV string into structured rows.
 * Informed by Procore_Budget.csv column structure.
 */
export function parseProcoreBudgetCsv(csvContent: string): ProcreBudgetCsvRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header row
  return lines.slice(1).map((line) => {
    const cols = parseCSVLine(line);
    return {
      subJob: cols[0] ?? '',
      costCodeTier1: cols[1] ?? '',
      costCodeTier2: cols[2] ?? '',
      costCodeTier3: cols[3] ?? '',
      costType: cols[4] ?? '',
      budgetCode: cols[5] ?? '',
      budgetCodeDescription: cols[6] ?? '',
      originalBudgetAmount: parseFloat(cols[7] ?? '0') || 0,
      budgetModifications: parseFloat(cols[8] ?? '0') || 0,
      approvedCOs: parseFloat(cols[9] ?? '0') || 0,
      revisedBudget: parseFloat(cols[10] ?? '0') || 0,
      committedCosts: parseFloat(cols[12] ?? '0') || 0,
      jobToDateCosts: parseFloat(cols[15] ?? '0') || 0,
      forecastToComplete: parseFloat(cols[18] ?? '0') || 0,
      estimatedCostAtCompletion: parseFloat(cols[19] ?? '0') || 0,
      projectedOverUnder: parseFloat(cols[20] ?? '0') || 0,
    };
  }).filter((row) => row.budgetCode.trim() !== ''); // Skip empty/summary rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
    current += char;
  }
  result.push(current.trim());
  return result;
}

/**
 * Validate parsed CSV rows against governed import rules.
 */
export function validateImportRows(rows: readonly ProcreBudgetCsvRow[]): ImportValidationResult {
  const errors: ImportValidationError[] = [];
  const warnings: ImportValidationWarning[] = [];

  rows.forEach((row, i) => {
    if (!row.budgetCode) errors.push({ row: i, field: 'budgetCode', message: 'Budget code is required' });
    if (!row.costType) errors.push({ row: i, field: 'costType', message: 'Cost type is required' });
    if (row.originalBudgetAmount < 0) warnings.push({ row: i, field: 'originalBudgetAmount', message: 'Negative budget amount' });
  });

  return { isValid: errors.length === 0, errors, warnings };
}

// ── Service ────────────────────────────────────────────────────────────

export class BudgetImportService {
  constructor(private readonly repo: IFinancialRepository) {}

  /**
   * Load the current budget state for a project — lines, reconciliation
   * conditions, and import posture.
   */
  async load(projectId: string, reportingPeriod: string): Promise<BudgetImportLoadResult> {
    const [posture, version] = await Promise.all([
      this.repo.getModulePosture(projectId, reportingPeriod),
      this.repo.getCurrentWorkingVersion(projectId),
    ]);

    const versionId = version?.forecastVersionId ?? posture.currentVersionId;
    const [lines, conditions] = await Promise.all([
      versionId ? this.repo.getBudgetLines(versionId) : Promise.resolve([]),
      versionId ? this.repo.getReconciliationConditions(versionId) : Promise.resolve([]),
    ]);

    const pendingConditions = conditions.filter((c) => c.status === 'Pending');
    const isImportBlocked = posture.currentVersionState !== 'Working';

    return {
      lines,
      reconciliationConditions: conditions,
      posture,
      staleBudgetLineCount: posture.staleBudgetLineCount,
      pendingConditionCount: pendingConditions.length,
      isImportBlocked,
      blockReason: isImportBlocked ? 'Import requires a Working version' : null,
    };
  }

  /**
   * Resolve a reconciliation condition (ambiguous import match).
   */
  async resolveCondition(
    conditionId: string,
    resolution: 'MergedInto' | 'CreatedNew',
    resolvedBy: string,
  ): Promise<FinancialOperationResult<IFinancialReconciliationConditionPort>> {
    return this.repo.resolveReconciliationCondition(conditionId, resolution, resolvedBy);
  }

  /**
   * Update a budget line's forecast-to-complete value.
   */
  async updateFTC(
    forecastVersionId: string,
    budgetLineId: string,
    forecastToComplete: number,
    editedBy: string,
  ): Promise<FinancialOperationResult<IFinancialBudgetLinePort>> {
    return this.repo.updateBudgetLineFTC(forecastVersionId, budgetLineId, forecastToComplete, editedBy);
  }

  /**
   * Get the count of pending reconciliation conditions.
   */
  getPendingConditionCount(conditions: readonly IFinancialReconciliationConditionPort[]): number {
    return conditions.filter((c) => c.status === 'Pending').length;
  }
}
