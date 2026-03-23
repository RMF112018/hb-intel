import { describe, expect, it } from 'vitest';

import {
  validateConfirmationGate,
  generateChecklistForVersion,
  FORECAST_CHECKLIST_TEMPLATE,
} from '../../index.js';
import { createMockForecastVersion, createMockChecklistItem } from '../../../testing/index.js';

describe('P3-E4-T03 confirmation gate', () => {
  describe('validateConfirmationGate', () => {
    it('allows confirmation when all conditions are met', () => {
      const version = createMockForecastVersion({ versionType: 'Working', staleBudgetLineCount: 0 });
      const checklist = FORECAST_CHECKLIST_TEMPLATE.map((t) =>
        createMockChecklistItem({
          itemId: t.itemId,
          required: t.required,
          completed: true,
        }),
      );
      const result = validateConfirmationGate(version, checklist, 0);
      expect(result.canConfirm).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('blocks when required checklist items are incomplete', () => {
      const version = createMockForecastVersion({ versionType: 'Working' });
      const checklist = [
        createMockChecklistItem({ itemId: 'doc_procore_budget', required: true, completed: false }),
        createMockChecklistItem({ itemId: 'doc_forecast_summary', required: true, completed: true }),
      ];
      const result = validateConfirmationGate(version, checklist, 0);
      expect(result.canConfirm).toBe(false);
      expect(result.blockers.some((b) => b.includes('incomplete'))).toBe(true);
    });

    it('blocks when staleBudgetLineCount > 0', () => {
      const version = createMockForecastVersion({ versionType: 'Working' });
      const checklist = FORECAST_CHECKLIST_TEMPLATE.map((t) =>
        createMockChecklistItem({ itemId: t.itemId, required: t.required, completed: true }),
      );
      const result = validateConfirmationGate(version, checklist, 3);
      expect(result.canConfirm).toBe(false);
      expect(result.blockers.some((b) => b.includes('reconciliation'))).toBe(true);
    });

    it('blocks when version is not Working', () => {
      const version = createMockForecastVersion({ versionType: 'ConfirmedInternal' });
      const result = validateConfirmationGate(version, [], 0);
      expect(result.canConfirm).toBe(false);
      expect(result.blockers.some((b) => b.includes('not Working'))).toBe(true);
    });

    it('reports multiple blockers simultaneously', () => {
      const version = createMockForecastVersion({ versionType: 'ConfirmedInternal' });
      const checklist = [
        createMockChecklistItem({ required: true, completed: false }),
      ];
      const result = validateConfirmationGate(version, checklist, 5);
      expect(result.canConfirm).toBe(false);
      expect(result.blockers.length).toBeGreaterThanOrEqual(3);
    });

    it('allows conditional items to be uncompleted without blocking', () => {
      const version = createMockForecastVersion({ versionType: 'Working' });
      const checklist = FORECAST_CHECKLIST_TEMPLATE.map((t) =>
        createMockChecklistItem({
          itemId: t.itemId,
          required: t.required,
          completed: t.required, // required items completed, conditional items not
        }),
      );
      const result = validateConfirmationGate(version, checklist, 0);
      expect(result.canConfirm).toBe(true);
    });
  });

  describe('generateChecklistForVersion', () => {
    it('generates correct number of items from template', () => {
      const checklist = generateChecklistForVersion('ver-001');
      expect(checklist).toHaveLength(FORECAST_CHECKLIST_TEMPLATE.length);
      expect(checklist).toHaveLength(19);
    });

    it('all items start uncompleted', () => {
      const checklist = generateChecklistForVersion('ver-001');
      for (const item of checklist) {
        expect(item.completed).toBe(false);
        expect(item.completedBy).toBeNull();
        expect(item.completedAt).toBeNull();
      }
    });

    it('all items reference the correct version', () => {
      const checklist = generateChecklistForVersion('ver-test');
      for (const item of checklist) {
        expect(item.forecastVersionId).toBe('ver-test');
      }
    });

    it('preserves template item IDs and groups', () => {
      const checklist = generateChecklistForVersion('ver-001');
      for (let i = 0; i < FORECAST_CHECKLIST_TEMPLATE.length; i++) {
        expect(checklist[i].itemId).toBe(FORECAST_CHECKLIST_TEMPLATE[i].itemId);
        expect(checklist[i].group).toBe(FORECAST_CHECKLIST_TEMPLATE[i].group);
        expect(checklist[i].required).toBe(FORECAST_CHECKLIST_TEMPLATE[i].required);
      }
    });

    it('generates unique checklistId for each item', () => {
      const checklist = generateChecklistForVersion('ver-001');
      const ids = new Set(checklist.map((i) => i.checklistId));
      expect(ids.size).toBe(checklist.length);
    });
  });
});
