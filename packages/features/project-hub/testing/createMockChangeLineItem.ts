import type { IChangeLineItem } from '../src/constraints/change-ledger/types.js';

export const createMockChangeLineItem = (
  overrides?: Partial<IChangeLineItem>,
): IChangeLineItem => ({
  lineItemId: 'li-001',
  description: 'Additional structural steel for foundation redesign',
  type: 'Material',
  quantity: 12,
  unit: 'TON',
  unitCost: 2500,
  totalCost: 30000,
  costCode: '03-21-001',
  procoreLineItemId: null,
  notes: null,
  ...overrides,
});
