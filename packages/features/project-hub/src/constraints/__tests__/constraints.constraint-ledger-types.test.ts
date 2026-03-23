import { describe, expect, it } from 'vitest';

import {
  CONSTRAINT_LEDGER_SCOPE,
  CONSTRAINT_STATUSES,
  TERMINAL_CONSTRAINT_STATUSES,
  CONSTRAINT_CATEGORIES,
  CONSTRAINT_PRIORITY_LEVELS,
  CONSTRAINT_IMMUTABLE_FIELDS,
  VALID_CONSTRAINT_TRANSITIONS,
  CONSTRAINT_PRIORITY_LABELS,
  CONSTRAINT_CATEGORY_LABELS,
} from '../../index.js';

describe('P3-E6-T02 contract stability', () => {
  it('CONSTRAINT_LEDGER_SCOPE is "constraints/constraint-ledger"', () => {
    expect(CONSTRAINT_LEDGER_SCOPE).toBe('constraints/constraint-ledger');
  });

  it('locks CONSTRAINT_STATUSES to exactly 7 values', () => {
    expect(CONSTRAINT_STATUSES).toEqual([
      'Identified',
      'UnderAction',
      'Pending',
      'Resolved',
      'Void',
      'Cancelled',
      'Superseded',
    ]);
    expect(CONSTRAINT_STATUSES).toHaveLength(7);
  });

  it('locks TERMINAL_CONSTRAINT_STATUSES to exactly 4 values', () => {
    expect(TERMINAL_CONSTRAINT_STATUSES).toEqual(['Resolved', 'Void', 'Cancelled', 'Superseded']);
    expect(TERMINAL_CONSTRAINT_STATUSES).toHaveLength(4);
  });

  it('locks CONSTRAINT_CATEGORIES to exactly 26 values', () => {
    expect(CONSTRAINT_CATEGORIES).toEqual([
      'DESIGN',
      'PERMITS',
      'PROCUREMENT',
      'LABOR',
      'WEATHER',
      'SAFETY',
      'QUALITY',
      'SCHEDULE',
      'COST',
      'ENVIRONMENTAL',
      'EQUIPMENT',
      'COMMUNICATION',
      'SITE_ACCESS',
      'UTILITIES',
      'GEOTECHNICAL',
      'LEGAL',
      'TECHNOLOGY',
      'SECURITY',
      'SUBCONTRACTOR',
      'INSPECTIONS',
      'LOGISTICS',
      'STAKEHOLDER',
      'OWNER_REQUIREMENTS',
      'CHANGE_MANAGEMENT',
      'PUBLIC_WORKS',
      'OTHER',
    ]);
    expect(CONSTRAINT_CATEGORIES).toHaveLength(26);
  });

  it('locks CONSTRAINT_PRIORITY_LEVELS to exactly 4 values', () => {
    expect(CONSTRAINT_PRIORITY_LEVELS).toEqual([1, 2, 3, 4]);
    expect(CONSTRAINT_PRIORITY_LEVELS).toHaveLength(4);
  });

  it('locks CONSTRAINT_IMMUTABLE_FIELDS to exactly 9 fields', () => {
    expect(CONSTRAINT_IMMUTABLE_FIELDS).toEqual([
      'constraintId',
      'projectId',
      'constraintNumber',
      'category',
      'dateIdentified',
      'identifiedBy',
      'parentRiskId',
      'createdAt',
      'createdBy',
    ]);
    expect(CONSTRAINT_IMMUTABLE_FIELDS).toHaveLength(9);
  });

  it('VALID_CONSTRAINT_TRANSITIONS has entries for all 7 statuses', () => {
    const keys = Object.keys(VALID_CONSTRAINT_TRANSITIONS);
    expect(keys).toHaveLength(7);
    for (const status of CONSTRAINT_STATUSES) {
      expect(keys).toContain(status);
    }
  });

  it('terminal statuses have empty transition arrays', () => {
    for (const status of TERMINAL_CONSTRAINT_STATUSES) {
      expect(VALID_CONSTRAINT_TRANSITIONS[status]).toEqual([]);
    }
  });

  it('non-terminal statuses have at least one valid transition', () => {
    const nonTerminal = CONSTRAINT_STATUSES.filter(
      (s) => !(TERMINAL_CONSTRAINT_STATUSES as readonly string[]).includes(s),
    );
    for (const status of nonTerminal) {
      expect(VALID_CONSTRAINT_TRANSITIONS[status].length).toBeGreaterThan(0);
    }
  });

  it('CONSTRAINT_PRIORITY_LABELS has labels for all 4 levels', () => {
    for (const level of CONSTRAINT_PRIORITY_LEVELS) {
      expect(CONSTRAINT_PRIORITY_LABELS[level]).toBeTruthy();
    }
  });

  it('CONSTRAINT_CATEGORY_LABELS has labels for all 26 categories', () => {
    for (const category of CONSTRAINT_CATEGORIES) {
      expect(CONSTRAINT_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});
