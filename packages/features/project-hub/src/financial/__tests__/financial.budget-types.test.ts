import { describe, expect, it } from 'vitest';

import {
  COST_TYPES,
  EXTERNAL_SOURCE_SYSTEMS,
  RECONCILIATION_CONDITION_STATUSES,
  RECONCILIATION_RESOLUTIONS,
  BUDGET_LINE_REQUIRED_CSV_COLUMNS,
  PROCORE_CSV_COLUMN_MAP,
  PROCORE_COST_TYPE_MAP,
} from '../../index.js';

describe('P3-E4-T02 contract stability', () => {
  it('locks COST_TYPES to exactly 5 values', () => {
    expect(COST_TYPES).toEqual(['Labor', 'Material', 'Equipment', 'Subcontract', 'Other']);
    expect(COST_TYPES).toHaveLength(5);
  });

  it('locks EXTERNAL_SOURCE_SYSTEMS to exactly 2 values', () => {
    expect(EXTERNAL_SOURCE_SYSTEMS).toEqual(['procore', 'manual']);
    expect(EXTERNAL_SOURCE_SYSTEMS).toHaveLength(2);
  });

  it('locks RECONCILIATION_CONDITION_STATUSES to exactly 3 values', () => {
    expect(RECONCILIATION_CONDITION_STATUSES).toEqual(['Pending', 'Resolved', 'Dismissed']);
    expect(RECONCILIATION_CONDITION_STATUSES).toHaveLength(3);
  });

  it('locks RECONCILIATION_RESOLUTIONS to exactly 2 values', () => {
    expect(RECONCILIATION_RESOLUTIONS).toEqual(['MergedInto', 'CreatedNew']);
    expect(RECONCILIATION_RESOLUTIONS).toHaveLength(2);
  });

  it('locks BUDGET_LINE_REQUIRED_CSV_COLUMNS to exactly 5 values', () => {
    expect(BUDGET_LINE_REQUIRED_CSV_COLUMNS).toHaveLength(5);
    expect(BUDGET_LINE_REQUIRED_CSV_COLUMNS).toContain('budgetCode');
    expect(BUDGET_LINE_REQUIRED_CSV_COLUMNS).toContain('originalBudget');
  });

  it('PROCORE_CSV_COLUMN_MAP maps Direct Costs to jobToDateActualCost', () => {
    expect(PROCORE_CSV_COLUMN_MAP['Direct Costs']).toBe('jobToDateActualCost');
  });

  it('PROCORE_CSV_COLUMN_MAP has expected column count', () => {
    expect(Object.keys(PROCORE_CSV_COLUMN_MAP)).toHaveLength(15);
  });

  it('PROCORE_COST_TYPE_MAP maps all Procore prefixes', () => {
    expect(PROCORE_COST_TYPE_MAP['LAB']).toBe('Labor');
    expect(PROCORE_COST_TYPE_MAP['LBN']).toBe('Labor');
    expect(PROCORE_COST_TYPE_MAP['MAT']).toBe('Material');
    expect(PROCORE_COST_TYPE_MAP['EQU']).toBe('Equipment');
    expect(PROCORE_COST_TYPE_MAP['SUB']).toBe('Subcontract');
    expect(PROCORE_COST_TYPE_MAP['OTH']).toBe('Other');
    expect(Object.keys(PROCORE_COST_TYPE_MAP)).toHaveLength(6);
  });
});
