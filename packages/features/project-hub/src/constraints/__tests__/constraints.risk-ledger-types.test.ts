import { describe, expect, it } from 'vitest';

import {
  CONSTRAINTS_MODULE_SCOPE,
  RISK_LEDGER_SCOPE,
  RISK_STATUSES,
  TERMINAL_RISK_STATUSES,
  RISK_CATEGORIES,
  RISK_PROBABILITY_LEVELS,
  RISK_IMPACT_LEVELS,
  RISK_IMMUTABLE_FIELDS,
  VALID_RISK_TRANSITIONS,
  DEFAULT_HIGH_RISK_SCORE_THRESHOLD,
  RISK_PROBABILITY_LABELS,
  RISK_IMPACT_LABELS,
  RISK_CATEGORY_LABELS,
} from '../../index.js';

describe('P3-E6-T01 contract stability', () => {
  it('CONSTRAINTS_MODULE_SCOPE is "constraints"', () => {
    expect(CONSTRAINTS_MODULE_SCOPE).toBe('constraints');
  });

  it('RISK_LEDGER_SCOPE is "constraints/risk-ledger"', () => {
    expect(RISK_LEDGER_SCOPE).toBe('constraints/risk-ledger');
  });

  it('locks RISK_STATUSES to exactly 8 values', () => {
    expect(RISK_STATUSES).toEqual([
      'Identified',
      'UnderAssessment',
      'Mitigated',
      'Accepted',
      'MaterializationPending',
      'Closed',
      'Void',
      'Cancelled',
    ]);
    expect(RISK_STATUSES).toHaveLength(8);
  });

  it('locks TERMINAL_RISK_STATUSES to exactly 3 values', () => {
    expect(TERMINAL_RISK_STATUSES).toEqual(['Closed', 'Void', 'Cancelled']);
    expect(TERMINAL_RISK_STATUSES).toHaveLength(3);
  });

  it('locks RISK_CATEGORIES to exactly 16 values', () => {
    expect(RISK_CATEGORIES).toEqual([
      'SITE_CONDITIONS',
      'DESIGN',
      'PERMITS_REGULATORY',
      'PROCUREMENT',
      'LABOR',
      'SUBCONTRACTOR',
      'WEATHER_ENVIRONMENTAL',
      'FINANCIAL',
      'SCHEDULE',
      'SCOPE',
      'STAKEHOLDER',
      'SAFETY_HEALTH',
      'LEGAL_CONTRACTUAL',
      'TECHNOLOGY',
      'FORCE_MAJEURE',
      'OTHER',
    ]);
    expect(RISK_CATEGORIES).toHaveLength(16);
  });

  it('locks RISK_PROBABILITY_LEVELS to exactly 5 values', () => {
    expect(RISK_PROBABILITY_LEVELS).toEqual([1, 2, 3, 4, 5]);
    expect(RISK_PROBABILITY_LEVELS).toHaveLength(5);
  });

  it('locks RISK_IMPACT_LEVELS to exactly 5 values', () => {
    expect(RISK_IMPACT_LEVELS).toEqual([1, 2, 3, 4, 5]);
    expect(RISK_IMPACT_LEVELS).toHaveLength(5);
  });

  it('locks RISK_IMMUTABLE_FIELDS to exactly 8 fields', () => {
    expect(RISK_IMMUTABLE_FIELDS).toEqual([
      'riskId',
      'projectId',
      'riskNumber',
      'category',
      'dateIdentified',
      'identifiedBy',
      'createdAt',
      'createdBy',
    ]);
    expect(RISK_IMMUTABLE_FIELDS).toHaveLength(8);
  });

  it('VALID_RISK_TRANSITIONS has entries for all 8 statuses', () => {
    const keys = Object.keys(VALID_RISK_TRANSITIONS);
    expect(keys).toHaveLength(8);
    for (const status of RISK_STATUSES) {
      expect(keys).toContain(status);
    }
  });

  it('terminal statuses have empty transition arrays', () => {
    for (const status of TERMINAL_RISK_STATUSES) {
      expect(VALID_RISK_TRANSITIONS[status]).toEqual([]);
    }
  });

  it('non-terminal statuses have at least one valid transition', () => {
    const nonTerminal = RISK_STATUSES.filter(
      (s) => !(TERMINAL_RISK_STATUSES as readonly string[]).includes(s),
    );
    for (const status of nonTerminal) {
      expect(VALID_RISK_TRANSITIONS[status].length).toBeGreaterThan(0);
    }
  });

  it('DEFAULT_HIGH_RISK_SCORE_THRESHOLD is 15', () => {
    expect(DEFAULT_HIGH_RISK_SCORE_THRESHOLD).toBe(15);
  });

  it('RISK_PROBABILITY_LABELS has labels for all 5 levels', () => {
    for (const level of RISK_PROBABILITY_LEVELS) {
      expect(RISK_PROBABILITY_LABELS[level]).toBeTruthy();
    }
  });

  it('RISK_IMPACT_LABELS has labels for all 5 levels', () => {
    for (const level of RISK_IMPACT_LEVELS) {
      expect(RISK_IMPACT_LABELS[level]).toBeTruthy();
    }
  });

  it('RISK_CATEGORY_LABELS has labels for all 16 categories', () => {
    for (const category of RISK_CATEGORIES) {
      expect(RISK_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});
