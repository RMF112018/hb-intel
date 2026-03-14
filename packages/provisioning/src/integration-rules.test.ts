import { describe, expect, it } from 'vitest';

import {
  PROJECT_SETUP_INTEGRATION_RULES,
  getIntegrationRule,
} from './integration-rules.js';

describe('PROJECT_SETUP_INTEGRATION_RULES', () => {
  it('contains exactly 7 rules', () => {
    expect(PROJECT_SETUP_INTEGRATION_RULES).toHaveLength(7);
  });

  it('every rule has a unique ruleId', () => {
    const ids = PROJECT_SETUP_INTEGRATION_RULES.map((r) => r.ruleId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every ruleId matches the IR-## format', () => {
    for (const rule of PROJECT_SETUP_INTEGRATION_RULES) {
      expect(rule.ruleId).toMatch(/^IR-\d{2}$/);
    }
  });

  it('every rule has non-empty rule, antiPattern, and correctPattern', () => {
    for (const rule of PROJECT_SETUP_INTEGRATION_RULES) {
      expect(rule.rule.length).toBeGreaterThan(0);
      expect(rule.antiPattern.length).toBeGreaterThan(0);
      expect(rule.correctPattern.length).toBeGreaterThan(0);
    }
  });

  it('every rule has non-empty title and package references', () => {
    for (const rule of PROJECT_SETUP_INTEGRATION_RULES) {
      expect(rule.title.length).toBeGreaterThan(0);
      expect(rule.packageA.length).toBeGreaterThan(0);
      expect(rule.packageB.length).toBeGreaterThan(0);
    }
  });
});

describe('getIntegrationRule', () => {
  it('returns the correct rule by ID', () => {
    const rule = getIntegrationRule('IR-01');
    expect(rule).toBeDefined();
    expect(rule!.title).toBe('Draft Cleared Only on API Success');
  });

  it('returns undefined for nonexistent ID', () => {
    expect(getIntegrationRule('IR-99')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getIntegrationRule('')).toBeUndefined();
  });
});
