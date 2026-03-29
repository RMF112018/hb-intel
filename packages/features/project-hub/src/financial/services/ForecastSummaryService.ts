/**
 * ForecastSummaryService — domain service for Forecast Summary operations.
 *
 * Composes the Financial repository facade methods for Forecast Summary
 * into domain-level operations: load, edit, validate, compute posture.
 *
 * Wave 3A.1: first repository-backed Financial domain service.
 * Field grouping informed by Financial Forecast Summary & Checklist.xlsx
 * worksheet structure; governed by T04 contracts.
 */

import type { IFinancialRepository, IFinancialForecastSummaryPort, IFinancialModulePosture, FinancialOperationResult } from '@hbc/data-access';
import type { ForecastSummaryEditableField } from '../types/index.js';
import {
  computeRevisedContractAmount,
  computeTotalContractWithPending,
  computeForecastSummaryProfit,
  computeForecastSummaryProfitMargin,
  computeContingencyRemaining,
} from '../computors/index.js';

// ── Service types ──────────────────────────────────────────────────────

export interface ForecastSummaryLoadResult {
  readonly summary: IFinancialForecastSummaryPort | null;
  readonly posture: IFinancialModulePosture;
  readonly isEditable: boolean;
  readonly isStale: boolean;
  readonly blockers: readonly string[];
}

export interface ForecastSummaryEditResult {
  readonly success: boolean;
  readonly summary: IFinancialForecastSummaryPort | null;
  readonly error: string | null;
  readonly recomputedFields: readonly string[];
}

/**
 * Worksheet-aligned field groups (informed by Financial Forecast Summary
 * & Checklist.xlsx section structure).
 *
 * - Project Info: project metadata fields
 * - Schedule: completion dates, percent complete
 * - Contract: original, revised, pending amounts
 * - Cost: actual, committed, exposure, forecast-to-complete
 * - Profit: current profit, margin, projected over/under
 * - Contingency: budget, used, remaining, expected use
 * - GC/GR: rolled-up variance from GC/GR tool
 * - Narrative: PM commentary
 */
export type ForecastSummaryFieldGroup =
  | 'project-info'
  | 'schedule'
  | 'contract'
  | 'cost'
  | 'profit'
  | 'contingency'
  | 'gcgr'
  | 'narrative';

export interface ForecastSummaryFieldDescriptor {
  readonly field: string;
  readonly group: ForecastSummaryFieldGroup;
  readonly label: string;
  readonly editable: boolean;
  readonly type: 'currency' | 'percentage' | 'number' | 'date' | 'text';
}

/**
 * Field registry — maps each IFinancialForecastSummary field to its group,
 * editability, and display type. Informed by worksheet section layout.
 */
export const FORECAST_SUMMARY_FIELD_REGISTRY: readonly ForecastSummaryFieldDescriptor[] = [
  // Project Info
  { field: 'projectName', group: 'project-info', label: 'Project Name', editable: true, type: 'text' },
  { field: 'projectNumber', group: 'project-info', label: 'Project Number', editable: true, type: 'text' },
  { field: 'projectManager', group: 'project-info', label: 'Project Manager', editable: true, type: 'text' },
  { field: 'contractType', group: 'project-info', label: 'Contract Type', editable: true, type: 'text' },
  { field: 'clientName', group: 'project-info', label: 'Client', editable: true, type: 'text' },
  // Schedule
  { field: 'scheduledCompletionDate', group: 'schedule', label: 'Scheduled Completion', editable: true, type: 'date' },
  { field: 'revisedCompletionDate', group: 'schedule', label: 'Revised Completion', editable: true, type: 'date' },
  { field: 'percentComplete', group: 'schedule', label: 'Percent Complete', editable: true, type: 'percentage' },
  { field: 'monthsRemaining', group: 'schedule', label: 'Months Remaining', editable: true, type: 'number' },
  // Contract
  { field: 'originalContractAmount', group: 'contract', label: 'Original Contract', editable: true, type: 'currency' },
  { field: 'approvedChangeOrders', group: 'contract', label: 'Approved Change Orders', editable: true, type: 'currency' },
  { field: 'pendingChangeOrders', group: 'contract', label: 'Pending Change Orders', editable: true, type: 'currency' },
  { field: 'revisedContractAmount', group: 'contract', label: 'Revised Contract Amount', editable: false, type: 'currency' },
  { field: 'totalContractWithPending', group: 'contract', label: 'Total with Pending', editable: false, type: 'currency' },
  // Cost
  { field: 'jobToDateActualCost', group: 'cost', label: 'Job-to-Date Actual Cost', editable: false, type: 'currency' },
  { field: 'committedCosts', group: 'cost', label: 'Committed Costs', editable: false, type: 'currency' },
  { field: 'costExposureToDate', group: 'cost', label: 'Cost Exposure to Date', editable: false, type: 'currency' },
  { field: 'forecastToComplete', group: 'cost', label: 'Forecast to Complete', editable: true, type: 'currency' },
  { field: 'estimatedCostAtCompletion', group: 'cost', label: 'Estimated Cost at Completion', editable: false, type: 'currency' },
  // Profit
  { field: 'currentProfit', group: 'profit', label: 'Current Profit', editable: false, type: 'currency' },
  { field: 'profitMargin', group: 'profit', label: 'Profit Margin', editable: false, type: 'percentage' },
  { field: 'projectedOverUnder', group: 'profit', label: 'Projected Over/Under', editable: false, type: 'currency' },
  // Contingency
  { field: 'contingencyBudget', group: 'contingency', label: 'Contingency Budget', editable: true, type: 'currency' },
  { field: 'contingencyUsedToDate', group: 'contingency', label: 'Contingency Used', editable: true, type: 'currency' },
  { field: 'contingencyRemaining', group: 'contingency', label: 'Contingency Remaining', editable: false, type: 'currency' },
  { field: 'expectedContingencyUse', group: 'contingency', label: 'Expected Use', editable: false, type: 'currency' },
  // GC/GR
  { field: 'gcgrTotalVariance', group: 'gcgr', label: 'GC/GR Total Variance', editable: false, type: 'currency' },
  // Narrative
  { field: 'pmNarrative', group: 'narrative', label: 'PM Narrative', editable: true, type: 'text' },
];

