import type { IBuyoutLineItem } from '../src/financial/types/index.js';

export const createMockBuyoutLineItem = (
  overrides?: Partial<IBuyoutLineItem>,
): IBuyoutLineItem => {
  const base: IBuyoutLineItem = {
    buyoutLineId: 'buyout-001',
    projectId: 'project-001',
    divisionCode: '03',
    divisionDescription: 'Concrete',
    lineItemDescription: 'Foundation concrete work',
    subcontractorVendorName: 'ABC Concrete Inc.',
    originalBudget: 500000,
    contractAmount: 475000,
    overUnder: -25000,
    buyoutSavingsAmount: 25000,
    savingsDispositionStatus: 'Undispositioned',
    loiDateToBeSent: '2026-01-15',
    loiReturnedExecuted: '2026-01-22',
    contractExecutedDate: '2026-02-01',
    status: 'ContractExecuted',
    subcontractChecklistId: 'checklist-001',
    notes: null,
    lastEditedBy: null,
    lastEditedAt: null,
  };

  return { ...base, ...overrides };
};
