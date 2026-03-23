import type { IBuyoutLineItem } from '../src/financial/types/index.js';
import { createMockBuyoutLineItem } from './createMockBuyoutLineItem.js';

export const notStartedLine = createMockBuyoutLineItem({
  buyoutLineId: 'buyout-ns',
  status: 'NotStarted',
  contractAmount: null,
  overUnder: null,
  buyoutSavingsAmount: 0,
  savingsDispositionStatus: 'NoSavings',
  loiDateToBeSent: null,
  loiReturnedExecuted: null,
  contractExecutedDate: null,
  subcontractChecklistId: null,
});

export const executedLineWithSavings = createMockBuyoutLineItem({
  buyoutLineId: 'buyout-savings',
  status: 'ContractExecuted',
  originalBudget: 500000,
  contractAmount: 475000,
  overUnder: -25000,
  buyoutSavingsAmount: 25000,
  savingsDispositionStatus: 'Undispositioned',
});

export const executedLineOverBudget = createMockBuyoutLineItem({
  buyoutLineId: 'buyout-over',
  status: 'ContractExecuted',
  originalBudget: 500000,
  contractAmount: 520000,
  overUnder: 20000,
  buyoutSavingsAmount: 0,
  savingsDispositionStatus: 'NoSavings',
});

export const voidLine = createMockBuyoutLineItem({
  buyoutLineId: 'buyout-void',
  status: 'Void',
  contractAmount: null,
  overUnder: null,
  buyoutSavingsAmount: 0,
  savingsDispositionStatus: 'NoSavings',
});

export const completeLine = createMockBuyoutLineItem({
  buyoutLineId: 'buyout-complete',
  status: 'Complete',
  originalBudget: 200000,
  contractAmount: 195000,
  overUnder: -5000,
  buyoutSavingsAmount: 5000,
  savingsDispositionStatus: 'FullyDispositioned',
});

export const mixedBuyoutLines: readonly IBuyoutLineItem[] = [
  notStartedLine,
  executedLineWithSavings,
  executedLineOverBudget,
  voidLine,
  completeLine,
];
