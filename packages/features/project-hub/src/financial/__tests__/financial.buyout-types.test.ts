import { describe, expect, it } from 'vitest';

import {
  BUYOUT_LINE_STATUSES,
  BUYOUT_SAVINGS_DESTINATIONS,
  BUYOUT_SAVINGS_DISPOSITION_STATUSES,
  BUYOUT_IN_PROGRESS_STATUSES,
  BUYOUT_RECONCILIATION_TOLERANCE,
} from '../../index.js';

describe('P3-E4-T06 buyout contract stability', () => {
  it('locks BUYOUT_LINE_STATUSES to exactly 7 values', () => {
    expect(BUYOUT_LINE_STATUSES).toEqual([
      'NotStarted', 'LoiPending', 'LoiExecuted', 'ContractPending',
      'ContractExecuted', 'Complete', 'Void',
    ]);
    expect(BUYOUT_LINE_STATUSES).toHaveLength(7);
  });

  it('locks BUYOUT_SAVINGS_DESTINATIONS to exactly 3 values', () => {
    expect(BUYOUT_SAVINGS_DESTINATIONS).toEqual([
      'AppliedToForecast', 'HeldInContingency', 'ReleasedToGoverned',
    ]);
    expect(BUYOUT_SAVINGS_DESTINATIONS).toHaveLength(3);
  });

  it('locks BUYOUT_SAVINGS_DISPOSITION_STATUSES to exactly 4 values', () => {
    expect(BUYOUT_SAVINGS_DISPOSITION_STATUSES).toEqual([
      'NoSavings', 'Undispositioned', 'PartiallyDispositioned', 'FullyDispositioned',
    ]);
    expect(BUYOUT_SAVINGS_DISPOSITION_STATUSES).toHaveLength(4);
  });

  it('BUYOUT_IN_PROGRESS_STATUSES contains 4 statuses', () => {
    expect(BUYOUT_IN_PROGRESS_STATUSES).toHaveLength(4);
    expect(BUYOUT_IN_PROGRESS_STATUSES).toContain('LoiPending');
    expect(BUYOUT_IN_PROGRESS_STATUSES).toContain('ContractExecuted');
  });

  it('BUYOUT_RECONCILIATION_TOLERANCE is 5%', () => {
    expect(BUYOUT_RECONCILIATION_TOLERANCE).toBe(0.05);
  });
});
