import type { IBuyoutSavingsDisposition } from '../src/financial/types/index.js';

export const createMockBuyoutSavingsDisposition = (
  overrides?: Partial<IBuyoutSavingsDisposition>,
): IBuyoutSavingsDisposition => {
  const base: IBuyoutSavingsDisposition = {
    dispositionId: 'disp-001',
    buyoutLineId: 'buyout-001',
    projectId: 'project-001',
    totalSavingsAmount: 25000,
    dispositionedAmount: 0,
    undispositionedAmount: 25000,
    dispositionItems: [],
    createdAt: '2026-03-23T12:00:00.000Z',
    lastUpdatedAt: '2026-03-23T12:00:00.000Z',
  };

  return { ...base, ...overrides };
};
