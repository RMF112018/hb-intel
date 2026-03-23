import { describe, expect, it } from 'vitest';

import {
  FINANCIAL_ACTIVITY_EVENT_TYPES,
  FINANCIAL_HEALTH_METRIC_KEYS,
  FINANCIAL_WORK_QUEUE_ITEM_TYPES,
  FINANCIAL_ANNOTATION_ANCHOR_TYPES,
  PM_ANNOTATION_DISPOSITION_STATUSES,
  FINANCIAL_ANNOTATABLE_FIELD_KEYS,
  FINANCIAL_ANNOTATABLE_SECTION_KEYS,
} from '../../index.js';

describe('P3-E4-T08 spine events and annotation contract stability', () => {
  it('locks FINANCIAL_ACTIVITY_EVENT_TYPES to exactly 10 values', () => {
    expect(FINANCIAL_ACTIVITY_EVENT_TYPES).toHaveLength(10);
    expect(FINANCIAL_ACTIVITY_EVENT_TYPES).toContain('BudgetImported');
    expect(FINANCIAL_ACTIVITY_EVENT_TYPES).toContain('ReconciliationConditionResolved');
  });

  it('locks FINANCIAL_HEALTH_METRIC_KEYS to exactly 10 values', () => {
    expect(FINANCIAL_HEALTH_METRIC_KEYS).toHaveLength(10);
    expect(FINANCIAL_HEALTH_METRIC_KEYS).toContain('projectedOverUnder');
    expect(FINANCIAL_HEALTH_METRIC_KEYS).toContain('buyoutToCommittedCostsReconciliation');
  });

  it('locks FINANCIAL_WORK_QUEUE_ITEM_TYPES to exactly 8 values', () => {
    expect(FINANCIAL_WORK_QUEUE_ITEM_TYPES).toHaveLength(8);
    expect(FINANCIAL_WORK_QUEUE_ITEM_TYPES).toContain('BudgetReconciliationRequired');
    expect(FINANCIAL_WORK_QUEUE_ITEM_TYPES).toContain('BuyoutComplianceGateBlocked');
  });

  it('locks FINANCIAL_ANNOTATION_ANCHOR_TYPES to 3 values', () => {
    expect(FINANCIAL_ANNOTATION_ANCHOR_TYPES).toEqual(['field', 'section', 'block']);
  });

  it('locks PM_ANNOTATION_DISPOSITION_STATUSES to 4 values', () => {
    expect(PM_ANNOTATION_DISPOSITION_STATUSES).toEqual([
      'Pending', 'Addressed', 'StillApplicable', 'NeedsReviewerAttention',
    ]);
  });

  it('FINANCIAL_ANNOTATABLE_FIELD_KEYS matches §15.2 spec', () => {
    expect(FINANCIAL_ANNOTATABLE_FIELD_KEYS).toHaveLength(4);
    expect(FINANCIAL_ANNOTATABLE_FIELD_KEYS).toContain('forecastToComplete');
    expect(FINANCIAL_ANNOTATABLE_FIELD_KEYS).toContain('projectedOverUnder');
  });

  it('FINANCIAL_ANNOTATABLE_SECTION_KEYS covers major sections', () => {
    expect(FINANCIAL_ANNOTATABLE_SECTION_KEYS).toHaveLength(5);
    expect(FINANCIAL_ANNOTATABLE_SECTION_KEYS).toContain('cost-summary');
    expect(FINANCIAL_ANNOTATABLE_SECTION_KEYS).toContain('buyout-section');
  });
});
