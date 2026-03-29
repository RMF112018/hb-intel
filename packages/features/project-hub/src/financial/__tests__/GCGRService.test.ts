/**
 * GCGRService — Wave 3B.1 domain service tests.
 */

import { describe, expect, it } from 'vitest';
import { createFinancialRepository } from '@hbc/data-access';
import { GCGRService } from '../services/GCGRService.js';

function createService() {
  const repo = createFinancialRepository('mock');
  return { service: new GCGRService(repo), repo };
}

describe('GCGRService', () => {
  describe('load', () => {
    it('loads GC/GR state with lines, rollup, and posture', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.lines.length).toBeGreaterThan(0);
      expect(result.rollup.totalBudget).toBeGreaterThan(0);
      expect(result.posture.projectId).toBe('proj-uuid-001');
      expect(result.posture.currentVersionState).toBe('Working');
    });

    it('returns editable = true for Working version', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.isEditable).toBe(true);
    });

    it('returns rollup with line count and over-budget count', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.rollup.lineCount).toBeGreaterThan(0);
      expect(typeof result.rollup.overBudgetLineCount).toBe('number');
    });
  });

  describe('editLine', () => {
    it('persists a line edit through the facade', async () => {
      const { service } = createService();
      const result = await service.editLine('ver-003', 'gcgr-1', 200_000, 5_000, 'Overtime', 'John Smith');

      expect(result.success).toBe(true);
      expect(result.line).not.toBeNull();
      expect(result.rollupAffected).toBe(true);
    });

    it('returns updated variance after edit', async () => {
      const { service } = createService();
      const result = await service.editLine('ver-003', 'gcgr-1', 200_000, 5_000, '', 'John Smith');

      expect(result.success).toBe(true);
      // MockFinancialRepository computes variance = forecastAmount - budgetAmount
      expect(typeof result.updatedVariance).toBe('number');
    });

    it('returns error for unknown line', async () => {
      const { service } = createService();
      const result = await service.editLine('ver-003', 'nonexistent', 100_000, 0, '', 'John Smith');

      expect(result.success).toBe(false);
      expect(result.error).not.toBeNull();
    });
  });

  describe('groupByCategory', () => {
    it('groups lines by GC/GR/Other categories', async () => {
      const { service } = createService();
      const loadResult = await service.load('proj-uuid-001', '2026-03');
      const groups = service.groupByCategory(loadResult.lines);

      expect(groups.length).toBeGreaterThan(0);
      // MockFinancialRepository returns divisions 01 and 02 (both GC range)
      const gcGroup = groups.find((g) => g.category === 'GeneralConditions');
      expect(gcGroup).toBeDefined();
      expect(gcGroup!.lines.length).toBeGreaterThan(0);
    });

    it('computes subtotals per category group', async () => {
      const { service } = createService();
      const loadResult = await service.load('proj-uuid-001', '2026-03');
      const groups = service.groupByCategory(loadResult.lines);

      for (const group of groups) {
        const expectedBudget = group.lines.reduce((s, l) => s + l.budgetAmount, 0);
        expect(group.subtotalBudget).toBe(expectedBudget);
      }
    });
  });

  describe('getGCGRTotalVariance', () => {
    it('returns the total variance for Forecast Summary rollup', async () => {
      const { service } = createService();
      const variance = await service.getGCGRTotalVariance('ver-003');

      expect(typeof variance).toBe('number');
    });
  });

  describe('computeLineVariance', () => {
    it('computes variance = forecast - budget', () => {
      const { service } = createService();
      const result = service.computeLineVariance(195_000, 180_000);

      expect(result.varianceAmount).toBe(15_000);
      expect(result.isOverBudget).toBe(true);
      expect(result.variancePercent).toBeCloseTo(8.33, 1);
    });

    it('computes negative variance for under-budget', () => {
      const { service } = createService();
      const result = service.computeLineVariance(110_000, 120_000);

      expect(result.varianceAmount).toBe(-10_000);
      expect(result.isOverBudget).toBe(false);
    });

    it('handles zero budget without division error', () => {
      const { service } = createService();
      const result = service.computeLineVariance(5_000, 0);

      expect(result.varianceAmount).toBe(5_000);
      expect(result.variancePercent).toBe(0);
    });
  });
});
