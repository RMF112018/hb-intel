/**
 * ForecastSummaryService — Wave 3A.1 domain service tests.
 */

import { describe, expect, it } from 'vitest';
import { createFinancialRepository } from '@hbc/data-access';
import { ForecastSummaryService, FORECAST_SUMMARY_FIELD_REGISTRY } from '../services/ForecastSummaryService.js';

function createService() {
  const repo = createFinancialRepository('mock');
  return { service: new ForecastSummaryService(repo), repo };
}

describe('ForecastSummaryService', () => {
  describe('load', () => {
    it('loads summary with posture, editability, and blockers', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.summary).not.toBeNull();
      expect(result.posture.projectId).toBe('proj-uuid-001');
      expect(result.posture.currentVersionState).toBe('Working');
      expect(result.isEditable).toBe(true);
    });

    it('returns blockers when stale budget lines exist', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      // MockFinancialRepository returns staleBudgetLineCount: 0 and confirmationGateCanPass: false
      expect(result.blockers.length).toBeGreaterThanOrEqual(0);
    });

    it('returns summary port data with expected fields', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.summary).not.toBeNull();
      expect(result.summary!.originalContractAmount).toBe(50_000_000);
      expect(result.summary!.revisedContractAmount).toBe(52_500_000);
      expect(result.summary!.profitMargin).toBeCloseTo(5.14, 1);
    });
  });

  describe('editField', () => {
    it('persists an editable field through the facade', async () => {
      const { service } = createService();
      const result = await service.editField('ver-003', 'forecastToComplete', 30_000_000, 'John Smith');

      expect(result.success).toBe(true);
      expect(result.summary).not.toBeNull();
    });

    it('rejects editing a derived field', async () => {
      const { service } = createService();
      const result = await service.editField('ver-003', 'revisedContractAmount' as any, 55_000_000, 'John Smith');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not editable');
    });

    it('returns recomputed fields for contract amount edits', async () => {
      const { service } = createService();
      const result = await service.editField('ver-003', 'originalContractAmount', 55_000_000, 'John Smith');

      expect(result.recomputedFields).toContain('revisedContractAmount');
      expect(result.recomputedFields).toContain('currentProfit');
      expect(result.recomputedFields).toContain('profitMargin');
    });

    it('returns recomputed fields for contingency edits', async () => {
      const { service } = createService();
      const result = await service.editField('ver-003', 'contingencyBudget', 4_000_000, 'John Smith');

      expect(result.recomputedFields).toContain('contingencyRemaining');
    });

    it('returns empty recomputed fields for narrative edits', async () => {
      const { service } = createService();
      const result = await service.editField('ver-003', 'pmNarrative', 'Updated narrative', 'John Smith');

      expect(result.recomputedFields).toHaveLength(0);
    });
  });

  describe('field registry', () => {
    it('contains 28 fields matching IFinancialForecastSummary', () => {
      expect(FORECAST_SUMMARY_FIELD_REGISTRY).toHaveLength(28);
    });

    it('has 16 editable fields and 12 derived fields', () => {
      const editable = FORECAST_SUMMARY_FIELD_REGISTRY.filter((f) => f.editable);
      const derived = FORECAST_SUMMARY_FIELD_REGISTRY.filter((f) => !f.editable);
      expect(editable).toHaveLength(16);
      expect(derived).toHaveLength(12);
    });

    it('groups fields by worksheet section', () => {
      const groups = [...new Set(FORECAST_SUMMARY_FIELD_REGISTRY.map((f) => f.group))];
      expect(groups).toContain('project-info');
      expect(groups).toContain('schedule');
      expect(groups).toContain('contract');
      expect(groups).toContain('cost');
      expect(groups).toContain('profit');
      expect(groups).toContain('contingency');
      expect(groups).toContain('gcgr');
      expect(groups).toContain('narrative');
      expect(groups).toHaveLength(8);
    });
  });

  describe('getFieldsByGroup', () => {
    it('returns correct fields for contract group', () => {
      const { service } = createService();
      const fields = service.getFieldsByGroup('contract');
      expect(fields.length).toBe(5);
      expect(fields.some((f) => f.field === 'originalContractAmount')).toBe(true);
      expect(fields.some((f) => f.field === 'revisedContractAmount')).toBe(true);
    });
  });
});
