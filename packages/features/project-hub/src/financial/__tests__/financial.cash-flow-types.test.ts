import { describe, expect, it } from 'vitest';

import {
  CASH_FLOW_RECORD_TYPES,
  CASH_FLOW_ACTUAL_MONTHS,
  CASH_FLOW_FORECAST_MONTHS,
  DEFAULT_RETAINAGE_RATE,
  AR_AGING_BUCKETS,
} from '../../index.js';

describe('P3-E4-T05 cash flow contract stability', () => {
  it('locks CASH_FLOW_RECORD_TYPES to exactly 2 values', () => {
    expect(CASH_FLOW_RECORD_TYPES).toEqual(['Actual', 'Forecast']);
    expect(CASH_FLOW_RECORD_TYPES).toHaveLength(2);
  });

  it('CASH_FLOW_ACTUAL_MONTHS is 13', () => {
    expect(CASH_FLOW_ACTUAL_MONTHS).toBe(13);
  });

  it('CASH_FLOW_FORECAST_MONTHS is 18', () => {
    expect(CASH_FLOW_FORECAST_MONTHS).toBe(18);
  });

  it('DEFAULT_RETAINAGE_RATE is 10%', () => {
    expect(DEFAULT_RETAINAGE_RATE).toBe(0.10);
  });

  it('locks AR_AGING_BUCKETS to exactly 4 values', () => {
    expect(AR_AGING_BUCKETS).toEqual([
      'current0To30',
      'current30To60',
      'current60To90',
      'current90Plus',
    ]);
    expect(AR_AGING_BUCKETS).toHaveLength(4);
  });
});
