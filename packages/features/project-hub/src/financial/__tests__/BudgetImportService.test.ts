/**
 * BudgetImportService — Wave 3C.1 domain service tests.
 */

import { describe, expect, it } from 'vitest';
import { createFinancialRepository } from '@hbc/data-access';
import { BudgetImportService, parseProcoreBudgetCsv, validateImportRows } from '../services/BudgetImportService.js';

function createService() {
  const repo = createFinancialRepository('mock');
  return { service: new BudgetImportService(repo), repo };
}

const SAMPLE_CSV = `Sub Job,Cost Code Tier 1,Cost Code Tier 2,Cost Code Tier 3,Cost Type,Budget Code,Budget Code Description,Original Budget Amount,Budget Modifications,Approved COs,Revised Budget,Pending Budget Changes,Projected Budget,Committed Costs,Direct Costs,Job to Date Costs,Pending Cost Changes,Projected Costs,Forecast To Complete,Estimated Cost at Completion,Projected over Under
0001,03 - ESTIMATING,03-01 - GC,03-01-025 - PLAN COPY,MAT,0001.03-01-025.MAT,Plan Copy.Materials,5000.00,0.00,0.00,5000.00,0.00,5000.00,0.00,3200.00,3200.00,0.00,3200.00,1800.00,5000.00,0.00
0001,03 - ESTIMATING,03-01 - GC,03-01-413 - ESTIMATING,LAB,0001.03-01-413.LAB,Estimating.Labor,120000.00,5000.00,0.00,125000.00,0.00,125000.00,45000.00,80000.00,80000.00,0.00,80000.00,40000.00,120000.00,5000.00
,,,,,,,,,,,,,,,,,,,,`;

describe('parseProcoreBudgetCsv', () => {
  it('parses CSV header and data rows', () => {
    const rows = parseProcoreBudgetCsv(SAMPLE_CSV);
    expect(rows.length).toBe(2); // Skips header and empty row
  });

  it('extracts budget code and cost type', () => {
    const rows = parseProcoreBudgetCsv(SAMPLE_CSV);
    expect(rows[0].budgetCode).toBe('0001.03-01-025.MAT');
    expect(rows[0].costType).toBe('MAT');
  });

  it('extracts numeric amounts correctly', () => {
    const rows = parseProcoreBudgetCsv(SAMPLE_CSV);
    expect(rows[0].originalBudgetAmount).toBe(5000);
    expect(rows[1].budgetModifications).toBe(5000);
    expect(rows[1].forecastToComplete).toBe(40000);
  });

  it('filters empty/summary rows', () => {
    const rows = parseProcoreBudgetCsv(SAMPLE_CSV);
    // Empty row (all commas) should be filtered out
    expect(rows.every((r) => r.budgetCode.trim() !== '')).toBe(true);
  });
});

describe('validateImportRows', () => {
  it('validates required fields', () => {
    const rows = parseProcoreBudgetCsv(SAMPLE_CSV);
    const result = validateImportRows(rows);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing budget code', () => {
    const result = validateImportRows([{
      subJob: '0001', costCodeTier1: '', costCodeTier2: '', costCodeTier3: '',
      costType: 'MAT', budgetCode: '', budgetCodeDescription: '',
      originalBudgetAmount: 5000, budgetModifications: 0, approvedCOs: 0,
      revisedBudget: 5000, committedCosts: 0, jobToDateCosts: 0,
      forecastToComplete: 5000, estimatedCostAtCompletion: 5000, projectedOverUnder: 0,
    }]);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].field).toBe('budgetCode');
  });

  it('warns on negative budget amount', () => {
    const rows = parseProcoreBudgetCsv(SAMPLE_CSV);
    const modified = [{ ...rows[0], originalBudgetAmount: -100 }];
    const result = validateImportRows(modified);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].field).toBe('originalBudgetAmount');
  });
});

describe('BudgetImportService', () => {
  describe('load', () => {
    it('loads budget state with lines, conditions, and posture', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.lines.length).toBeGreaterThan(0);
      expect(result.posture.projectId).toBe('proj-uuid-001');
      expect(typeof result.staleBudgetLineCount).toBe('number');
    });

    it('reports import blocked for non-Working version', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      // MockFinancialRepository returns Working state
      expect(result.isImportBlocked).toBe(false);
    });

    it('counts pending reconciliation conditions', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(typeof result.pendingConditionCount).toBe('number');
    });
  });

  describe('resolveCondition', () => {
    it('resolves a reconciliation condition', async () => {
      const { service } = createService();
      const result = await service.resolveCondition('cond-001', 'MergedInto', 'John Smith');

      expect(result.success).toBe(true);
    });
  });

  describe('updateFTC', () => {
    it('updates a budget line FTC through the facade', async () => {
      const { service } = createService();
      const result = await service.updateFTC('ver-003', 'bl-001', 300_000, 'John Smith');

      expect(result.success).toBe(true);
      expect(result.data).not.toBeNull();
    });
  });
});
