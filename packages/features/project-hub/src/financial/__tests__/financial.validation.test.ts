import { describe, expect, it } from 'vitest';

import {
  normalizeCostCode,
  extractCostCodeFromCsvTier,
  isValidCostCode,
  parseCostTypeFromCsv,
  validateBudgetImportRow,
  validateBudgetImportBatch,
} from '../../index.js';
import { createMockBudgetImportRow } from '../../../testing/index.js';

const mockCostCodeSet = new Set(['01-00-000', '01-01-000', '03-01-025', '03-01-413']);

describe('P3-E4-T02 financial validation', () => {
  describe('normalizeCostCode', () => {
    it('replaces spaces with hyphens', () => {
      expect(normalizeCostCode('03 01 025')).toBe('03-01-025');
    });

    it('preserves already-hyphenated codes', () => {
      expect(normalizeCostCode('03-01-025')).toBe('03-01-025');
    });

    it('trims whitespace', () => {
      expect(normalizeCostCode('  03-01-025  ')).toBe('03-01-025');
    });
  });

  describe('extractCostCodeFromCsvTier', () => {
    it('extracts code before " - " separator', () => {
      expect(extractCostCodeFromCsvTier('03 - ESTIMATING')).toBe('03');
    });

    it('extracts multi-part code', () => {
      expect(extractCostCodeFromCsvTier('03-01-025 - PLAN COPY EXPENSE')).toBe('03-01-025');
    });

    it('returns full value when no separator', () => {
      expect(extractCostCodeFromCsvTier('03')).toBe('03');
    });

    it('trims whitespace', () => {
      expect(extractCostCodeFromCsvTier('  03 - ESTIMATING  ')).toBe('03');
    });
  });

  describe('isValidCostCode', () => {
    it('returns true when code prefix matches dictionary entries', () => {
      expect(isValidCostCode('03 - ESTIMATING', mockCostCodeSet)).toBe(true);
    });

    it('returns true for direct match', () => {
      expect(isValidCostCode('03-01-025', mockCostCodeSet)).toBe(true);
    });

    it('returns false for unknown code', () => {
      expect(isValidCostCode('99 - UNKNOWN', mockCostCodeSet)).toBe(false);
    });
  });

  describe('parseCostTypeFromCsv', () => {
    it('parses Procore format with prefix', () => {
      expect(parseCostTypeFromCsv('MAT - Materials')).toBe('Material');
      expect(parseCostTypeFromCsv('LAB - Labor')).toBe('Labor');
      expect(parseCostTypeFromCsv('LBN - Labor Burden')).toBe('Labor');
      expect(parseCostTypeFromCsv('SUB - Subcontract')).toBe('Subcontract');
      expect(parseCostTypeFromCsv('EQU - Equipment')).toBe('Equipment');
      expect(parseCostTypeFromCsv('OTH - Other')).toBe('Other');
    });

    it('accepts canonical CostType values directly', () => {
      expect(parseCostTypeFromCsv('Labor')).toBe('Labor');
      expect(parseCostTypeFromCsv('Material')).toBe('Material');
    });

    it('returns null for invalid cost type', () => {
      expect(parseCostTypeFromCsv('INVALID')).toBeNull();
      expect(parseCostTypeFromCsv('')).toBeNull();
    });
  });

  describe('validateBudgetImportRow', () => {
    it('returns no errors for a valid row', () => {
      const row = createMockBudgetImportRow();
      const errors = validateBudgetImportRow(row, 0, mockCostCodeSet);
      expect(errors).toHaveLength(0);
    });

    it('reports missing budgetCode', () => {
      const row = createMockBudgetImportRow({ budgetCode: '' });
      const errors = validateBudgetImportRow(row, 0, mockCostCodeSet);
      expect(errors.some((e) => e.field === 'budgetCode')).toBe(true);
    });

    it('reports missing budgetCodeDescription', () => {
      const row = createMockBudgetImportRow({ budgetCodeDescription: '' });
      const errors = validateBudgetImportRow(row, 0, mockCostCodeSet);
      expect(errors.some((e) => e.field === 'budgetCodeDescription')).toBe(true);
    });

    it('reports invalid cost type', () => {
      const row = createMockBudgetImportRow({ costType: 'INVALID' });
      const errors = validateBudgetImportRow(row, 0, mockCostCodeSet);
      expect(errors.some((e) => e.field === 'costType')).toBe(true);
    });

    it('reports cost code not in dictionary', () => {
      const row = createMockBudgetImportRow({ costCodeTier1: '99 - UNKNOWN' });
      const errors = validateBudgetImportRow(row, 0, mockCostCodeSet);
      expect(errors.some((e) => e.field === 'costCodeTier1')).toBe(true);
    });

    it('reports negative original budget', () => {
      const row = createMockBudgetImportRow({ originalBudget: '-500' });
      const errors = validateBudgetImportRow(row, 0, mockCostCodeSet);
      expect(errors.some((e) => e.field === 'originalBudget')).toBe(true);
    });
  });

  describe('validateBudgetImportBatch', () => {
    it('returns valid for clean batch', () => {
      const rows = [
        createMockBudgetImportRow({ budgetCode: 'A' }),
        createMockBudgetImportRow({ budgetCode: 'B' }),
      ];
      const result = validateBudgetImportBatch(rows, mockCostCodeSet);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects duplicate budgetCode within batch', () => {
      const rows = [
        createMockBudgetImportRow({ budgetCode: 'DUP' }),
        createMockBudgetImportRow({ budgetCode: 'DUP' }),
      ];
      const result = validateBudgetImportBatch(rows, mockCostCodeSet);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Duplicate'))).toBe(true);
    });

    it('aggregates row-level and batch-level errors', () => {
      const rows = [
        createMockBudgetImportRow({ budgetCode: '' }),
        createMockBudgetImportRow({ budgetCode: 'A', costType: 'INVALID' }),
      ];
      const result = validateBudgetImportBatch(rows, mockCostCodeSet);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});
