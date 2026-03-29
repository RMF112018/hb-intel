/**
 * ForecastVersioningService — Wave 3D.1 domain service tests.
 */

import { describe, expect, it } from 'vitest';
import { createFinancialRepository } from '@hbc/data-access';
import { ForecastVersioningService } from '../services/ForecastVersioningService.js';

function createService() {
  const repo = createFinancialRepository('mock');
  return { service: new ForecastVersioningService(repo), repo };
}

describe('ForecastVersioningService', () => {
  describe('load', () => {
    it('loads version ledger with current version and history', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.currentVersion).not.toBeNull();
      expect(result.versionHistory.length).toBeGreaterThan(0);
      expect(result.posture.projectId).toBe('proj-uuid-001');
    });

    it('loads checklist for the current version', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.checklist.length).toBeGreaterThan(0);
    });

    it('evaluates confirmation gate', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(typeof result.gateResult.canConfirm).toBe('boolean');
      expect(Array.isArray(result.gateResult.blockers)).toBe(true);
    });

    it('reports editable for Working version', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      expect(result.isEditable).toBe(true);
    });

    it('reports canConfirm based on gate result', async () => {
      const { service } = createService();
      const result = await service.load('proj-uuid-001', '2026-03');

      // MockFinancialRepository returns canConfirm: false (incomplete checklist)
      expect(result.canConfirm).toBe(false);
    });
  });

  describe('toggleChecklistItem', () => {
    it('toggles a checklist item through the facade', async () => {
      const { service } = createService();
      const result = await service.toggleChecklistItem('ver-003', 'chk-1', true, 'John Smith');

      expect(result.success).toBe(true);
      expect(result.data).not.toBeNull();
    });
  });

  describe('confirmVersion', () => {
    it('attempts version confirmation through the facade', async () => {
      const { service } = createService();
      const result = await service.confirmVersion('ver-003', 'John Smith');

      expect(result.success).toBe(true);
      expect(result.version).not.toBeNull();
    });
  });

  describe('deriveVersion', () => {
    it('derives a new Working version through the facade', async () => {
      const { service } = createService();
      const result = await service.deriveVersion('proj-uuid-001', 'ver-002', 'NewPeriod', 'John Smith');

      expect(result.success).toBe(true);
      expect(result.version).not.toBeNull();
    });
  });

  describe('groupChecklistByCategory', () => {
    it('groups checklist items by worksheet-aligned categories', async () => {
      const { service } = createService();
      const loadResult = await service.load('proj-uuid-001', '2026-03');
      const groups = service.groupChecklistByCategory(loadResult.checklist);

      expect(groups.length).toBeGreaterThan(0);
      // MockFinancialRepository returns items with group field
      for (const group of groups) {
        expect(group.total).toBeGreaterThan(0);
        expect(typeof group.requiredCompleted).toBe('number');
        expect(typeof group.isGroupComplete).toBe('boolean');
      }
    });
  });

  describe('getChecklistSummary', () => {
    it('computes overall checklist completion summary', async () => {
      const { service } = createService();
      const loadResult = await service.load('proj-uuid-001', '2026-03');
      const summary = service.getChecklistSummary(loadResult.checklist);

      expect(summary.total).toBeGreaterThan(0);
      expect(summary.requiredTotal).toBeGreaterThanOrEqual(0);
      expect(typeof summary.allRequiredComplete).toBe('boolean');
    });
  });
});
