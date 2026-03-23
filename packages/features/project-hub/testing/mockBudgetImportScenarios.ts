import type { IBudgetImportRow, IBudgetLineItem } from '../src/financial/types/index.js';
import { createMockBudgetImportRow } from './createMockBudgetImportRow.js';
import { createMockBudgetLineItem } from './createMockBudgetLineItem.js';

/** Three clean new rows with no matches in existing lines. */
export const cleanImportRows: readonly IBudgetImportRow[] = [
  createMockBudgetImportRow({ budgetCode: 'NEW-001', costType: 'LAB - Labor', costCodeTier1: '03 - ESTIMATING' }),
  createMockBudgetImportRow({ budgetCode: 'NEW-002', costType: 'MAT - Materials', costCodeTier1: '03 - ESTIMATING' }),
  createMockBudgetImportRow({ budgetCode: 'NEW-003', costType: 'SUB - Subcontract', costCodeTier1: '03 - ESTIMATING' }),
];

/** Rows that will match existing canonical lines by composite key. */
export const matchedImportRows: readonly IBudgetImportRow[] = [
  createMockBudgetImportRow({ budgetCode: '0000.03-01-025.MAT', costType: 'MAT - Materials', costCodeTier1: '03 - ESTIMATING' }),
];

/** Existing lines that matchedImportRows will resolve against. */
export const matchedExistingLines: readonly IBudgetLineItem[] = [
  createMockBudgetLineItem({
    canonicalBudgetLineId: 'existing-canon-001',
    fallbackCompositeMatchKey: '03|material|0000.03-01-025.mat',
    budgetCode: '0000.03-01-025.MAT',
  }),
];

/** Rows that will produce ambiguous matches (multiple existing lines share the composite key). */
export const ambiguousImportRows: readonly IBudgetImportRow[] = [
  createMockBudgetImportRow({ budgetCode: 'AMB-001', costType: 'MAT - Materials', costCodeTier1: '03 - ESTIMATING' }),
];

/** Multiple existing lines sharing the same composite key — triggers ambiguous resolution. */
export const ambiguousExistingLines: readonly IBudgetLineItem[] = [
  createMockBudgetLineItem({
    canonicalBudgetLineId: 'amb-canon-001',
    fallbackCompositeMatchKey: '03|material|amb-001',
    budgetCode: 'AMB-001',
  }),
  createMockBudgetLineItem({
    canonicalBudgetLineId: 'amb-canon-002',
    fallbackCompositeMatchKey: '03|material|amb-001',
    budgetCode: 'AMB-001',
  }),
];

/** Rows that will fail validation. */
export const validationFailureRows: readonly IBudgetImportRow[] = [
  createMockBudgetImportRow({ budgetCode: '', costType: 'INVALID' }),
  createMockBudgetImportRow({ budgetCode: 'DUP-001', originalBudget: '-500' }),
  createMockBudgetImportRow({ budgetCode: 'DUP-001', originalBudget: '100' }),
];
