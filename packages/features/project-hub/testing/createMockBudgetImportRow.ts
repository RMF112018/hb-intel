import type { IBudgetImportRow } from '../src/financial/types/index.js';

export const createMockBudgetImportRow = (
  overrides?: Partial<IBudgetImportRow>,
): IBudgetImportRow => {
  const base: IBudgetImportRow = {
    subJob: '0000 - Main',
    costCodeTier1: '03 - ESTIMATING',
    costCodeTier2: '03-01 - GENERAL CONDITIONS',
    costCodeTier3: '03-01-025 - PLAN COPY EXPENSE',
    costType: 'MAT - Materials',
    budgetCode: '0000.03-01-025.MAT',
    budgetCodeDescription: 'PLAN COPY EXPENSE.Materials',
    originalBudget: '100000.00',
    budgetModifications: '5000.00',
    approvedCOs: '2000.00',
    pendingBudgetChanges: '1000.00',
    jobToDateActualCost: '50000.00',
    committedCosts: '20000.00',
    pendingCostChanges: '3000.00',
    forecastToComplete: '37000.00',
  };

  return { ...base, ...overrides };
};
