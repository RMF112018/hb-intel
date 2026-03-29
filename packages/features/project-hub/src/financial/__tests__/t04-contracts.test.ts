/**
 * T04 Contract-level tests — Forecast Summary and GC/GR.
 *
 * Validates type contracts, computors, and field editability distinctions.
 */

import { describe, expect, it } from 'vitest';
import type {
  IFinancialForecastSummary,
  ForecastSummaryEditableField,
  ForecastSummaryDerivedField,
  IGCGRLine,
  GCGREditableField,
  GCGRDerivedField,
  GCGRCategory,
  IGCGRSummaryRollup,
} from '../types/index.js';
import {
  computeRevisedContractAmount,
  computeTotalContractWithPending,
  computeForecastSummaryProfit,
  computeForecastSummaryProfitMargin,
  computeContingencyRemaining,
  computeGCGRLineVariance,
  computeGCGRLineVariancePercent,
  computeGCGRSummaryRollup,
} from '../computors/index.js';

describe('T04 Forecast Summary contracts', () => {
  it('IFinancialForecastSummary type compiles with all required fields', () => {
    const summary: IFinancialForecastSummary = {
      summaryId: 'sum-001',
      forecastVersionId: 'ver-003',
      projectId: 'proj-001',
      reportingPeriod: '2026-03',
      projectName: 'City Center Tower',
      projectNumber: 'PRJ-001',
      projectManager: 'John Smith',
      contractType: 'GMP',
      clientName: 'Acme Corp',
      scheduledCompletionDate: '2028-06-30',
      revisedCompletionDate: '2028-09-30',
      percentComplete: 42,
      monthsRemaining: 30,
      originalContractAmount: 50_000_000,
      approvedChangeOrders: 2_500_000,
      pendingChangeOrders: 750_000,
      contingencyBudget: 3_000_000,
      contingencyUsedToDate: 800_000,
      forecastToComplete: 28_000_000,
      pmNarrative: 'Project tracking on budget with minor schedule pressure.',
      revisedContractAmount: 52_500_000,
      totalContractWithPending: 53_250_000,
      estimatedCostAtCompletion: 49_800_000,
      jobToDateActualCost: 18_500_000,
      committedCosts: 3_200_000,
      costExposureToDate: 21_700_000,
      currentProfit: 2_700_000,
      profitMargin: 5.14,
      projectedOverUnder: 200_000,
      contingencyRemaining: 2_200_000,
      expectedContingencyUse: 1_500_000,
      gcgrTotalVariance: 6_000,
      createdAt: '2026-03-03T09:00:00Z',
      updatedAt: '2026-03-15T10:00:00Z',
      lastEditedBy: 'John Smith',
    };

    expect(summary.summaryId).toBe('sum-001');
    expect(summary.revisedContractAmount).toBe(52_500_000);
  });

  it('editable fields are distinct from derived fields', () => {
    const editableFields: ForecastSummaryEditableField[] = [
      'projectName', 'projectNumber', 'projectManager', 'contractType', 'clientName',
      'scheduledCompletionDate', 'revisedCompletionDate', 'percentComplete', 'monthsRemaining',
      'originalContractAmount', 'approvedChangeOrders', 'pendingChangeOrders',
      'contingencyBudget', 'contingencyUsedToDate', 'forecastToComplete', 'pmNarrative',
    ];
    const derivedFields: ForecastSummaryDerivedField[] = [
      'revisedContractAmount', 'totalContractWithPending', 'estimatedCostAtCompletion',
      'jobToDateActualCost', 'committedCosts', 'costExposureToDate', 'currentProfit',
      'profitMargin', 'projectedOverUnder', 'contingencyRemaining', 'expectedContingencyUse',
      'gcgrTotalVariance',
    ];

    expect(editableFields.length).toBe(16);
    expect(derivedFields.length).toBe(12);
    // No overlap between editable and derived
    const overlap = editableFields.filter((f) => (derivedFields as string[]).includes(f));
    expect(overlap).toHaveLength(0);
  });

  it('computeRevisedContractAmount sums original + approved COs', () => {
    expect(computeRevisedContractAmount(50_000_000, 2_500_000)).toBe(52_500_000);
  });

  it('computeTotalContractWithPending includes pending COs', () => {
    expect(computeTotalContractWithPending(52_500_000, 750_000)).toBe(53_250_000);
  });

  it('computeCurrentProfit is budget-minus-cost sign convention', () => {
    expect(computeForecastSummaryProfit(52_500_000, 49_800_000)).toBe(2_700_000);
    expect(computeForecastSummaryProfit(50_000_000, 52_000_000)).toBe(-2_000_000); // Loss
  });

  it('computeProfitMargin handles zero contract amount', () => {
    expect(computeForecastSummaryProfitMargin(1_000_000, 50_000_000)).toBeCloseTo(2.0, 1);
    expect(computeForecastSummaryProfitMargin(0, 0)).toBe(0); // Division by zero guard
  });

  it('computeContingencyRemaining is budget minus used', () => {
    expect(computeContingencyRemaining(3_000_000, 800_000)).toBe(2_200_000);
  });
});

