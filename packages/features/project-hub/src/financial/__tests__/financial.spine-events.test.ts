import { describe, expect, it } from 'vitest';

import {
  createFinancialActivityEvent,
  createFinancialHealthMetric,
  createFinancialHealthSnapshot,
  createFinancialWorkQueueItem,
} from '../../index.js';
import { mockHealthSnapshotInput } from '../../../testing/index.js';

describe('P3-E4-T08 spine event factories', () => {
  describe('createFinancialActivityEvent', () => {
    it('creates a typed activity event with timestamp', () => {
      const event = createFinancialActivityEvent('BudgetImported', 'proj-1', {
        importBatchId: 'batch-1',
        lineCount: 50,
      });
      expect(event.eventType).toBe('BudgetImported');
      expect(event.projectId).toBe('proj-1');
      expect(event.timestamp).toBeTruthy();
      expect(event.payload.importBatchId).toBe('batch-1');
    });

    it('creates events for all 10 types', () => {
      const types = [
        'BudgetImported', 'ForecastVersionConfirmed', 'ForecastVersionDerived',
        'ReportCandidateDesignated', 'ForecastVersionPublished', 'GCGRUpdated',
        'BuyoutLineExecuted', 'BuyoutSavingsDispositioned', 'CashFlowProjectionUpdated',
        'ReconciliationConditionResolved',
      ] as const;
      for (const type of types) {
        const event = createFinancialActivityEvent(type, 'proj-1', {});
        expect(event.eventType).toBe(type);
      }
    });
  });

  describe('createFinancialHealthMetric', () => {
    it('creates a metric with key, value, and unit', () => {
      const metric = createFinancialHealthMetric('profitMargin', 12.5, 'percent', 'ForecastVersionConfirmed');
      expect(metric.key).toBe('profitMargin');
      expect(metric.value).toBe(12.5);
      expect(metric.unit).toBe('percent');
      expect(metric.updatedOn).toBe('ForecastVersionConfirmed');
    });
  });

  describe('createFinancialHealthSnapshot', () => {
    it('creates exactly 10 metrics', () => {
      const snapshot = createFinancialHealthSnapshot(mockHealthSnapshotInput, 'ForecastVersionConfirmed');
      expect(snapshot).toHaveLength(10);
    });

    it('includes all metric keys', () => {
      const snapshot = createFinancialHealthSnapshot(mockHealthSnapshotInput, 'ForecastVersionConfirmed');
      const keys = snapshot.map((m) => m.key);
      expect(keys).toContain('projectedOverUnder');
      expect(keys).toContain('buyoutToCommittedCostsReconciliation');
    });

    it('assigns correct units', () => {
      const snapshot = createFinancialHealthSnapshot(mockHealthSnapshotInput, 'test');
      const profitMargin = snapshot.find((m) => m.key === 'profitMargin')!;
      expect(profitMargin.unit).toBe('percent');
      const overUnder = snapshot.find((m) => m.key === 'projectedOverUnder')!;
      expect(overUnder.unit).toBe('usd');
    });
  });

  describe('createFinancialWorkQueueItem', () => {
    it('creates a work queue item with type and message', () => {
      const item = createFinancialWorkQueueItem(
        'BudgetReconciliationRequired',
        'proj-1',
        'user-pm-001',
        '3 budget lines require reconciliation',
        { conditionCount: 3 },
      );
      expect(item.itemType).toBe('BudgetReconciliationRequired');
      expect(item.projectId).toBe('proj-1');
      expect(item.assignedTo).toBe('user-pm-001');
      expect(item.context.conditionCount).toBe(3);
      expect(item.createdAt).toBeTruthy();
    });

    it('defaults context to empty object', () => {
      const item = createFinancialWorkQueueItem('CashFlowDeficit', 'proj-1', 'pm', 'deficit');
      expect(item.context).toEqual({});
    });
  });
});
