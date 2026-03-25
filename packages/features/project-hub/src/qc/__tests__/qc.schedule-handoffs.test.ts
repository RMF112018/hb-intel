import { describe, expect, it } from 'vitest';
import {
  isScheduleRefReadOnly,
  isQcScheduleAuthoritative,
  canQcWriteScheduleRecords,
  canQcOwnFieldExecution,
  isHandoffPreservedThroughSnapshot,
  isDeferredToPhase6,
  isBaselineVisibleInPhase3,
  doesHandoffViolateDownstreamBoundary,
  canQcOwnPunchWorkflow,
  canQcOwnCommissioning,
  canQcOwnWarrantyCaseExecution,
  isReadinessSignalValid,
  getHandoffContentForTarget,
  isRecordScheduleAware,
  canQcExpandIntoFieldMobileExecution,
} from '../../index.js';

describe('QC schedule-handoffs business rules', () => {
  describe('schedule reference rules', () => {
    it('isScheduleRefReadOnly returns true', () => {
      expect(isScheduleRefReadOnly()).toBe(true);
    });

    it('isQcScheduleAuthoritative returns false', () => {
      expect(isQcScheduleAuthoritative()).toBe(false);
    });

    it('canQcWriteScheduleRecords returns false', () => {
      expect(canQcWriteScheduleRecords()).toBe(false);
    });
  });

  describe('field execution boundary', () => {
    it('canQcOwnFieldExecution returns false', () => {
      expect(canQcOwnFieldExecution()).toBe(false);
    });
  });

  describe('handoff preservation', () => {
    it('isHandoffPreservedThroughSnapshot returns true', () => {
      expect(isHandoffPreservedThroughSnapshot()).toBe(true);
    });
  });

  describe('isDeferredToPhase6', () => {
    it('returns true for DAILY_FIELD_EXECUTION', () => {
      expect(isDeferredToPhase6('DAILY_FIELD_EXECUTION')).toBe(true);
    });

    it('returns true for SHORT_INTERVAL_COMMITMENT', () => {
      expect(isDeferredToPhase6('SHORT_INTERVAL_COMMITMENT')).toBe(true);
    });

    it('returns true for PPC_METRICS', () => {
      expect(isDeferredToPhase6('PPC_METRICS')).toBe(true);
    });

    it('returns true for MOBILE_FIRST_CAPTURE', () => {
      expect(isDeferredToPhase6('MOBILE_FIRST_CAPTURE')).toBe(true);
    });

    it('returns true for OFFLINE_DEFERRED_SYNC', () => {
      expect(isDeferredToPhase6('OFFLINE_DEFERRED_SYNC')).toBe(true);
    });

    it('returns true for FIELD_ORIGINATED_UPDATES', () => {
      expect(isDeferredToPhase6('FIELD_ORIGINATED_UPDATES')).toBe(true);
    });
  });

  describe('isBaselineVisibleInPhase3', () => {
    it('returns true for MILESTONE_ALIGNMENT', () => {
      expect(isBaselineVisibleInPhase3('MILESTONE_ALIGNMENT')).toBe(true);
    });

    it('returns true for UPCOMING_WINDOW_READINESS', () => {
      expect(isBaselineVisibleInPhase3('UPCOMING_WINDOW_READINESS')).toBe(true);
    });

    it('returns true for HOLD_MOCKUP_TEST_DUE_POSTURE', () => {
      expect(isBaselineVisibleInPhase3('HOLD_MOCKUP_TEST_DUE_POSTURE')).toBe(true);
    });

    it('returns true for TURNOVER_QUALITY_READINESS', () => {
      expect(isBaselineVisibleInPhase3('TURNOVER_QUALITY_READINESS')).toBe(true);
    });
  });

  describe('downstream boundary rules', () => {
    it('doesHandoffViolateDownstreamBoundary returns false', () => {
      expect(doesHandoffViolateDownstreamBoundary()).toBe(false);
    });

    it('canQcOwnPunchWorkflow returns false', () => {
      expect(canQcOwnPunchWorkflow()).toBe(false);
    });

    it('canQcOwnCommissioning returns false', () => {
      expect(canQcOwnCommissioning()).toBe(false);
    });

    it('canQcOwnWarrantyCaseExecution returns false', () => {
      expect(canQcOwnWarrantyCaseExecution()).toBe(false);
    });
  });

  describe('isReadinessSignalValid', () => {
    it('returns true for QUALITY_READY', () => {
      expect(isReadinessSignalValid('QUALITY_READY')).toBe(true);
    });

    it('returns true for QUALITY_READY_WITH_CONDITIONS', () => {
      expect(isReadinessSignalValid('QUALITY_READY_WITH_CONDITIONS')).toBe(true);
    });

    it('returns true for QUALITY_AT_RISK', () => {
      expect(isReadinessSignalValid('QUALITY_AT_RISK')).toBe(true);
    });

    it('returns true for QUALITY_BLOCKED', () => {
      expect(isReadinessSignalValid('QUALITY_BLOCKED')).toBe(true);
    });

    it('returns true for QUALITY_RECHECK_REQUIRED', () => {
      expect(isReadinessSignalValid('QUALITY_RECHECK_REQUIRED')).toBe(true);
    });

    it('returns false for INVALID', () => {
      expect(isReadinessSignalValid('INVALID' as never)).toBe(false);
    });
  });

  describe('getHandoffContentForTarget', () => {
    it('CLOSEOUT returns 5 items including TURNOVER_QUALITY_BASIS', () => {
      const result = getHandoffContentForTarget('CLOSEOUT');
      expect(result).toHaveLength(5);
      expect(result).toContain('TURNOVER_QUALITY_BASIS');
    });

    it('STARTUP returns 5 items', () => {
      const result = getHandoffContentForTarget('STARTUP');
      expect(result).toHaveLength(5);
    });

    it('WARRANTY returns 5 items', () => {
      const result = getHandoffContentForTarget('WARRANTY');
      expect(result).toHaveLength(5);
    });

    it('FUTURE_SITE_CONTROLS returns 4 items', () => {
      const result = getHandoffContentForTarget('FUTURE_SITE_CONTROLS');
      expect(result).toHaveLength(4);
    });
  });

  describe('isRecordScheduleAware', () => {
    it('returns true for WORK_PACKAGE_QUALITY_PLAN', () => {
      expect(isRecordScheduleAware('WORK_PACKAGE_QUALITY_PLAN')).toBe(true);
    });

    it('returns true for CONTROL_GATE', () => {
      expect(isRecordScheduleAware('CONTROL_GATE')).toBe(true);
    });

    it('returns true for PRECONSTRUCTION_REVIEW_PACKAGE', () => {
      expect(isRecordScheduleAware('PRECONSTRUCTION_REVIEW_PACKAGE')).toBe(true);
    });

    it('returns true for REVIEW_FINDING', () => {
      expect(isRecordScheduleAware('REVIEW_FINDING')).toBe(true);
    });

    it('returns true for QC_ISSUE', () => {
      expect(isRecordScheduleAware('QC_ISSUE')).toBe(true);
    });

    it('returns true for CORRECTIVE_ACTION', () => {
      expect(isRecordScheduleAware('CORRECTIVE_ACTION')).toBe(true);
    });

    it('returns true for EXTERNAL_APPROVAL_DEPENDENCY', () => {
      expect(isRecordScheduleAware('EXTERNAL_APPROVAL_DEPENDENCY')).toBe(true);
    });

    it('returns true for SUBMITTAL_ITEM_RECORD', () => {
      expect(isRecordScheduleAware('SUBMITTAL_ITEM_RECORD')).toBe(true);
    });

    it('returns true for ADVISORY_VERDICT', () => {
      expect(isRecordScheduleAware('ADVISORY_VERDICT')).toBe(true);
    });

    it('returns true for VERSION_DRIFT_ALERT', () => {
      expect(isRecordScheduleAware('VERSION_DRIFT_ALERT')).toBe(true);
    });

    it('returns false for UNKNOWN', () => {
      expect(isRecordScheduleAware('UNKNOWN' as never)).toBe(false);
    });
  });

  describe('expansion boundary', () => {
    it('canQcExpandIntoFieldMobileExecution returns false', () => {
      expect(canQcExpandIntoFieldMobileExecution()).toBe(false);
    });
  });
});