describe('T04 GC/GR contracts', () => {
  const mockLine: IGCGRLine = {
    lineId: 'gcgr-001',
    forecastVersionId: 'ver-003',
    projectId: 'proj-001',
    divisionCode: '01',
    divisionDescription: 'Project Management',
    category: 'GeneralConditions' as GCGRCategory,
    budgetAmount: 180_000,
    forecastAmount: 195_000,
    adjustmentAmount: 5_000,
    adjustmentNotes: 'Staff augmentation',
    varianceAmount: 15_000,
    variancePercent: 8.33,
    isOverBudget: true,
    sortOrder: 1,
    createdAt: '2026-03-03T09:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
    lastEditedBy: 'John Smith',
  };

  it('IGCGRLine type compiles with all required fields', () => {
    expect(mockLine.lineId).toBe('gcgr-001');
    expect(mockLine.category).toBe('GeneralConditions');
    expect(mockLine.isOverBudget).toBe(true);
  });

  it('editable fields are distinct from derived fields', () => {
    const editableFields: GCGREditableField[] = ['forecastAmount', 'adjustmentAmount', 'adjustmentNotes'];
    const derivedFields: GCGRDerivedField[] = ['varianceAmount', 'variancePercent', 'isOverBudget'];

    expect(editableFields.length).toBe(3);
    expect(derivedFields.length).toBe(3);
    const overlap = editableFields.filter((f) => (derivedFields as string[]).includes(f));
    expect(overlap).toHaveLength(0);
  });

  it('computeGCGRLineVariance is forecast-minus-budget (cost-minus-budget convention)', () => {
    expect(computeGCGRLineVariance(195_000, 180_000)).toBe(15_000);  // Over
    expect(computeGCGRLineVariance(170_000, 180_000)).toBe(-10_000); // Under
  });

  it('computeGCGRLineVariancePercent handles zero budget', () => {
    expect(computeGCGRLineVariancePercent(15_000, 180_000)).toBeCloseTo(8.33, 1);
    expect(computeGCGRLineVariancePercent(0, 0)).toBe(0); // Division by zero guard
  });

  it('computeGCGRSummaryRollup aggregates correctly', () => {
    const lines: IGCGRLine[] = [
      { ...mockLine, lineId: 'gc-1', divisionCode: '01', category: 'GeneralConditions', budgetAmount: 180_000, forecastAmount: 195_000, adjustmentAmount: 5_000, varianceAmount: 15_000, isOverBudget: true },
      { ...mockLine, lineId: 'gc-2', divisionCode: '02', category: 'GeneralConditions', budgetAmount: 120_000, forecastAmount: 110_000, adjustmentAmount: 0, varianceAmount: -10_000, isOverBudget: false },
      { ...mockLine, lineId: 'gr-1', divisionCode: '03', category: 'GeneralRequirements', budgetAmount: 85_000, forecastAmount: 82_000, adjustmentAmount: 0, varianceAmount: -3_000, isOverBudget: false },
    ];

    const rollup: IGCGRSummaryRollup = computeGCGRSummaryRollup(lines);

    expect(rollup.totalBudget).toBe(385_000);
    expect(rollup.totalForecast).toBe(387_000);
    expect(rollup.totalVariance).toBe(2_000);
    expect(rollup.totalAdjustment).toBe(5_000);
    expect(rollup.lineCount).toBe(3);
    expect(rollup.overBudgetLineCount).toBe(1);
    expect(rollup.gcSubtotal).toBe(5_000);  // 15k + (-10k)
    expect(rollup.grSubtotal).toBe(-3_000);
  });
});
