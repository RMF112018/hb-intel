import { describe, expect, it } from 'vitest';

import {
  DELAY_LEDGER_SCOPE,
  DELAY_STATUSES,
  TERMINAL_DELAY_STATUSES,
  DELAY_EVENT_TYPES,
  RESPONSIBLE_PARTIES,
  CRITICAL_PATH_IMPACTS,
  ANALYSIS_METHODS,
  EVIDENCE_TYPES,
  QUANTIFICATION_CONFIDENCE_LEVELS,
  DISPOSITION_OUTCOMES,
  SCHEDULE_REFERENCE_MODES,
  DELAY_IMMUTABLE_FIELDS,
  VALID_DELAY_TRANSITIONS,
  DEFAULT_NOTIFICATION_THRESHOLD_DAYS,
  DELAY_EVENT_TYPE_LABELS,
  RESPONSIBLE_PARTY_LABELS,
  CRITICAL_PATH_IMPACT_LABELS,
  ANALYSIS_METHOD_LABELS,
  EVIDENCE_TYPE_LABELS,
  DISPOSITION_OUTCOME_LABELS,
} from '../../index.js';

describe('P3-E6-T03 contract stability', () => {
  it('DELAY_LEDGER_SCOPE is "constraints/delay-ledger"', () => {
    expect(DELAY_LEDGER_SCOPE).toBe('constraints/delay-ledger');
  });

  it('locks DELAY_STATUSES to exactly 7 values', () => {
    expect(DELAY_STATUSES).toEqual([
      'Identified', 'UnderAnalysis', 'Quantified', 'Dispositioned', 'Closed', 'Void', 'Cancelled',
    ]);
    expect(DELAY_STATUSES).toHaveLength(7);
  });

  it('locks TERMINAL_DELAY_STATUSES to exactly 3 values', () => {
    expect(TERMINAL_DELAY_STATUSES).toEqual(['Closed', 'Void', 'Cancelled']);
    expect(TERMINAL_DELAY_STATUSES).toHaveLength(3);
  });

  it('locks DELAY_EVENT_TYPES to exactly 12 values', () => {
    expect(DELAY_EVENT_TYPES).toHaveLength(12);
  });

  it('locks RESPONSIBLE_PARTIES to exactly 7 values', () => {
    expect(RESPONSIBLE_PARTIES).toHaveLength(7);
  });

  it('locks CRITICAL_PATH_IMPACTS to exactly 4 values', () => {
    expect(CRITICAL_PATH_IMPACTS).toEqual(['CRITICAL', 'NEAR_CRITICAL', 'NON_CRITICAL', 'UNKNOWN']);
    expect(CRITICAL_PATH_IMPACTS).toHaveLength(4);
  });

  it('locks ANALYSIS_METHODS to exactly 7 values', () => {
    expect(ANALYSIS_METHODS).toHaveLength(7);
  });

  it('locks EVIDENCE_TYPES to exactly 9 values', () => {
    expect(EVIDENCE_TYPES).toHaveLength(9);
  });

  it('locks QUANTIFICATION_CONFIDENCE_LEVELS to exactly 3 values', () => {
    expect(QUANTIFICATION_CONFIDENCE_LEVELS).toEqual(['Rough', 'Ordered', 'Definitive']);
    expect(QUANTIFICATION_CONFIDENCE_LEVELS).toHaveLength(3);
  });

  it('locks DISPOSITION_OUTCOMES to exactly 5 values', () => {
    expect(DISPOSITION_OUTCOMES).toHaveLength(5);
  });

  it('locks SCHEDULE_REFERENCE_MODES to exactly 2 values', () => {
    expect(SCHEDULE_REFERENCE_MODES).toEqual(['Integrated', 'ManualFallback']);
    expect(SCHEDULE_REFERENCE_MODES).toHaveLength(2);
  });

  it('locks DELAY_IMMUTABLE_FIELDS to exactly 10 fields', () => {
    expect(DELAY_IMMUTABLE_FIELDS).toHaveLength(10);
  });

  it('VALID_DELAY_TRANSITIONS has entries for all 7 statuses', () => {
    const keys = Object.keys(VALID_DELAY_TRANSITIONS);
    expect(keys).toHaveLength(7);
    for (const status of DELAY_STATUSES) {
      expect(keys).toContain(status);
    }
  });

  it('terminal statuses have empty transition arrays', () => {
    for (const status of TERMINAL_DELAY_STATUSES) {
      expect(VALID_DELAY_TRANSITIONS[status]).toEqual([]);
    }
  });

  it('DEFAULT_NOTIFICATION_THRESHOLD_DAYS is 7', () => {
    expect(DEFAULT_NOTIFICATION_THRESHOLD_DAYS).toBe(7);
  });

  it('all label maps are complete', () => {
    for (const t of DELAY_EVENT_TYPES) expect(DELAY_EVENT_TYPE_LABELS[t]).toBeTruthy();
    for (const p of RESPONSIBLE_PARTIES) expect(RESPONSIBLE_PARTY_LABELS[p]).toBeTruthy();
    for (const c of CRITICAL_PATH_IMPACTS) expect(CRITICAL_PATH_IMPACT_LABELS[c]).toBeTruthy();
    for (const m of ANALYSIS_METHODS) expect(ANALYSIS_METHOD_LABELS[m]).toBeTruthy();
    for (const e of EVIDENCE_TYPES) expect(EVIDENCE_TYPE_LABELS[e]).toBeTruthy();
    for (const d of DISPOSITION_OUTCOMES) expect(DISPOSITION_OUTCOME_LABELS[d]).toBeTruthy();
  });
});
