import { describe, expect, it } from 'vitest';

import {
  CHANGE_LEDGER_SCOPE,
  CHANGE_EVENT_STATUSES,
  TERMINAL_CHANGE_EVENT_STATUSES,
  CHANGE_EVENT_ORIGINS,
  CHANGE_LINE_ITEM_TYPES,
  CHANGE_INTEGRATION_MODES,
  PROCORE_SYNC_STATES,
  COST_CONFIDENCE_LEVELS,
  CHANGE_EVENT_IMMUTABLE_FIELDS,
  VALID_CHANGE_EVENT_TRANSITIONS,
  CHANGE_EVENT_STATUS_LABELS,
  CHANGE_EVENT_ORIGIN_LABELS,
  CHANGE_LINE_ITEM_TYPE_LABELS,
  PROCORE_SYNC_STATE_LABELS,
} from '../../index.js';

describe('P3-E6-T04 contract stability', () => {
  it('CHANGE_LEDGER_SCOPE is "constraints/change-ledger"', () => {
    expect(CHANGE_LEDGER_SCOPE).toBe('constraints/change-ledger');
  });

  it('locks CHANGE_EVENT_STATUSES to exactly 9 values', () => {
    expect(CHANGE_EVENT_STATUSES).toEqual([
      'Identified', 'UnderAnalysis', 'PendingApproval', 'Approved', 'Rejected',
      'Closed', 'Void', 'Cancelled', 'Superseded',
    ]);
    expect(CHANGE_EVENT_STATUSES).toHaveLength(9);
  });

  it('locks TERMINAL_CHANGE_EVENT_STATUSES to exactly 4 values', () => {
    expect(TERMINAL_CHANGE_EVENT_STATUSES).toEqual(['Closed', 'Void', 'Cancelled', 'Superseded']);
    expect(TERMINAL_CHANGE_EVENT_STATUSES).toHaveLength(4);
  });

  it('locks CHANGE_EVENT_ORIGINS to exactly 10 values', () => {
    expect(CHANGE_EVENT_ORIGINS).toHaveLength(10);
  });

  it('locks CHANGE_LINE_ITEM_TYPES to exactly 5 values', () => {
    expect(CHANGE_LINE_ITEM_TYPES).toEqual(['Labor', 'Material', 'Equipment', 'Subcontract', 'Other']);
    expect(CHANGE_LINE_ITEM_TYPES).toHaveLength(5);
  });

  it('locks CHANGE_INTEGRATION_MODES to exactly 2 values', () => {
    expect(CHANGE_INTEGRATION_MODES).toEqual(['ManualNative', 'IntegratedWithProcore']);
    expect(CHANGE_INTEGRATION_MODES).toHaveLength(2);
  });

  it('locks PROCORE_SYNC_STATES to exactly 4 values', () => {
    expect(PROCORE_SYNC_STATES).toHaveLength(4);
  });

  it('locks COST_CONFIDENCE_LEVELS to exactly 3 values', () => {
    expect(COST_CONFIDENCE_LEVELS).toEqual(['Rough', 'Ordered', 'Definitive']);
    expect(COST_CONFIDENCE_LEVELS).toHaveLength(3);
  });

  it('locks CHANGE_EVENT_IMMUTABLE_FIELDS to exactly 9 fields', () => {
    expect(CHANGE_EVENT_IMMUTABLE_FIELDS).toHaveLength(9);
  });

  it('VALID_CHANGE_EVENT_TRANSITIONS has entries for all 9 statuses', () => {
    const keys = Object.keys(VALID_CHANGE_EVENT_TRANSITIONS);
    expect(keys).toHaveLength(9);
    for (const status of CHANGE_EVENT_STATUSES) {
      expect(keys).toContain(status);
    }
  });

  it('terminal statuses have empty transition arrays', () => {
    for (const status of TERMINAL_CHANGE_EVENT_STATUSES) {
      expect(VALID_CHANGE_EVENT_TRANSITIONS[status]).toEqual([]);
    }
  });

  it('Rejected allows resubmission to UnderAnalysis', () => {
    expect(VALID_CHANGE_EVENT_TRANSITIONS['Rejected']).toContain('UnderAnalysis');
  });

  it('all label maps are complete', () => {
    for (const s of CHANGE_EVENT_STATUSES) expect(CHANGE_EVENT_STATUS_LABELS[s]).toBeTruthy();
    for (const o of CHANGE_EVENT_ORIGINS) expect(CHANGE_EVENT_ORIGIN_LABELS[o]).toBeTruthy();
    for (const t of CHANGE_LINE_ITEM_TYPES) expect(CHANGE_LINE_ITEM_TYPE_LABELS[t]).toBeTruthy();
    for (const s of PROCORE_SYNC_STATES) expect(PROCORE_SYNC_STATE_LABELS[s]).toBeTruthy();
  });
});
