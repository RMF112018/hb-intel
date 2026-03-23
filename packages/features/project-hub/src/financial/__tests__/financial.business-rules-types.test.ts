import { describe, expect, it } from 'vitest';

import {
  SIGN_CONVENTION_RULES,
  DISPLAY_PRECISION_CURRENCY,
  DISPLAY_PRECISION_PERCENT,
  FTC_OVER_BUDGET_WARNING_THRESHOLD,
  PROFIT_MARGIN_WARNING_THRESHOLD,
  PROFIT_MARGIN_CRITICAL_THRESHOLD,
} from '../../index.js';

describe('P3-E4-T07 business rules contract stability', () => {
  it('SIGN_CONVENTION_RULES covers exactly 5 domains', () => {
    expect(SIGN_CONVENTION_RULES).toHaveLength(5);
    const domains = SIGN_CONVENTION_RULES.map((r) => r.domain);
    expect(domains).toContain('budgetLine');
    expect(domains).toContain('gcgr');
    expect(domains).toContain('buyout');
    expect(domains).toContain('profit');
    expect(domains).toContain('cashFlow');
  });

  it('budgetLine uses budget-minus-cost (positive = favorable)', () => {
    const rule = SIGN_CONVENTION_RULES.find((r) => r.domain === 'budgetLine')!;
    expect(rule.direction).toBe('budget-minus-cost');
    expect(rule.positiveColor).toBe('green');
    expect(rule.negativeColor).toBe('red');
  });

  it('gcgr and buyout use cost-minus-budget (positive = unfavorable)', () => {
    const gcgr = SIGN_CONVENTION_RULES.find((r) => r.domain === 'gcgr')!;
    const buyout = SIGN_CONVENTION_RULES.find((r) => r.domain === 'buyout')!;
    expect(gcgr.direction).toBe('cost-minus-budget');
    expect(gcgr.positiveColor).toBe('red');
    expect(buyout.direction).toBe('cost-minus-budget');
    expect(buyout.positiveColor).toBe('red');
  });

  it('DISPLAY_PRECISION_CURRENCY is 2', () => {
    expect(DISPLAY_PRECISION_CURRENCY).toBe(2);
  });

  it('DISPLAY_PRECISION_PERCENT is 2', () => {
    expect(DISPLAY_PRECISION_PERCENT).toBe(2);
  });

  it('FTC_OVER_BUDGET_WARNING_THRESHOLD is 1.10', () => {
    expect(FTC_OVER_BUDGET_WARNING_THRESHOLD).toBe(1.10);
  });

  it('PROFIT_MARGIN_WARNING_THRESHOLD is 5', () => {
    expect(PROFIT_MARGIN_WARNING_THRESHOLD).toBe(5);
  });

  it('PROFIT_MARGIN_CRITICAL_THRESHOLD is 0', () => {
    expect(PROFIT_MARGIN_CRITICAL_THRESHOLD).toBe(0);
  });
});
