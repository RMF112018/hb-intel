import { describe, expect, it } from 'vitest';

import {
  COMMITMENT_TYPES,
  DEFAULT_MILESTONE_THRESHOLDS,
  MILESTONE_STATUS_DISPLAY,
  MILESTONE_STATUSES,
  MILESTONE_TYPE_DESCRIPTIONS,
  MILESTONE_TYPES,
  RECONCILIATION_STATUS_DESCRIPTIONS,
  RECONCILIATION_STATUSES,
  RECONCILIATION_TRIGGERS,
} from '../constants/index.js';

describe('P3-E5-T02 contract stability', () => {
  describe('§2.1 commitment types', () => {
    it('has exactly 3 commitment types', () => {
      expect(COMMITMENT_TYPES).toHaveLength(3);
      expect(COMMITMENT_TYPES).toEqual([
        'ActivityForecast',
        'MilestoneCommitment',
        'CompletionForecast',
      ]);
    });
  });

  describe('§2.1 reconciliation statuses', () => {
    it('has exactly 7 reconciliation statuses', () => {
      expect(RECONCILIATION_STATUSES).toHaveLength(7);
    });

    it('contains all expected statuses', () => {
      expect(RECONCILIATION_STATUSES).toEqual([
        'Aligned',
        'PMOverride',
        'SourceAhead',
        'ConflictRequiresReview',
        'PendingApproval',
        'Approved',
        'Rejected',
      ]);
    });

    it('has a description for every status', () => {
      expect(RECONCILIATION_STATUS_DESCRIPTIONS).toHaveLength(7);
      for (const status of RECONCILIATION_STATUSES) {
        expect(
          RECONCILIATION_STATUS_DESCRIPTIONS.find((d) => d.status === status),
        ).toBeDefined();
      }
    });
  });

  describe('§2.2 reconciliation triggers', () => {
    it('has exactly 5 triggers', () => {
      expect(RECONCILIATION_TRIGGERS).toHaveLength(5);
      expect(RECONCILIATION_TRIGGERS).toEqual([
        'SourceImport',
        'PMEdit',
        'PEApproval',
        'PERejection',
        'System',
      ]);
    });
  });

  describe('§4.4 milestone types', () => {
    it('has exactly 8 milestone types', () => {
      expect(MILESTONE_TYPES).toHaveLength(8);
    });

    it('contains all expected types', () => {
      expect(MILESTONE_TYPES).toEqual([
        'ContractCompletion',
        'SubstantialCompletion',
        'OwnerMilestone',
        'HBInternal',
        'SubMilestone',
        'Permit',
        'Inspection',
        'Custom',
      ]);
    });

    it('has a description for every type', () => {
      expect(MILESTONE_TYPE_DESCRIPTIONS).toHaveLength(8);
      for (const type of MILESTONE_TYPES) {
        expect(
          MILESTONE_TYPE_DESCRIPTIONS.find((d) => d.type === type),
        ).toBeDefined();
      }
    });
  });

  describe('§4.3 milestone statuses', () => {
    it('has exactly 7 milestone statuses', () => {
      expect(MILESTONE_STATUSES).toHaveLength(7);
    });

    it('contains all expected statuses', () => {
      expect(MILESTONE_STATUSES).toEqual([
        'NotStarted',
        'OnTrack',
        'AtRisk',
        'Delayed',
        'Critical',
        'Achieved',
        'Superseded',
      ]);
    });

    it('has a display entry for every status', () => {
      expect(MILESTONE_STATUS_DISPLAY).toHaveLength(7);
      for (const status of MILESTONE_STATUSES) {
        const display = MILESTONE_STATUS_DISPLAY.find((d) => d.status === status);
        expect(display, `Missing display for ${status}`).toBeDefined();
        expect(display!.uiSignal).toBeTruthy();
        expect(display!.color).toBeTruthy();
      }
    });
  });

  describe('§4.3 default thresholds', () => {
    it('has atRiskThresholdDays = 14', () => {
      expect(DEFAULT_MILESTONE_THRESHOLDS.atRiskThresholdDays).toBe(14);
    });

    it('has delayedThresholdDays = 30', () => {
      expect(DEFAULT_MILESTONE_THRESHOLDS.delayedThresholdDays).toBe(30);
    });
  });
});
