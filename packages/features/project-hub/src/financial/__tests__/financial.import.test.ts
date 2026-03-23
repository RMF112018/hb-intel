import { describe, expect, it } from 'vitest';

import {
  resolveLineIdentity,
  createReconciliationCondition,
  transformCsvRowToBudgetLine,
  executeBudgetImport,
} from '../../index.js';
import {
  createMockBudgetLineItem,
  createMockBudgetImportRow,
} from '../../../testing/index.js';

const mockCostCodeSet = new Set(['01-00-000', '03-01-025', '03-01-413']);

describe('P3-E4-T02 financial import', () => {
  describe('resolveLineIdentity', () => {
    it('matches by externalSourceLineId when present', () => {
      const existing = [
        createMockBudgetLineItem({ externalSourceSystem: 'procore', externalSourceLineId: 'ext-123' }),
      ];
      const result = resolveLineIdentity(
        { externalSourceSystem: 'procore', externalSourceLineId: 'ext-123', fallbackCompositeMatchKey: 'unused' },
        existing,
      );
      expect(result.outcome).toBe('matched');
      expect(result.canonicalBudgetLineId).toBe(existing[0].canonicalBudgetLineId);
    });

    it('returns new when externalSourceLineId does not match', () => {
      const result = resolveLineIdentity(
        { externalSourceSystem: 'procore', externalSourceLineId: 'ext-999', fallbackCompositeMatchKey: 'unused' },
        [],
      );
      expect(result.outcome).toBe('new');
      expect(result.canonicalBudgetLineId).toBeNull();
    });

    it('matches unique composite key', () => {
      const existing = [
        createMockBudgetLineItem({ fallbackCompositeMatchKey: '03|material|code-a' }),
      ];
      const result = resolveLineIdentity(
        { externalSourceSystem: 'procore', externalSourceLineId: null, fallbackCompositeMatchKey: '03|material|code-a' },
        existing,
      );
      expect(result.outcome).toBe('matched');
    });

    it('returns new when composite key has no match', () => {
      const result = resolveLineIdentity(
        { externalSourceSystem: 'procore', externalSourceLineId: null, fallbackCompositeMatchKey: 'no|match|here' },
        [createMockBudgetLineItem()],
      );
      expect(result.outcome).toBe('new');
    });

    it('returns ambiguous when multiple lines share composite key', () => {
      const existing = [
        createMockBudgetLineItem({ canonicalBudgetLineId: 'a', fallbackCompositeMatchKey: 'dup|key|x' }),
        createMockBudgetLineItem({ canonicalBudgetLineId: 'b', fallbackCompositeMatchKey: 'dup|key|x' }),
      ];
      const result = resolveLineIdentity(
        { externalSourceSystem: 'procore', externalSourceLineId: null, fallbackCompositeMatchKey: 'dup|key|x' },
        existing,
      );
      expect(result.outcome).toBe('ambiguous');
      expect(result.candidateCanonicalLineIds).toEqual(['a', 'b']);
    });
  });

  describe('createReconciliationCondition', () => {
    it('creates a condition with Pending status and valid structure', () => {
      const condition = createReconciliationCondition('proj-1', 'batch-1', 'key', ['c1', 'c2']);
      expect(condition.status).toBe('Pending');
      expect(condition.projectId).toBe('proj-1');
      expect(condition.importBatchId).toBe('batch-1');
      expect(condition.importRowFallbackKey).toBe('key');
      expect(condition.candidateCanonicalLineIds).toEqual(['c1', 'c2']);
      expect(condition.conditionId).toBeTruthy();
      expect(condition.createdAt).toBeTruthy();
    });
  });

  describe('transformCsvRowToBudgetLine', () => {
    it('transforms a CSV row into a complete budget line item', () => {
      const row = createMockBudgetImportRow();
      const line = transformCsvRowToBudgetLine(row, 'proj-1', 'batch-1', 'canon-1', '2026-03-23T12:00:00Z');

      expect(line.canonicalBudgetLineId).toBe('canon-1');
      expect(line.projectId).toBe('proj-1');
      expect(line.importBatchId).toBe('batch-1');
      expect(line.externalSourceSystem).toBe('procore');
      expect(line.externalSourceLineId).toBeNull();
      expect(line.costType).toBe('Material');
      expect(line.costCodeTier1).toBe('03');
      expect(line.originalBudget).toBe(100000);
    });

    it('computes derived fields correctly', () => {
      const row = createMockBudgetImportRow({
        originalBudget: '100000',
        budgetModifications: '5000',
        approvedCOs: '2000',
        pendingBudgetChanges: '1000',
        jobToDateActualCost: '50000',
        committedCosts: '20000',
        pendingCostChanges: '3000',
        forecastToComplete: '37000',
      });
      const line = transformCsvRowToBudgetLine(row, 'p', 'b', 'c', '2026-01-01T00:00:00Z');

      expect(line.revisedBudget).toBe(107000);
      expect(line.costExposureToDate).toBe(70000);
      expect(line.estimatedCostAtCompletion).toBe(107000);
      expect(line.projectedOverUnder).toBe(0);
    });

    it('uses default FTC when CSV value is 0', () => {
      const row = createMockBudgetImportRow({
        originalBudget: '100000',
        budgetModifications: '0',
        approvedCOs: '0',
        jobToDateActualCost: '30000',
        committedCosts: '10000',
        forecastToComplete: '0',
      });
      const line = transformCsvRowToBudgetLine(row, 'p', 'b', 'c', '2026-01-01T00:00:00Z');

      // Default FTC = max(0, 100000 - 40000) = 60000
      expect(line.forecastToComplete).toBe(60000);
    });
  });

  describe('executeBudgetImport', () => {
    it('returns failure with errors on invalid batch', () => {
      const rows = [createMockBudgetImportRow({ budgetCode: '' })];
      const result = executeBudgetImport(rows, [], mockCostCodeSet, 'proj-1');

      expect(result.success).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
      expect(result.lines).toHaveLength(0);
    });

    it('creates new lines for unmatched rows', () => {
      const rows = [createMockBudgetImportRow({ budgetCode: 'UNIQUE-001' })];
      const result = executeBudgetImport(rows, [], mockCostCodeSet, 'proj-1');

      expect(result.success).toBe(true);
      expect(result.linesCreated).toBe(1);
      expect(result.linesMatched).toBe(0);
      expect(result.lines).toHaveLength(1);
    });

    it('matches existing lines by composite key', () => {
      const row = createMockBudgetImportRow({
        budgetCode: 'MATCH-001',
        costType: 'MAT - Materials',
        costCodeTier1: '03 - ESTIMATING',
      });
      const existing = [
        createMockBudgetLineItem({
          canonicalBudgetLineId: 'existing-canon',
          fallbackCompositeMatchKey: '03|material|match-001',
        }),
      ];
      const result = executeBudgetImport([row], existing, mockCostCodeSet, 'proj-1');

      expect(result.success).toBe(true);
      expect(result.linesMatched).toBe(1);
      expect(result.lines[0].canonicalBudgetLineId).toBe('existing-canon');
    });

    it('creates reconciliation conditions for ambiguous matches', () => {
      const row = createMockBudgetImportRow({
        budgetCode: 'AMB-001',
        costType: 'MAT - Materials',
        costCodeTier1: '03 - ESTIMATING',
      });
      const existing = [
        createMockBudgetLineItem({ canonicalBudgetLineId: 'a', fallbackCompositeMatchKey: '03|material|amb-001' }),
        createMockBudgetLineItem({ canonicalBudgetLineId: 'b', fallbackCompositeMatchKey: '03|material|amb-001' }),
      ];
      const result = executeBudgetImport([row], existing, mockCostCodeSet, 'proj-1');

      expect(result.success).toBe(true);
      expect(result.reconciliationConditionsCreated).toBe(1);
      expect(result.reconciliationConditions[0].candidateCanonicalLineIds).toEqual(['a', 'b']);
    });
  });
});
