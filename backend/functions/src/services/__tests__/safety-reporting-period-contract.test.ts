import { describe, expect, it } from 'vitest';
import {
  ReportingPeriodContractError,
  normalizeReportingPeriodContract,
} from '../safety-reporting-period-contract.js';

describe('normalizeReportingPeriodContract', () => {
  it('accepts canonical period-{id} and returns normalized pair', () => {
    const normalized = normalizeReportingPeriodContract({
      reportingPeriodId: 'period-14',
    });

    expect(normalized.reportingPeriodId).toBe('period-14');
    expect(normalized.reportingPeriodSpItemId).toBe(14);
  });

  it('accepts matching reportingPeriodSpItemId companion', () => {
    const normalized = normalizeReportingPeriodContract({
      reportingPeriodId: 'period-27',
      reportingPeriodSpItemId: 27,
    });

    expect(normalized.reportingPeriodId).toBe('period-27');
    expect(normalized.reportingPeriodSpItemId).toBe(27);
  });

  it('throws explicit contract error for malformed reportingPeriodId', () => {
    expect(() => normalizeReportingPeriodContract({
      reportingPeriodId: '27',
    })).toThrowError(ReportingPeriodContractError);

    try {
      normalizeReportingPeriodContract({ reportingPeriodId: '27' });
      throw new Error('expected contract error');
    } catch (err) {
      expect(err).toBeInstanceOf(ReportingPeriodContractError);
      const contractErr = err as ReportingPeriodContractError;
      expect(contractErr.code).toBe('SAFETY_REPORTING_PERIOD_ID_INVALID');
    }
  });

  it('throws explicit contract error when companion ID mismatches', () => {
    expect(() => normalizeReportingPeriodContract({
      reportingPeriodId: 'period-8',
      reportingPeriodSpItemId: 9,
    })).toThrowError(ReportingPeriodContractError);

    try {
      normalizeReportingPeriodContract({
        reportingPeriodId: 'period-8',
        reportingPeriodSpItemId: 9,
      });
      throw new Error('expected contract error');
    } catch (err) {
      expect(err).toBeInstanceOf(ReportingPeriodContractError);
      const contractErr = err as ReportingPeriodContractError;
      expect(contractErr.code).toBe('SAFETY_REPORTING_PERIOD_ID_MISMATCH');
      expect(contractErr.details.parsedFromId).toBe(8);
      expect(contractErr.details.reportingPeriodSpItemId).toBe(9);
    }
  });
});
