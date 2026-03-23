import type { IBudgetLineItem } from '../src/financial/types/index.js';

export const createMockBudgetLineItem = (
  overrides?: Partial<IBudgetLineItem>,
): IBudgetLineItem => {
  const base: IBudgetLineItem = {
    canonicalBudgetLineId: 'canon-001',
    externalSourceSystem: 'procore',
    externalSourceLineId: null,
    fallbackCompositeMatchKey: '03|material|0100.03-01-025.mat',
    budgetImportRowId: 'row-001',
    projectId: 'project-001',
    importBatchId: 'batch-001',
    importedAt: '2026-03-23T12:00:00.000Z',
    subJob: null,
    costCodeTier1: '03',
    costCodeTier2: '03-01',
    costCodeTier3: '03-01-025',
    costType: 'Material',
    budgetCode: '0100.03-01-025.MAT',
    budgetCodeDescription: 'PLAN COPY EXPENSE.Materials',
    originalBudget: 100000,
    budgetModifications: 5000,
    approvedCOs: 2000,
    revisedBudget: 107000,        // 100000 + 5000 + 2000
    pendingBudgetChanges: 1000,
    projectedBudget: 108000,       // 107000 + 1000
    jobToDateActualCost: 50000,
    committedCosts: 20000,
    costExposureToDate: 70000,     // 50000 + 20000
    pendingCostChanges: 3000,
    projectedCosts: 73000,         // 70000 + 3000
    forecastToComplete: 37000,     // max(0, 107000 - 70000) = 37000
    estimatedCostAtCompletion: 107000,  // 70000 + 37000
    projectedOverUnder: 0,         // 107000 - 107000
    lastEditedBy: null,
    lastEditedAt: null,
    priorForecastToComplete: null,
    notes: null,
  };

  return { ...base, ...overrides };
};
