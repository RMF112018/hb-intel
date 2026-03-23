import { describe, expect, it } from 'vitest';

import {
  SCENARIO_LOGIC_SOURCES,
  SCENARIO_PROMOTION_DISPOSITIONS,
  SCENARIO_RELATIONSHIP_TYPES,
  SCENARIO_STATUSES,
  SCENARIO_TYPES,
} from '../constants/index.js';

describe('P3-E5-T04 contract stability', () => {
  describe('§5.1 scenario types', () => {
    it('has exactly 6 scenario types', () => {
      expect(SCENARIO_TYPES).toHaveLength(6);
      expect(SCENARIO_TYPES).toEqual([
        'RecoverySchedule',
        'AccelerationOption',
        'WhatIfAnalysis',
        'DelayImpact',
        'BaselineCandidate',
        'Other',
      ]);
    });
  });

  describe('§5.1 scenario statuses', () => {
    it('has exactly 7 scenario statuses', () => {
      expect(SCENARIO_STATUSES).toHaveLength(7);
      expect(SCENARIO_STATUSES).toEqual([
        'Draft',
        'UnderReview',
        'Approved',
        'Rejected',
        'PromotedToCommitment',
        'PromotedToPublication',
        'Archived',
      ]);
    });
  });

  describe('§5.4 promotion dispositions', () => {
    it('has exactly 4 dispositions', () => {
      expect(SCENARIO_PROMOTION_DISPOSITIONS).toHaveLength(4);
      expect(SCENARIO_PROMOTION_DISPOSITIONS).toEqual([
        'None',
        'PromoteToCommitment',
        'PromoteToPublication',
        'PromoteToBaseline',
      ]);
    });
  });

  describe('§5.3 relationship types', () => {
    it('has exactly 4 relationship types', () => {
      expect(SCENARIO_RELATIONSHIP_TYPES).toHaveLength(4);
      expect(SCENARIO_RELATIONSHIP_TYPES).toEqual(['FS', 'SS', 'FF', 'SF']);
    });
  });

  describe('§5.3 logic sources', () => {
    it('has exactly 2 logic sources', () => {
      expect(SCENARIO_LOGIC_SOURCES).toHaveLength(2);
      expect(SCENARIO_LOGIC_SOURCES).toEqual(['ScenarioOverride', 'WorkPackageLink']);
    });
  });
});
