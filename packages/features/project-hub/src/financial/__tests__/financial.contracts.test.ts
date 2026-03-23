import { describe, expect, it } from 'vitest';

import {
  FINANCIAL_MODULE_SCOPE,
  FINANCIAL_VERSION_STATES,
  FINANCIAL_AUTHORITY_ROLES,
  FINANCIAL_ACCESS_ACTIONS,
  FINANCIAL_INTEGRATION_BOUNDARIES,
  FINANCIAL_GOVERNANCE_SCOPE,
  FINANCIAL_INTEGRATIONS_SCOPE,
} from '../../index.js';

describe('P3-E4-T01 contract stability', () => {
  it('FINANCIAL_MODULE_SCOPE is "financial"', () => {
    expect(FINANCIAL_MODULE_SCOPE).toBe('financial');
  });

  it('FINANCIAL_GOVERNANCE_SCOPE is "financial/governance"', () => {
    expect(FINANCIAL_GOVERNANCE_SCOPE).toBe('financial/governance');
  });

  it('FINANCIAL_INTEGRATIONS_SCOPE is "financial/integrations"', () => {
    expect(FINANCIAL_INTEGRATIONS_SCOPE).toBe('financial/integrations');
  });

  it('locks FINANCIAL_VERSION_STATES to exactly 4 values', () => {
    expect(FINANCIAL_VERSION_STATES).toEqual([
      'Working',
      'ConfirmedInternal',
      'PublishedMonthly',
      'Superseded',
    ]);
    expect(FINANCIAL_VERSION_STATES).toHaveLength(4);
  });

  it('locks FINANCIAL_AUTHORITY_ROLES to exactly 3 values', () => {
    expect(FINANCIAL_AUTHORITY_ROLES).toEqual(['PM', 'PER', 'Leadership']);
    expect(FINANCIAL_AUTHORITY_ROLES).toHaveLength(3);
  });

  it('locks FINANCIAL_ACCESS_ACTIONS to exactly 5 values', () => {
    expect(FINANCIAL_ACCESS_ACTIONS).toEqual([
      'read',
      'write',
      'annotate',
      'derive',
      'designate-report-candidate',
    ]);
    expect(FINANCIAL_ACCESS_ACTIONS).toHaveLength(5);
  });

  it('locks FINANCIAL_INTEGRATION_BOUNDARIES to exactly 5 entries', () => {
    expect(FINANCIAL_INTEGRATION_BOUNDARIES).toHaveLength(5);
  });

  it('each integration boundary has required fields populated', () => {
    for (const boundary of FINANCIAL_INTEGRATION_BOUNDARIES) {
      expect(boundary.key).toBeTruthy();
      expect(boundary.direction).toMatch(/^(inbound|outbound)$/);
      expect(boundary.source).toBeTruthy();
      expect(boundary.target).toBeTruthy();
      expect(boundary.description).toBeTruthy();
      expect(boundary.status).toMatch(/^(active|planned)$/);
    }
  });

  it('inbound boundaries have correct source/target direction', () => {
    const inbound = FINANCIAL_INTEGRATION_BOUNDARIES.filter((b) => b.direction === 'inbound');
    expect(inbound).toHaveLength(2);
    for (const boundary of inbound) {
      expect(boundary.target).toBe('Financial');
    }
  });

  it('outbound boundaries have correct source/target direction', () => {
    const outbound = FINANCIAL_INTEGRATION_BOUNDARIES.filter((b) => b.direction === 'outbound');
    expect(outbound).toHaveLength(3);
    for (const boundary of outbound) {
      expect(boundary.source).toBe('Financial');
    }
  });

  it('only procore-budget-import is active; others are planned', () => {
    const active = FINANCIAL_INTEGRATION_BOUNDARIES.filter((b) => b.status === 'active');
    expect(active).toHaveLength(1);
    expect(active[0].key).toBe('procore-budget-import');
  });
});