// ── Service ────────────────────────────────────────────────────────────

export class ForecastSummaryService {
  constructor(private readonly repo: IFinancialRepository) {}

  /**
   * Load the active Forecast Summary for a project + reporting period.
   * Returns the summary, module posture, editability, and blockers.
   */
  async load(projectId: string, reportingPeriod: string): Promise<ForecastSummaryLoadResult> {
    const [posture, version] = await Promise.all([
      this.repo.getModulePosture(projectId, reportingPeriod),
      this.repo.getCurrentWorkingVersion(projectId),
    ]);

    const versionId = version?.forecastVersionId ?? posture.currentVersionId;
    const summary = versionId ? await this.repo.getForecastSummary(versionId) : null;

    const isEditable = posture.currentVersionState === 'Working';
    const isStale = posture.staleBudgetLineCount > 0;
    const blockers: string[] = [];
    if (isStale) blockers.push(`${posture.staleBudgetLineCount} unresolved reconciliation conditions`);
    if (!posture.confirmationGateCanPass && isEditable) blockers.push('Confirmation gate not yet passable');

    return { summary, posture, isEditable, isStale, blockers };
  }

  /**
   * Edit a single field on the Working version's Forecast Summary.
   * Recomputes affected derived fields locally and persists via facade.
   */
  async editField(
    forecastVersionId: string,
    field: ForecastSummaryEditableField,
    value: unknown,
    editedBy: string,
  ): Promise<ForecastSummaryEditResult> {
    const descriptor = FORECAST_SUMMARY_FIELD_REGISTRY.find((d) => d.field === field);
    if (!descriptor || !descriptor.editable) {
      return { success: false, summary: null, error: `Field '${field}' is not editable`, recomputedFields: [] };
    }

    const result = await this.repo.updateForecastSummaryField(forecastVersionId, field, value, editedBy);
    if (!result.success || !result.data) {
      return { success: false, summary: null, error: result.error, recomputedFields: [] };
    }

    // Identify which derived fields are recomputed by this edit
    const recomputedFields = this.getRecomputedFields(field);

    return { success: true, summary: result.data, error: null, recomputedFields };
  }

  /**
   * Get the field registry with current values from a summary.
   * Returns fields grouped by worksheet section.
   */
  getFieldsWithValues(summary: IFinancialForecastSummaryPort): readonly (ForecastSummaryFieldDescriptor & { value: unknown })[] {
    return FORECAST_SUMMARY_FIELD_REGISTRY.map((desc) => ({
      ...desc,
      value: (summary as unknown as Record<string, unknown>)[desc.field] ?? null,
    }));
  }

  /**
   * Get fields for a specific group.
   */
  getFieldsByGroup(group: ForecastSummaryFieldGroup): readonly ForecastSummaryFieldDescriptor[] {
    return FORECAST_SUMMARY_FIELD_REGISTRY.filter((d) => d.group === group);
  }

  /**
   * Determine which derived fields are affected by editing a given field.
   */
  private getRecomputedFields(editedField: ForecastSummaryEditableField): string[] {
    const cascades: Record<string, string[]> = {
      originalContractAmount: ['revisedContractAmount', 'totalContractWithPending', 'currentProfit', 'profitMargin', 'projectedOverUnder'],
      approvedChangeOrders: ['revisedContractAmount', 'totalContractWithPending', 'currentProfit', 'profitMargin', 'projectedOverUnder'],
      pendingChangeOrders: ['totalContractWithPending'],
      forecastToComplete: ['estimatedCostAtCompletion', 'currentProfit', 'profitMargin', 'projectedOverUnder'],
      contingencyBudget: ['contingencyRemaining'],
      contingencyUsedToDate: ['contingencyRemaining'],
    };
    return cascades[editedField] ?? [];
  }
}
