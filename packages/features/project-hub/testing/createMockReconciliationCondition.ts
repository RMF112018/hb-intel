import type { IBudgetLineReconciliationCondition } from '../src/financial/types/index.js';

export const createMockReconciliationCondition = (
  overrides?: Partial<IBudgetLineReconciliationCondition>,
): IBudgetLineReconciliationCondition => {
  const base: IBudgetLineReconciliationCondition = {
    conditionId: 'cond-001',
    projectId: 'project-001',
    importBatchId: 'batch-001',
    importRowFallbackKey: '03|material|0100.03-01-025.mat',
    candidateCanonicalLineIds: ['canon-001', 'canon-002'],
    status: 'Pending',
    createdAt: '2026-03-23T12:00:00.000Z',
  };

  return { ...base, ...overrides };
};
